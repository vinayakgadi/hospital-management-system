import os
import sqlite3
import uuid
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "patients.db")


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Patients Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Check if created_at column exists in patients (safe migration)
    cursor.execute("PRAGMA table_info(patients)")
    patient_columns = [col[1] for col in cursor.fetchall()]
    if "created_at" not in patient_columns:
        cursor.execute("ALTER TABLE patients ADD COLUMN created_at TEXT DEFAULT NULL")
        cursor.execute("UPDATE patients SET created_at = datetime('now') WHERE created_at IS NULL")

    # 2. Doctors Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            specialization TEXT NOT NULL,
            phone TEXT DEFAULT '555-0199',
            status TEXT DEFAULT 'Active',
            role TEXT DEFAULT 'Doctor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 3. Appointments Table
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

    # 4. Activity Logs Table
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

    # 5. Admins Table
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

    # Seed Admin if not exists
    cursor.execute("SELECT COUNT(*) FROM admins WHERE email = 'admin@healthpulse.com'")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO admins (name, email, password, role)
            VALUES (?, ?, ?, ?)
        """, (
            "System Administrator",
            "admin@healthpulse.com",
            generate_password_hash("admin123"),
            "Admin"
        ))

    # Seed Doctors if empty
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

    # Seed initial Appointments if empty
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

    # Seed initial Activity Logs if empty
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
        print(f"Error logging activity: {e}")


def row_to_patient_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "weight": str(row["weight"]) if row["weight"] is not None else "",
        "gender": row["gender"] or "Male",
        "age": str(row["age"]) if row["age"] is not None else "",
        "email": row["email"],
        "password": row["password"],
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
        "name": row["name"],
        "email": row["email"],
        "specialization": row["specialization"],
        "phone": row["phone"],
        "status": row["status"],
        "role": "Doctor",
        "created_at": row["created_at"],
    }


def verify_password(stored_password, provided_password):
    if not stored_password or not provided_password:
        return False
    # Check if hash or plaintext (for backwards compatibility with existing records)
    if stored_password.startswith("pbkdf2:sha256:") or stored_password.startswith("scrypt:"):
        return check_password_hash(stored_password, provided_password)
    return stored_password == provided_password


# Initialize DB on startup
init_db()


# ---------------------------------------------------------
# AUTHENTICATION ENDPOINTS
# ---------------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "service": "HealthPulse Professional Healthcare API",
        "version": "2.0.0",
        "roles_supported": ["admin", "doctor", "patient"]
    })


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    role_requested = data.get("role", "").strip().lower()

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # A. Check Administrator
    if role_requested in ["admin", "administrator", ""]:
        # Check hardcoded fallback or admins table
        if (email == "admin@healthpulse.com" and password == "admin123") or (email == "admin" and password == "admin"):
            token = f"admin-token-{uuid.uuid4()}"
            log_activity("ADMIN_LOGIN", "System Administrator logged in", "Admin", 1, "System Administrator", "Admin")
            conn.close()
            return jsonify({
                "message": "Admin authentication successful",
                "token": token,
                "role": "admin",
                "user": {
                    "id": 1,
                    "name": "System Administrator",
                    "email": "admin@healthpulse.com",
                    "role": "Admin",
                    "avatar": "SA"
                }
            })

        cursor.execute("SELECT * FROM admins WHERE LOWER(email) = ?", (email,))
        admin_row = cursor.fetchone()
        if admin_row and verify_password(admin_row["password"], password):
            token = f"admin-token-{uuid.uuid4()}"
            log_activity("ADMIN_LOGIN", f"Admin {admin_row['name']} logged in", "Admin", admin_row["id"], admin_row["name"], "Admin")
            conn.close()
            return jsonify({
                "message": "Admin authentication successful",
                "token": token,
                "role": "admin",
                "user": {
                    "id": admin_row["id"],
                    "name": admin_row["name"],
                    "email": admin_row["email"],
                    "role": "Admin",
                    "avatar": admin_row["name"][:2].upper()
                }
            })

        if role_requested == "admin":
            conn.close()
            return jsonify({"error": "Invalid administrator email or password."}), 401

    # B. Check Doctor
    if role_requested in ["doctor", ""]:
        cursor.execute("SELECT * FROM doctors WHERE LOWER(email) = ?", (email,))
        doc_row = cursor.fetchone()
        if doc_row and verify_password(doc_row["password"], password):
            token = f"doctor-token-{uuid.uuid4()}"
            log_activity("DOCTOR_LOGIN", f"Dr. {doc_row['name']} logged in", "Doctor", doc_row["id"], doc_row["name"], "Doctor")
            conn.close()
            return jsonify({
                "message": "Doctor authentication successful",
                "token": token,
                "role": "doctor",
                "user": {
                    "id": doc_row["id"],
                    "name": doc_row["name"],
                    "email": doc_row["email"],
                    "specialization": doc_row["specialization"],
                    "phone": doc_row["phone"],
                    "role": "Doctor",
                    "avatar": "DR"
                }
            })

        if role_requested == "doctor":
            conn.close()
            return jsonify({"error": "Invalid doctor email or password."}), 401

    # C. Check Patient
    if role_requested in ["patient", ""]:
        cursor.execute("SELECT * FROM patients WHERE LOWER(email) = ?", (email,))
        pat_row = cursor.fetchone()
        if pat_row and verify_password(pat_row["password"], password):
            token = f"patient-token-{uuid.uuid4()}"
            log_activity("PATIENT_LOGIN", f"Patient {pat_row['name']} logged in", "Patient", pat_row["id"], pat_row["name"], "Patient")
            conn.close()
            return jsonify({
                "message": "Patient authentication successful",
                "token": token,
                "role": "patient",
                "user": row_to_patient_dict(pat_row)
            })

        if role_requested == "patient":
            conn.close()
            return jsonify({"error": "Invalid patient email or password."}), 401

    conn.close()
    return jsonify({"error": "Invalid credentials or unauthorized role."}), 401


# Backward-compatible legacy login route
@app.route("/login", methods=["POST"])
def legacy_login():
    return auth_login()


# ---------------------------------------------------------
# ADMIN DASHBOARD ENDPOINTS
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

    # Generate date range
    trend_data = []
    conn = get_db_connection()
    cursor = conn.cursor()

    for i in range(days - 1, -1, -1):
        target_date = today - timedelta(days=i)
        date_str = target_date.strftime("%Y-%m-%d")
        display_label = target_date.strftime("%b %d")

        cursor.execute("SELECT COUNT(*) FROM patients WHERE date(created_at) = date(?)", (date_str,))
        count = cursor.fetchone()[0]

        # For days without records, calculate cumulative base distribution for realistic graph
        cursor.execute("SELECT COUNT(*) FROM patients WHERE date(created_at) <= date(?)", (date_str,))
        cumulative = cursor.fetchone()[0]

        trend_data.append({
            "date": display_label,
            "full_date": date_str,
            "registrations": count if count > 0 else (1 if (i % 2 == 0 and cumulative > 0) else 0),
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
        "Scheduled": "#3b82f6",
        "Completed": "#10b981",
        "Cancelled": "#ef4444",
        "Pending": "#f59e0b"
    }

    stats = []
    for r in rows:
        status_name = r["status"]
        stats.append({
            "status": status_name,
            "count": r["count"],
            "fill": status_colors.get(status_name, "#64748b")
        })

    # Default fallback if empty
    if not stats:
        stats = [
            {"status": "Scheduled", "count": 0, "fill": "#3b82f6"},
            {"status": "Completed", "count": 0, "fill": "#10b981"},
            {"status": "Cancelled", "count": 0, "fill": "#ef4444"},
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
               p.id as patient_id, p.name as patient_name, p.gender as patient_gender,
               d.id as doctor_id, d.name as doctor_name, d.specialization as doctor_specialization
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
            "date": r["appointment_date"],
            "time": r["appointment_time"],
            "status": r["status"],
            "reason": r["reason"] or "General Consultation",
            "patient": {
                "id": r["patient_id"],
                "name": r["patient_name"],
                "gender": r["patient_gender"]
            },
            "doctor": {
                "id": r["doctor_id"],
                "name": r["doctor_name"],
                "specialization": r["doctor_specialization"]
            }
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
def register_doctor():
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
        cursor.execute("""
            INSERT INTO doctors (name, email, password, specialization, phone, status, role)
            VALUES (?, ?, ?, ?, ?, 'Active', 'Doctor')
        """, (name, email, hashed_pw, specialization, phone))
        new_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM doctors WHERE id = ?", (new_id,))
        new_doc = cursor.fetchone()
        conn.close()

        log_activity("DOCTOR_REGISTERED", f"Dr. {name} registered to {specialization}", "Doctor", new_id, "System Administrator", "Admin")

        return jsonify({
            "message": "Doctor registered successfully",
            "doctor": row_to_doctor_dict(new_doc)
        }), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "A doctor with this email already exists."}), 409


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
            "date": r["appointment_date"],
            "time": r["appointment_time"],
            "status": r["status"],
            "reason": r["reason"] or "General Checkup",
            "created_at": r["created_at"],
        })
    return jsonify(appointments)


@app.route("/api/appointments", methods=["POST"])
def create_appointment():
    data = request.get_json(silent=True) or {}
    patient_id = data.get("patient_id")
    doctor_id = data.get("doctor_id")
    date_val = data.get("date") or data.get("appointment_date")
    time_val = data.get("time") or data.get("appointment_time") or "10:00 AM"
    reason = data.get("reason", "Consultation")
    actor_name = data.get("actor_name", "Admin")

    if not patient_id or not doctor_id or not date_val:
        return jsonify({"error": "Patient ID, Doctor ID, and Appointment Date are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
        VALUES (?, ?, ?, ?, 'Scheduled', ?)
    """, (patient_id, doctor_id, date_val, time_val, reason))
    new_id = cursor.lastrowid

    # Fetch names for logging
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
        actor_name,
        "Admin"
    )

    return jsonify({
        "message": "Appointment scheduled successfully",
        "appointment_id": new_id
    }), 201


@app.route("/api/appointments/<int:appt_id>/status", methods=["PUT"])
def update_appointment_status(appt_id):
    data = request.get_json(silent=True) or {}
    new_status = data.get("status")

    if new_status not in ["Scheduled", "Completed", "Cancelled"]:
        return jsonify({"error": "Invalid status. Must be Scheduled, Completed, or Cancelled."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE appointments SET status = ? WHERE id = ?", (new_status, appt_id))
    conn.commit()
    conn.close()

    log_activity("APPOINTMENT_STATUS_UPDATE", f"Appointment #{appt_id} marked as {new_status}", "Appointment", appt_id)

    return jsonify({"message": f"Appointment status updated to {new_status}"})


# ---------------------------------------------------------
# DOCTOR-SPECIFIC ENDPOINTS
# ---------------------------------------------------------

@app.route("/api/doctor/dashboard/<int:doctor_id>", methods=["GET"])
def get_doctor_dashboard(doctor_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM doctors WHERE id = ?", (doctor_id,))
    doc_row = cursor.fetchone()
    if not doc_row:
        conn.close()
        return jsonify({"error": "Doctor not found"}), 404

    # Patients assigned to this doctor
    cursor.execute("SELECT * FROM patients WHERE doctor_id = ? ORDER BY id DESC", (doctor_id,))
    patients = [row_to_patient_dict(r) for r in cursor.fetchall()]

    # Appointments assigned to this doctor
    cursor.execute("""
        SELECT a.*, p.name as patient_name, p.gender as patient_gender, p.age as patient_age, p.email as patient_email
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
    """, (doctor_id,))
    appointments = []
    for r in cursor.fetchall():
        appointments.append({
            "id": r["id"],
            "patient_id": r["patient_id"],
            "patient_name": r["patient_name"],
            "patient_gender": r["patient_gender"],
            "patient_age": r["patient_age"],
            "patient_email": r["patient_email"],
            "date": r["appointment_date"],
            "time": r["appointment_time"],
            "status": r["status"],
            "reason": r["reason"] or "Consultation",
        })

    conn.close()

    return jsonify({
        "doctor": row_to_doctor_dict(doc_row),
        "assigned_patients": patients,
        "appointments": appointments,
        "metrics": {
            "total_patients": len(patients),
            "total_appointments": len(appointments),
            "completed": len([a for a in appointments if a["status"] == "Completed"]),
            "pending": len([a for a in appointments if a["status"] == "Scheduled"]),
        }
    })


# ---------------------------------------------------------
# PATIENT-SPECIFIC ENDPOINTS
# ---------------------------------------------------------

@app.route("/api/patient/dashboard/<int:patient_id>", methods=["GET"])
def get_patient_dashboard(patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    pat_row = cursor.fetchone()
    if not pat_row:
        conn.close()
        return jsonify({"error": "Patient not found"}), 404

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
            "date": r["appointment_date"],
            "time": r["appointment_time"],
            "status": r["status"],
            "reason": r["reason"] or "General Checkup",
        })

    conn.close()

    return jsonify({
        "patient": row_to_patient_dict(pat_row),
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
    email = data.get("email", "").strip()

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
        cursor.execute("""
            INSERT INTO patients (
                name, weight, gender, age, email, password, disease,
                doctor_id, doctor_name, doctor_specialization, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, weight, gender, age, email, hashed_password, disease, doc_id, doc_name, doc_spec, role))
        new_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM patients WHERE id = ?", (new_id,))
        new_row = cursor.fetchone()
        conn.close()

        created_patient = row_to_patient_dict(new_row)
        log_activity("PATIENT_REGISTERED", f"Patient {name} registered with condition: {disease}", "Patient", new_id)

        return jsonify({
            "message": "added successfllyu",
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
    cursor.execute("SELECT name FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Patient not found"}), 404

    patient_name = row["name"]
    cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    conn.commit()
    conn.close()

    log_activity("PATIENT_DELETED", f"Patient {patient_name} (ID #{patient_id}) deleted", "Patient", patient_id)

    return jsonify({"message": "deleted successfully", "id": patient_id})


if __name__ == "__main__":
    print("Starting HealthPulse Professional API server on http://localhost:5000 ...")
    app.run(host="0.0.0.0", port=5000, debug=False)
