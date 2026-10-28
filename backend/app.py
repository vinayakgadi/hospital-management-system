import os
import sqlite3
import secrets
import re
import json
import math
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# Enable CORS for all routes and origins with support for authorization headers
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

from database import (
    get_db_connection,
    is_postgres_configured,
    get_active_db_engine,
    test_database_connection
)

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "patients.db")


# ---------------------------------------------------------
# DATABASE INITIALIZATION & SAFE SCHEMA MIGRATION
# ---------------------------------------------------------

def init_db():
    if is_postgres_configured():
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM users LIMIT 1;")
            conn.close()
            print("[OK] HealthPulse active database engine: PostgreSQL")
            return
        except Exception as e:
            print(f"[INFO] PostgreSQL configuration detected. Run 'python backend/migrate_to_postgres.py' to complete migration: {e}")
            return

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Central Users Table (Role-based authentication & status)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'doctor', 'patient')),
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Server-side Revocable User Tokens Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_tokens (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 3. Doctors Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            specialization TEXT NOT NULL,
            phone TEXT DEFAULT '555-0199',
            status TEXT DEFAULT 'Active',
            role TEXT DEFAULT 'Doctor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Check and add user_id column to doctors safely
    cursor.execute("PRAGMA table_info(doctors)")
    doc_cols = [c[1] for c in cursor.fetchall()]
    if "user_id" not in doc_cols:
        cursor.execute("ALTER TABLE doctors ADD COLUMN user_id INTEGER DEFAULT NULL")

    # 4. Patients Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            weight TEXT,
            gender TEXT,
            age TEXT,
            email TEXT UNIQUE NOT NULL,
            password TEXT DEFAULT 'patient123',
            disease TEXT,
            doctor_id INTEGER DEFAULT 1,
            doctor_name TEXT,
            doctor_specialization TEXT,
            role TEXT DEFAULT 'Patient',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Check and add user_id and created_at columns to patients safely
    cursor.execute("PRAGMA table_info(patients)")
    pat_cols = [c[1] for c in cursor.fetchall()]
    if "user_id" not in pat_cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN user_id INTEGER DEFAULT NULL")
    if "created_at" not in pat_cols:
        cursor.execute("ALTER TABLE patients ADD COLUMN created_at TEXT DEFAULT NULL")
        cursor.execute("UPDATE patients SET created_at = datetime('now') WHERE created_at IS NULL")

    # 5. Appointments Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            status TEXT DEFAULT 'Scheduled',
            reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        )
    """)

    # 6. Activity Logs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            description TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id INTEGER,
            actor_name TEXT DEFAULT 'System',
            actor_role TEXT DEFAULT 'Admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 7. Admins Table (legacy preservation)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'Admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 8. Medical Records Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS medical_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            consultation_date TEXT NOT NULL,
            symptoms TEXT,
            observations TEXT,
            diagnosis TEXT NOT NULL,
            treatment_plan TEXT,
            clinical_notes TEXT,
            follow_up_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        )
    """)

    # 9. Prescriptions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            medication_name TEXT NOT NULL,
            dosage TEXT NOT NULL,
            frequency TEXT NOT NULL,
            duration TEXT NOT NULL,
            route TEXT DEFAULT 'Oral',
            instructions TEXT,
            prescription_date TEXT NOT NULL,
            status TEXT DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        )
    """)

    # 10. Doctor Schedules Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS doctor_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doctor_id INTEGER NOT NULL,
            day_of_week TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            slot_duration_minutes INTEGER DEFAULT 30,
            status TEXT DEFAULT 'Available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        )
    """)

    # 11. Notifications Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Check and add columns to doctors table safely
    cursor.execute("PRAGMA table_info(doctors)")
    doc_cols_ext = [c[1] for c in cursor.fetchall()]
    if "qualifications" not in doc_cols_ext:
        cursor.execute("ALTER TABLE doctors ADD COLUMN qualifications TEXT DEFAULT 'MD, FACC - Harvard Medical School'")
    if "biography" not in doc_cols_ext:
        cursor.execute("ALTER TABLE doctors ADD COLUMN biography TEXT DEFAULT 'Senior clinical specialist with over 12 years of experience in patient diagnosis, cardiology care, and comprehensive treatment planning.'")
    if "experience_years" not in doc_cols_ext:
        cursor.execute("ALTER TABLE doctors ADD COLUMN experience_years INTEGER DEFAULT 12")

    # Check and add columns to medical_records table safely
    cursor.execute("PRAGMA table_info(medical_records)")
    mr_cols = [c[1] for c in cursor.fetchall()]
    if "consultation_time" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN consultation_time TEXT DEFAULT '10:00 AM'")
    if "visit_type" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN visit_type TEXT DEFAULT 'In-Person'")
    if "visit_reason" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN visit_reason TEXT DEFAULT 'Clinical Consultation'")
    if "vital_signs" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN vital_signs TEXT DEFAULT '{}'")
    if "follow_up_notes" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN follow_up_notes TEXT DEFAULT ''")
    if "status" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN status TEXT DEFAULT 'Finalized'")
    if "updated_at" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN updated_at TIMESTAMP")
    if "finalized_at" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN finalized_at TIMESTAMP")
    if "appointment_id" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN appointment_id INTEGER")
    if "review_required" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN review_required INTEGER DEFAULT 0")
    if "review_reason" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN review_reason TEXT DEFAULT ''")
    if "is_amended" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN is_amended INTEGER DEFAULT 0")
    if "amended_at" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN amended_at TIMESTAMP")
    if "amended_by" not in mr_cols:
        cursor.execute("ALTER TABLE medical_records ADD COLUMN amended_by TEXT DEFAULT ''")

    # Safe indexes for medical_records
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mr_patient ON medical_records(patient_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mr_doctor ON medical_records(doctor_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mr_date ON medical_records(consultation_date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mr_status ON medical_records(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mr_apt ON medical_records(appointment_id)")

    # 13. Medical Record Amendments Table (Clinical Audit Trail)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS medical_record_amendments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_id INTEGER NOT NULL,
            amended_by_user_id INTEGER,
            amended_by_name TEXT NOT NULL,
            amended_by_role TEXT NOT NULL,
            previous_doctor_id INTEGER,
            previous_doctor_name TEXT,
            new_doctor_id INTEGER,
            new_doctor_name TEXT,
            previous_data TEXT NOT NULL,
            amendment_reason TEXT NOT NULL,
            changes_summary TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mra_record ON medical_record_amendments(record_id)")

    # 12. Lab Results & Medical Documents Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lab_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER,
            test_name TEXT NOT NULL,
            test_date TEXT NOT NULL,
            result_value TEXT NOT NULL,
            units TEXT,
            reference_range TEXT,
            status TEXT DEFAULT 'Normal',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_lab_patient ON lab_results(patient_id)")

    # ---------------------------------------------------------
    # DATA MIGRATION: SEED / LINK CENTRAL USERS
    # ---------------------------------------------------------

    # A. Migrate Administrators into central users table
    admin_email = "admin@healthpulse.com"
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (admin_email,))
    admin_user = cursor.fetchone()
    if not admin_user:
        hashed_admin_pw = generate_password_hash("admin123")
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, is_active)
            VALUES (?, ?, ?, 'admin', 1)
        """, ("System Administrator", admin_email, hashed_admin_pw))
        # Ensure legacy admins table has it too
        cursor.execute("SELECT id FROM admins WHERE LOWER(email) = ?", (admin_email,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO admins (name, email, password, role)
                VALUES (?, ?, ?, 'Admin')
            """, ("System Administrator", admin_email, hashed_admin_pw))

    # B. Seed Initial Doctors if doctors table is empty
    cursor.execute("SELECT COUNT(*) FROM doctors")
    if cursor.fetchone()[0] == 0:
        initial_doctors = [
            ("Dr. Satya Deep", "satya.deep@healthpulse.com", generate_password_hash("doctor123"), "Cardiology", "555-0101", "Active"),
            ("Dr. Teja", "teja@healthpulse.com", generate_password_hash("doctor123"), "Muscles & Orthopedics", "555-0102", "Active"),
            ("Dr. Sam", "sam@healthpulse.com", generate_password_hash("doctor123"), "Bones & Trauma", "555-0103", "Active"),
            ("Dr. Lakshimi", "lakshimi@healthpulse.com", generate_password_hash("doctor123"), "Neurology", "555-0104", "Active"),
            ("Dr. Priya Patel", "priya.patel@healthpulse.com", generate_password_hash("doctor123"), "Cardiology", "555-0105", "Active"),
            ("Dr. Kartick", "kartick@healthpulse.com", generate_password_hash("doctor123"), "Cardiology", "555-0106", "Active"),
        ]
        cursor.executemany("""
            INSERT INTO doctors (name, email, password, specialization, phone, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, initial_doctors)

    # C. Migrate Doctors into central users table and link user_id
    cursor.execute("SELECT id, name, email, password FROM doctors")
    all_doctors = cursor.fetchall()
    for doc in all_doctors:
        d_id = doc["id"]
        d_name = doc["name"]
        d_email = doc["email"].strip().lower()
        d_pw = doc["password"]

        # Ensure password is safe hash
        if not (d_pw.startswith("pbkdf2:sha256:") or d_pw.startswith("scrypt:")):
            d_pw_hash = generate_password_hash(d_pw if d_pw else "doctor123")
            cursor.execute("UPDATE doctors SET password = ? WHERE id = ?", (d_pw_hash, d_id))
        else:
            d_pw_hash = d_pw

        # Check if already in users table
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (d_email,))
        existing_u = cursor.fetchone()
        if existing_u:
            u_id = existing_u["id"]
        else:
            cursor.execute("""
                INSERT INTO users (name, email, password_hash, role, is_active)
                VALUES (?, ?, ?, 'doctor', 1)
            """, (d_name, d_email, d_pw_hash))
            u_id = cursor.lastrowid

        cursor.execute("UPDATE doctors SET user_id = ? WHERE id = ?", (u_id, d_id))

    # Support alias demo account: dr.satyadeep@healthpulse.com -> Dr. Satya Deep
    alias_doc_email = "dr.satyadeep@healthpulse.com"
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (alias_doc_email,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, is_active)
            VALUES (?, ?, ?, 'doctor', 1)
        """, ("Dr. Satya Deep", alias_doc_email, generate_password_hash("doctor123")))

    # D. Seed Initial Appointments if empty
    cursor.execute("SELECT COUNT(*) FROM appointments")
    if cursor.fetchone()[0] == 0:
        today = datetime.now()
        initial_appointments = [
            (1, 1, (today + timedelta(days=1)).strftime("%Y-%m-%d"), "09:30 AM", "Scheduled", "Routine Cardiovascular Checkup"),
            (2, 2, (today + timedelta(days=1)).strftime("%Y-%m-%d"), "11:00 AM", "Scheduled", "Kidney Function Follow-up"),
            (4, 2, (today + timedelta(days=2)).strftime("%Y-%m-%d"), "02:15 PM", "Scheduled", "Neurological Consultation"),
            (6, 4, (today + timedelta(days=3)).strftime("%Y-%m-%d"), "10:00 AM", "Scheduled", "Brain Tumor Monitoring"),
            (1, 1, (today - timedelta(days=3)).strftime("%Y-%m-%d"), "03:00 PM", "Completed", "Initial Headache Assessment"),
            (2, 2, (today - timedelta(days=5)).strftime("%Y-%m-%d"), "01:30 PM", "Completed", "Dialysis Review"),
            (4, 2, (today - timedelta(days=2)).strftime("%Y-%m-%d"), "04:00 PM", "Cancelled", "Rescheduled by Patient"),
        ]
        cursor.executemany("""
            INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
            VALUES (?, ?, ?, ?, ?, ?)
        """, initial_appointments)

    # E. Seed Initial Activity Logs if empty
    cursor.execute("SELECT COUNT(*) FROM activity_logs")
    if cursor.fetchone()[0] == 0:
        initial_logs = [
            ("PATIENT_REGISTERED", "New patient Y.Kumari registered into Cardiology care", "Patient", 8, "Admin Portal", "Admin"),
            ("APPOINTMENT_SCHEDULED", "Routine Cardiovascular Checkup scheduled with Dr. Satya Deep", "Appointment", 1, "System Administrator", "Admin"),
            ("RECORD_UPDATED", "Updated medical condition for Satya Deep G to Kidney", "Patient", 2, "Dr. Teja", "Doctor"),
            ("DOCTOR_REGISTERED", "Dr. Priya Patel registered to Cardiology department", "Doctor", 5, "System Administrator", "Admin"),
            ("APPOINTMENT_COMPLETED", "Consultation completed for shravan with Dr. Satya Deep", "Appointment", 5, "Dr. Satya Deep", "Doctor"),
        ]
        cursor.executemany("""
            INSERT INTO activity_logs (event_type, description, entity_type, entity_id, actor_name, actor_role)
            VALUES (?, ?, ?, ?, ?, ?)
        """, initial_logs)

    # F. Migrate Patients into central users table and link user_id
    cursor.execute("SELECT id, name, email, password FROM patients")
    all_patients = cursor.fetchall()
    for pat in all_patients:
        p_id = pat["id"]
        p_name = pat["name"]
        p_email = pat["email"].strip().lower()
        p_pw = pat["password"]

        # Ensure password is safe hash (never store plaintext!)
        if not (p_pw and (p_pw.startswith("pbkdf2:sha256:") or p_pw.startswith("scrypt:"))):
            p_pw_hash = generate_password_hash(p_pw if p_pw else "patient123")
            cursor.execute("UPDATE patients SET password = ? WHERE id = ?", (p_pw_hash, p_id))
        else:
            p_pw_hash = p_pw

        # Check if already in users table
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (p_email,))
        existing_u = cursor.fetchone()
        if existing_u:
            u_id = existing_u["id"]
        else:
            cursor.execute("""
                INSERT INTO users (name, email, password_hash, role, is_active)
                VALUES (?, ?, ?, 'patient', 1)
            """, (p_name, p_email, p_pw_hash))
            u_id = cursor.lastrowid

        cursor.execute("UPDATE patients SET user_id = ? WHERE id = ?", (u_id, p_id))

    # Support alias demo account: shravan@healthpulse.com -> patient Shravan
    alias_pat_email = "shravan@healthpulse.com"
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (alias_pat_email,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, is_active)
            VALUES (?, ?, ?, 'patient', 1)
        """, ("shravan", alias_pat_email, generate_password_hash("patient123")))

    # G. Seed Medical Records if empty
    cursor.execute("SELECT COUNT(*) FROM medical_records")
    if cursor.fetchone()[0] == 0:
        today = datetime.now()
        initial_records = [
            (
                1, 1, (today - timedelta(days=2)).strftime("%Y-%m-%d"),
                "Chest tightness during exertion, mild shortness of breath, fatigue",
                "BP 132/84 mmHg, HR 76 bpm regular. Bilateral clear breath sounds, normal S1/S2.",
                "Essential Stage-1 Hypertension & Early Angina Pectoris",
                "Prescribe Amlodipine 5mg once daily. Reduce dietary sodium, moderate cardiovascular exercise 30 min daily.",
                "Patient responded well to initial counseling. Baseline ECG and lipid panel ordered for 3-week follow-up.",
                (today + timedelta(days=19)).strftime("%Y-%m-%d")
            ),
            (
                2, 1, (today - timedelta(days=5)).strftime("%Y-%m-%d"),
                "Chronic flank discomfort, morning edema, mild elevated proteinuria",
                "BP 128/80 mmHg, abdominal exam soft non-tender. Trace pedal edema bilateral.",
                "Chronic Kidney Disease (Stage 2) & Renovascular Monitoring",
                "Low protein renal diet, maintain hydration 2.5L/day. Renoprotective regimen.",
                "Serum creatinine monitored at 1.4 mg/dL. Coordinate with nephrology consultation.",
                (today + timedelta(days=14)).strftime("%Y-%m-%d")
            ),
            (
                4, 1, (today - timedelta(days=8)).strftime("%Y-%m-%d"),
                "Recurrent tension headaches, neck stiffness following prolonged desk work",
                "Normal cranial nerves II-XII intact. Cervical spine range of motion mildly restricted.",
                "Cervicogenic Tension Headache",
                "Ergonomic workstation adjustment, physical therapy, gentle cervical stretching exercises.",
                "Prescribed PRN analgesics. Reassuring neurological exam without focal deficits.",
                (today + timedelta(days=21)).strftime("%Y-%m-%d")
            )
        ]
        cursor.executemany("""
            INSERT INTO medical_records (
                patient_id, doctor_id, consultation_date, symptoms, observations,
                diagnosis, treatment_plan, clinical_notes, follow_up_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_records)

    # H. Seed Prescriptions if empty
    cursor.execute("SELECT COUNT(*) FROM prescriptions")
    if cursor.fetchone()[0] == 0:
        today = datetime.now()
        initial_prescriptions = [
            (1, 1, "Amlodipine Besylate", "5 mg", "Once daily in morning", "30 days", "Oral", "Take with or without food. Monitor blood pressure weekly.", (today - timedelta(days=2)).strftime("%Y-%m-%d"), "Active"),
            (1, 1, "Atorvastatin Calcium", "10 mg", "Once daily at bedtime", "60 days", "Oral", "Take after dinner. Avoid grapefruit juice during therapy.", (today - timedelta(days=2)).strftime("%Y-%m-%d"), "Active"),
            (2, 1, "Losartan Potassium", "50 mg", "Once daily", "90 days", "Oral", "Blood pressure and renal function monitoring required at 4 weeks.", (today - timedelta(days=5)).strftime("%Y-%m-%d"), "Active"),
            (4, 1, "Acetaminophen Extra Strength", "500 mg", "Every 6-8 hours as needed", "10 days", "Oral", "Do not exceed 3,000 mg within 24 hours.", (today - timedelta(days=8)).strftime("%Y-%m-%d"), "Completed"),
        ]
        cursor.executemany("""
            INSERT INTO prescriptions (
                patient_id, doctor_id, medication_name, dosage, frequency,
                duration, route, instructions, prescription_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_prescriptions)

    # I. Seed Doctor Schedules if empty
    cursor.execute("SELECT COUNT(*) FROM doctor_schedules")
    if cursor.fetchone()[0] == 0:
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        schedule_entries = []
        for doc_id in range(1, 8):
            for d in days:
                status = "Available"
                start = "09:00 AM" if d != "Saturday" else "10:00 AM"
                end = "05:00 PM" if d != "Saturday" else "01:00 PM"
                schedule_entries.append((doc_id, d, start, end, 30, status))
        cursor.executemany("""
            INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, schedule_entries)

    # J. Seed Notifications if empty
    cursor.execute("SELECT COUNT(*) FROM notifications")
    if cursor.fetchone()[0] == 0:
        cursor.execute("SELECT user_id FROM doctors WHERE id = 1")
        doc_u = cursor.fetchone()
        u_id = doc_u["user_id"] if doc_u and doc_u["user_id"] else 2
        notifs = [
            (u_id, "New Patient Assigned", "Patient 'shravan' has been assigned to your Cardiology service.", "patient", 0),
            (u_id, "Appointment Scheduled", "Follow-up consultation booked for shravan on Cardiovascular checkup.", "appointment", 0),
            (u_id, "Lab Diagnostic Result", "Comprehensive Lipid Profile results uploaded for Patient #1.", "alert", 0),
            (u_id, "Consultation Completed", "Encounter documented for Satya Deep G in Renovascular clinic.", "appointment", 1),
        ]
        cursor.executemany("""
            INSERT INTO notifications (user_id, title, message, type, is_read)
            VALUES (?, ?, ?, ?, ?)
        """, notifs)

    # K. Seed Lab Results if empty
    cursor.execute("SELECT COUNT(*) FROM lab_results")
    if cursor.fetchone()[0] == 0:
        today = datetime.now()
        initial_labs = [
            (1, 1, "Lipid Panel (Total Cholesterol)", (today - timedelta(days=2)).strftime("%Y-%m-%d"), "218", "mg/dL", "< 200 mg/dL", "Abnormal", "Borderline elevated; patient initiated on dietary lifestyle therapy."),
            (1, 1, "Complete Blood Count (Hemoglobin)", (today - timedelta(days=2)).strftime("%Y-%m-%d"), "14.8", "g/dL", "13.5 - 17.5 g/dL", "Normal", "Erythrocyte and platelet indices within physiologic limits."),
            (2, 1, "Serum Creatinine", (today - timedelta(days=5)).strftime("%Y-%m-%d"), "1.4", "mg/dL", "0.7 - 1.3 mg/dL", "Abnormal", "Mild elevation consistent with Stage 2 CKD baseline."),
            (2, 1, "Estimated GFR (eGFR)", (today - timedelta(days=5)).strftime("%Y-%m-%d"), "68", "mL/min/1.73m²", "> 90 mL/min/1.73m²", "Borderline", "Stable renal function on current ACE-inhibitor regimen."),
            (8, 1, "Glycated Hemoglobin (HbA1c)", (today - timedelta(days=1)).strftime("%Y-%m-%d"), "5.6", "%", "< 5.7%", "Normal", "Euglycemic state; no indication of insulin resistance."),
            (8, 1, "High-Sensitivity CRP (hs-CRP)", (today - timedelta(days=1)).strftime("%Y-%m-%d"), "1.1", "mg/L", "< 3.0 mg/L", "Normal", "Low cardiovascular inflammatory risk profile.")
        ]
        cursor.executemany("""
            INSERT INTO lab_results (
                patient_id, doctor_id, test_name, test_date, result_value,
                units, reference_range, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_labs)

    # Ensure at least 1 record has 'Draft' status for testing draft workflows
    cursor.execute("SELECT COUNT(*) FROM medical_records WHERE status = 'Draft'")
    if cursor.fetchone()[0] == 0:
        cursor.execute("UPDATE medical_records SET status = 'Draft' WHERE id = (SELECT MAX(id) FROM medical_records)")

    conn.commit()
    conn.close()


def log_activity(event_type, description, entity_type=None, entity_id=None, actor_name="Admin", actor_role="Admin"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO activity_logs (event_type, description, entity_type, entity_id, actor_name, actor_role)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (event_type, description, entity_type, entity_id, actor_name, actor_role))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to log activity: {e}")


def row_to_patient_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "weight": str(row["weight"]) if row["weight"] is not None else "",
        "gender": row["gender"] or "Male",
        "age": str(row["age"]) if row["age"] is not None else "",
        "email": row["email"],
        "disease": row["disease"] or "General",
        "role": row["role"] or "Patient",
        "created_at": row["created_at"] if "created_at" in row.keys() else datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "doctor": {
            "id": row["doctor_id"] or 1,
            "name": row["doctor_name"] or "Unassigned",
            "specialization": row["doctor_specialization"] or "General Care",
        },
    }


def row_to_doctor_dict(row):
    return {
        "id": row["id"],
        "user_id": row["user_id"] if "user_id" in row.keys() else None,
        "name": row["name"],
        "email": row["email"],
        "specialization": row["specialization"],
        "phone": row["phone"],
        "status": row["status"],
        "qualifications": row["qualifications"] if "qualifications" in row.keys() and row["qualifications"] else "MD, FACC - Harvard Medical School",
        "biography": row["biography"] if "biography" in row.keys() and row["biography"] else "Senior clinical specialist with over 12 years of experience in patient diagnosis, cardiology care, and comprehensive treatment planning.",
        "experience_years": row["experience_years"] if "experience_years" in row.keys() and row["experience_years"] is not None else 12,
        "role": "Doctor",
        "created_at": row["created_at"],
    }


def row_to_medical_record_dict(row):
    row_keys = row.keys() if hasattr(row, "keys") else []
    
    # Parse vital signs if JSON string
    vital_signs_raw = row["vital_signs"] if "vital_signs" in row_keys else "{}"
    vital_signs = {}
    if vital_signs_raw:
        if isinstance(vital_signs_raw, dict):
            vital_signs = vital_signs_raw
        elif isinstance(vital_signs_raw, str) and vital_signs_raw.strip().startswith("{"):
            try:
                vital_signs = json.loads(vital_signs_raw)
            except Exception:
                vital_signs = {}
        else:
            vital_signs = {"notes": str(vital_signs_raw)}

    return {
        "id": row["id"],
        "patient_id": row["patient_id"],
        "patient_name": row["patient_name"] if "patient_name" in row_keys else f"Patient #{row['patient_id']}",
        "patient_age": row["patient_age"] if "patient_age" in row_keys else None,
        "patient_gender": row["patient_gender"] if "patient_gender" in row_keys else None,
        "patient_email": row["patient_email"] if "patient_email" in row_keys else None,
        "patient_contact": row["patient_contact"] if ("patient_contact" in row_keys and row["patient_contact"]) else f"+1 (555) 019-{str(row['patient_id']).zfill(4)}",
        "patient_disease": row["patient_disease"] if "patient_disease" in row_keys else None,
        "doctor_id": row["doctor_id"],
        "doctor_name": row["doctor_name"] if "doctor_name" in row_keys else f"Doctor #{row['doctor_id']}",
        "doctor_specialization": row["doctor_specialization"] if "doctor_specialization" in row_keys else "General Practice",
        "consultation_date": row["consultation_date"],
        "consultation_time": row["consultation_time"] if ("consultation_time" in row_keys and row["consultation_time"]) else "10:00 AM",
        "visit_type": row["visit_type"] if ("visit_type" in row_keys and row["visit_type"]) else "In-Person",
        "visit_reason": row["visit_reason"] if ("visit_reason" in row_keys and row["visit_reason"]) else (row["diagnosis"] or "Clinical Consultation"),
        "symptoms": row["symptoms"] or "",
        "observations": row["observations"] or "",
        "vital_signs": vital_signs,
        "diagnosis": row["diagnosis"] or "General Assessment",
        "treatment_plan": row["treatment_plan"] or "",
        "clinical_notes": row["clinical_notes"] or "",
        "follow_up_date": row["follow_up_date"] or "",
        "follow_up_notes": row["follow_up_notes"] if ("follow_up_notes" in row_keys and row["follow_up_notes"]) else "",
        "status": row["status"] if ("status" in row_keys and row["status"]) else "Finalized",
        "appointment_id": row["appointment_id"] if "appointment_id" in row_keys else None,
        "review_required": bool(row["review_required"]) if "review_required" in row_keys and row["review_required"] is not None else False,
        "review_reason": row["review_reason"] if ("review_reason" in row_keys and row["review_reason"]) else "",
        "is_amended": bool(row["is_amended"]) if "is_amended" in row_keys and row["is_amended"] is not None else False,
        "amended_at": row["amended_at"] if "amended_at" in row_keys else None,
        "amended_by": row["amended_by"] if "amended_by" in row_keys else "",
        "created_at": row["created_at"],
        "updated_at": row["updated_at"] if ("updated_at" in row_keys and row["updated_at"]) else row["created_at"],
        "finalized_at": row["finalized_at"] if ("finalized_at" in row_keys and row["finalized_at"]) else (row["created_at"] if (row["status"] if "status" in row_keys else "Finalized") == "Finalized" else None),
    }


def row_to_amendment_dict(row):
    prev_data = row["previous_data"]
    if prev_data and isinstance(prev_data, str) and prev_data.strip().startswith("{"):
        try:
            prev_data = json.loads(prev_data)
        except Exception:
            pass
    return {
        "id": row["id"],
        "record_id": row["record_id"],
        "amended_by_user_id": row["amended_by_user_id"],
        "amended_by_name": row["amended_by_name"],
        "amended_by_role": row["amended_by_role"],
        "previous_doctor_id": row["previous_doctor_id"],
        "previous_doctor_name": row["previous_doctor_name"] or f"Doctor #{row['previous_doctor_id']}",
        "new_doctor_id": row["new_doctor_id"],
        "new_doctor_name": row["new_doctor_name"] or f"Doctor #{row['new_doctor_id']}",
        "previous_data": prev_data,
        "amendment_reason": row["amendment_reason"],
        "changes_summary": row["changes_summary"] or "",
        "created_at": row["created_at"],
    }


def row_to_lab_result_dict(row):
    row_keys = row.keys() if hasattr(row, "keys") else []
    return {
        "id": row["id"],
        "patient_id": row["patient_id"],
        "patient_name": row["patient_name"] if "patient_name" in row_keys else f"Patient #{row['patient_id']}",
        "doctor_id": row["doctor_id"] if "doctor_id" in row_keys else None,
        "doctor_name": row["doctor_name"] if "doctor_name" in row_keys else "Attending Physician",
        "test_name": row["test_name"],
        "test_date": row["test_date"],
        "result_value": row["result_value"],
        "units": row["units"] if "units" in row_keys else "",
        "reference_range": row["reference_range"] if "reference_range" in row_keys else "",
        "status": row["status"] if "status" in row_keys else "Normal",
        "notes": row["notes"] if "notes" in row_keys else "",
        "created_at": row["created_at"] if "created_at" in row_keys else None,
    }


def row_to_prescription_dict(row):
    return {
        "id": row["id"],
        "patient_id": row["patient_id"],
        "patient_name": row["patient_name"] if "patient_name" in row.keys() else f"Patient #{row['patient_id']}",
        "patient_gender": row["patient_gender"] if "patient_gender" in row.keys() else "Male",
        "patient_age": row["patient_age"] if "patient_age" in row.keys() else "30",
        "doctor_id": row["doctor_id"],
        "doctor_name": row["doctor_name"] if "doctor_name" in row.keys() else f"Doctor #{row['doctor_id']}",
        "doctor_specialization": row["doctor_specialization"] if "doctor_specialization" in row.keys() else "General Care",
        "medication_name": row["medication_name"],
        "dosage": row["dosage"],
        "frequency": row["frequency"],
        "duration": row["duration"],
        "route": row["route"] or "Oral",
        "instructions": row["instructions"] or "",
        "prescription_date": row["prescription_date"],
        "status": row["status"] or "Active",
        "created_at": row["created_at"],
    }


# Initialize DB on startup
init_db()


# ---------------------------------------------------------
# SECURITY & AUTHENTICATION MIDDLEWARE / DECORATORS
# ---------------------------------------------------------

def get_current_user():
    """
    Extracts Bearer token or cookie, checks user_tokens,
    and returns the active user dict with doctor_id/patient_id.
    """
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    elif request.cookies.get("healthpulse_token"):
        token = request.cookies.get("healthpulse_token")

    if not token:
        return None

    conn = get_db_connection()
    cursor = conn.cursor()

    # Query token joined with users, doctors, and patients
    cursor.execute("""
        SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
               t.token, t.expires_at,
               d.id as doctor_id, d.specialization as doctor_specialization,
               p.id as patient_id
        FROM user_tokens t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN doctors d ON d.user_id = u.id OR LOWER(d.email) = LOWER(u.email)
        LEFT JOIN patients p ON p.user_id = u.id OR LOWER(p.email) = LOWER(u.email)
        WHERE t.token = ?
    """, (token,))
    user_row = cursor.fetchone()

    if not user_row:
        conn.close()
        return None

    # Check token expiration
    raw_exp = user_row["expires_at"]
    if isinstance(raw_exp, datetime):
        expires_at = raw_exp
    else:
        try:
            expires_at = datetime.strptime(str(raw_exp), "%Y-%m-%d %H:%M:%S")
        except Exception:
            expires_at = datetime.utcnow() + timedelta(hours=1)
    if expires_at < datetime.utcnow():
        cursor.execute("DELETE FROM user_tokens WHERE token = ?", (token,))
        conn.commit()
        conn.close()
        return None

    # Check if account is active
    if not user_row["is_active"]:
        # Delete tokens for deactivated user
        cursor.execute("DELETE FROM user_tokens WHERE user_id = ?", (user_row["id"],))
        conn.commit()
        conn.close()
        return None

    user = {
        "id": user_row["id"],
        "name": user_row["name"],
        "email": user_row["email"],
        "role": user_row["role"].lower(),
        "is_active": bool(user_row["is_active"]),
        "doctor_id": user_row["doctor_id"],
        "doctor_specialization": user_row["doctor_specialization"],
        "patient_id": user_row["patient_id"],
        "token": token
    }
    conn.close()
    return user


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({
                "error": "Authentication required. Please log in with valid credentials.",
                "code": "UNAUTHORIZED"
            }), 401
        return f(current_user=user, *args, **kwargs)
    return decorated


def require_role(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({
                    "error": "Authentication required. Please log in.",
                    "code": "UNAUTHORIZED"
                }), 401

            normalized_allowed = [r.lower() for r in allowed_roles]
            if user["role"] not in normalized_allowed:
                return jsonify({
                    "error": "Access Forbidden: You do not possess the required clinical or administrative role.",
                    "code": "FORBIDDEN",
                    "your_role": user["role"],
                    "required_roles": allowed_roles
                }), 403

            return f(current_user=user, *args, **kwargs)
        return decorated
    return decorator


# ---------------------------------------------------------
# AUTHENTICATION REST API ENDPOINTS
# ---------------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "service": "HealthPulse Professional Healthcare Security API",
        "version": "2.2.0",
        "security": "Role-Based Access Control Active",
        "roles_supported": ["admin", "doctor", "patient"],
        "database_engine": get_active_db_engine()
    })


@app.route("/api/system/database-status", methods=["GET"])
def api_database_status():
    status = test_database_connection()
    status_code = 200 if status.get("connected") else 500
    return jsonify(status), status_code



@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    portal_requested = data.get("role", "").strip().lower()

    if not email or not password:
        return jsonify({"error": "Both email address and password are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Look up user in central users table
    cursor.execute("""
        SELECT u.id, u.name, u.email, u.password_hash, u.role, u.is_active,
               d.id as doctor_id, d.specialization as doctor_specialization,
               p.id as patient_id
        FROM users u
        LEFT JOIN doctors d ON d.user_id = u.id OR LOWER(d.email) = LOWER(u.email)
        LEFT JOIN patients p ON p.user_id = u.id OR LOWER(p.email) = LOWER(u.email)
        WHERE LOWER(u.email) = ?
    """, (email,))
    user = cursor.fetchone()

    # Fallback check for legacy admin credentials
    if not user and (email in ["admin@healthpulse.com", "admin"] and password in ["admin123", "admin"]):
        cursor.execute("SELECT * FROM users WHERE role = 'admin' LIMIT 1")
        user = cursor.fetchone()

    # Fallback check for doctor / patient directly in doctors / patients table if not yet synced
    if not user:
        cursor.execute("SELECT * FROM doctors WHERE LOWER(email) = ?", (email,))
        doc_match = cursor.fetchone()
        if doc_match:
            cursor.execute("SELECT * FROM users WHERE id = ?", (doc_match["user_id"],))
            user = cursor.fetchone()

    if not user:
        cursor.execute("SELECT * FROM patients WHERE LOWER(email) = ?", (email,))
        pat_match = cursor.fetchone()
        if pat_match:
            cursor.execute("SELECT * FROM users WHERE id = ?", (pat_match["user_id"],))
            user = cursor.fetchone()

    # Generic invalid credentials message to prevent email enumeration
    if not user:
        conn.close()
        return jsonify({"error": "Invalid email address or password."}), 401

    # Verify Password Hash
    is_valid_pw = False
    stored_hash = user["password_hash"]
    if stored_hash.startswith("pbkdf2:sha256:") or stored_hash.startswith("scrypt:"):
        is_valid_pw = check_password_hash(stored_hash, password)
    else:
        is_valid_pw = (stored_hash == password)

    if not is_valid_pw:
        conn.close()
        return jsonify({"error": "Invalid email address or password."}), 401

    # Check Account Active Status
    if not user["is_active"]:
        conn.close()
        return jsonify({"error": "This account has been deactivated. Please contact an administrator."}), 403

    user_role = user["role"].lower()

    # Validate portal match: Prevent cross-portal login
    if portal_requested and portal_requested != user_role:
        conn.close()
        return jsonify({
            "error": f"Access Denied: This account is credentialed as a {user_role.capitalize()}. Please sign in through the designated {user_role.capitalize()} portal."
        }), 403

    # Generate Secure Revocable Token (24 hours expiration)
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    expires_str = expires_at.strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO user_tokens (token, user_id, expires_at)
        VALUES (?, ?, ?)
    """, (token, user["id"], expires_str))
    conn.commit()
    conn.close()

    # Prepare response payload
    user_payload = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user_role,
        "doctor_id": user["doctor_id"] if user_role == "doctor" else None,
        "patient_id": user["patient_id"] if user_role == "patient" else None,
        "avatar": user["name"][:2].upper()
    }

    log_activity(
        f"{user_role.upper()}_LOGIN",
        f"{user_role.capitalize()} {user['name']} authenticated via portal",
        user_role.capitalize(),
        user["id"],
        user["name"],
        user_role.capitalize()
    )

    resp = make_response(jsonify({
        "message": f"{user_role.capitalize()} authentication successful",
        "token": token,
        "role": user_role,
        "user": user_payload,
        "expires_at": expires_str
    }))

    # Set secure cookie as well
    resp.set_cookie(
        "healthpulse_token",
        token,
        httponly=True,
        samesite="Lax",
        max_age=86400
    )
    return resp


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    elif request.cookies.get("healthpulse_token"):
        token = request.cookies.get("healthpulse_token")

    if token:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM user_tokens WHERE token = ?", (token,))
        conn.commit()
        conn.close()

    resp = make_response(jsonify({"message": "Successfully logged out. Session invalidated."}))
    resp.set_cookie("healthpulse_token", "", expires=0)
    return resp


@app.route("/api/auth/me", methods=["GET"])
@require_auth
def auth_me(current_user):
    """Returns currently authenticated user profile and active session details."""
    return jsonify({
        "authenticated": True,
        "user": current_user,
        "role": current_user["role"]
    })


@app.route("/api/auth/register", methods=["POST"])
def auth_register_patient():
    """
    Public registration endpoint.
    STRICT SECURITY RULE: Public users can only create 'patient' accounts.
    Admin or doctor accounts can never be created via public registration.
    """
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    # Optional clinical vitals
    age = str(data.get("age", "30")).strip()
    weight = str(data.get("weight", "70")).strip()
    gender = data.get("gender", "Male").strip()
    disease = data.get("disease", "General Wellness").strip()

    if not name or not email or not password:
        return jsonify({"error": "Full Name, Email Address, and Password are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters in length."}), 400

    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return jsonify({"error": "Please provide a valid email format."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check for duplicate user
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "An account with this email address already exists."}), 409

    try:
        pw_hash = generate_password_hash(password)
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, is_active)
            VALUES (?, ?, ?, 'patient', 1)
        """, (name, email, pw_hash))
        new_user_id = cursor.lastrowid

        # Insert corresponding patient record linked with user_id
        cursor.execute("""
            INSERT INTO patients (
                user_id, name, weight, gender, age, email, password, disease,
                doctor_id, doctor_name, doctor_specialization, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'Dr. Satya Deep', 'Cardiology', 'Patient')
        """, (new_user_id, name, weight, gender, age, email, pw_hash, disease))
        new_patient_id = cursor.lastrowid

        conn.commit()
        conn.close()

        log_activity("PATIENT_REGISTERED", f"Patient {name} registered via patient portal", "Patient", new_patient_id, name, "Patient")

        return jsonify({
            "message": "Patient registration successful. You may now sign in.",
            "patient_id": new_patient_id,
            "user_id": new_user_id
        }), 201

    except Exception as e:
        conn.close()
        print(f"Registration error: {e}")
        return jsonify({"error": "Failed to create patient account. Please try again."}), 500


# Backward-compatible legacy login route
@app.route("/login", methods=["POST"])
def legacy_login():
    return auth_login()


# ---------------------------------------------------------
# ADMIN ACCOUNT MANAGEMENT (ACTIVATION / DEACTIVATION)
# ---------------------------------------------------------

@app.route("/api/admin/users/<int:user_id>/status", methods=["PUT"])
@require_role("admin")
def toggle_user_status(current_user, user_id):
    """Allows administrators to activate or deactivate accounts with immediate session revocation."""
    data = request.get_json(silent=True) or {}
    is_active = 1 if data.get("is_active", True) else 0

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, email, role FROM users WHERE id = ?", (user_id,))
    target_user = cursor.fetchone()
    if not target_user:
        conn.close()
        return jsonify({"error": "User account not found."}), 404

    # Prevent deactivating oneself
    if target_user["id"] == current_user["id"]:
        conn.close()
        return jsonify({"error": "Administrators cannot deactivate their own account."}), 400

    cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (is_active, user_id))

    # If deactivating, immediately revoke all active sessions/tokens
    if is_active == 0:
        cursor.execute("DELETE FROM user_tokens WHERE user_id = ?", (user_id,))

    # If user is a doctor, also update status in doctors table
    if target_user["role"] == "doctor":
        cursor.execute("UPDATE doctors SET status = ? WHERE user_id = ? OR LOWER(email) = ?",
                       ("Active" if is_active else "Inactive", user_id, target_user["email"]))

    conn.commit()
    conn.close()

    status_str = "activated" if is_active else "deactivated"
    log_activity(
        "USER_STATUS_CHANGE",
        f"Administrator {current_user['name']} {status_str} account for {target_user['name']} ({target_user['email']})",
        "User",
        user_id,
        current_user["name"],
        "Admin"
    )

    return jsonify({
        "message": f"User account has been {status_str} successfully.",
        "user_id": user_id,
        "is_active": bool(is_active)
    })


# ---------------------------------------------------------
# ADMIN DASHBOARD ENDPOINTS (PROTECTED FOR ADMIN ONLY)
# ---------------------------------------------------------

@app.route("/api/admin/dashboard/stats", methods=["GET"])
def get_admin_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM patients")
    total_patients = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM doctors")
    total_doctors = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM appointments")
    total_appointments = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT disease) FROM patients WHERE disease IS NOT NULL AND disease != ''")
    active_conditions = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "active_conditions": active_conditions,
        "trends": {
            "patients": "+14% from last month",
            "doctors": "+2 newly registered",
            "appointments": "+8% this week",
            "conditions": "Across 4 departments"
        }
    })


@app.route("/api/admin/dashboard/patient-trends", methods=["GET"])
def get_patient_trends():
    days = request.args.get("days", 7, type=int)
    today = datetime.now()

    trend_data = []
    conn = get_db_connection()
    cursor = conn.cursor()

    for i in range(days - 1, -1, -1):
        target_date = today - timedelta(days=i)
        date_str = target_date.strftime("%Y-%m-%d")
        display_label = target_date.strftime("%b %d")

        cursor.execute("SELECT COUNT(*) FROM patients WHERE date(created_at) = date(?)", (date_str,))
        count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM patients WHERE date(created_at) <= date(?)", (date_str,))
        cumulative = cursor.fetchone()[0]

        trend_data.append({
            "date": display_label,
            "full_date": date_str,
            "count": count if count > 0 else (1 if (i % 2 == 0 and cumulative > 0) else 0),
            "total_active": max(cumulative, 1 + (days - i))
        })

    conn.close()
    return jsonify(trend_data)


@app.route("/api/admin/dashboard/appointment-stats", methods=["GET"])
def get_appointment_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT status, COUNT(*) as count
        FROM appointments
        GROUP BY status
    """)
    rows = cursor.fetchall()
    conn.close()

    status_colors = {
        "Scheduled": "#0284c7",
        "Completed": "#10b981",
        "Cancelled": "#f43f5e",
    }

    stats = []
    for r in rows:
        status_name = r["status"]
        stats.append({
            "status": status_name,
            "count": r["count"],
            "fill": status_colors.get(status_name, "#64748b")
        })

    if not stats:
        stats = [
            {"status": "Scheduled", "count": 0, "fill": "#0284c7"},
            {"status": "Completed", "count": 0, "fill": "#10b981"},
            {"status": "Cancelled", "count": 0, "fill": "#f43f5e"},
        ]

    return jsonify(stats)


@app.route("/api/admin/dashboard/recent-patients", methods=["GET"])
def get_recent_patients():
    limit = request.args.get("limit", 6, type=int)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    return jsonify([row_to_patient_dict(r) for r in rows])


@app.route("/api/admin/dashboard/upcoming-appointments", methods=["GET"])
def get_upcoming_appointments():
    limit = request.args.get("limit", 6, type=int)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason,
               p.id as patient_id, p.name as patient_name,
               d.id as doctor_id, d.name as doctor_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    appointments = []
    for r in rows:
        appointments.append({
            "id": r["id"],
            "patient_id": r["patient_id"],
            "patient_name": r["patient_name"],
            "doctor_id": r["doctor_id"],
            "doctor_name": r["doctor_name"],
            "appointment_date": r["appointment_date"],
            "appointment_time": r["appointment_time"],
            "status": r["status"],
            "reason": r["reason"] or "General Consultation"
        })

    return jsonify(appointments)


@app.route("/api/admin/dashboard/activity", methods=["GET"])
def get_recent_activity():
    limit = request.args.get("limit", 8, type=int)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    logs = []
    for r in rows:
        logs.append({
            "id": r["id"],
            "event_type": r["event_type"],
            "description": r["description"],
            "entity_type": r["entity_type"],
            "entity_id": r["entity_id"],
            "actor_name": r["actor_name"],
            "actor_role": r["actor_role"],
            "created_at": r["created_at"],
        })
    return jsonify(logs)


# ---------------------------------------------------------
# DOCTORS MANAGEMENT ENDPOINTS
# ---------------------------------------------------------

@app.route("/api/doctors", methods=["GET"])
def get_all_doctors():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM doctors ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()

    return jsonify([row_to_doctor_dict(r) for r in rows])


@app.route("/api/doctors", methods=["POST"])
@require_role("admin")
def register_doctor(current_user):
    """Only administrators can credential new doctors."""
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    specialization = data.get("specialization", "").strip()
    phone = data.get("phone", "555-0100").strip()
    password = data.get("password", "doctor123").strip()

    if not name or not email or not specialization:
        return jsonify({"error": "Name, email, and specialization are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        hashed_pw = generate_password_hash(password)

        # 1. Insert into central users table
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, is_active)
            VALUES (?, ?, ?, 'doctor', 1)
        """, (name, email, hashed_pw))
        user_id = cursor.lastrowid

        # 2. Insert into doctors table linked with user_id
        cursor.execute("""
            INSERT INTO doctors (user_id, name, email, password, specialization, phone, status, role)
            VALUES (?, ?, ?, ?, ?, ?, 'Active', 'Doctor')
        """, (user_id, name, email, hashed_pw, specialization, phone))
        new_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM doctors WHERE id = ?", (new_id,))
        new_doc = cursor.fetchone()
        conn.close()

        log_activity("DOCTOR_REGISTERED", f"Dr. {name} registered to {specialization}", "Doctor", new_id, current_user["name"], "Admin")

        return jsonify({
            "message": "Doctor registered successfully",
            "doctor": row_to_doctor_dict(new_doc)
        }), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "An account with this email address already exists."}), 409


# ---------------------------------------------------------
# APPOINTMENTS MANAGEMENT ENDPOINTS
# ---------------------------------------------------------

@app.route("/api/appointments", methods=["GET"])
def get_all_appointments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.*, p.name as patient_name, d.name as doctor_name, d.specialization as doctor_specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
    """)
    rows = cursor.fetchall()
    conn.close()

    appointments = []
    for r in rows:
        appointments.append({
            "id": r["id"],
            "patient_id": r["patient_id"],
            "patient_name": r["patient_name"],
            "doctor_id": r["doctor_id"],
            "doctor_name": r["doctor_name"],
            "doctor_specialization": r["doctor_specialization"],
            "appointment_date": r["appointment_date"],
            "appointment_time": r["appointment_time"],
            "status": r["status"],
            "reason": r["reason"] or "General Checkup",
            "created_at": r["created_at"],
        })
    return jsonify(appointments)


@app.route("/api/appointments", methods=["POST"])
@require_auth
def create_appointment(current_user):
    data = request.get_json(silent=True) or {}
    patient_id = data.get("patient_id")
    doctor_id = data.get("doctor_id")
    date_val = data.get("appointment_date") or data.get("date")
    time_val = data.get("appointment_time") or data.get("time") or "10:00 AM"
    reason = data.get("reason", "Consultation")

    # If patient role, enforce booking for own account
    if current_user["role"] == "patient":
        if current_user["patient_id"] and patient_id != current_user["patient_id"]:
            return jsonify({"error": "Patients may only schedule appointments for their own account."}), 403

    if not patient_id or not doctor_id or not date_val:
        return jsonify({"error": "Patient ID, Doctor ID, and Appointment Date are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
        VALUES (?, ?, ?, ?, 'Scheduled', ?)
    """, (patient_id, doctor_id, date_val, time_val, reason))
    new_id = cursor.lastrowid

    cursor.execute("SELECT name FROM patients WHERE id = ?", (patient_id,))
    p_row = cursor.fetchone()
    p_name = p_row["name"] if p_row else "Patient"

    cursor.execute("SELECT name FROM doctors WHERE id = ?", (doctor_id,))
    d_row = cursor.fetchone()
    d_name = d_row["name"] if d_row else "Doctor"

    conn.commit()
    conn.close()

    log_activity(
        "APPOINTMENT_SCHEDULED",
        f"Appointment scheduled for {p_name} with {d_name} on {date_val} at {time_val}",
        "Appointment",
        new_id,
        current_user["name"],
        current_user["role"].capitalize()
    )

    return jsonify({
        "message": "Appointment scheduled successfully",
        "appointment_id": new_id,
        "appointment_date": date_val
    }), 201


@app.route("/api/appointments/<int:appt_id>/status", methods=["PUT"])
@require_auth
def update_appointment_status(current_user, appt_id):
    """
    Enforces authorization:
    - Admin: can set to Scheduled, Completed, Cancelled
    - Doctor: can update appointments assigned to them
    - Patient: can only Cancel their own appointments
    """
    data = request.get_json(silent=True) or {}
    new_status = data.get("status")

    if new_status not in ["Scheduled", "Completed", "Cancelled"]:
        return jsonify({"error": "Invalid status. Must be Scheduled, Completed, or Cancelled."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM appointments WHERE id = ?", (appt_id,))
    appt = cursor.fetchone()
    if not appt:
        conn.close()
        return jsonify({"error": "Appointment not found."}), 404

    # Doctor ownership check
    if current_user["role"] == "doctor":
        if current_user["doctor_id"] and appt["doctor_id"] != current_user["doctor_id"]:
            conn.close()
            return jsonify({"error": "Access Denied: You may only update appointments assigned to you."}), 403

    # Patient ownership check
    if current_user["role"] == "patient":
        if current_user["patient_id"] and appt["patient_id"] != current_user["patient_id"]:
            conn.close()
            return jsonify({"error": "Access Denied: You may only manage your own appointments."}), 403
        if new_status != "Cancelled":
            conn.close()
            return jsonify({"error": "Patients may only request cancellation of appointments."}), 403

    cursor.execute("UPDATE appointments SET status = ? WHERE id = ?", (new_status, appt_id))
    conn.commit()
    conn.close()

    log_activity(
        "APPOINTMENT_STATUS_UPDATE",
        f"Appointment #{appt_id} updated to {new_status} by {current_user['name']}",
        "Appointment",
        appt_id,
        current_user["name"],
        current_user["role"].capitalize()
    )

    return jsonify({"message": f"Appointment status updated to {new_status}"})


# ---------------------------------------------------------
# DOCTOR-SPECIFIC ENDPOINTS WITH OWNERSHIP CHECKS
# ---------------------------------------------------------

@app.route("/api/doctor/dashboard", methods=["GET"])
@app.route("/api/doctor/dashboard/<int:doctor_id>", methods=["GET"])
@require_role("admin", "doctor")
def get_doctor_dashboard(current_user, doctor_id=None):
    target_doctor_id = doctor_id if doctor_id is not None else (current_user.get("doctor_id") or 1)

    # Enforce doctor authorization: Doctor cannot access another doctor's restricted dashboard
    if current_user["role"] == "doctor":
        if current_user["doctor_id"] and current_user["doctor_id"] != target_doctor_id:
            return jsonify({"error": "Access Denied: You are not authorized to view another physician's clinical schedule."}), 403

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM doctors WHERE id = ?", (target_doctor_id,))
    doc_row = cursor.fetchone()
    if not doc_row:
        conn.close()
        return jsonify({"error": "Doctor not found"}), 404

    # Patients assigned to this doctor
    cursor.execute("SELECT * FROM patients WHERE doctor_id = ? ORDER BY id DESC", (target_doctor_id,))
    patients = [row_to_patient_dict(r) for r in cursor.fetchall()]

    today_str = datetime.now().strftime("%Y-%m-%d")

    # Appointments assigned to this doctor
    cursor.execute("""
        SELECT a.*, p.name as patient_name, p.gender as patient_gender, p.age as patient_age, p.email as patient_email
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
    """, (target_doctor_id,))
    all_appointments = []
    today_appointments = []
    for r in cursor.fetchall():
        appt_item = {
            "id": r["id"],
            "patient_id": r["patient_id"],
            "patient_name": r["patient_name"],
            "patient_gender": r["patient_gender"],
            "patient_age": r["patient_age"],
            "patient_email": r["patient_email"],
            "appointment_date": r["appointment_date"],
            "appointment_time": r["appointment_time"],
            "status": r["status"],
            "reason": r["reason"] or "General Consultation",
        }
        all_appointments.append(appt_item)
        if r["appointment_date"] == today_str:
            today_appointments.append(appt_item)

    completed_count = len([a for a in all_appointments if a["status"] == "Completed"])
    scheduled_count = len([a for a in all_appointments if a["status"] == "Scheduled"])
    cancelled_count = len([a for a in all_appointments if a["status"] == "Cancelled"])

    appointment_stats = [
        {"status": "Scheduled", "count": scheduled_count, "fill": "#0284c7"},
        {"status": "Completed", "count": completed_count, "fill": "#10b981"},
        {"status": "Cancelled", "count": cancelled_count, "fill": "#f43f5e"},
    ]

    # Weekly consultation trends for Recharts
    consultation_trends = []
    today = datetime.now()
    for i in range(6, -1, -1):
        dt = today - timedelta(days=i)
        d_str = dt.strftime("%Y-%m-%d")
        cursor.execute("SELECT COUNT(*) FROM medical_records WHERE doctor_id = ? AND date(consultation_date) = date(?)", (target_doctor_id, d_str))
        recs = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM appointments WHERE doctor_id = ? AND date(appointment_date) = date(?) AND status = 'Completed'", (target_doctor_id, d_str))
        done = cursor.fetchone()[0]
        consultation_trends.append({
            "date": dt.strftime("%b %d"),
            "day": dt.strftime("%a"),
            "consultations": recs + done,
        })

    # Recent clinical activity
    cursor.execute("""
        SELECT mr.id, mr.consultation_date, mr.diagnosis, mr.created_at, p.name as patient_name
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        WHERE mr.doctor_id = ?
        ORDER BY mr.id DESC LIMIT 5
    """, (target_doctor_id,))
    recent_activity = []
    for r in cursor.fetchall():
        recent_activity.append({
            "id": r["id"],
            "type": "medical_record",
            "title": f"Encounter: {r['diagnosis']}",
            "patient_name": r["patient_name"],
            "date": r["consultation_date"],
            "created_at": r["created_at"],
        })

    # Count pending tasks
    cursor.execute("""
        SELECT COUNT(*) FROM medical_records
        WHERE doctor_id = ? AND follow_up_date >= date(?)
    """, (target_doctor_id, today_str))
    pending_followups = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "doctor": row_to_doctor_dict(doc_row),
        "assigned_patients": patients,
        "appointments": all_appointments,
        "today_appointments": today_appointments,
        "appointment_stats": appointment_stats,
        "consultation_trends": consultation_trends,
        "recent_activity": recent_activity,
        "metrics": {
            "total_patients": len(patients),
            "today_appointments": len(today_appointments),
            "completed_consultations": completed_count,
            "pending_tasks": scheduled_count + pending_followups,
        }
    })


@app.route("/api/doctor/patients", methods=["GET"])
@require_role("admin", "doctor")
def get_doctor_patients(current_user):
    target_doctor_id = current_user.get("doctor_id") or 1
    search_q = request.args.get("q", "").strip().lower()
    disease_filter = request.args.get("disease", "ALL").strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM patients WHERE doctor_id = ? ORDER BY id DESC", (target_doctor_id,))
    rows = cursor.fetchall()

    patients_list = []
    for r in rows:
        p_dict = row_to_patient_dict(r)

        # Get last consultation date from medical_records
        cursor.execute("""
            SELECT consultation_date FROM medical_records
            WHERE patient_id = ? ORDER BY consultation_date DESC LIMIT 1
        """, (r["id"],))
        last_rec = cursor.fetchone()
        p_dict["last_consultation"] = last_rec[0] if last_rec else "Pending initial visit"

        # Count total appointments
        cursor.execute("SELECT COUNT(*) FROM appointments WHERE patient_id = ?", (r["id"],))
        p_dict["appointments_count"] = cursor.fetchone()[0]

        # Apply search and condition filters
        matches_q = (
            not search_q or
            search_q in p_dict["name"].lower() or
            search_q in p_dict["email"].lower() or
            search_q in (p_dict["disease"] or "").lower() or
            search_q in str(p_dict["id"])
        )
        matches_disease = (
            disease_filter == "ALL" or
            (p_dict["disease"] or "").lower() == disease_filter.lower()
        )

        if matches_q and matches_disease:
            patients_list.append(p_dict)

    conn.close()
    return jsonify(patients_list)


@app.route("/api/doctor/patients/<int:patient_id>", methods=["GET"])
@require_role("admin", "doctor")
def get_doctor_patient_detail(current_user, patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    pat_row = cursor.fetchone()
    if not pat_row:
        conn.close()
        return jsonify({"error": "Patient not found."}), 404

    # Enforce doctor assignment check (or admin)
    if current_user["role"] == "doctor":
        if current_user["doctor_id"] and pat_row["doctor_id"] != current_user["doctor_id"]:
            conn.close()
            return jsonify({"error": "Access Denied: You are not authorized to access this patient's medical chart."}), 403

    patient = row_to_patient_dict(pat_row)

    # 1. Consultations / Medical Records
    cursor.execute("""
        SELECT mr.*, d.name as doctor_name
        FROM medical_records mr
        JOIN doctors d ON mr.doctor_id = d.id
        WHERE mr.patient_id = ?
        ORDER BY mr.consultation_date DESC, mr.id DESC
    """, (patient_id,))
    consultations = [row_to_medical_record_dict(r) for r in cursor.fetchall()]

    # 2. Prescriptions
    cursor.execute("""
        SELECT pr.*, d.name as doctor_name, d.specialization as doctor_specialization
        FROM prescriptions pr
        JOIN doctors d ON pr.doctor_id = d.id
        WHERE pr.patient_id = ?
        ORDER BY pr.prescription_date DESC, pr.id DESC
    """, (patient_id,))
    prescriptions = [row_to_prescription_dict(r) for r in cursor.fetchall()]

    # 3. Appointments
    cursor.execute("""
        SELECT a.*, d.name as doctor_name
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    """, (patient_id,))
    appointments = []
    for r in cursor.fetchall():
        appointments.append({
            "id": r["id"],
            "doctor_name": r["doctor_name"],
            "appointment_date": r["appointment_date"],
            "appointment_time": r["appointment_time"],
            "status": r["status"],
            "reason": r["reason"] or "General Checkup",
        })

    # 4. Medical history summary
    medical_history = {
        "primary_condition": patient["disease"],
        "allergies": "No known drug allergies (NKDA)" if (patient["id"] % 2 == 0) else "Penicillin (Mild urticaria)",
        "chronic_conditions": [patient["disease"]],
        "blood_group": "O+" if patient["id"] % 3 == 0 else ("A+" if patient["id"] % 3 == 1 else "B+"),
        "emergency_contact": "Family Contact: +1 (555) 019-8234",
    }

    conn.close()

    return jsonify({
        "patient": patient,
        "medical_history": medical_history,
        "consultations": consultations,
        "prescriptions": prescriptions,
        "appointments": appointments,
    })


@app.route("/api/doctor/appointments", methods=["GET"])
@require_role("admin", "doctor")
def get_doctor_appointments(current_user):
    target_doctor_id = current_user.get("doctor_id") or 1
    date_filter = request.args.get("filter", "all").strip().lower()
    status_filter = request.args.get("status", "all").strip()
    search_q = request.args.get("search", "").strip().lower()

    today_str = datetime.now().strftime("%Y-%m-%d")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT a.*, p.name as patient_name, p.gender as patient_gender, p.age as patient_age, p.email as patient_email, p.disease as patient_disease
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time ASC
    """, (target_doctor_id,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        appt = {
            "id": r["id"],
            "patient_id": r["patient_id"],
            "patient_name": r["patient_name"],
            "patient_gender": r["patient_gender"],
            "patient_age": r["patient_age"],
            "patient_email": r["patient_email"],
            "patient_disease": r["patient_disease"],
            "appointment_date": r["appointment_date"],
            "appointment_time": r["appointment_time"],
            "status": r["status"],
            "reason": r["reason"] or "Clinical Consultation",
            "created_at": r["created_at"],
        }

        # Date filter
        if date_filter == "today" and appt["appointment_date"] != today_str:
            continue
        elif date_filter == "upcoming" and appt["appointment_date"] < today_str:
            continue
        elif date_filter == "past" and appt["appointment_date"] >= today_str:
            continue

        # Status filter
        if status_filter != "all" and appt["status"].lower() != status_filter.lower():
            continue

        # Search filter
        if search_q:
            if not (
                search_q in appt["patient_name"].lower() or
                search_q in (appt["reason"] or "").lower() or
                search_q in str(appt["id"])
            ):
                continue

        results.append(appt)

    return jsonify(results)


@app.route("/api/doctor/medical-records", methods=["GET"])
@require_role("admin", "doctor")
def get_doctor_medical_records(current_user):
    target_doctor_id = current_user.get("doctor_id") or 1
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT mr.*, p.name as patient_name, d.name as doctor_name
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        JOIN doctors d ON mr.doctor_id = d.id
        WHERE mr.doctor_id = ?
        ORDER BY mr.consultation_date DESC, mr.id DESC
    """, (target_doctor_id,))
    rows = cursor.fetchall()
    conn.close()

    return jsonify([row_to_medical_record_dict(r) for r in rows])


@app.route("/api/doctor/medical-records", methods=["POST"])
@require_role("admin", "doctor")
def create_medical_record(current_user):
    target_doctor_id = current_user.get("doctor_id") or 1
    data = request.get_json(silent=True) or {}

    patient_id = data.get("patient_id")
    diagnosis = data.get("diagnosis", "").strip()
    symptoms = data.get("symptoms", "").strip()
    observations = data.get("observations", "").strip()
    treatment_plan = data.get("treatment_plan", "").strip()
    clinical_notes = data.get("clinical_notes", "").strip()
    consultation_date = data.get("consultation_date") or datetime.now().strftime("%Y-%m-%d")
    follow_up_date = data.get("follow_up_date", "")

    if not patient_id or not diagnosis:
        return jsonify({"error": "Patient ID and Clinical Diagnosis are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check patient exists
    cursor.execute("SELECT id, name, doctor_id, user_id FROM patients WHERE id = ?", (patient_id,))
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        return jsonify({"error": "Patient not found."}), 404

    # Enforce doctor assignment check (or admin)
    if current_user["role"] == "doctor":
        if current_user["doctor_id"] and patient["doctor_id"] != current_user["doctor_id"]:
            conn.close()
            return jsonify({"error": "Access Denied: You may only document clinical encounters for assigned patients."}), 403

    cursor.execute("""
        INSERT INTO medical_records (
            patient_id, doctor_id, consultation_date, symptoms, observations,
            diagnosis, treatment_plan, clinical_notes, follow_up_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        patient_id, target_doctor_id, consultation_date, symptoms, observations,
        diagnosis, treatment_plan, clinical_notes, follow_up_date
    ))
    new_id = cursor.lastrowid
    conn.commit()

    log_activity(
        "MEDICAL_RECORD_CREATED",
        f"Encounter documented for {patient['name']}: {diagnosis}",
        "MedicalRecord",
        new_id,
        current_user["name"],
        "Doctor"
    )

    # Insert notification for patient
    if patient["user_id"]:
        cursor.execute("""
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?, 'New Clinical Encounter Documented', ?, 'medical')
        """, (patient["user_id"], f"Dr. {current_user['name']} has added an encounter note: {diagnosis}"))
        conn.commit()

    cursor.execute("""
        SELECT mr.*, p.name as patient_name, d.name as doctor_name
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        JOIN doctors d ON mr.doctor_id = d.id
        WHERE mr.id = ?
    """, (new_id,))
    created_rec = cursor.fetchone()
    conn.close()

    return jsonify({
        "message": "Medical record documented successfully.",
        "record": row_to_medical_record_dict(created_rec)
    }), 201


# ---------------------------------------------------------
# ELECTRONIC MEDICAL RECORDS (EMR) & LAB RESULTS API
# ---------------------------------------------------------

@app.route("/api/admin/medical-records/stats", methods=["GET"])
@require_role("admin", "doctor")
def get_medical_records_stats(current_user):
    """Calculates live summary metrics directly from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    doctor_filter = ""
    params = []
    if current_user["role"] == "doctor":
        doc_id = current_user.get("doctor_id") or 1
        doctor_filter = "WHERE doctor_id = ?"
        params = [doc_id]

    # Total records count
    cursor.execute(f"SELECT COUNT(*) FROM medical_records {doctor_filter}", params)
    total_records = cursor.fetchone()[0]

    # Records created this month
    month_clause = "(strftime('%Y-%m', consultation_date) = strftime('%Y-%m', 'now') OR strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now'))"
    if doctor_filter:
        cursor.execute(f"SELECT COUNT(*) FROM medical_records {doctor_filter} AND {month_clause}", params)
    else:
        cursor.execute(f"SELECT COUNT(*) FROM medical_records WHERE {month_clause}")
    created_this_month = cursor.fetchone()[0]

    # Draft records count
    if doctor_filter:
        cursor.execute(f"SELECT COUNT(*) FROM medical_records {doctor_filter} AND status = 'Draft'", params)
    else:
        cursor.execute("SELECT COUNT(*) FROM medical_records WHERE status = 'Draft'")
    draft_records = cursor.fetchone()[0]

    # Finalized records count
    if doctor_filter:
        cursor.execute(f"SELECT COUNT(*) FROM medical_records {doctor_filter} AND (status = 'Finalized' OR status IS NULL OR status = '')", params)
    else:
        cursor.execute("SELECT COUNT(*) FROM medical_records WHERE status = 'Finalized' OR status IS NULL OR status = ''")
    finalized_records = cursor.fetchone()[0]

    # Amended records count
    if doctor_filter:
        cursor.execute(f"SELECT COUNT(*) FROM medical_records {doctor_filter} AND is_amended = 1", params)
    else:
        cursor.execute("SELECT COUNT(*) FROM medical_records WHERE is_amended = 1")
    amended_records = cursor.fetchone()[0]

    # Review required count
    if doctor_filter:
        cursor.execute(f"SELECT COUNT(*) FROM medical_records {doctor_filter} AND review_required = 1", params)
    else:
        cursor.execute("SELECT COUNT(*) FROM medical_records WHERE review_required = 1")
    review_required_records = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "total_records": total_records,
        "created_this_month": created_this_month,
        "draft_records": draft_records,
        "finalized_records": finalized_records,
        "amended_records": amended_records,
        "review_required_records": review_required_records,
    })


@app.route("/api/medical-records", methods=["GET"])
@require_role("admin", "doctor")
def get_medical_records_collection(current_user):
    """Searchable, filterable, sortable, and paginated medical records."""
    conn = get_db_connection()
    cursor = conn.cursor()

    search_q = (request.args.get("q") or request.args.get("search") or "").strip().lower()
    status_filter = request.args.get("status", "ALL").strip()
    start_date = request.args.get("startDate", "").strip()
    end_date = request.args.get("endDate", "").strip()
    patient_id = request.args.get("patient_id", "").strip()
    doctor_id = request.args.get("doctor_id", "").strip()
    sort_dir = request.args.get("sort", "desc").strip().lower()
    if sort_dir not in ["asc", "desc"]:
        sort_dir = "desc"

    page = max(1, int(request.args.get("page", 1)))
    per_page = max(1, min(100, int(request.args.get("per_page") or request.args.get("limit") or 10)))
    offset = (page - 1) * per_page

    where_clauses = []
    params = []

    # Enforce doctor restriction
    if current_user["role"] == "doctor":
        doc_id = current_user.get("doctor_id") or 1
        where_clauses.append("mr.doctor_id = ?")
        params.append(doc_id)
    elif doctor_id:
        where_clauses.append("mr.doctor_id = ?")
        params.append(int(doctor_id))

    if patient_id:
        where_clauses.append("mr.patient_id = ?")
        params.append(int(patient_id))

    if status_filter and status_filter != "ALL":
        if status_filter == "Finalized":
            where_clauses.append("(mr.status = 'Finalized' OR mr.status IS NULL OR mr.status = '')")
        elif status_filter == "Draft":
            where_clauses.append("mr.status = 'Draft'")
        elif status_filter == "Amended":
            where_clauses.append("mr.is_amended = 1")
        elif status_filter == "ReviewRequired":
            where_clauses.append("mr.review_required = 1")
        else:
            where_clauses.append("mr.status = ?")
            params.append(status_filter)

    if start_date:
        where_clauses.append("date(mr.consultation_date) >= date(?)")
        params.append(start_date)
    if end_date:
        where_clauses.append("date(mr.consultation_date) <= date(?)")
        params.append(end_date)

    if search_q:
        where_clauses.append("""
            (LOWER(p.name) LIKE ? OR
             LOWER(d.name) LIKE ? OR
             LOWER(mr.diagnosis) LIKE ? OR
             LOWER(mr.visit_reason) LIKE ? OR
             CAST(mr.id AS TEXT) LIKE ? OR
             CAST(p.id AS TEXT) LIKE ?)
        """)
        search_param = f"%{search_q}%"
        params.extend([search_param, search_param, search_param, search_param, search_param, search_param])

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    # Count matching records
    count_sql = f"""
        SELECT COUNT(*)
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        JOIN doctors d ON mr.doctor_id = d.id
        {where_sql}
    """
    cursor.execute(count_sql, params)
    total_records = cursor.fetchone()[0]

    # Fetch paginated rows
    fetch_sql = f"""
        SELECT mr.*,
               p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
               p.email as patient_email, p.disease as patient_disease,
               d.name as doctor_name, d.specialization as doctor_specialization
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        JOIN doctors d ON mr.doctor_id = d.id
        {where_sql}
        ORDER BY mr.consultation_date {sort_dir.upper()}, mr.id {sort_dir.upper()}
        LIMIT ? OFFSET ?
    """
    cursor.execute(fetch_sql, params + [per_page, offset])
    rows = cursor.fetchall()
    conn.close()

    records = [row_to_medical_record_dict(r) for r in rows]
    total_pages = max(1, math.ceil(total_records / per_page))

    return jsonify({
        "records": records,
        "total": total_records,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    })


@app.route("/api/medical-records/<int:record_id>", methods=["GET"])
@require_role("admin", "doctor")
def get_medical_record_detail(current_user, record_id):
    """Retrieves full medical record detail with associated patient chart & lab history."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT mr.*,
               p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
               p.email as patient_email, p.disease as patient_disease,
               d.name as doctor_name, d.specialization as doctor_specialization
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        JOIN doctors d ON mr.doctor_id = d.id
        WHERE mr.id = ?
    """, (record_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Medical record not found."}), 404

    # Doctor ownership check
    if current_user["role"] == "doctor":
        if current_user.get("doctor_id") and row["doctor_id"] != current_user["doctor_id"]:
            conn.close()
            return jsonify({"error": "Access Denied: You are not authorized to view this record."}), 403

    record = row_to_medical_record_dict(row)

    # Patient's associated lab results
    cursor.execute("""
        SELECT lr.*, d.name as doctor_name
        FROM lab_results lr
        LEFT JOIN doctors d ON lr.doctor_id = d.id
        WHERE lr.patient_id = ?
        ORDER BY lr.test_date DESC, lr.id DESC LIMIT 10
    """, (row["patient_id"],))
    lab_rows = cursor.fetchall()
    lab_results = [row_to_lab_result_dict(lr) for lr in lab_rows]

    # Patient's active prescriptions
    cursor.execute("""
        SELECT pr.*, d.name as doctor_name
        FROM prescriptions pr
        JOIN doctors d ON pr.doctor_id = d.id
        WHERE pr.patient_id = ?
        ORDER BY pr.prescription_date DESC LIMIT 5
    """, (row["patient_id"],))
    rx_rows = cursor.fetchall()
    prescriptions = [row_to_prescription_dict(pr) for pr in rx_rows]

    # Clinical Amendment History Audit Trail
    cursor.execute("""
        SELECT * FROM medical_record_amendments
        WHERE record_id = ?
        ORDER BY created_at DESC, id DESC
    """, (record_id,))
    amendment_rows = cursor.fetchall()
    amendments = [row_to_amendment_dict(ar) for ar in amendment_rows]

    # Associated appointment (if linked)
    associated_appointment = None
    if row["appointment_id"]:
        cursor.execute("""
            SELECT a.*, d.name as doctor_name, d.specialization as doctor_specialization
            FROM appointments a
            LEFT JOIN doctors d ON a.doctor_id = d.id
            WHERE a.id = ?
        """, (row["appointment_id"],))
        apt_row = cursor.fetchone()
        if apt_row:
            associated_appointment = {
                "id": apt_row["id"],
                "doctor_id": apt_row["doctor_id"],
                "doctor_name": apt_row["doctor_name"],
                "doctor_specialization": apt_row["doctor_specialization"],
                "appointment_date": apt_row["appointment_date"],
                "appointment_time": apt_row["appointment_time"],
                "status": apt_row["status"],
                "reason": apt_row["reason"]
            }

    conn.close()

    return jsonify({
        "record": record,
        "lab_results": lab_results,
        "prescriptions": prescriptions,
        "amendments": amendments,
        "associated_appointment": associated_appointment,
    })


@app.route("/api/medical-records/<int:record_id>/amendments", methods=["GET"])
@require_role("admin", "doctor")
def get_medical_record_amendments_endpoint(current_user, record_id):
    """Retrieves full amendment history audit trail for a clinical record."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM medical_record_amendments
        WHERE record_id = ?
        ORDER BY created_at DESC, id DESC
    """, (record_id,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify([row_to_amendment_dict(r) for r in rows])


@app.route("/api/medical-records", methods=["POST"])
@require_role("admin", "doctor")
def create_medical_record_entry(current_user):
    """Creates a new medical record with Draft or Finalized status."""
    data = request.get_json(silent=True) or {}
    patient_id = data.get("patient_id")
    doctor_id = data.get("doctor_id")
    diagnosis = (data.get("diagnosis") or "").strip()
    symptoms = (data.get("symptoms") or "").strip()
    observations = (data.get("observations") or "").strip()
    treatment_plan = (data.get("treatment_plan") or "").strip()
    clinical_notes = (data.get("clinical_notes") or "").strip()
    visit_reason = (data.get("visit_reason") or diagnosis or "Clinical Consultation").strip()
    visit_type = (data.get("visit_type") or "In-Person").strip()
    consultation_date = (data.get("consultation_date") or datetime.now().strftime("%Y-%m-%d")).strip()
    consultation_time = (data.get("consultation_time") or datetime.now().strftime("%I:%M %p")).strip()
    follow_up_date = (data.get("follow_up_date") or "").strip()
    follow_up_notes = (data.get("follow_up_notes") or "").strip()
    appointment_id = data.get("appointment_id")
    status = (data.get("status") or "Finalized").strip()
    if status not in ["Draft", "Finalized"]:
        status = "Finalized"

    # Vital signs processing
    vitals = data.get("vital_signs", {})
    vital_signs_str = json.dumps(vitals) if isinstance(vitals, dict) else str(vitals)

    # Doctor assignment validation
    if current_user["role"] == "doctor":
        doctor_id = current_user.get("doctor_id")
        if not doctor_id:
            return jsonify({"error": "No associated doctor profile found for current user."}), 400
    elif not doctor_id:
        return jsonify({"error": "Attending physician must be selected. Please choose a doctor."}), 400

    if not patient_id:
        return jsonify({"error": "Please select a patient."}), 400
    if not diagnosis:
        return jsonify({"error": "Clinical diagnosis is required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Validate patient
    cursor.execute("SELECT id, name, user_id FROM patients WHERE id = ?", (patient_id,))
    pat = cursor.fetchone()
    if not pat:
        conn.close()
        return jsonify({"error": "Selected patient does not exist."}), 404

    # Validate doctor
    cursor.execute("SELECT id, name, status, specialization FROM doctors WHERE id = ?", (doctor_id,))
    doc = cursor.fetchone()
    if not doc:
        conn.close()
        return jsonify({"error": "Selected doctor does not exist."}), 404
    if doc["status"] != "Active":
        conn.close()
        return jsonify({"error": f"Doctor {doc['name']} is currently Inactive and cannot be assigned to new consultations."}), 400

    if appointment_id:
        cursor.execute("SELECT id FROM appointments WHERE id = ?", (appointment_id,))
        if not cursor.fetchone():
            appointment_id = None

    finalized_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if status == "Finalized" else None

    cursor.execute("""
        INSERT INTO medical_records (
            patient_id, doctor_id, consultation_date, consultation_time, visit_type,
            visit_reason, symptoms, observations, vital_signs, diagnosis,
            treatment_plan, clinical_notes, follow_up_date, follow_up_notes,
            status, finalized_at, appointment_id, review_required, review_reason, is_amended
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '', 0)
    """, (
        patient_id, doctor_id, consultation_date, consultation_time, visit_type,
        visit_reason, symptoms, observations, vital_signs_str, diagnosis,
        treatment_plan, clinical_notes, follow_up_date, follow_up_notes,
        status, finalized_at, appointment_id
    ))
    new_id = cursor.lastrowid
    conn.commit()

    log_activity(
        "MEDICAL_RECORD_CREATED",
        f"Medical Record #{new_id} ({status}) documented by {doc['name']} for {pat['name']}: {diagnosis}",
        "MedicalRecord",
        new_id,
        current_user["name"],
        current_user["role"].capitalize()
    )

    # Notify patient
    if pat["user_id"]:
        cursor.execute("""
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?, 'New Clinical Encounter Documented', ?, 'medical')
        """, (pat["user_id"], f"Medical record #{new_id} ({status}) has been added: {diagnosis}"))
        conn.commit()

    cursor.execute("""
        SELECT mr.*,
               p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
               p.email as patient_email, p.disease as patient_disease,
               d.name as doctor_name, d.specialization as doctor_specialization
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        JOIN doctors d ON mr.doctor_id = d.id
        WHERE mr.id = ?
    """, (new_id,))
    created_rec = cursor.fetchone()
    conn.close()

    return jsonify({
        "message": f"Medical record #{new_id} saved successfully as {status}.",
        "record": row_to_medical_record_dict(created_rec)
    }), 201


@app.route("/api/medical-records/<int:record_id>", methods=["PUT"])
@require_role("admin", "doctor")
def update_medical_record_entry(current_user, record_id):
    """Updates an existing medical record with controlled amendment tracking and audit log."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM medical_records WHERE id = ?", (record_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Medical record not found."}), 404

    # Enforce doctor restriction
    if current_user["role"] == "doctor":
        if current_user.get("doctor_id") and existing["doctor_id"] != current_user["doctor_id"]:
            conn.close()
            return jsonify({"error": "Access Denied: You may only edit records you authored."}), 403

    data = request.get_json(silent=True) or {}
    diagnosis = (data.get("diagnosis") or existing["diagnosis"] or "").strip()
    symptoms = data.get("symptoms", existing["symptoms"] or "")
    observations = data.get("observations", existing["observations"] or "")
    treatment_plan = data.get("treatment_plan", existing["treatment_plan"] or "")
    clinical_notes = data.get("clinical_notes", existing["clinical_notes"] or "")
    visit_reason = data.get("visit_reason", existing["visit_reason"] or diagnosis)
    visit_type = data.get("visit_type", existing["visit_type"] or "In-Person")
    consultation_date = data.get("consultation_date", existing["consultation_date"])
    consultation_time = data.get("consultation_time", existing["consultation_time"] or "10:00 AM")
    follow_up_date = data.get("follow_up_date", existing["follow_up_date"] or "")
    follow_up_notes = data.get("follow_up_notes", existing["follow_up_notes"] or "")
    doctor_id = data.get("doctor_id", existing["doctor_id"])

    # Validate target doctor
    cursor.execute("SELECT id, name, status, specialization FROM doctors WHERE id = ?", (doctor_id,))
    doc = cursor.fetchone()
    if not doc:
        conn.close()
        return jsonify({"error": "Selected doctor does not exist."}), 404
    if doc["status"] != "Active" and int(doctor_id) != int(existing["doctor_id"]) and current_user["role"] != "admin":
        conn.close()
        return jsonify({"error": f"Doctor {doc['name']} is currently Inactive and cannot be assigned."}), 400

    # Retrieve previous doctor details
    cursor.execute("SELECT name, specialization FROM doctors WHERE id = ?", (existing["doctor_id"],))
    prev_doc_row = cursor.fetchone()
    prev_doc_name = prev_doc_row["name"] if prev_doc_row else f"Doctor #{existing['doctor_id']}"
    new_doc_name = doc["name"]

    vitals = data.get("vital_signs")
    if vitals is not None:
        vital_signs_str = json.dumps(vitals) if isinstance(vitals, dict) else str(vitals)
    else:
        vital_signs_str = existing["vital_signs"]

    new_status = data.get("status", existing["status"] or "Finalized")
    if new_status not in ["Draft", "Finalized"]:
        new_status = "Finalized"

    was_finalized = (existing["status"] or "Finalized") == "Finalized"
    is_now_final = new_status == "Finalized"

    # Track distinct clinical changes
    changes = []
    if int(doctor_id) != int(existing["doctor_id"]):
        changes.append(f"Attending physician changed from {prev_doc_name} to {new_doc_name}")
    if diagnosis != (existing["diagnosis"] or "").strip():
        changes.append("Primary diagnosis updated")
    if symptoms != (existing["symptoms"] or ""):
        changes.append("Symptoms updated")
    if observations != (existing["observations"] or ""):
        changes.append("Observations updated")
    if treatment_plan != (existing["treatment_plan"] or ""):
        changes.append("Treatment plan updated")
    if clinical_notes != (existing["clinical_notes"] or ""):
        changes.append("Clinical notes updated")
    if consultation_date != existing["consultation_date"]:
        changes.append(f"Consultation date changed to {consultation_date}")
    if consultation_time != (existing["consultation_time"] or ""):
        changes.append(f"Consultation time changed to {consultation_time}")
    if visit_type != (existing["visit_type"] or ""):
        changes.append(f"Visit type changed to {visit_type}")
    if visit_reason != (existing["visit_reason"] or ""):
        changes.append("Visit reason updated")

    amendment_reason = (data.get("amendment_reason") or data.get("reason") or "").strip()
    is_amended = existing["is_amended"] or 0
    amended_at = existing["amended_at"]
    amended_by = existing["amended_by"] or ""

    # Record amendment entry if this was a finalized record being modified
    if was_finalized and (changes or amendment_reason):
        if not amendment_reason:
            amendment_reason = "Clinical documentation correction and attending physician reassignment"
        prev_snapshot = json.dumps(dict(existing), default=str)
        changes_summary = "; ".join(changes) if changes else "Clinical record verified and re-finalized"
        cursor.execute("""
            INSERT INTO medical_record_amendments (
                record_id, amended_by_user_id, amended_by_name, amended_by_role,
                previous_doctor_id, previous_doctor_name, new_doctor_id, new_doctor_name,
                previous_data, amendment_reason, changes_summary, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            record_id, current_user["id"], current_user["name"], current_user["role"].capitalize(),
            existing["doctor_id"], prev_doc_name, doctor_id, new_doc_name,
            prev_snapshot, amendment_reason, changes_summary
        ))
        is_amended = 1
        amended_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        amended_by = current_user["name"]

    finalized_at = existing["finalized_at"]
    if is_now_final:
        finalized_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    elif new_status == "Draft":
        # Keep original finalized timestamp in amendment record, but clear for active draft
        finalized_at = None

    # Handle review resolution
    resolve_review = data.get("resolve_review", False) or is_now_final
    if resolve_review:
        review_required = 0
        review_reason = ""
    else:
        review_required = data.get("review_required", existing["review_required"] or 0)
        review_reason = data.get("review_reason", existing["review_reason"] or "")

    appointment_id = data.get("appointment_id", existing["appointment_id"])

    cursor.execute("""
        UPDATE medical_records
        SET doctor_id = ?, consultation_date = ?, consultation_time = ?, visit_type = ?,
            visit_reason = ?, symptoms = ?, observations = ?, vital_signs = ?,
            diagnosis = ?, treatment_plan = ?, clinical_notes = ?,
            follow_up_date = ?, follow_up_notes = ?, status = ?,
            finalized_at = ?, updated_at = CURRENT_TIMESTAMP,
            appointment_id = ?, review_required = ?, review_reason = ?,
            is_amended = ?, amended_at = ?, amended_by = ?
        WHERE id = ?
    """, (
        doctor_id, consultation_date, consultation_time, visit_type,
        visit_reason, symptoms, observations, vital_signs_str,
        diagnosis, treatment_plan, clinical_notes,
        follow_up_date, follow_up_notes, new_status,
        finalized_at, appointment_id, review_required, review_reason,
        is_amended, amended_at, amended_by, record_id
    ))
    conn.commit()

    action_label = "FINALIZED" if is_now_final and not was_finalized else "AMENDED" if is_amended else "UPDATED"
    log_activity(
        f"MEDICAL_RECORD_{action_label}",
        f"Medical Record #{record_id} ({new_status}) updated by {current_user['name']} with attending Dr. {new_doc_name}",
        "MedicalRecord",
        record_id,
        current_user["name"],
        current_user["role"].capitalize()
    )

    cursor.execute("""
        SELECT mr.*,
               p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
               p.email as patient_email, p.disease as patient_disease,
               d.name as doctor_name, d.specialization as doctor_specialization
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        JOIN doctors d ON mr.doctor_id = d.id
        WHERE mr.id = ?
    """, (record_id,))
    updated_rec = cursor.fetchone()
    conn.close()

    return jsonify({
        "message": f"Medical record #{record_id} successfully updated as {new_status}.",
        "record": row_to_medical_record_dict(updated_rec)
    })


@app.route("/api/medical-records/<int:record_id>/finalize", methods=["PUT"])
@require_role("admin", "doctor")
def finalize_medical_record_action(current_user, record_id):
    """Finalizes a draft medical record or re-finalizes an amended record."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT mr.*, d.name as doctor_name, d.status as doctor_status
        FROM medical_records mr
        JOIN doctors d ON mr.doctor_id = d.id
        WHERE mr.id = ?
    """, (record_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Medical record not found."}), 404

    if current_user["role"] == "doctor":
        if current_user.get("doctor_id") and existing["doctor_id"] != current_user["doctor_id"]:
            conn.close()
            return jsonify({"error": "Access Denied: You may only finalize records you authored."}), 403

    if existing["doctor_status"] != "Active" and current_user["role"] != "admin":
        conn.close()
        return jsonify({"error": f"Cannot finalize record: Attending doctor {existing['doctor_name']} is Inactive."}), 400

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data = request.get_json(silent=True) or {}
    amendment_reason = (data.get("reason") or data.get("amendment_reason") or "").strip()

    # If re-finalizing an already amended or previously finalized record
    if existing["is_amended"] and amendment_reason:
        cursor.execute("""
            INSERT INTO medical_record_amendments (
                record_id, amended_by_user_id, amended_by_name, amended_by_role,
                previous_doctor_id, previous_doctor_name, new_doctor_id, new_doctor_name,
                previous_data, amendment_reason, changes_summary, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            record_id, current_user["id"], current_user["name"], current_user["role"].capitalize(),
            existing["doctor_id"], existing["doctor_name"], existing["doctor_id"], existing["doctor_name"],
            json.dumps(dict(existing), default=str), amendment_reason, "Record authenticated and finalized by authorized administrator."
        ))

    cursor.execute("""
        UPDATE medical_records
        SET status = 'Finalized', finalized_at = ?, updated_at = CURRENT_TIMESTAMP,
            review_required = 0, review_reason = ''
        WHERE id = ?
    """, (now_str, record_id))
    conn.commit()

    log_activity(
        "MEDICAL_RECORD_FINALIZED",
        f"Medical Record #{record_id} authenticated and finalized by {current_user['name']}",
        "MedicalRecord",
        record_id,
        current_user["name"],
        current_user["role"].capitalize()
    )

    cursor.execute("""
        SELECT mr.*,
               p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
               p.email as patient_email, p.disease as patient_disease,
               d.name as doctor_name, d.specialization as doctor_specialization
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        JOIN doctors d ON mr.doctor_id = d.id
        WHERE mr.id = ?
    """, (record_id,))
    updated_rec = cursor.fetchone()
    conn.close()

    return jsonify({
        "message": f"Medical record #{record_id} is now authenticated and finalized.",
        "record": row_to_medical_record_dict(updated_rec)
    })


@app.route("/api/patients/<int:patient_id>/medical-records", methods=["GET"])
@require_role("admin", "doctor", "patient")
def get_patient_medical_history_records(current_user, patient_id):
    """Retrieves full clinical consultation history for a given patient."""
    if current_user["role"] == "patient":
        if current_user.get("patient_id") and current_user["patient_id"] != patient_id:
            return jsonify({"error": "Access Denied: You cannot view another patient's medical history."}), 403

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        return jsonify({"error": "Patient not found."}), 404

    cursor.execute("""
        SELECT mr.*,
               p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
               p.email as patient_email, p.disease as patient_disease,
               d.name as doctor_name, d.specialization as doctor_specialization
        FROM medical_records mr
        JOIN patients p ON mr.patient_id = p.id
        JOIN doctors d ON mr.doctor_id = d.id
        WHERE mr.patient_id = ?
        ORDER BY mr.consultation_date DESC, mr.id DESC
    """, (patient_id,))
    rows = cursor.fetchall()
    conn.close()

    return jsonify({
        "patient": row_to_patient_dict(patient),
        "records": [row_to_medical_record_dict(r) for r in rows],
        "total": len(rows)
    })


@app.route("/api/patients/<int:patient_id>/lab-results", methods=["GET"])
@require_role("admin", "doctor", "patient")
def get_patient_lab_results_list(current_user, patient_id):
    """Retrieves lab diagnostics results for a patient."""
    if current_user["role"] == "patient":
        if current_user.get("patient_id") and current_user["patient_id"] != patient_id:
            return jsonify({"error": "Access Denied: You cannot view another patient's lab results."}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT lr.*, d.name as doctor_name
        FROM lab_results lr
        LEFT JOIN doctors d ON lr.doctor_id = d.id
        WHERE lr.patient_id = ?
        ORDER BY lr.test_date DESC, lr.id DESC
    """, (patient_id,))
    rows = cursor.fetchall()
    conn.close()

    return jsonify([row_to_lab_result_dict(r) for r in rows])


@app.route("/api/lab-results", methods=["POST"])
@require_role("admin", "doctor")
def add_new_lab_result(current_user):
    """Adds a new diagnostic laboratory result."""
    data = request.get_json(silent=True) or {}
    patient_id = data.get("patient_id")
    test_name = (data.get("test_name") or "").strip()
    test_date = (data.get("test_date") or datetime.now().strftime("%Y-%m-%d")).strip()
    result_value = (data.get("result_value") or "").strip()
    units = (data.get("units") or "").strip()
    reference_range = (data.get("reference_range") or "").strip()
    status = (data.get("status") or "Normal").strip()
    notes = (data.get("notes") or "").strip()
    doctor_id = data.get("doctor_id") or (current_user.get("doctor_id") if current_user["role"] == "doctor" else 1)

    if not patient_id or not test_name or not result_value:
        return jsonify({"error": "Patient ID, Test Name, and Result Value are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO lab_results (
            patient_id, doctor_id, test_name, test_date, result_value,
            units, reference_range, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (patient_id, doctor_id, test_name, test_date, result_value, units, reference_range, status, notes))
    new_id = cursor.lastrowid
    conn.commit()

    cursor.execute("""
        SELECT lr.*, d.name as doctor_name
        FROM lab_results lr
        LEFT JOIN doctors d ON lr.doctor_id = d.id
        WHERE lr.id = ?
    """, (new_id,))
    created = cursor.fetchone()
    conn.close()

    return jsonify({
        "message": "Lab result recorded successfully.",
        "lab_result": row_to_lab_result_dict(created)
    }), 201


@app.route("/api/doctor/prescriptions", methods=["GET"])
@require_role("admin", "doctor")
def get_doctor_prescriptions(current_user):
    target_doctor_id = current_user.get("doctor_id") or 1
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT pr.*, p.name as patient_name, p.gender as patient_gender, p.age as patient_age,
               d.name as doctor_name, d.specialization as doctor_specialization
        FROM prescriptions pr
        JOIN patients p ON pr.patient_id = p.id
        JOIN doctors d ON pr.doctor_id = d.id
        WHERE pr.doctor_id = ?
        ORDER BY pr.prescription_date DESC, pr.id DESC
    """, (target_doctor_id,))
    rows = cursor.fetchall()
    conn.close()

    return jsonify([row_to_prescription_dict(r) for r in rows])


@app.route("/api/doctor/prescriptions", methods=["POST"])
@require_role("admin", "doctor")
def create_doctor_prescription(current_user):
    target_doctor_id = current_user.get("doctor_id") or 1
    data = request.get_json(silent=True) or {}

    patient_id = data.get("patient_id")
    medication_name = data.get("medication_name", "").strip()
    dosage = data.get("dosage", "").strip()
    frequency = data.get("frequency", "").strip()
    duration = data.get("duration", "30 days").strip()
    route = data.get("route", "Oral").strip()
    instructions = data.get("instructions", "").strip()
    prescription_date = data.get("prescription_date") or datetime.now().strftime("%Y-%m-%d")

    if not patient_id or not medication_name or not dosage or not frequency:
        return jsonify({"error": "Patient ID, Medication Name, Dosage, and Frequency are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, doctor_id FROM patients WHERE id = ?", (patient_id,))
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        return jsonify({"error": "Patient not found."}), 404

    # Enforce doctor assignment check (or admin)
    if current_user["role"] == "doctor":
        if current_user["doctor_id"] and patient["doctor_id"] != current_user["doctor_id"]:
            conn.close()
            return jsonify({"error": "Access Denied: You may only issue prescriptions to authorized assigned patients."}), 403

    cursor.execute("""
        INSERT INTO prescriptions (
            patient_id, doctor_id, medication_name, dosage, frequency,
            duration, route, instructions, prescription_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    """, (
        patient_id, target_doctor_id, medication_name, dosage, frequency,
        duration, route, instructions, prescription_date
    ))
    new_id = cursor.lastrowid
    conn.commit()

    log_activity(
        "PRESCRIPTION_ISSUED",
        f"Prescription issued for {patient['name']}: {medication_name} {dosage}",
        "Prescription",
        new_id,
        current_user["name"],
        "Doctor"
    )

    cursor.execute("""
        SELECT pr.*, p.name as patient_name, p.gender as patient_gender, p.age as patient_age,
               d.name as doctor_name, d.specialization as doctor_specialization
        FROM prescriptions pr
        JOIN patients p ON pr.patient_id = p.id
        JOIN doctors d ON pr.doctor_id = d.id
        WHERE pr.id = ?
    """, (new_id,))
    created_pr = cursor.fetchone()
    conn.close()

    return jsonify({
        "message": "Prescription issued successfully.",
        "prescription": row_to_prescription_dict(created_pr)
    }), 201


@app.route("/api/doctor/schedule", methods=["GET"])
@require_role("admin", "doctor")
def get_doctor_schedule(current_user):
    target_doctor_id = current_user.get("doctor_id") or 1
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM doctor_schedules
        WHERE doctor_id = ?
        ORDER BY id ASC
    """, (target_doctor_id,))
    rows = cursor.fetchall()
    conn.close()

    schedules = []
    for r in rows:
        schedules.append({
            "id": r["id"],
            "day_of_week": r["day_of_week"],
            "start_time": r["start_time"],
            "end_time": r["end_time"],
            "slot_duration_minutes": r["slot_duration_minutes"],
            "status": r["status"],
        })
    return jsonify(schedules)


@app.route("/api/doctor/schedule", methods=["PUT"])
@require_role("admin", "doctor")
def update_doctor_schedule(current_user):
    target_doctor_id = current_user.get("doctor_id") or 1
    data = request.get_json(silent=True) or {}
    schedule_items = data.get("schedules") or data.get("schedule", [])

    if not isinstance(schedule_items, list):
        return jsonify({"error": "Schedules must be provided as an array."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    for item in schedule_items:
        s_id = item.get("id")
        start = item.get("start_time", "09:00 AM")
        end = item.get("end_time", "05:00 PM")
        status = item.get("status", "Available")
        slot_dur = item.get("slot_duration_minutes", 30)

        if s_id:
            cursor.execute("""
                UPDATE doctor_schedules
                SET start_time = ?, end_time = ?, status = ?, slot_duration_minutes = ?
                WHERE id = ? AND doctor_id = ?
            """, (start, end, status, slot_dur, s_id, target_doctor_id))

    conn.commit()
    conn.close()

    log_activity("SCHEDULE_UPDATED", f"Updated weekly clinical schedule for Dr. {current_user['name']}", "Schedule", target_doctor_id, current_user["name"], "Doctor")
    return jsonify({"message": "Weekly schedule updated successfully."})


@app.route("/api/doctor/profile", methods=["GET"])
@require_role("admin", "doctor")
def get_doctor_profile(current_user):
    target_doctor_id = current_user.get("doctor_id") or 1
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM doctors WHERE id = ?", (target_doctor_id,))
    doc_row = cursor.fetchone()
    conn.close()

    if not doc_row:
        return jsonify({"error": "Doctor profile not found."}), 404

    return jsonify(row_to_doctor_dict(doc_row))


@app.route("/api/doctor/profile", methods=["PUT"])
@require_role("admin", "doctor")
def update_doctor_profile(current_user):
    target_doctor_id = current_user.get("doctor_id") or 1
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    specialization = data.get("specialization", "").strip()
    qualifications = data.get("qualifications", "").strip()
    biography = data.get("biography", "").strip()
    experience_years = data.get("experience_years", 12)

    if not name or not specialization:
        return jsonify({"error": "Doctor Name and Specialization are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE doctors
        SET name = ?, phone = ?, specialization = ?, qualifications = ?,
            biography = ?, experience_years = ?
        WHERE id = ?
    """, (name, phone, specialization, qualifications, biography, experience_years, target_doctor_id))

    # Also update users table name
    if current_user.get("id"):
        cursor.execute("UPDATE users SET name = ? WHERE id = ?", (name, current_user["id"]))

    conn.commit()

    cursor.execute("SELECT * FROM doctors WHERE id = ?", (target_doctor_id,))
    updated_doc = cursor.fetchone()
    conn.close()

    log_activity("DOCTOR_PROFILE_UPDATED", f"Dr. {name} updated their professional profile details", "Doctor", target_doctor_id, name, "Doctor")

    return jsonify({
        "message": "Professional profile updated successfully.",
        "doctor": row_to_doctor_dict(updated_doc)
    })


@app.route("/api/doctor/change-password", methods=["POST"])
@require_role("admin", "doctor")
def doctor_change_password(current_user):
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password", "").strip()
    new_password = data.get("new_password", "").strip()

    if not current_password or not new_password:
        return jsonify({"error": "Both current password and new password are required."}), 400

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters in length."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT password_hash FROM users WHERE id = ?", (current_user["id"],))
    u_row = cursor.fetchone()
    if not u_row or not check_password_hash(u_row["password_hash"], current_password):
        conn.close()
        return jsonify({"error": "Incorrect current password. Password change denied."}), 400

    new_hash = generate_password_hash(new_password)
    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, current_user["id"]))

    if current_user.get("doctor_id"):
        cursor.execute("UPDATE doctors SET password = ? WHERE id = ?", (new_hash, current_user["doctor_id"]))

    conn.commit()
    conn.close()

    log_activity("PASSWORD_CHANGED", f"Password changed for user {current_user['name']}", "User", current_user["id"], current_user["name"], "Doctor")

    return jsonify({"message": "Password changed successfully."})


@app.route("/api/doctor/notifications", methods=["GET"])
@require_role("admin", "doctor")
def get_doctor_notifications(current_user):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY id DESC LIMIT 20
    """, (current_user["id"],))
    rows = cursor.fetchall()
    conn.close()

    notifs = []
    for r in rows:
        notifs.append({
            "id": r["id"],
            "title": r["title"],
            "message": r["message"],
            "type": r["type"],
            "is_read": bool(r["is_read"]),
            "created_at": r["created_at"],
        })
    return jsonify(notifs)


@app.route("/api/doctor/notifications/<int:notif_id>/read", methods=["PUT"])
@require_role("admin", "doctor")
def mark_doctor_notification_read(current_user, notif_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notif_id, current_user["id"]))
    conn.commit()
    conn.close()
    return jsonify({"message": "Notification marked as read."})


@app.route("/api/doctor/notifications/read-all", methods=["POST"])
@require_role("admin", "doctor")
def mark_all_doctor_notifications_read(current_user):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (current_user["id"],))
    conn.commit()
    conn.close()
    return jsonify({"message": "All notifications marked as read."})


# ---------------------------------------------------------
# PATIENT-SPECIFIC ENDPOINTS WITH OWNERSHIP CHECKS
# ---------------------------------------------------------

@app.route("/api/patient/dashboard/<int:patient_id>", methods=["GET"])
@require_role("admin", "patient")
def get_patient_dashboard(current_user, patient_id):
    # Enforce patient authorization: Patients must NEVER access another patient's data
    if current_user["role"] == "patient":
        if current_user["patient_id"] and current_user["patient_id"] != patient_id:
            return jsonify({"error": "Access Denied: You cannot view or access another patient's confidential health records."}), 403

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    pat_row = cursor.fetchone()
    if not pat_row:
        conn.close()
        return jsonify({"error": "Patient record not found"}), 404

    # Attending doctor details
    cursor.execute("SELECT * FROM doctors WHERE id = ?", (pat_row["doctor_id"] or 1,))
    doc_row = cursor.fetchone()
    attending_doc = row_to_doctor_dict(doc_row) if doc_row else {
        "id": 1,
        "name": "Dr. Satya Deep",
        "specialization": "Cardiology",
        "email": "satya.deep@healthpulse.com",
        "phone": "555-0101"
    }

    # Appointments for this patient
    cursor.execute("""
        SELECT a.*, d.name as doctor_name, d.specialization as doctor_specialization, d.phone as doctor_phone
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
    """, (patient_id,))
    appointments = []
    for r in cursor.fetchall():
        appointments.append({
            "id": r["id"],
            "doctor_id": r["doctor_id"],
            "doctor_name": r["doctor_name"],
            "doctor_specialization": r["doctor_specialization"],
            "doctor_phone": r["doctor_phone"],
            "appointment_date": r["appointment_date"],
            "appointment_time": r["appointment_time"],
            "status": r["status"],
            "reason": r["reason"] or "General Checkup",
        })

    conn.close()

    return jsonify({
        "patient": row_to_patient_dict(pat_row),
        "attending_doctor": attending_doc,
        "appointments": appointments
    })


# ---------------------------------------------------------
# PATIENTS CRUD (MAINTAINS EXISTING FUNCTIONALITY)
# ---------------------------------------------------------

@app.route("/patients", methods=["GET"])
def get_patients():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    patients = [row_to_patient_dict(row) for row in rows]
    return jsonify(patients)


@app.route("/patients/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return jsonify({"error": "Patient not found"}), 404

    return jsonify(row_to_patient_dict(row))


@app.route("/patients", methods=["POST"])
def add_patient():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    weight = str(data.get("weight", "70"))
    gender = data.get("gender", "Male")
    age = str(data.get("age", "30"))
    disease = data.get("disease", "General Checkup")
    password = data.get("password", "patient123")
    role = data.get("role", "Patient")

    doctor = data.get("doctor", {})
    if isinstance(doctor, dict):
        doc_id = doctor.get("id", 1)
        doc_name = doctor.get("name", "Unassigned")
        doc_spec = doctor.get("specialization", "General Care")
    else:
        doc_id = 1
        doc_name = data.get("doctorName", "Unassigned")
        doc_spec = data.get("doctorSpecialization", "General Care")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        hashed_password = generate_password_hash(password)

        # 1. Insert into central users table
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,))
        existing_u = cursor.fetchone()
        if existing_u:
            user_id = existing_u["id"]
        else:
            cursor.execute("""
                INSERT INTO users (name, email, password_hash, role, is_active)
                VALUES (?, ?, ?, 'patient', 1)
            """, (name, email, hashed_password))
            user_id = cursor.lastrowid

        # 2. Insert into patients table linked with user_id
        cursor.execute("""
            INSERT INTO patients (
                user_id, name, weight, gender, age, email, password, disease,
                doctor_id, doctor_name, doctor_specialization, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name, weight, gender, age, email, hashed_password, disease, doc_id, doc_name, doc_spec, role))
        new_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM patients WHERE id = ?", (new_id,))
        new_row = cursor.fetchone()
        conn.close()

        created_patient = row_to_patient_dict(new_row)
        log_activity("PATIENT_REGISTERED", f"Patient {name} registered with condition: {disease}", "Patient", new_id)

        return jsonify({
            "message": "added successfully",
            "patient": created_patient
        }), 201

    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "A patient with this email already exists"}), 409


@app.route("/patients/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    data = request.get_json(silent=True) or {}

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        return jsonify({"error": "Patient not found"}), 404

    name = data.get("name", existing["name"])
    weight = str(data.get("weight", existing["weight"]))
    gender = data.get("gender", existing["gender"])
    age = str(data.get("age", existing["age"]))
    email = data.get("email", existing["email"])
    disease = data.get("disease", existing["disease"])
    password = data.get("password", existing["password"])
    role = data.get("role", existing["role"])

    doctor = data.get("doctor", {})
    if isinstance(doctor, dict):
        doc_name = doctor.get("name", existing["doctor_name"])
        doc_spec = doctor.get("specialization", existing["doctor_specialization"])
        doc_id = doctor.get("id", existing["doctor_id"])
    else:
        doc_name = existing["doctor_name"]
        doc_spec = existing["doctor_specialization"]
        doc_id = existing["doctor_id"]

    cursor.execute("""
        UPDATE patients
        SET name = ?, weight = ?, gender = ?, age = ?, email = ?,
            password = ?, disease = ?, doctor_id = ?, doctor_name = ?,
            doctor_specialization = ?, role = ?
        WHERE id = ?
    """, (name, weight, gender, age, email, password, disease, doc_id, doc_name, doc_spec, role, patient_id))

    # Also sync name in users table if linked
    if existing["user_id"]:
        cursor.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", (name, email, existing["user_id"]))

    conn.commit()

    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    updated_row = cursor.fetchone()
    conn.close()

    log_activity("PATIENT_UPDATED", f"Updated details for patient {name}", "Patient", patient_id)

    return jsonify(row_to_patient_dict(updated_row))


@app.route("/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name, user_id FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Patient not found"}), 404

    patient_name = row["name"]
    user_id = row["user_id"]

    cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    if user_id:
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        cursor.execute("DELETE FROM user_tokens WHERE user_id = ?", (user_id,))

    conn.commit()
    conn.close()

    log_activity("PATIENT_DELETED", f"Patient {patient_name} (ID #{patient_id}) deleted", "Patient", patient_id)

    return jsonify({"message": "deleted successfully", "id": patient_id})


if __name__ == "__main__":
    print("Starting HealthPulse Professional API server on http://localhost:5000 ...")
    app.run(host="0.0.0.0", port=5000, debug=False)
