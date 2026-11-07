import os
import sys
import psycopg2

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from database import DATABASE_URL, is_postgres_configured, SQLITE_DB_FILE
import sqlite3

INDEXES_TO_CREATE = [
    # Appointments indexes for status filtering and date ordering
    ("idx_apt_status", "appointments", "(status)"),
    ("idx_apt_date_time", "appointments", "(appointment_date, appointment_time)"),
    
    # Patients indexes for disease filter, name search, and registration trend queries
    ("idx_patients_disease", "patients", "(disease)"),
    ("idx_patients_name", "patients", "(name)"),
    ("idx_patients_created_at", "patients", "(created_at)"),
    
    # Prescriptions indexes for status filtering and timeline sorting
    ("idx_rx_status", "prescriptions", "(status)"),
    ("idx_rx_created_at", "prescriptions", "(created_at)"),
    
    # Doctors indexes for specialization and status filtering
    ("idx_doctors_specialization", "doctors", "(specialization)"),
    ("idx_doctors_status", "doctors", "(status)"),
    
    # Auth and security indexes for token expiration and audit logging
    ("idx_tokens_expires_at", "user_tokens", "(expires_at)"),
    ("idx_logs_event_type", "activity_logs", "(event_type)"),
]

def apply_indexes():
    print("=== Optimizing Database Indexes ===")
    if is_postgres_configured():
        print(f"Connecting to PostgreSQL...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        for idx_name, table, cols in INDEXES_TO_CREATE:
            sql = f"CREATE INDEX IF NOT EXISTS {idx_name} ON {table} {cols};"
            print(f"  [PostgreSQL] Applying {idx_name} on {table}{cols}...")
            cur.execute(sql)
        conn.commit()
        conn.close()
        print("[OK] All PostgreSQL indexes verified and created successfully.")
    else:
        print(f"Connecting to SQLite: {SQLITE_DB_FILE}...")
        conn = sqlite3.connect(SQLITE_DB_FILE)
        cur = conn.cursor()
        for idx_name, table, cols in INDEXES_TO_CREATE:
            sql = f"CREATE INDEX IF NOT EXISTS {idx_name} ON {table} {cols};"
            print(f"  [SQLite] Applying {idx_name} on {table}{cols}...")
            cur.execute(sql)
        conn.commit()
        conn.close()
        print("[OK] All SQLite indexes verified and created successfully.")

if __name__ == "__main__":
    apply_indexes()
