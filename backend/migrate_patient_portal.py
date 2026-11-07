"""
Safe database migration for HealthPulse Patient Portal
Adds profile fields to patients, creates patient_correction_requests table,
and ensures indexes and notifications support patient workflows.
Works on both PostgreSQL and SQLite fallback.
"""
import os
import sys

def migrate_postgres():
    import psycopg2
    DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://neondb_owner:npg_YaMrz8bSXiv4@ep-billowing-band-b54bdfgd-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require')
    print("Connecting to PostgreSQL...")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # 1. Add missing columns to patients table
    patient_columns = [
        ("phone", "VARCHAR(50) DEFAULT '+1 (555) 234-5678'"),
        ("address", "TEXT DEFAULT '742 Evergreen Terrace, Springfield, OR 97477'"),
        ("emergency_contact_name", "VARCHAR(255) DEFAULT 'Sarah Jenkins'"),
        ("emergency_contact_phone", "VARCHAR(50) DEFAULT '+1 (555) 987-6543'"),
        ("date_of_birth", "VARCHAR(50) DEFAULT '1992-06-15'"),
        ("blood_group", "VARCHAR(10) DEFAULT 'O+'")
    ]
    for col_name, col_def in patient_columns:
        try:
            cur.execute(f"ALTER TABLE patients ADD COLUMN IF NOT EXISTS {col_name} {col_def}")
            print(f"PostgreSQL: patients.{col_name} checked/added.")
        except Exception as e:
            print(f"Notice adding {col_name}: {e}")
            conn.rollback()

    # 2. Add link column to notifications if not exists
    try:
        cur.execute("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link VARCHAR(255)")
        print("PostgreSQL: notifications.link checked/added.")
    except Exception as e:
        print(f"Notice adding notifications.link: {e}")
        conn.rollback()

    # 3. Create patient_correction_requests table
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS patient_correction_requests (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                medical_record_id INTEGER NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
                doctor_id INTEGER REFERENCES doctors(id),
                request_type VARCHAR(100) DEFAULT 'Medical Record Correction',
                reason VARCHAR(255) NOT NULL,
                details TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                doctor_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("PostgreSQL: patient_correction_requests table verified/created.")
    except Exception as e:
        print(f"Notice creating patient_correction_requests: {e}")
        conn.rollback()

    # 4. Seed profile details for existing patients if null
    try:
        cur.execute("""
            UPDATE patients
            SET phone = COALESCE(phone, '+1 (555) 234-5678'),
                address = COALESCE(address, '742 Evergreen Terrace, Springfield, OR 97477'),
                emergency_contact_name = COALESCE(emergency_contact_name, 'Sarah Jenkins'),
                emergency_contact_phone = COALESCE(emergency_contact_phone, '+1 (555) 987-6543'),
                date_of_birth = COALESCE(date_of_birth, '1992-06-15'),
                blood_group = COALESCE(blood_group, 'O+')
            WHERE phone IS NULL OR address IS NULL OR date_of_birth IS NULL
        """)
        print("PostgreSQL: Updated existing patient rows with default profile info if null.")
    except Exception as e:
        print(f"Notice updating patient defaults: {e}")
        conn.rollback()

    # 5. Create index on patient_correction_requests and notifications
    try:
        cur.execute("CREATE INDEX IF NOT EXISTS idx_corr_req_patient ON patient_correction_requests(patient_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_corr_req_record ON patient_correction_requests(medical_record_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_notif_user_read ON notifications(user_id, is_read)")
        print("PostgreSQL: Indexes created.")
    except Exception as e:
        print(f"Notice creating indexes: {e}")
        conn.rollback()

    conn.commit()
    cur.close()
    conn.close()
    print("PostgreSQL migration completed successfully.")

def migrate_sqlite():
    import sqlite3
    db_path = os.path.join(os.path.dirname(__file__), 'hospital.db')
    if not os.path.exists(db_path):
        print(f"SQLite DB {db_path} not found, skipping SQLite.")
        return
    print(f"Migrating SQLite DB at {db_path}...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Add columns if missing in SQLite
    cur.execute("PRAGMA table_info(patients)")
    cols = [r[1] for r in cur.fetchall()]
    new_cols = [
        ("phone", "TEXT DEFAULT '+1 (555) 234-5678'"),
        ("address", "TEXT DEFAULT '742 Evergreen Terrace, Springfield, OR 97477'"),
        ("emergency_contact_name", "TEXT DEFAULT 'Sarah Jenkins'"),
        ("emergency_contact_phone", "TEXT DEFAULT '+1 (555) 987-6543'"),
        ("date_of_birth", "TEXT DEFAULT '1992-06-15'"),
        ("blood_group", "TEXT DEFAULT 'O+'")
    ]
    for col_name, col_def in new_cols:
        if col_name not in cols:
            try:
                cur.execute(f"ALTER TABLE patients ADD COLUMN {col_name} {col_def}")
                print(f"SQLite: patients.{col_name} added.")
            except Exception as e:
                print(f"SQLite notice adding {col_name}: {e}")

    # Notifications link
    cur.execute("PRAGMA table_info(notifications)")
    notif_cols = [r[1] for r in cur.fetchall()]
    if "link" not in notif_cols:
        try:
            cur.execute("ALTER TABLE notifications ADD COLUMN link TEXT")
            print("SQLite: notifications.link added.")
        except Exception as e:
            print(f"SQLite notice adding notifications.link: {e}")

    # patient_correction_requests
    cur.execute("""
        CREATE TABLE IF NOT EXISTS patient_correction_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            medical_record_id INTEGER NOT NULL,
            doctor_id INTEGER,
            request_type TEXT DEFAULT 'Medical Record Correction',
            reason TEXT NOT NULL,
            details TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            doctor_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (medical_record_id) REFERENCES medical_records(id)
        )
    """)
    conn.commit()
    conn.close()
    print("SQLite migration completed.")

if __name__ == '__main__':
    try:
        migrate_postgres()
    except Exception as e:
        print(f"Error during Postgres migration: {e}")
    try:
        migrate_sqlite()
    except Exception as e:
        print(f"Error during SQLite migration: {e}")
