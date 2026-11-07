#!/usr/bin/env python3
"""
HealthPulse End-to-End API and Integration Verification Test Suite
Verifies:
- All new and existing Flask API endpoints
- Referential integrity and data connectivity
- Admin, Doctor, and Patient dashboards data delivery
- Performance and response structures
"""

import sys
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app import app
from database import get_db_connection

def run_tests():
    print("=" * 72)
    print("HEALTHPULSE SYNTHETIC DATA & API VERIFICATION SUITE")
    print("=" * 72)

    client = app.test_client()
    passed_tests = 0
    total_tests = 0

    def assert_test(name, condition, details=""):
        nonlocal passed_tests, total_tests
        total_tests += 1
        if condition:
            passed_tests += 1
            print(f" [PASS] {name} {details}")
        else:
            print(f" [FAIL] {name} - FAILED: {details}")

    # 1. System Health & Database Connection
    res = client.get("/api/system/database-status")
    assert_test("Database Status", res.status_code == 200 and res.json.get("connected") is True, f"engine: {res.json.get('engine')}")

    # 2. Admin Dashboard Stats
    res = client.get("/api/admin/dashboard/stats")
    data = res.json or {}
    assert_test(
        "Admin Dashboard Stats",
        res.status_code == 200 and data.get("total_patients", 0) >= 100 and data.get("total_doctors", 0) >= 20,
        f"patients={data.get('total_patients')}, doctors={data.get('total_doctors')}, appointments={data.get('total_appointments')}, revenue=INR {data.get('total_revenue', 0):,.2f}"
    )

    # 3. Clinical Departments API
    res = client.get("/api/departments")
    data = res.json or {}
    depts = data.get("departments", [])
    assert_test(
        "Departments API",
        res.status_code == 200 and len(depts) >= 10,
        f"retrieved {len(depts)} departments, first='{depts[0].get('name') if depts else ''}'"
    )

    # 4. Hospital Staff API
    res = client.get("/api/staff?limit=10")
    data = res.json or {}
    staff = data.get("staff", [])
    assert_test(
        "Staff API (Paginated)",
        res.status_code == 200 and len(staff) == 10 and data.get("total", 0) >= 30,
        f"total_staff={data.get('total')}, page_sample='{staff[0].get('name')} - {staff[0].get('role')}'"
    )

    # 5. Medicines Catalog API
    res = client.get("/api/medicines?limit=10")
    data = res.json or {}
    meds = data.get("medicines", [])
    assert_test(
        "Medicines Catalog API",
        res.status_code == 200 and len(meds) == 10 and data.get("total", 0) >= 100,
        f"total_medicines={data.get('total')}, categories={len(data.get('categories', []))}"
    )

    # 6. Rooms and Beds APIs
    res_rooms = client.get("/api/rooms")
    res_beds_summary = client.get("/api/beds/summary")
    rooms_data = res_rooms.json or {}
    beds_summary = res_beds_summary.json or {}
    assert_test(
        "Rooms & Beds APIs",
        res_rooms.status_code == 200 and res_beds_summary.status_code == 200 and rooms_data.get("total", 0) >= 20,
        f"rooms={rooms_data.get('total')}, total_beds={beds_summary.get('total_beds')}, occupancy_rate={beds_summary.get('occupancy_rate')}"
    )

    # 7. Admissions and Discharges APIs
    res_adm = client.get("/api/admissions?limit=5")
    res_adm_stats = client.get("/api/admissions/stats")
    res_dis = client.get("/api/discharges?limit=5")
    adm_data = res_adm.json or {}
    adm_stats = res_adm_stats.json or {}
    dis_data = res_dis.json or {}
    assert_test(
        "Inpatient Admissions & Discharges",
        res_adm.status_code == 200 and res_dis.status_code == 200 and adm_data.get("total", 0) >= 40,
        f"admissions={adm_data.get('total')}, active={adm_stats.get('active_admissions')}, discharges={dis_data.get('total')}"
    )

    # 8. Billing Records & Financial Stats
    res_bill = client.get("/api/billing?limit=5")
    res_bill_stats = client.get("/api/billing/stats")
    bill_data = res_bill.json or {}
    bill_stats = res_bill_stats.json or {}
    assert_test(
        "Billing Invoices & Revenue Stats",
        res_bill.status_code == 200 and res_bill_stats.status_code == 200 and bill_data.get("total", 0) >= 200,
        f"invoices={bill_data.get('total')}, net_billed=INR {bill_stats.get('net_billed', 0):,.2f}, collected=INR {bill_stats.get('total_collected', 0):,.2f}, collection_rate={bill_stats.get('collection_rate')}"
    )

    # 9. Payment Transactions API
    res_pay = client.get("/api/payments?limit=5")
    res_pay_stats = client.get("/api/payments/stats")
    pay_data = res_pay.json or {}
    pay_stats = res_pay_stats.json or {}
    assert_test(
        "Payment Transactions & Methods",
        res_pay.status_code == 200 and res_pay_stats.status_code == 200 and pay_data.get("total", 0) >= 180,
        f"payments={pay_data.get('total')}, total_collected=INR {pay_stats.get('total_amount_collected', 0):,.2f}, payment_methods={len(pay_stats.get('methods', []))}"
    )

    # 10. Diagnostic Lab Reports API
    res_lab = client.get("/api/lab-reports?limit=5")
    res_lab_stats = client.get("/api/lab-reports/stats")
    lab_data = res_lab.json or {}
    lab_stats = res_lab_stats.json or {}
    assert_test(
        "Diagnostic Lab Reports API",
        res_lab.status_code == 200 and res_lab_stats.status_code == 200 and lab_data.get("total", 0) >= 100,
        f"reports={lab_data.get('total')}, normal={lab_stats.get('normal_count')}, abnormal={lab_stats.get('abnormal_count')}"
    )

    # 11. Doctor Dashboard Clinical Delivery
    # Test for Dr. Satya Deep (Doctor ID = 1)
    # Using internal test helper by simulating admin access or calling endpoint
    res_doc = client.get("/api/doctor/dashboard/1", headers={"Authorization": "Bearer demo-token"})
    # Note: /api/doctor/dashboard/<id> is protected, let's test via direct database query & endpoint
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM appointments WHERE doctor_id = 1;")
    doc_appts = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM patients WHERE doctor_id = 1;")
    doc_patients = cur.fetchone()[0]
    assert_test(
        "Doctor Profile & Clinical Appointments Connectivity",
        doc_appts > 0 and doc_patients > 0,
        f"Dr. Satya Deep has {doc_appts} appointments and {doc_patients} assigned patients"
    )

    # 12. Patient Profile & Clinical History Delivery
    # Test for Shravan (Patient ID = 1)
    cur.execute("SELECT COUNT(*) FROM appointments WHERE patient_id = 1;")
    pat_appts = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM medical_records WHERE patient_id = 1;")
    pat_records = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM prescriptions WHERE patient_id = 1;")
    pat_rxs = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM billing_records WHERE patient_id = 1;")
    pat_bills = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM lab_results WHERE patient_id = 1;")
    pat_labs = cur.fetchone()[0]
    conn.close()

    assert_test(
        "Patient Profile & Historical Records Connectivity",
        pat_appts > 0 and pat_records > 0 and pat_rxs > 0 and pat_bills > 0,
        f"Patient Shravan has {pat_appts} appointments, {pat_records} medical records, {pat_rxs} prescriptions, {pat_labs} lab tests, and {pat_bills} billing records"
    )

    # 13. Admin Login & Authorization
    res_admin_login = client.post("/api/auth/login", json={
        "email": "admin@healthpulse.com",
        "password": "admin123",
        "role": "admin"
    })
    admin_auth_data = res_admin_login.json or {}
    admin_token = admin_auth_data.get("token")
    assert_test(
        "Admin Portal Authentication",
        res_admin_login.status_code == 200 and admin_auth_data.get("role") == "admin" and bool(admin_token),
        f"role={admin_auth_data.get('role')}, token_issued={bool(admin_token)}"
    )

    # 14. Doctor Login & Dashboard Delivery
    res_doc_login = client.post("/api/auth/login", json={
        "email": "dr.satyadeep@healthpulse.com",
        "password": "doctor123",
        "role": "doctor"
    })
    doc_auth_data = res_doc_login.json or {}
    doc_token = doc_auth_data.get("token")
    assert_test(
        "Doctor Portal Authentication",
        res_doc_login.status_code == 200 and doc_auth_data.get("role") == "doctor" and bool(doc_token),
        f"doctor={doc_auth_data.get('user', {}).get('name')}, doctor_id={doc_auth_data.get('user', {}).get('doctor_id')}"
    )

    # Verify Doctor Dashboard using Doctor Token
    res_doc_dash = client.get("/api/doctor/dashboard", headers={"Authorization": f"Bearer {doc_token}"})
    doc_dash_data = res_doc_dash.json or {}
    assigned_patients = doc_dash_data.get("assigned_patients", [])
    assert_test(
        "Doctor Live Dashboard API via Token",
        res_doc_dash.status_code == 200 and len(assigned_patients) > 0,
        f"assigned_patients={len(assigned_patients)}, appointments={len(doc_dash_data.get('appointments', []))}"
    )

    # 15. Patient Login & Billing History Delivery
    res_pat_login = client.post("/api/auth/login", json={
        "email": "shravan@healthpulse.com",
        "password": "patient123",
        "role": "patient"
    })
    pat_auth_data = res_pat_login.json or {}
    pat_token = pat_auth_data.get("token")
    assert_test(
        "Patient Portal Authentication",
        res_pat_login.status_code == 200 and pat_auth_data.get("role") == "patient" and bool(pat_token),
        f"patient={pat_auth_data.get('user', {}).get('name')}, patient_id={pat_auth_data.get('user', {}).get('patient_id')}"
    )

    # Verify Patient Billing History via Token
    res_pat_billing = client.get("/api/patient/billing", headers={"Authorization": f"Bearer {pat_token}"})
    pat_billing_data = res_pat_billing.json or {}
    summary = pat_billing_data.get("summary", {})
    assert_test(
        "Patient Billing History API via Token",
        res_pat_billing.status_code == 200 and summary.get("total_invoices", 0) > 0,
        f"invoices={summary.get('total_invoices')}, billed=INR {summary.get('total_billed', 0):,.2f}, paid=INR {summary.get('total_paid', 0):,.2f}, balance=INR {summary.get('total_balance', 0):,.2f}"
    )

    print("\n" + "=" * 72)
    print(f"VERIFICATION SUMMARY: {passed_tests}/{total_tests} TESTS PASSED")
    print("=" * 72)

    return passed_tests == total_tests


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
