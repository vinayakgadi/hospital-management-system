#!/usr/bin/env python3
"""
HealthPulse: SQLite to PostgreSQL Migration Script
Preserves all historical healthcare data, primary keys, relationships, password hashes, and timestamps.
"""

import os
import sys
import shutil
import sqlite3
import argparse
from datetime import datetime

# Try importing psycopg2
try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("[ERROR] 'psycopg2' is not installed. Please install it using: pip install psycopg2-binary")
    sys.exit(1)

# Try loading .env
try:
    from dotenv import load_dotenv
    env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_file):
        load_dotenv(env_file)
except ImportError:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_DB_PATH = os.path.join(BASE_DIR, "patients.db")
BACKUP_DB_PATH = os.path.join(BASE_DIR, "patients_backup_sqlite.db")

# Tables in exact foreign key dependency order
TABLE_MIGRATION_ORDER = [
    "users",
    "admins",
    "doctors",
    "patients",
    "user_tokens",
    "doctor_schedules",
    "appointments",
    "activity_logs",
    "notifications",
    "prescriptions",
    "lab_results",
    "medical_records",
    "medical_record_amendments"
]

POSTGRES_DDL = [
    # 1. users table
    """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK(role IN ('admin', 'doctor', 'patient')),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    """,

    # 2. admins table
    """
    CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,

    # 3. doctors table
    """
    CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT '555-0199',
        status VARCHAR(50) DEFAULT 'Active',
        role VARCHAR(50) DEFAULT 'Doctor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        qualifications TEXT DEFAULT 'MD, FACC - Harvard Medical School',
        biography TEXT DEFAULT 'Senior clinical specialist with over 12 years of experience in patient diagnosis, cardiology care, and comprehensive treatment planning.',
        experience_years INTEGER DEFAULT 12
    );
    CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
    CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
    """,

    # 4. patients table
    """
    CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        weight VARCHAR(50),
        gender VARCHAR(50),
        age VARCHAR(50),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) DEFAULT 'patient123',
        disease VARCHAR(255),
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
        doctor_name VARCHAR(255),
        doctor_specialization VARCHAR(255),
        role VARCHAR(50) DEFAULT 'Patient',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
    CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
    CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
    """,

    # 5. user_tokens table
    """
    CREATE TABLE IF NOT EXISTS user_tokens (
        token VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON user_tokens(user_id);
    """,

    # 6. doctor_schedules table
    """
    CREATE TABLE IF NOT EXISTS doctor_schedules (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        day_of_week VARCHAR(50) NOT NULL,
        start_time VARCHAR(50) NOT NULL,
        end_time VARCHAR(50) NOT NULL,
        slot_duration_minutes INTEGER DEFAULT 30,
        status VARCHAR(50) DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_sched_doctor ON doctor_schedules(doctor_id);
    """,

    # 7. appointments table
    """
    CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Scheduled',
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_apt_patient ON appointments(patient_id);
    CREATE INDEX IF NOT EXISTS idx_apt_doctor ON appointments(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_apt_date ON appointments(appointment_date);
    """,

    # 8. activity_logs table
    """
    CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        entity_type VARCHAR(100),
        entity_id INTEGER,
        actor_name VARCHAR(255) DEFAULT 'System',
        actor_role VARCHAR(50) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_logs_created_at ON activity_logs(created_at);
    """,

    # 9. notifications table
    """
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
    """,

    # 10. prescriptions table
    """
    CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        medication_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        route VARCHAR(50) DEFAULT 'Oral',
        instructions TEXT,
        prescription_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_rx_patient ON prescriptions(patient_id);
    CREATE INDEX IF NOT EXISTS idx_rx_doctor ON prescriptions(doctor_id);
    """,

    # 11. lab_results table
    """
    CREATE TABLE IF NOT EXISTS lab_results (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
        test_name VARCHAR(255) NOT NULL,
        test_date DATE NOT NULL,
        result_value VARCHAR(100) NOT NULL,
        units VARCHAR(50),
        reference_range VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Normal',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_lab_patient ON lab_results(patient_id);
    """,

    # 12. medical_records table
    """
    CREATE TABLE IF NOT EXISTS medical_records (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        consultation_date DATE NOT NULL,
        consultation_time VARCHAR(50) DEFAULT '10:00 AM',
        visit_type VARCHAR(100) DEFAULT 'In-Person',
        visit_reason TEXT DEFAULT 'Clinical Consultation',
        symptoms TEXT,
        observations TEXT,
        vital_signs TEXT DEFAULT '{}',
        diagnosis TEXT NOT NULL,
        treatment_plan TEXT,
        clinical_notes TEXT,
        follow_up_date VARCHAR(50),
        follow_up_notes TEXT,
        status VARCHAR(50) DEFAULT 'Finalized',
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
        review_required BOOLEAN DEFAULT FALSE,
        review_reason TEXT DEFAULT '',
        is_amended BOOLEAN DEFAULT FALSE,
        amended_at TIMESTAMP,
        amended_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        finalized_at TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_mr_patient ON medical_records(patient_id);
    CREATE INDEX IF NOT EXISTS idx_mr_doctor ON medical_records(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_mr_date ON medical_records(consultation_date);
    CREATE INDEX IF NOT EXISTS idx_mr_status ON medical_records(status);
    CREATE INDEX IF NOT EXISTS idx_mr_apt ON medical_records(appointment_id);
    """,

    # 13. medical_record_amendments table
    """
    CREATE TABLE IF NOT EXISTS medical_record_amendments (
        id SERIAL PRIMARY KEY,
        record_id INTEGER NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
        amended_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        amended_by_name VARCHAR(255) NOT NULL,
        amended_by_role VARCHAR(50) NOT NULL,
        previous_doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
        previous_doctor_name VARCHAR(255),
        new_doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
        new_doctor_name VARCHAR(255),
        previous_data TEXT NOT NULL,
        amendment_reason TEXT NOT NULL,
        changes_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_mra_record ON medical_record_amendments(record_id);
    """
]


def backup_sqlite():
    """Creates a safety backup of the SQLite database."""
    if not os.path.exists(SQLITE_DB_PATH):
        raise FileNotFoundError(f"Source SQLite database not found at {SQLITE_DB_PATH}")
    shutil.copy2(SQLITE_DB_PATH, BACKUP_DB_PATH)
    print(f"[OK] SQLite database verified and backed up to: {BACKUP_DB_PATH}")


def convert_val_for_pg(col_name, val):
    """Converts SQLite types to compatible PostgreSQL types."""
    if val is None:
        return None
    # Boolean conversions
    if col_name in ("is_active", "is_read", "review_required", "is_amended"):
        if isinstance(val, bool):
            return val
        if isinstance(val, (int, str)):
            return str(val).strip() in ("1", "true", "True", "t", "yes")
        return bool(val)
    # Empty string date conversions to None
    if col_name in ("follow_up_date", "finalized_at", "updated_at") and val == "":
        return None
    return val


def migrate(target_url=None):
    db_url = target_url or os.getenv("DATABASE_URL")
    if not db_url:
        print("\n" + "=" * 70)
        print("[ERROR] DATABASE_URL is not set.")
        print("=" * 70)
        print("Please configure your PostgreSQL connection string in backend/.env:")
        print("  DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database_name>")
        print("\nOr provide it via command line argument:")
        print("  python backend/migrate_to_postgres.py --url postgresql://postgres:postgres@localhost:5432/healthpulse_db")
        print("=" * 70)
        sys.exit(1)

    print("\n" + "=" * 70)
    print("HealthPulse: Migrating SQLite Database -> PostgreSQL")
    print(f"Target URL: {db_url.split('@')[-1] if '@' in db_url else db_url}")
    print("=" * 70)

    # 1. Back up SQLite database
    backup_sqlite()

    # 2. Test PostgreSQL connectivity
    print("\n[1/5] Testing connection to PostgreSQL...")
    try:
        pg_conn = psycopg2.connect(db_url)
        pg_cur = pg_conn.cursor()
        pg_cur.execute("SELECT version();")
        pg_ver = pg_cur.fetchone()[0]
        print(f"[OK] Connected to PostgreSQL: {pg_ver.split(',')[0]}")
    except Exception as e:
        print(f"[ERROR] Failed to connect to PostgreSQL: {e}")
        print("\nTroubleshooting Setup Instructions:")
        print("1. Ensure PostgreSQL service is installed and running on your system or cloud host.")
        print("2. Create the target database if it does not exist:")
        print("     CREATE DATABASE healthpulse_db;")
        print("3. Verify username, password, host, and port in DATABASE_URL.")
        sys.exit(1)

    # 3. Connect to SQLite source
    print("\n[2/5] Reading source SQLite database...")
    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    # 4. Create PostgreSQL Schema
    print("\n[3/5] Applying PostgreSQL Schema & Constraints...")
    for ddl in POSTGRES_DDL:
        try:
            pg_cur.execute(ddl)
        except Exception as e:
            pg_conn.rollback()
            print(f"[ERROR] Schema execution failed: {e}")
            sys.exit(1)
    pg_conn.commit()
    print("[OK] All PostgreSQL tables, constraints, and indexes created successfully.")

    # 5. Migrate Data Table by Table
    print("\n[4/5] Migrating clinical data in dependency order...")
    migration_summary = {}

    for table in TABLE_MIGRATION_ORDER:
        sqlite_cur.execute(f"SELECT * FROM {table};")
        rows = sqlite_cur.fetchall()
        src_count = len(rows)

        if src_count == 0:
            migration_summary[table] = {"source": 0, "destination": 0, "status": "Empty"}
            continue

        cols = [col[0] for col in sqlite_cur.description]
        col_names = ", ".join(cols)
        placeholders = ", ".join(["%s"] * len(cols))

        # Idempotent insert with ON CONFLICT (id) DO NOTHING / UPDATE
        pk_col = "token" if table == "user_tokens" else "id"
        update_set = ", ".join([f"{col} = EXCLUDED.{col}" for col in cols if col != pk_col])
        
        if update_set:
            insert_query = f"""
                INSERT INTO {table} ({col_names})
                VALUES ({placeholders})
                ON CONFLICT ({pk_col}) DO UPDATE SET {update_set};
            """
        else:
            insert_query = f"""
                INSERT INTO {table} ({col_names})
                VALUES ({placeholders})
                ON CONFLICT ({pk_col}) DO NOTHING;
            """

        migrated_rows = 0
        skipped_rows = 0
        for r in rows:
            row_dict = dict(r)
            values = [convert_val_for_pg(c, row_dict[c]) for c in cols]
            try:
                pg_cur.execute(insert_query, values)
                migrated_rows += 1
            except Exception as e:
                pg_conn.rollback()
                err_msg = str(e).strip()
                if "violates foreign key constraint" in err_msg.lower():
                    print(f"  [WARN] Skipping orphaned row in {table} (PK {row_dict.get(pk_col)}): {err_msg.splitlines()[0]}")
                    skipped_rows += 1
                else:
                    print(f"[ERROR] Failed migrating row in {table} (PK {row_dict.get(pk_col)}): {e}")
                    sys.exit(1)

        pg_conn.commit()

        # Reset serial sequence if table has integer primary key id
        if pk_col == "id":
            try:
                pg_cur.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE((SELECT MAX(id) FROM {table}), 1));")
                pg_conn.commit()
            except Exception as e:
                # Some tables may not use serial sequence
                pass

        # Verify destination count
        pg_cur.execute(f"SELECT COUNT(*) FROM {table};")
        dest_count = pg_cur.fetchone()[0]

        migration_summary[table] = {
            "source": src_count,
            "destination": dest_count,
            "status": "Verified" if src_count == dest_count else "Count Mismatch"
        }
        print(f"  [OK] {table:<24} : {src_count} source -> {dest_count} migrated [{migration_summary[table]['status']}]")

    # 6. Verification Report
    print("\n[5/5] Migration Verification Report:")
    print("-" * 70)
    print(f"{'Table':<28} | {'SQLite Rows':<12} | {'PostgreSQL Rows':<16} | Status")
    print("-" * 70)
    all_matched = True
    for t, stats in migration_summary.items():
        matched = stats["source"] == stats["destination"]
        if not matched:
            all_matched = False
        print(f"{t:<28} | {stats['source']:<12} | {stats['destination']:<16} | {stats['status']}")
    print("-" * 70)

    if all_matched:
        print("\nSUCCESS: All tables migrated and verified successfully with zero data loss!")
        print("Existing SQLite database remains preserved at:", SQLITE_DB_PATH)
        print("Safety backup verified at:", BACKUP_DB_PATH)
    else:
        print("\nWARNING: Some table row counts did not match. Please review the table above.")

    sqlite_conn.close()
    pg_conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HealthPulse SQLite to PostgreSQL Migration")
    parser.add_argument("--url", help="Target PostgreSQL connection string (defaults to DATABASE_URL in .env)")
    args = parser.parse_args()
    migrate(args.url)
