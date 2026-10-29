"""
Safe database migration for HealthPulse Firebase Authentication.
Adds firebase_uid and updated_at to the users table and creates unique constraint & index.
Works on PostgreSQL (active) and SQLite fallback.
"""
import os
import sys

def migrate_postgres():
    import psycopg2
    DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://neondb_owner:npg_YaMrz8bSXiv4@ep-billowing-band-b54bdfgd-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require')
    print("Connecting to PostgreSQL...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # 1. Add firebase_uid column if not exists
    try:
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE")
        print("PostgreSQL: users.firebase_uid checked/added.")
    except Exception as e:
        print(f"Notice adding firebase_uid: {e}")
        conn.rollback()

    # 2. Add updated_at column if not exists
    try:
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        print("PostgreSQL: users.updated_at checked/added.")
    except Exception as e:
        print(f"Notice adding updated_at: {e}")
        conn.rollback()

    # 3. Add index on firebase_uid
    try:
        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)")
        print("PostgreSQL: idx_users_firebase_uid created.")
    except Exception as e:
        print(f"Notice creating idx_users_firebase_uid: {e}")
        conn.rollback()

    conn.commit()
    cur.close()
    conn.close()
    print("PostgreSQL Firebase migration completed successfully.")

def migrate_sqlite():
    import sqlite3
    db_path = os.path.join(os.path.dirname(__file__), 'patients.db')
    if not os.path.exists(db_path):
        return
    print(f"Migrating SQLite DB at {db_path}...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("PRAGMA table_info(users)")
    cols = [r[1] for r in cur.fetchall()]

    if "firebase_uid" not in cols:
        try:
            cur.execute("ALTER TABLE users ADD COLUMN firebase_uid TEXT")
            cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_fb_uid ON users(firebase_uid)")
            print("SQLite: users.firebase_uid added with unique index.")
        except Exception as e:
            print(f"SQLite notice adding firebase_uid: {e}")

    if "updated_at" not in cols:
        try:
            cur.execute("ALTER TABLE users ADD COLUMN updated_at TEXT")
            print("SQLite: users.updated_at added.")
        except Exception as e:
            print(f"SQLite notice adding updated_at: {e}")

    conn.commit()
    conn.close()
    print("SQLite Firebase migration completed.")

if __name__ == '__main__':
    try:
        migrate_postgres()
    except Exception as e:
        print(f"Error during Postgres migration: {e}")
    try:
        migrate_sqlite()
    except Exception as e:
        print(f"Error during SQLite migration: {e}")
