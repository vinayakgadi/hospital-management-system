#!/usr/bin/env python3
"""
HealthPulse Hospital Management System
Reusable Database Seeding Script

Populates the PostgreSQL database with realistic, interconnected synthetic records:
- 10 Departments
- 30 Staff members
- 20 Doctors
- 100 Patients
- 200 Appointments
- 150 Medical Records
- 120 Prescriptions
- 100 Medicines
- 150 Prescription Items
- 100 Lab Reports
- 200 Billing Records
- 180 Payments
- 20 Rooms
- 50 Beds
- 40 Inpatient Admissions
- 30 Patient Discharges

Features:
- Idempotent: safe to run multiple times without duplicating or corrupting data.
- Strict referential integrity: zero orphan records.
- Realistic Indian demographic and clinical data.
- Supports CLI flags to customize target record counts or scale up.
"""

import os
import sys
import argparse
import datetime
from datetime import timedelta

# Ensure backend directory is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from generate_synthetic_data import HospitalSyntheticDataGenerator


def seed_database(
    departments=25,
    doctors=200,
    staff=500,
    medicines=2000,
    rooms=500,
    beds=2000,
    patients=10000,
    appointments=25000,
    medical_records=20000,
    prescriptions=15000,
    prescription_items=30000,
    lab_reports=12000,
    bills=25000,
    payments=30000,
    admissions=5000,
    discharges=4000,
    batch_size=2000
):
    print("=" * 72)
    print("HEALTHPULSE DATABASE SEEDING PROCESS")
    print(f"Timestamp: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Target Population: 181,225+ Interconnected Records across 16 Clinical Tables")
    print("=" * 72)

    gen = HospitalSyntheticDataGenerator(batch_size=batch_size)

    try:
        # Phase 1: Clinical Departments & Healthcare Personnel
        print("\n[Phase 1] Seeding Structural Foundation (Departments, Doctors, Staff)...")
        gen.generate_departments(departments)
        gen.generate_doctors(doctors)
        gen.generate_staff(staff)

        # Ensure initial seed doctors (1-7) have department assignments and Dr. Satya Deep is Cardiology Chief
        gen.cur.execute("UPDATE doctors SET department_id = 1 WHERE id IN (1, 5, 6) AND department_id IS NULL;")
        gen.cur.execute("UPDATE doctors SET department_id = 2 WHERE id = 4 AND department_id IS NULL;")
        gen.cur.execute("UPDATE doctors SET department_id = 3 WHERE id IN (2, 3) AND department_id IS NULL;")
        gen.cur.execute("UPDATE doctors SET department_id = 4 WHERE id = 7 AND department_id IS NULL;")
        gen.cur.execute("UPDATE departments SET head_doctor_id = 1 WHERE id = 1;")
        gen.raw_conn.commit()

        # Phase 2: Pharmacy Catalog & Hospital Infrastructure
        print("\n[Phase 2] Seeding Pharmacy & Ward Infrastructure (Medicines, Rooms, Beds)...")
        gen.generate_medicines(medicines)
        gen.generate_rooms_and_beds(rooms, beds)

        # Phase 3: Patient Registry & Clinical Scheduling
        print("\n[Phase 3] Seeding Patients & Appointments...")
        gen.generate_patients(patients)
        gen.generate_appointments(appointments)

        # Phase 4: Electronic Medical Records & Diagnostic Tests
        print("\n[Phase 4] Seeding Clinical Encounters & Diagnostic Reports...")
        gen.generate_medical_records(medical_records)
        gen.generate_prescriptions_and_items(prescriptions, prescription_items)
        gen.generate_lab_reports(lab_reports)

        # Phase 5: Inpatient Admissions & Discharges
        print("\n[Phase 5] Seeding Inpatient Admissions & Discharges...")
        gen.generate_admissions_and_discharges(admissions, discharges)

        # Phase 6: Financial Operations & Revenue Cycle
        print("\n[Phase 6] Seeding Billing Records & Payment Transactions...")
        gen.generate_billing_and_payments(bills, payments)

        # Phase 7: Comprehensive Referential Integrity Verification
        print("\n[Phase 7] Verifying Referential Integrity Across All Foreign Keys...")
        passed, issues = gen.verify_integrity()

        print("\n" + "=" * 72)
        print("DATABASE SEEDING COMPLETED")
        print("=" * 72)

        tables = [
            ("Departments", "departments"),
            ("Credentialed Doctors", "doctors"),
            ("Hospital Staff", "staff"),
            ("Medicines Catalog", "medicines"),
            ("Hospital Rooms", "rooms"),
            ("Hospital Beds", "beds"),
            ("Registered Patients", "patients"),
            ("Appointments", "appointments"),
            ("Medical Records (EMR)", "medical_records"),
            ("Prescriptions", "prescriptions"),
            ("Prescription Line Items", "prescription_items"),
            ("Diagnostic Lab Reports", "lab_results"),
            ("Inpatient Admissions", "admissions"),
            ("Patient Discharges", "discharges"),
            ("Billing Invoices", "billing_records"),
            ("Payment Transactions", "payments")
        ]

        total = 0
        for label, tbl in tables:
            cnt = gen.get_count(tbl)
            total += cnt
            print(f" • {label:28}: {cnt:>8,d} records")

        print("-" * 72)
        print(f" TOTAL DATABASE POPULATION  : {total:>8,d} RECORDS")
        print("=" * 72)

        if passed:
            print("[SUCCESS] All Foreign Key Constraints Verified (0 Orphans, 100% Referential Integrity)!")
        else:
            print(f"[WARNING] Detected issues in {len(issues)} table relations.")

        return passed

    except Exception as e:
        gen.raw_conn.rollback()
        print(f"[ERROR] Database seeding failed with error: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        gen.close()


def main():
    parser = argparse.ArgumentParser(description="HealthPulse Hospital Management System Database Seeder")
    parser.add_argument("--patients", type=int, default=10000, help="Number of patients (default: 10,000)")
    parser.add_argument("--doctors", type=int, default=200, help="Number of doctors (default: 200)")
    parser.add_argument("--departments", type=int, default=25, help="Number of departments (default: 25)")
    parser.add_argument("--appointments", type=int, default=25000, help="Number of appointments (default: 25,000)")
    parser.add_argument("--medical-records", type=int, default=20000, help="Number of medical records (default: 20,000)")
    parser.add_argument("--prescriptions", type=int, default=15000, help="Number of prescriptions (default: 15,000)")
    parser.add_argument("--medicines", type=int, default=2000, help="Number of medicines in catalog (default: 2,000)")
    parser.add_argument("--lab-reports", type=int, default=12000, help="Number of lab reports (default: 12,000)")
    parser.add_argument("--bills", type=int, default=25000, help="Number of billing invoices (default: 25,000)")
    parser.add_argument("--payments", type=int, default=30000, help="Number of payments (default: 30,000)")
    parser.add_argument("--staff", type=int, default=500, help="Number of staff members (default: 500)")
    parser.add_argument("--rooms", type=int, default=500, help="Number of rooms (default: 500)")
    parser.add_argument("--beds", type=int, default=2000, help="Number of beds (default: 2,000)")
    parser.add_argument("--admissions", type=int, default=5000, help="Number of admissions (default: 5,000)")
    parser.add_argument("--discharges", type=int, default=4000, help="Number of discharges (default: 4,000)")
    parser.add_argument("--sample", action="store_true", help="Quick smoke test mode with scaled down sample")

    args = parser.parse_args()

    if args.sample:
        print("[INFO] --sample flag provided: scaling down to test sample...")
        seed_database(
            departments=10,
            doctors=20,
            staff=30,
            medicines=100,
            rooms=20,
            beds=50,
            patients=100,
            appointments=200,
            medical_records=150,
            prescriptions=120,
            prescription_items=150,
            lab_reports=100,
            bills=200,
            payments=180,
            admissions=40,
            discharges=30
        )
    else:
        seed_database(
            departments=args.departments,
            doctors=args.doctors,
            staff=args.staff,
            medicines=args.medicines,
            rooms=args.rooms,
            beds=args.beds,
            patients=args.patients,
            appointments=args.appointments,
            medical_records=args.medical_records,
            prescriptions=args.prescriptions,
            prescription_items=int(args.prescriptions * 2.0),
            lab_reports=args.lab_reports,
            bills=args.bills,
            payments=args.payments,
            admissions=args.admissions,
            discharges=args.discharges
        )


if __name__ == "__main__":
    main()
