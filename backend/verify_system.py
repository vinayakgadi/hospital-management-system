from database import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

# 1. Update initial doctors' departments
cur.execute("UPDATE doctors SET department_id = 1 WHERE id IN (1, 5, 6);") # Cardiology
cur.execute("UPDATE doctors SET department_id = 2 WHERE id = 4;") # Neurology
cur.execute("UPDATE doctors SET department_id = 3 WHERE id IN (2, 3);") # Orthopedics
cur.execute("UPDATE doctors SET department_id = 4 WHERE id = 7;") # Pediatrics
cur.execute("UPDATE departments SET head_doctor_id = 1 WHERE id = 1;") # Dr. Satya Deep as head of Cardiology!
conn.commit()
print("Updated initial doctors to valid departments!")

# 2. Check Shravan's linked records
cur.execute("SELECT id, name, email FROM patients WHERE email = 'shravan11@gamil.com';")
p = cur.fetchone()
print("Patient Shravan:", dict(p))
pid = p['id']

for tbl in ["appointments", "medical_records", "prescriptions", "lab_results", "billing_records", "admissions"]:
    cur.execute(f"SELECT COUNT(*) FROM {tbl} WHERE patient_id = %s;", (pid,))
    print(f"  {tbl:20}: {cur.fetchone()[0]}")

# 3. Check Dr. Satya Deep's linked records
cur.execute("SELECT id, name, email FROM doctors WHERE id = 1;")
d = cur.fetchone()
print("\nDoctor Dr. Satya Deep:", dict(d))
did = d['id']
for tbl in ["appointments", "medical_records", "prescriptions", "lab_results", "admissions"]:
    col = "attending_doctor_id" if tbl == "admissions" else "doctor_id"
    cur.execute(f"SELECT COUNT(*) FROM {tbl} WHERE {col} = %s;", (did,))
    print(f"  {tbl:20}: {cur.fetchone()[0]}")

conn.close()
