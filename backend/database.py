import os
import re
import json
import time
import sqlite3
import threading
from datetime import datetime

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        root_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        if os.path.exists(root_env):
            load_dotenv(root_env)
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
SQLITE_DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "patients.db")

# Optional psycopg2 import
try:
    import psycopg2
    import psycopg2.extras
    import psycopg2.pool
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False


def _record_query_time(elapsed_sec):
    """Safely increments query execution time and query count in current Flask request context."""
    try:
        from flask import g, has_request_context
        if has_request_context():
            g.db_query_time = getattr(g, "db_query_time", 0.0) + elapsed_sec
            g.db_query_count = getattr(g, "db_query_count", 0) + 1
    except Exception:
        pass


def is_postgres_configured():
    """Returns True if DATABASE_URL is set to a PostgreSQL connection string."""
    return bool(DATABASE_URL and (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://")))


def get_active_db_engine():
    """Returns 'postgresql' if configured and accessible, otherwise 'sqlite'."""
    if is_postgres_configured():
        return "postgresql"
    return "sqlite"


class RowWrapper(dict):
    """
    Emulates sqlite3.Row behavior seamlessly:
    - Supports indexing by integer: row[0], row[1]
    - Supports access by column name (case-insensitive): row['id'], row['name']
    - Supports dictionary methods: row.get('key'), row.keys(), row.values(), row.items()
    - Can be converted directly to dict using dict(row)
    - Directly serializable to JSON
    """
    def __init__(self, cols, vals):
        super().__init__(zip(cols, vals))
        self._vals = tuple(vals)
        self._lower_map = {c.lower(): c for c in cols}

    def __getitem__(self, k):
        if isinstance(k, int):
            return self._vals[k]
        if k in self:
            return super().__getitem__(k)
        if isinstance(k, str) and k.lower() in self._lower_map:
            return super().__getitem__(self._lower_map[k.lower()])
        raise KeyError(k)

    def get(self, k, default=None):
        try:
            return self[k]
        except (KeyError, IndexError):
            return default


class PostgresCursorWrapper:
    """
    Wraps psycopg2 cursor to provide a unified SQLite-compatible interface:
    - Automatically maps '?' parameter placeholders to '%s'
    - Translates SQLite-specific functions (e.g. strftime -> to_char)
    - Emulates cursor.lastrowid by capturing RETURNING id or sequence val on INSERT
    - Dual-access row wrapper (accessible by column name and integer index)
    """
    def __init__(self, raw_cursor, connection):
        self.cursor = raw_cursor
        self.connection = connection
        self.lastrowid = None

    def _translate_query(self, query):
        q = query.strip()

        # Translate strftime('%Y-%m', 'now') to to_char(CURRENT_TIMESTAMP, 'YYYY-MM') FIRST
        q = re.sub(
            r"strftime\s*\(\s*'%Y-%m'\s*,\s*['\"]now['\"]\s*\)",
            "to_char(CURRENT_TIMESTAMP, 'YYYY-MM')",
            q,
            flags=re.IGNORECASE
        )
        # Translate SQLite strftime('%Y-%m', col) to PostgreSQL to_char(col, 'YYYY-MM')
        q = re.sub(
            r"strftime\s*\(\s*'%Y-%m'\s*,\s*([^)]+)\s*\)",
            r"to_char(\1::timestamp, 'YYYY-MM')",
            q,
            flags=re.IGNORECASE
        )
        # Translate date('now') to CURRENT_DATE
        q = re.sub(r"date\s*\(\s*['\"]now['\"]\s*\)", "CURRENT_DATE", q, flags=re.IGNORECASE)
        # Translate datetime('now') to CURRENT_TIMESTAMP
        q = re.sub(r"datetime\s*\(\s*['\"]now['\"]\s*\)", "CURRENT_TIMESTAMP", q, flags=re.IGNORECASE)
        # Translate literal boolean integers in VALUES: , 1) -> , TRUE), , 0) -> , FALSE)
        q = re.sub(r",\s*1\s*\)", ", TRUE)", q)
        q = re.sub(r",\s*0\s*\)", ", FALSE)", q)
        # Translate is_active = ? to is_active = (?)::boolean
        q = re.sub(r"\bis_active\s*=\s*\?", "is_active = (?)::boolean", q, flags=re.IGNORECASE)
        # Translate date(?) to (%s)::date
        q = re.sub(r"date\s*\(\s*\?\s*\)", "(?)::date", q, flags=re.IGNORECASE)
        # Translate date(col) to col::date
        q = re.sub(r"date\s*\(\s*([a-zA-Z0-9_\.]+)\s*\)", r"(\1)::date", q, flags=re.IGNORECASE)

        # Replace '?' parameter placeholders with '%s' for psycopg2
        # (Be careful not to replace ? inside quotes)
        parts = []
        in_quote = False
        quote_char = None
        for char in q:
            if char in ("'", '"') and (not in_quote or quote_char == char):
                in_quote = not in_quote
                quote_char = char if in_quote else None
                parts.append(char)
            elif char == "?" and not in_quote:
                parts.append("%s")
            else:
                parts.append(char)
        q = "".join(parts)

        # Check for INSERT without RETURNING clause
        needs_returning = False
        tbl_match = re.search(r"INSERT\s+INTO\s+([a-zA-Z0-9_]+)", q, flags=re.IGNORECASE)
        if tbl_match:
            table_name = tbl_match.group(1).lower()
            if table_name != "user_tokens" and "RETURNING" not in q.upper():
                q = q.rstrip(";") + " RETURNING id;"
                needs_returning = True

        return q, needs_returning

    def execute(self, query, params=None):
        translated_query, was_insert_returning = self._translate_query(query)
        t0 = time.time()
        try:
            if params is None:
                self.cursor.execute(translated_query)
            else:
                tuple_params = tuple(params) if isinstance(params, (list, tuple)) else (params,)
                self.cursor.execute(translated_query, tuple_params)
        finally:
            _record_query_time(time.time() - t0)

        if was_insert_returning:
            try:
                row = self.cursor.fetchone()
                if row and len(row) > 0:
                    self.lastrowid = row[0]
            except Exception:
                self.lastrowid = None
        else:
            self.lastrowid = None

        return self

    def executemany(self, query, seq_of_parameters):
        translated_query, _ = self._translate_query(query)
        t0 = time.time()
        try:
            return self.cursor.executemany(translated_query, seq_of_parameters)
        finally:
            _record_query_time(time.time() - t0)

    def _wrap_row(self, row):
        if row is None or not self.cursor.description:
            return row
        cols = [col[0] for col in self.cursor.description]
        return RowWrapper(cols, row)

    def fetchone(self):
        row = self.cursor.fetchone()
        return self._wrap_row(row)

    def fetchall(self):
        rows = self.cursor.fetchall()
        if not self.cursor.description or not rows:
            return []
        cols = [col[0] for col in self.cursor.description]
        return [RowWrapper(cols, r) for r in rows]

    def fetchmany(self, size=None):
        rows = self.cursor.fetchmany(size) if size else self.cursor.fetchmany()
        if not self.cursor.description or not rows:
            return []
        cols = [col[0] for col in self.cursor.description]
        return [RowWrapper(cols, r) for r in rows]

    @property
    def rowcount(self):
        return self.cursor.rowcount

    @property
    def description(self):
        return self.cursor.description

    def close(self):
        self.cursor.close()


_POOL_LOCK = threading.Lock()
_POSTGRES_POOL = None


def get_postgres_pool(minconn=2, maxconn=20):
    """Initializes and returns the singleton ThreadedConnectionPool."""
    global _POSTGRES_POOL
    if _POSTGRES_POOL is None:
        with _POOL_LOCK:
            if _POSTGRES_POOL is None and is_postgres_configured() and PSYCOPG2_AVAILABLE:
                _POSTGRES_POOL = psycopg2.pool.ThreadedConnectionPool(
                    minconn=minconn,
                    maxconn=maxconn,
                    dsn=DATABASE_URL
                )
    return _POSTGRES_POOL


class PostgresConnectionWrapper:
    """Wraps psycopg2 connection and returns connection to pool on close()."""
    def __init__(self, raw_conn, pool=None):
        self.raw_conn = raw_conn
        self.pool = pool
        self._closed = False

    def cursor(self):
        return PostgresCursorWrapper(self.raw_conn.cursor(), self.raw_conn)

    def commit(self):
        self.raw_conn.commit()

    def rollback(self):
        try:
            self.raw_conn.rollback()
        except Exception:
            pass

    def close(self):
        if self._closed:
            return
        self._closed = True
        if self.pool is not None:
            try:
                # Rollback uncommitted transactions before returning to pool
                self.raw_conn.rollback()
                self.pool.putconn(self.raw_conn)
            except Exception:
                try:
                    self.pool.putconn(self.raw_conn, close=True)
                except Exception:
                    pass
        else:
            try:
                self.raw_conn.close()
            except Exception:
                pass


def get_db_connection():
    """
    Returns an active database connection:
    - If PostgreSQL is configured, borrows an existing warm connection from ThreadedConnectionPool.
    - Automatic connection health recovery if an idle connection dropped.
    - Otherwise connects to SQLite patients.db.
    """
    if is_postgres_configured():
        if not PSYCOPG2_AVAILABLE:
            raise RuntimeError(
                "PostgreSQL is configured in DATABASE_URL, but 'psycopg2' is not installed. "
                "Run: pip install psycopg2-binary"
            )
        pool = get_postgres_pool()
        if pool is not None:
            for attempt in range(2):
                try:
                    raw_conn = pool.getconn()
                    if raw_conn.closed != 0:
                        pool.putconn(raw_conn, close=True)
                        continue
                    return PostgresConnectionWrapper(raw_conn, pool=pool)
                except Exception:
                    if attempt == 1:
                        break
        try:
            raw_conn = psycopg2.connect(DATABASE_URL)
            return PostgresConnectionWrapper(raw_conn, pool=None)
        except Exception as e:
            raise ConnectionError(
                f"Failed to connect to PostgreSQL database at {DATABASE_URL}.\n"
                f"Error: {e}\n"
                "Please ensure PostgreSQL is installed, running, and accessible, or check your DATABASE_URL in .env."
            )
    else:
        conn = sqlite3.connect(SQLITE_DB_FILE)
        conn.row_factory = sqlite3.Row
        return conn


def test_database_connection():
    """Tests the configured database connection and returns diagnostic info."""
    engine = get_active_db_engine()
    result = {
        "engine": engine,
        "database_url_configured": bool(DATABASE_URL),
        "connected": False,
        "error": None,
        "details": {}
    }

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        if engine == "postgresql":
            cur.execute("SELECT version();")
            ver = cur.fetchone()
            result["details"]["version"] = ver.get("version") if isinstance(ver, dict) else ver[0]
            cur.execute("SELECT current_database(), current_user;")
            info = cur.fetchone()
            result["details"]["database"] = info.get("current_database") if isinstance(info, dict) else info[0]
            result["details"]["user"] = info.get("current_user") if isinstance(info, dict) else info[1]
        else:
            cur.execute("SELECT sqlite_version();")
            ver = cur.fetchone()
            result["details"]["version"] = f"SQLite {ver[0]}"
            result["details"]["database_file"] = SQLITE_DB_FILE

        result["connected"] = True
        conn.close()
    except Exception as e:
        result["error"] = str(e)

    return result
