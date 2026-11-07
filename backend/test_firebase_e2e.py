"""
HealthPulse Firebase Authentication End-to-End Test Suite
Tests Firebase token exchange, role-based access control, cross-portal rejection,
unauthorized admin/doctor auto-creation blocking, patient auto-provisioning,
session generation, and data integrity on PostgreSQL.
"""

import sys
import os
import json
import unittest

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database import get_db_connection, get_active_db_engine

class TestFirebaseAuthenticationE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()
        print("\n====================================================================")
        print("HEALTHPULSE FIREBASE AUTHENTICATION END-TO-END TEST SUITE")
        print(f"Active Database Engine: {get_active_db_engine()}")
        print("====================================================================")

    def test_01_admin_firebase_login(self):
        """Admin can authenticate via Firebase token into Admin portal."""
        token = "mock-firebase-token-admin:admin@healthpulse.com"
        res = self.client.post("/api/auth/firebase-login", json={
            "idToken": token,
            "role": "admin",
            "name": "System Administrator",
            "provider": "google.com"
        })
        self.assertEqual(res.status_code, 200, res.get_json())
        data = res.get_json()
        self.assertEqual(data["role"], "admin")
        self.assertEqual(data["user"]["email"], "admin@healthpulse.com")
        self.assertTrue(data["token"])
        print(" [PASS] Test 1: Admin Firebase Authentication Succeeded")

    def test_02_doctor_firebase_login(self):
        """Doctor can authenticate via Firebase token into Doctor portal."""
        token = "mock-firebase-token-doctor:dr.satyadeep@healthpulse.com"
        res = self.client.post("/api/auth/firebase-login", json={
            "idToken": token,
            "role": "doctor",
            "name": "Dr. Satya Deep",
            "provider": "google.com"
        })
        self.assertEqual(res.status_code, 200, res.get_json())
        data = res.get_json()
        self.assertEqual(data["role"], "doctor")
        self.assertEqual(data["user"]["email"], "dr.satyadeep@healthpulse.com")
        self.assertIsNotNone(data["user"]["doctor_id"])
        print(" [PASS] Test 2: Doctor Firebase Authentication Succeeded (Doctor ID linked)")

    def test_03_patient_firebase_login(self):
        """Patient can authenticate via Firebase token into Patient portal."""
        token = "mock-firebase-token-patient:shravan@healthpulse.com"
        res = self.client.post("/api/auth/firebase-login", json={
            "idToken": token,
            "role": "patient",
            "name": "Shravan",
            "provider": "google.com"
        })
        self.assertEqual(res.status_code, 200, res.get_json())
        data = res.get_json()
        self.assertEqual(data["role"], "patient")
        self.assertIsNotNone(data["user"]["patient_id"])
        print(" [PASS] Test 3: Patient Firebase Authentication Succeeded (Patient ID linked)")

    def test_04_cross_portal_prevention(self):
        """Patient cannot sign into Admin or Doctor portals; Doctor cannot sign into Admin portal."""
        # Patient -> Admin portal
        res_pat_admin = self.client.post("/api/auth/firebase-login", json={
            "idToken": "mock-firebase-token-patient:shravan@healthpulse.com",
            "role": "admin"
        })
        self.assertEqual(res_pat_admin.status_code, 403)
        self.assertIn("Access Denied", res_pat_admin.get_json()["error"])

        # Doctor -> Admin portal
        res_doc_admin = self.client.post("/api/auth/firebase-login", json={
            "idToken": "mock-firebase-token-doctor:dr.satyadeep@healthpulse.com",
            "role": "admin"
        })
        self.assertEqual(res_doc_admin.status_code, 403)

        # Admin -> Patient portal
        res_adm_pat = self.client.post("/api/auth/firebase-login", json={
            "idToken": "mock-firebase-token-admin:admin@healthpulse.com",
            "role": "patient"
        })
        self.assertEqual(res_adm_pat.status_code, 403)
        print(" [PASS] Test 4: Cross-Portal Access Prevention Enforced (403 Forbidden)")

    def test_05_unauthorized_admin_creation_blocked(self):
        """Google / Firebase login must never auto-provision an Admin or Doctor account."""
        res_unknown_admin = self.client.post("/api/auth/firebase-login", json={
            "idToken": "mock-firebase-token-admin:intruder_admin@attacker.com",
            "role": "admin"
        })
        self.assertEqual(res_unknown_admin.status_code, 403)
        self.assertIn("Access Denied", res_unknown_admin.get_json()["error"])

        res_unknown_doc = self.client.post("/api/auth/firebase-login", json={
            "idToken": "mock-firebase-token-doctor:intruder_doctor@attacker.com",
            "role": "doctor"
        })
        self.assertEqual(res_unknown_doc.status_code, 403)
        print(" [PASS] Test 5: Unauthorized Admin & Doctor Provisioning Blocked (403 Forbidden)")

    def test_06_patient_auto_provisioning(self):
        """A new patient can register and authenticate via Firebase Patient Portal."""
        new_email = f"test.patient.{os.getpid()}@healthpulse.test"
        res = self.client.post("/api/auth/firebase-login", json={
            "idToken": f"mock-firebase-token-patient:{new_email}",
            "role": "patient",
            "name": "Jane Test Patient",
            "age": "29",
            "gender": "Female",
            "weight": "65",
            "disease": "Preventive Checkup"
        })
        self.assertEqual(res.status_code, 200, res.get_json())
        data = res.get_json()
        self.assertEqual(data["role"], "patient")
        self.assertIsNotNone(data["user"]["patient_id"])
        print(f" [PASS] Test 6: Patient Auto-Provisioning Succeeded (Created ID: {data['user']['patient_id']})")

    def test_07_invalid_token_rejection(self):
        """Invalid or malformed tokens must be rejected with 401."""
        res = self.client.post("/api/auth/firebase-login", json={
            "idToken": "invalid_malformed_token_xyz_123",
            "role": "patient"
        })
        self.assertEqual(res.status_code, 401)
        print(" [PASS] Test 7: Invalid Token Rejected with 401 Unauthorized")

    def test_08_rbac_protected_endpoints(self):
        """Verify role protection on endpoints."""
        # Authenticate patient
        pat_res = self.client.post("/api/auth/firebase-login", json={
            "idToken": "mock-firebase-token-patient:shravan@healthpulse.com",
            "role": "patient"
        })
        pat_token = pat_res.get_json()["token"]

        # Patient tries to access Admin user management
        adm_check = self.client.get("/api/admin/users", headers={"Authorization": f"Bearer {pat_token}"})
        self.assertEqual(adm_check.status_code, 403)

        # Authenticate admin
        adm_res = self.client.post("/api/auth/firebase-login", json={
            "idToken": "mock-firebase-token-admin:admin@healthpulse.com",
            "role": "admin"
        })
        adm_token = adm_res.get_json()["token"]

        # Admin accesses Admin user management
        adm_access = self.client.get("/api/admin/users", headers={"Authorization": f"Bearer {adm_token}"})
        self.assertEqual(adm_access.status_code, 200)
        print(" [PASS] Test 8: Role-based Authorization Verified (Patient 403, Admin 200)")

    def test_09_backward_compatibility_native_login(self):
        """Native email and password authentication continues to function seamlessly."""
        res = self.client.post("/api/auth/login", json={
            "email": "admin@healthpulse.com",
            "password": "admin123",
            "role": "admin"
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["role"], "admin")
        print(" [PASS] Test 9: Native Email/Password Login Backward Compatibility Verified")

    def test_10_database_integrity(self):
        """Ensure all clinical tables in database remain intact and uncorrupted."""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM doctors")
        doc_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM patients")
        pat_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM appointments")
        apt_count = cur.fetchone()[0]
        conn.close()

        self.assertGreater(doc_count, 0)
        self.assertGreater(pat_count, 0)
        self.assertGreater(apt_count, 0)
        print(f" [PASS] Test 10: Database Integrity Intact (Doctors: {doc_count}, Patients: {pat_count}, Appointments: {apt_count})")

if __name__ == "__main__":
    unittest.main()
