"""
HealthPulse HMS - Synthetic Names & Demographic Diversity Enrichment
Updates synthetic patients, doctors, and staff with 100% unique, diverse, pan-Indian names,
emails, phone numbers, and addresses while maintaining 100% referential integrity and
preserving original user and administrative accounts.
"""

import sys
import os
import re
import random
import datetime
import psycopg2
from psycopg2.extras import execute_values, execute_batch

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import get_db_connection
import indian_names_data as ind

# Prepare curated lists
MALE_FIRSTS = list(set(ind.INDIAN_MALE_FIRST_NAMES))
FEMALE_FIRSTS = list(set(ind.INDIAN_FEMALE_FIRST_NAMES))
LAST_NAMES = list(set(ind.INDIAN_LAST_NAMES))
MALE_MIDDLES = ind.INDIAN_MALE_MIDDLE_NAMES
FEMALE_MIDDLES = ind.INDIAN_FEMALE_MIDDLE_NAMES
INITIALS = ind.INDIAN_MIDDLE_INITIALS
CITIES = ind.INDIAN_CITIES

BUILDING_TYPES = [
    "Flat", "Apartment", "Apt", "Villa", "Plot", "House No.",
    "Bungalow", "Penthouse", "Tower", "Enclave", "Residency"
]

STREET_TYPES = [
    "Cross", "Main Road", "Lane", "Avenue", "Boulevard",
    "Sector", "Block", "Phase", "Layout", "Bypass Road"
]


def clean_slug(text):
    """Convert a name or string to a lowercase URL/email-friendly alphanumeric slug."""
    slug = re.sub(r'[^a-zA-Z0-9]', '', text).lower()
    return slug if slug else "user"


def generate_unique_name(gender='Any', prefix='', used_names_set=None):
    """
    Generates a natural, culturally authentic Indian name with zero digits.
    Uses first name + optional middle name/initial + last name.
    Automatically re-samples on collision without appending numbers.
    """
    if used_names_set is None:
        used_names_set = set()

    for _ in range(50000):
        g = gender
        if g not in ('Male', 'Female'):
            g = 'Male' if random.random() < 0.51 else 'Female'

        first = random.choice(MALE_FIRSTS if g == 'Male' else FEMALE_FIRSTS)
        last = random.choice(LAST_NAMES)

        dice = random.random()
        if dice < 0.42:
            base = f"{first} {last}"
        elif dice < 0.78:
            mid = random.choice(MALE_MIDDLES if g == 'Male' else FEMALE_MIDDLES)
            base = f"{first} {mid} {last}"
        else:
            init = random.choice(INITIALS)
            base = f"{first} {init} {last}"

        full = f"{prefix}{base}".strip()

        # Check that neither the full name nor the base name is already used
        if base not in used_names_set and full not in used_names_set:
            used_names_set.add(base)
            used_names_set.add(full)
            return full, base, first, last, g

    raise RuntimeError("Exhausted combinatorial space for unique Indian names.")


def generate_unique_phone(used_phones_set):
    """Generates an authentic unique 10-digit Indian mobile number."""
    prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "89", "88", "87", "86", "85", "84", "82", "81", "80", "79", "78", "77", "76", "75", "74", "73", "72", "70", "63", "62"]
    for _ in range(50000):
        pref = random.choice(prefixes)
        rest = "".join(str(random.randint(0, 9)) for _ in range(8))
        phone = f"+91 {pref}{rest[:4]} {rest[4:]}"
        if phone not in used_phones_set:
            used_phones_set.add(phone)
            return phone
    raise RuntimeError("Exhausted unique phone numbers.")


def generate_rich_address():
    """Generates a rich, non-repetitive Indian residential address."""
    city_info = random.choice(CITIES)
    city_name, state_name, localities, pin_prefix = city_info
    locality = random.choice(localities)
    b_type = random.choice(BUILDING_TYPES)
    s_type = random.choice(STREET_TYPES)
    door_num = random.randint(1, 250)
    street_num = random.randint(1, 24)

    if b_type in ("Flat", "Apt", "Apartment"):
        flat_num = f"{random.choice(['A', 'B', 'C', 'D', 'E'])}-{random.randint(101, 1404)}"
        addr_line = f"{flat_num}, {random.choice(['Sai', 'Sri', 'Green', 'Shanti', 'Royal', 'Galaxy', 'Krishna', 'Surya', 'Fortune'])} {b_type}, {street_num}th {s_type}"
    elif b_type in ("Villa", "Plot", "House No."):
        addr_line = f"#{door_num}, {random.choice(['Silver', 'Golden', 'Palm', 'Orchid', 'Tulip', 'Rose', 'Lakeview'])} {b_type}, Road No. {street_num}"
    else:
        addr_line = f"No. {door_num}, {street_num}th {s_type}, Near {random.choice(['Water Tank', 'Metro Station', 'Community Hall', 'Main Market', 'Central Park', 'Temple'])}"

    pin_suffix = f"{random.randint(11, 98):02d}"
    pincode = f"{pin_prefix}{pin_suffix}"
    return f"{addr_line}, {locality}, {city_name}, {state_name} - {pincode}"


def enrich_dataset():
    print("=" * 75, flush=True)
    print("HealthPulse HMS - Synthetic Names & Demographic Diversity Enrichment", flush=True)
    print("=" * 75, flush=True)

    conn = get_db_connection()
    raw_conn = getattr(conn, 'raw_conn', conn)
    cur = raw_conn.cursor()

    try:
        # -------------------------------------------------------------
        # STEP 1: LOAD PROTECTED ACCOUNTS
        # -------------------------------------------------------------
        print("\n[STEP 1] Inspecting and locking protected production accounts...", flush=True)
        used_names = set()
        used_emails = set()
        used_phones = set()

        # Users table (authenticated accounts)
        cur.execute("SELECT id, name, email FROM users;")
        user_rows = cur.fetchall()
        for u in user_rows:
            if u[1]:
                used_names.add(u[1].strip())
            if u[2]:
                used_emails.add(u[2].strip().lower())
        print(f" -> Protected {len(user_rows)} users in users table.", flush=True)

        # Original doctors (ID <= 7)
        cur.execute("SELECT id, name, email, phone FROM doctors WHERE id <= 7;")
        prot_doctors = cur.fetchall()
        for d in prot_doctors:
            if d[1]:
                used_names.add(d[1].strip())
                clean_d = re.sub(r'^Dr\.?\s*', '', d[1]).strip()
                used_names.add(clean_d)
            if d[2]:
                used_emails.add(d[2].strip().lower())
            if d[3]:
                used_phones.add(d[3].strip())
        print(f" -> Protected {len(prot_doctors)} original doctors (IDs 1-7).", flush=True)

        # Original patients (non-synthetic)
        cur.execute("SELECT id, name, email, phone FROM patients WHERE email NOT LIKE '%@healthpulse.com';")
        prot_patients = cur.fetchall()
        for p in prot_patients:
            if p[1]:
                used_names.add(p[1].strip())
            if p[2]:
                used_emails.add(p[2].strip().lower())
            if p[3]:
                used_phones.add(p[3].strip())
        print(f" -> Protected {len(prot_patients)} original patients.", flush=True)

        # -------------------------------------------------------------
        # STEP 2: ENRICH 193 SYNTHETIC DOCTORS
        # -------------------------------------------------------------
        print("\n[STEP 2] Generating unique, diverse names for synthetic doctors (IDs > 7)...", flush=True)
        cur.execute("SELECT id, specialization, department_id FROM doctors WHERE id > 7 ORDER BY id;")
        synth_doctors = cur.fetchall()
        print(f" -> Found {len(synth_doctors)} synthetic doctors to enrich.", flush=True)

        doctor_updates = []
        doctor_name_map = {d[0]: d[1] for d in prot_doctors}  # keep original doctor names

        for doc_id, spec, dept_id in synth_doctors:
            gender = 'Male' if random.random() < 0.58 else 'Female'
            full_name, base_name, first, last, g = generate_unique_name(
                gender=gender, prefix="Dr. ", used_names_set=used_names
            )
            # Create a clean, professional email
            clean_f = clean_slug(first)
            clean_l = clean_slug(last)
            email_candidate = f"dr.{clean_f}.{clean_l}@healthpulse.com"
            if email_candidate in used_emails:
                email_candidate = f"dr.{clean_f}.{clean_l}.{doc_id}@healthpulse.com"
            used_emails.add(email_candidate)

            phone = generate_unique_phone(used_phones)
            doctor_updates.append((full_name, email_candidate, phone, doc_id))
            doctor_name_map[doc_id] = full_name

        print(" -> Updating doctors in PostgreSQL...", flush=True)
        execute_batch(
            cur,
            "UPDATE doctors SET name = %s, email = %s, phone = %s WHERE id = %s;",
            doctor_updates,
            page_size=200
        )
        print(f" -> Successfully updated {len(doctor_updates)} doctors with 100% unique names.", flush=True)

        # -------------------------------------------------------------
        # STEP 3: ENRICH 500 STAFF MEMBERS
        # -------------------------------------------------------------
        print("\n[STEP 3] Generating unique, diverse names for 500 staff members...", flush=True)
        cur.execute("SELECT id, role FROM staff ORDER BY id;")
        staff_rows = cur.fetchall()
        print(f" -> Found {len(staff_rows)} staff members to enrich.", flush=True)

        staff_updates = []
        for staff_id, role in staff_rows:
            gender = 'Female' if random.random() < 0.65 else 'Male'
            full_name, base_name, first, last, g = generate_unique_name(
                gender=gender, prefix="", used_names_set=used_names
            )
            clean_f = clean_slug(first)
            clean_l = clean_slug(last)
            email_candidate = f"staff.{clean_f}.{clean_l}@healthpulse.com"
            if email_candidate in used_emails:
                email_candidate = f"staff.{clean_f}.{clean_l}.{staff_id}@healthpulse.com"
            used_emails.add(email_candidate)

            phone = generate_unique_phone(used_phones)
            staff_updates.append((full_name, email_candidate, phone, staff_id))

        print(" -> Updating staff in PostgreSQL...", flush=True)
        execute_batch(
            cur,
            "UPDATE staff SET name = %s, email = %s, phone = %s WHERE id = %s;",
            staff_updates,
            page_size=500
        )
        print(f" -> Successfully updated {len(staff_updates)} staff with 100% unique names.", flush=True)

        # -------------------------------------------------------------
        # STEP 4: ENRICH 9,994 SYNTHETIC PATIENTS
        # -------------------------------------------------------------
        print("\n[STEP 4] Generating unique, pan-Indian names and demographics for 9,994 synthetic patients...", flush=True)
        cur.execute("""
            SELECT id, gender, doctor_id 
            FROM patients 
            WHERE email LIKE '%@healthpulse.com' 
            ORDER BY id;
        """)
        synth_patients = cur.fetchall()
        print(f" -> Found {len(synth_patients)} synthetic patients to enrich.", flush=True)

        patient_updates = []
        for pat_id, current_gender, doc_id in synth_patients:
            gender = current_gender if current_gender in ('Male', 'Female') else ('Male' if random.random() < 0.51 else 'Female')
            full_name, base_name, first, last, g = generate_unique_name(
                gender=gender, prefix="", used_names_set=used_names
            )

            clean_f = clean_slug(first)
            clean_l = clean_slug(last)
            email_candidate = f"patient.{clean_f}.{clean_l}.{pat_id}@healthpulse.com"
            used_emails.add(email_candidate)

            phone = generate_unique_phone(used_phones)
            addr = generate_rich_address()

            # Generate natural emergency contact
            em_gender = 'Female' if random.random() < 0.50 else 'Male'
            em_first = random.choice(MALE_FIRSTS if em_gender == 'Male' else FEMALE_FIRSTS)
            em_last = last if random.random() < 0.65 else random.choice(LAST_NAMES)
            em_name = f"{em_first} {em_last}"
            em_phone = generate_unique_phone(used_phones)

            # Updated doctor name for denormalized column
            assigned_doc_name = doctor_name_map.get(doc_id, "Dr. Satya Deep")

            patient_updates.append((
                full_name, email_candidate, phone, addr,
                em_name, em_phone, assigned_doc_name, pat_id
            ))

        print(f" -> Prepared {len(patient_updates)} patient updates. Executing batch update in PostgreSQL...", flush=True)
        execute_batch(
            cur,
            """
            UPDATE patients SET 
                name = %s,
                email = %s,
                phone = %s,
                address = %s,
                emergency_contact_name = %s,
                emergency_contact_phone = %s,
                doctor_name = %s
            WHERE id = %s;
            """,
            patient_updates,
            page_size=1000
        )
        print(f" -> Successfully updated {len(patient_updates)} synthetic patients.", flush=True)

        # -------------------------------------------------------------
        # STEP 5: SYNCHRONIZE DEPARTMENT HEADS
        # -------------------------------------------------------------
        print("\n[STEP 5] Ensuring all 25 departments have assigned head doctors...", flush=True)
        cur.execute("""
            UPDATE departments d
            SET head_doctor_id = sub.id
            FROM (
                SELECT DISTINCT ON (department_id) id, department_id
                FROM doctors
                WHERE department_id IS NOT NULL
                ORDER BY department_id, id
            ) sub
            WHERE d.id = sub.department_id AND d.head_doctor_id IS NULL;
        """)

        # -------------------------------------------------------------
        # STEP 6: VERIFY UNIQUENESS CONSTRAINTS
        # -------------------------------------------------------------
        print("\n[STEP 6] Running rigorous uniqueness validation audit...", flush=True)

        # 1. Patients Uniqueness
        cur.execute("SELECT COUNT(*), COUNT(DISTINCT name), COUNT(DISTINCT email) FROM patients;")
        p_tot, p_uniq_names, p_uniq_emails = cur.fetchone()
        print(f" -> Patients: total={p_tot}, unique_names={p_uniq_names}, unique_emails={p_uniq_emails}", flush=True)
        if p_tot != p_uniq_names or p_tot != p_uniq_emails:
            raise ValueError(f"CRITICAL: Patient uniqueness check failed! Total: {p_tot}, Unique names: {p_uniq_names}")

        # 2. Doctors Uniqueness
        cur.execute("SELECT COUNT(*), COUNT(DISTINCT name), COUNT(DISTINCT email) FROM doctors;")
        d_tot, d_uniq_names, d_uniq_emails = cur.fetchone()
        print(f" -> Doctors: total={d_tot}, unique_names={d_uniq_names}, unique_emails={d_uniq_emails}", flush=True)
        if d_tot != d_uniq_names or d_tot != d_uniq_emails:
            raise ValueError(f"CRITICAL: Doctor uniqueness check failed! Total: {d_tot}, Unique names: {d_uniq_names}")

        # 3. Staff Uniqueness
        cur.execute("SELECT COUNT(*), COUNT(DISTINCT name), COUNT(DISTINCT email) FROM staff;")
        s_tot, s_uniq_names, s_uniq_emails = cur.fetchone()
        print(f" -> Staff: total={s_tot}, unique_names={s_uniq_names}, unique_emails={s_uniq_emails}", flush=True)
        if s_tot != s_uniq_names or s_tot != s_uniq_emails:
            raise ValueError(f"CRITICAL: Staff uniqueness check failed! Total: {s_tot}, Unique names: {s_uniq_names}")

        # 4. Cross-Entity Name Collisions (Doctors vs Staff vs Patients)
        cur.execute("""
            SELECT COUNT(*) FROM (
                SELECT REGEXP_REPLACE(name, '^Dr\.?\s*', '') AS clean_name FROM doctors
                INTERSECT
                SELECT name FROM staff
            ) sub;
        """)
        doc_staff_overlap = cur.fetchone()[0]
        print(f" -> Overlap between Doctor base names and Staff names: {doc_staff_overlap}", flush=True)
        if doc_staff_overlap > 0:
            raise ValueError(f"CRITICAL: Detected {doc_staff_overlap} overlapping names between doctors and staff!")

        cur.execute("""
            SELECT COUNT(*) FROM (
                SELECT REGEXP_REPLACE(name, '^Dr\.?\s*', '') AS clean_name FROM doctors
                INTERSECT
                SELECT name FROM patients
            ) sub;
        """)
        doc_pat_overlap = cur.fetchone()[0]
        print(f" -> Overlap between Doctor base names and Patient names: {doc_pat_overlap}", flush=True)
        if doc_pat_overlap > 0:
            raise ValueError(f"CRITICAL: Detected {doc_pat_overlap} overlapping names between doctors and patients!")

        cur.execute("""
            SELECT COUNT(*) FROM (
                SELECT name FROM staff
                INTERSECT
                SELECT name FROM patients
            ) sub;
        """)
        staff_pat_overlap = cur.fetchone()[0]
        print(f" -> Overlap between Staff names and Patient names: {staff_pat_overlap}", flush=True)
        if staff_pat_overlap > 0:
            raise ValueError(f"CRITICAL: Detected {staff_pat_overlap} overlapping names between staff and patients!")

        # 5. Check for any digits in synthetic names
        cur.execute("""
            SELECT COUNT(*) FROM (
                SELECT name FROM patients WHERE email LIKE '%@healthpulse.com' AND name ~ '[0-9]'
                UNION ALL
                SELECT name FROM doctors WHERE id > 7 AND name ~ '[0-9]'
                UNION ALL
                SELECT name FROM staff WHERE name ~ '[0-9]'
            ) sub;
        """)
        digit_names_count = cur.fetchone()[0]
        print(f" -> Names containing digits/numbers: {digit_names_count}", flush=True)
        if digit_names_count > 0:
            raise ValueError(f"CRITICAL: Found {digit_names_count} synthetic names containing digits!")

        # 6. Check for generic names ("Patient", "User", "Doctor 1")
        cur.execute("""
            SELECT COUNT(*) FROM (
                SELECT name FROM patients WHERE name ILIKE '%patient%' OR name ILIKE '%user%'
                UNION ALL
                SELECT name FROM doctors WHERE name ILIKE '%doctor %'
                UNION ALL
                SELECT name FROM staff WHERE name ILIKE '%staff%' OR name ILIKE '%user%'
            ) sub;
        """)
        generic_names_count = cur.fetchone()[0]
        print(f" -> Names containing generic words (patient/user/staff): {generic_names_count}", flush=True)
        if generic_names_count > 0:
            raise ValueError(f"CRITICAL: Found {generic_names_count} generic names!")

        # -------------------------------------------------------------
        # STEP 7: COMMIT TRANSACTION
        # -------------------------------------------------------------
        raw_conn.commit()
        print("\n" + "=" * 75, flush=True)
        print("ALL UNIQUENESS AUDITS PASSED WITH ZERO VIOLATIONS!", flush=True)
        print("Successfully committed updated synthetic names and demographics to PostgreSQL.", flush=True)
        print("=" * 75, flush=True)

    except Exception as e:
        raw_conn.rollback()
        print(f"\n[ERROR] Transaction aborted and rolled back: {e}", flush=True)
        raise e
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    enrich_dataset()
