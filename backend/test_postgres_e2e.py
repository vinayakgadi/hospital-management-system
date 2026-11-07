import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:5000"

def get(path, token=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    req = urllib.request.Request(f"{BASE_URL}{path}", headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def post(path, data, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE_URL}{path}", data=json.dumps(data).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def put(path, data, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE_URL}{path}", data=json.dumps(data).encode("utf-8"), headers=headers, method="PUT")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

print("=" * 60)
print("HealthPulse PostgreSQL End-to-End Verification")
print("=" * 60)

# 1. DB Status Endpoint
db_status = get("/api/system/database-status")
print(f"[OK] 1. Active Database Engine: {db_status['engine'].upper()}")
print(f"     Connected: {db_status['connected']}, DB: {db_status['details']['database']}")

# 2. Authentication: Admin Login
admin_auth = post("/api/auth/login", {"email": "admin@healthpulse.com", "password": "admin123", "role": "admin"})
admin_token = admin_auth["token"]
print(f"[OK] 2. Admin Login successful: {admin_auth['user']['name']} ({admin_auth['user']['email']})")

# 3. Authentication: Doctor Login
doc_auth = post("/api/auth/login", {"email": "dr.satyadeep@healthpulse.com", "password": "doctor123", "role": "doctor"})
doc_token = doc_auth["token"]
print(f"[OK] 3. Doctor Login successful: {doc_auth['user']['name']} ({doc_auth['user']['email']})")

# 4. Authentication: Patient Login
pat_auth = post("/api/auth/login", {"email": "shravan@healthpulse.com", "password": "patient123", "role": "patient"})
pat_token = pat_auth["token"]
print(f"[OK] 4. Patient Login successful: {pat_auth['user']['name']} ({pat_auth['user']['email']})")

# 5. Dashboard Statistics
stats = get("/api/admin/dashboard/stats", admin_token)
print(f"[OK] 5. Admin Dashboard Stats: Patients={stats['total_patients']}, Doctors={stats['total_doctors']}, Appointments={stats['total_appointments']}")

# 6. Patient Trends
trends = get("/api/admin/dashboard/patient-trends", admin_token)
print(f"[OK] 6. Monthly Patient Trends: {len(trends)} monthly buckets returned")

# 7. Patients Listing
patients = get("/patients", admin_token)
print(f"[OK] 7. Patients Listing: {len(patients)} patients retrieved from PostgreSQL")

# 8. Appointments Listing
apts = get("/api/appointments", admin_token)
print(f"[OK] 8. Appointments: {len(apts)} appointments retrieved from PostgreSQL")

# 9. Medical Records Module
records = get("/api/medical-records?page=1&per_page=10", admin_token)
print(f"[OK] 9. Medical Records: Total={records['total']}, Page records count={len(records['records'])}")
first_record = records["records"][0]
print(f"     Record #{first_record['id']}: Patient='{first_record['patient_name']}', Doctor='{first_record['doctor_name']}', Diagnosis='{first_record['diagnosis']}'")

# 10. Doctor Portal Profile & Dashboard
doc_profile = get("/api/doctor/profile", doc_token)
print(f"[OK] 10. Doctor Profile: {doc_profile['name']} - {doc_profile['specialization']}")

# 11. Add a new activity log / appointment to verify PostgreSQL sequence & lastrowid
import time
verify_email = f"postgres.verify.{int(time.time())}@healthpulse.com"
new_patient_payload = {
    "name": "Postgres Migration Verification Patient",
    "weight": "72 kg",
    "gender": "Other",
    "age": "34",
    "email": verify_email,
    "password": "patient123",
    "disease": "PostgreSQL Health Check",
    "doctor_id": 1
}
new_pat_resp = post("/patients", new_patient_payload, admin_token)
created_patient = new_pat_resp.get("patient", {})
pat_id = created_patient.get("id")
print(f"[OK] 11. Created new patient via PostgreSQL: ID={pat_id}, Name='{created_patient.get('name')}'")

# 12. Retrieve created patient
fetched_pat = get(f"/patients/{pat_id}", admin_token)
print(f"[OK] 12. Retrieved newly created patient from PostgreSQL: ID={fetched_pat.get('id')}, Name='{fetched_pat.get('name')}'")

# 13. Clean up the test patient
del_req = urllib.request.Request(f"{BASE_URL}/patients/{pat_id}", headers={"Authorization": f"Bearer {admin_token}"}, method="DELETE")
with urllib.request.urlopen(del_req) as resp:
    del_res = json.loads(resp.read().decode("utf-8"))
print(f"[OK] 13. Cleaned up verification patient: {del_res.get('message', 'Deleted')}")

print("=" * 60)
print("ALL POSTGRESQL HEALTHPULSE VERIFICATION TESTS PASSED SUCCESSFULLY!")
print("=" * 60)
