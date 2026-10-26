import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

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
            role TEXT DEFAULT 'Patient'
        )
    """)

    # Check if database is empty, seed with initial clinical data
    cursor.execute("SELECT COUNT(*) FROM patients")
    count = cursor.fetchone()[0]

    if count == 0:
        initial_patients = [
            (
                "shravan", "85", "Male", "26", "shravan@gmail.com", "shravan",
                "Headache", 1, "Satya Deep", "cardio", "Patient"
            ),
            (
                "Satya Deep G", "90", "Male", "29", "satya@gmail.com", "satya",
                "Headache", 2, "Teja", "Muscles", "Patient"
            ),
            (
                "Abdul", "86", "Male", "29", "abdul@gmail.com", "abdul",
                "Bones", 3, "Sam", "Bones", "Patient"
            ),
            (
                "ram teja", "65", "Male", "20", "ram@gmail.com", "ram",
                "Brain", 2, "Teja", "Muscles", "Patient"
            ),
            (
                "Vijay Kumar", "70", "Male", "55", "chlsdev23@gmail.com", "vijay",
                "Brain Tumor", 4, "Dr. Lakshimi", "Neurologist", "Patient"
            ),
        ]
        cursor.executemany("""
            INSERT INTO patients (
                name, weight, gender, age, email, password, disease,
                doctor_id, doctor_name, doctor_specialization, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_patients)

    conn.commit()
    conn.close()


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
        "doctor": {
            "id": row["doctor_id"] or 1,
            "name": row["doctor_name"] or "Unassigned",
            "specialization": row["doctor_specialization"] or "General Care",
        },
    }


# Initialize DB on startup
init_db()


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "service": "HealthPulse Python REST API",
        "endpoints": [
            "GET /patients",
            "POST /patients",
            "PUT /patients/<id>",
            "DELETE /patients/<id>",
            "POST /login"
        ]
    })


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
        cursor.execute("""
            INSERT INTO patients (
                name, weight, gender, age, email, password, disease,
                doctor_id, doctor_name, doctor_specialization, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, weight, gender, age, email, password, disease, doc_id, doc_name, doc_spec, role))
        new_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM patients WHERE id = ?", (new_id,))
        new_row = cursor.fetchone()
        conn.close()

        created_patient = row_to_patient_dict(new_row)
        return jsonify({
            "message": "added successfllyu",
            "patient": created_patient
        }), 201

    except sqlite3.IntegrityError:
        conn.close()
        # If email already exists, update existing
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

    return jsonify(row_to_patient_dict(updated_row))


@app.route("/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Patient not found"}), 404

    cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "deleted successfully", "id": patient_id})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # System Administrator check
    if (email == "admin@healthpulse.com" and password == "admin123") or (email == "admin" and password == "admin"):
        return jsonify({
            "message": "Login successful",
            "patient": {
                "name": "System Administrator",
                "email": "admin@healthpulse.com",
                "role": "Admin",
            }
        })

    # Patient / Doctor database check
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE LOWER(email) = ? AND password = ?", (email, password))
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify({
            "message": "Login successful",
            "patient": row_to_patient_dict(row)
        })

    return jsonify({"error": "Unauthorized", "message": "Invalid email or password"}), 401


if __name__ == "__main__":
    print("Starting HealthPulse Python API server on http://localhost:5000 ...")
    app.run(host="0.0.0.0", port=5000, debug=False)
