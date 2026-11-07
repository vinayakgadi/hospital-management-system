"""
HealthPulse Schema Extension for Synthetic Hospital Data
Creates tables for departments, staff, medicines, prescription_items,
rooms, beds, admissions, discharges, billing_records, payments, and lab_reports view.
Safe and idempotent (IF NOT EXISTS). Does NOT drop or truncate any existing data.
"""
import sys
from database import get_db_connection

DDL_STATEMENTS = [
    # 1. departments
    """
    CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        head_doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
        phone VARCHAR(50),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
    CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
    """,

    # 2. Add department_id to doctors
    """
    ALTER TABLE doctors ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_doctors_dept_id ON doctors(department_id);
    """,

    # 3. staff
    """
    CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        shift VARCHAR(50) DEFAULT 'Morning',
        status VARCHAR(50) DEFAULT 'Active',
        qualification VARCHAR(255),
        salary NUMERIC(10, 2) DEFAULT 35000.00,
        joined_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff(department_id);
    CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
    CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
    """,

    # 4. medicines
    """
    CREATE TABLE IF NOT EXISTS medicines (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        generic_name VARCHAR(255),
        category VARCHAR(100),
        dosage_form VARCHAR(50),
        strength VARCHAR(50),
        manufacturer VARCHAR(255),
        price NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
        stock_quantity INTEGER NOT NULL DEFAULT 100,
        reorder_level INTEGER DEFAULT 20,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
    CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
    """,

    # 5. prescription_items
    """
    CREATE TABLE IF NOT EXISTS prescription_items (
        id SERIAL PRIMARY KEY,
        prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
        medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        duration VARCHAR(100),
        quantity INTEGER DEFAULT 1,
        instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_rx_items_rx_id ON prescription_items(prescription_id);
    CREATE INDEX IF NOT EXISTS idx_rx_items_med_id ON prescription_items(medicine_id);
    """,

    # 6. rooms
    """
    CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(50) UNIQUE NOT NULL,
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        room_type VARCHAR(100) NOT NULL,
        floor INTEGER NOT NULL DEFAULT 1,
        charge_per_day NUMERIC(10, 2) NOT NULL DEFAULT 1500.00,
        status VARCHAR(50) DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(room_number);
    CREATE INDEX IF NOT EXISTS idx_rooms_dept ON rooms(department_id);
    CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
    """,

    # 7. beds
    """
    CREATE TABLE IF NOT EXISTS beds (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        bed_number VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_room_bed UNIQUE(room_id, bed_number)
    );
    CREATE INDEX IF NOT EXISTS idx_beds_room_id ON beds(room_id);
    CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);
    """,

    # 8. admissions
    """
    CREATE TABLE IF NOT EXISTS admissions (
        id SERIAL PRIMARY KEY,
        admission_number VARCHAR(100) UNIQUE NOT NULL,
        patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        bed_id INTEGER NOT NULL REFERENCES beds(id) ON DELETE RESTRICT,
        attending_doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
        admission_date TIMESTAMP NOT NULL,
        admission_reason TEXT,
        diagnosis TEXT,
        status VARCHAR(50) DEFAULT 'Admitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_admissions_patient ON admissions(patient_id);
    CREATE INDEX IF NOT EXISTS idx_admissions_bed ON admissions(bed_id);
    CREATE INDEX IF NOT EXISTS idx_admissions_doctor ON admissions(attending_doctor_id);
    CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
    CREATE INDEX IF NOT EXISTS idx_admissions_num ON admissions(admission_number);
    """,

    # 9. discharges
    """
    CREATE TABLE IF NOT EXISTS discharges (
        id SERIAL PRIMARY KEY,
        admission_id INTEGER NOT NULL UNIQUE REFERENCES admissions(id) ON DELETE CASCADE,
        patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        discharge_date TIMESTAMP NOT NULL,
        discharge_summary TEXT,
        condition_at_discharge VARCHAR(100) DEFAULT 'Recovered',
        follow_up_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_discharges_admission ON discharges(admission_id);
    CREATE INDEX IF NOT EXISTS idx_discharges_patient ON discharges(patient_id);
    """,

    # 10. billing_records
    """
    CREATE TABLE IF NOT EXISTS billing_records (
        id SERIAL PRIMARY KEY,
        bill_number VARCHAR(100) UNIQUE NOT NULL,
        patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
        admission_id INTEGER REFERENCES admissions(id) ON DELETE SET NULL,
        total_amount NUMERIC(12, 2) NOT NULL,
        discount_amount NUMERIC(12, 2) DEFAULT 0.00,
        tax_amount NUMERIC(12, 2) DEFAULT 0.00,
        net_amount NUMERIC(12, 2) NOT NULL,
        paid_amount NUMERIC(12, 2) DEFAULT 0.00,
        balance_amount NUMERIC(12, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'Paid',
        bill_date DATE NOT NULL,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_billing_patient ON billing_records(patient_id);
    CREATE INDEX IF NOT EXISTS idx_billing_appointment ON billing_records(appointment_id);
    CREATE INDEX IF NOT EXISTS idx_billing_status ON billing_records(status);
    CREATE INDEX IF NOT EXISTS idx_billing_num ON billing_records(bill_number);
    """,

    # 11. payments
    """
    CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        payment_number VARCHAR(100) UNIQUE NOT NULL,
        bill_id INTEGER NOT NULL REFERENCES billing_records(id) ON DELETE CASCADE,
        patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        transaction_reference VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Success',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_payments_bill ON payments(bill_id);
    CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);
    CREATE INDEX IF NOT EXISTS idx_payments_num ON payments(payment_number);
    """,

    # 12. lab_reports view
    """
    CREATE OR REPLACE VIEW lab_reports AS
    SELECT 
        lr.id,
        lr.patient_id,
        p.name AS patient_name,
        lr.doctor_id,
        d.name AS doctor_name,
        lr.test_name,
        lr.test_date,
        lr.result_value,
        lr.units,
        lr.reference_range,
        lr.status,
        lr.notes,
        lr.created_at
    FROM lab_results lr
    LEFT JOIN patients p ON lr.patient_id = p.id
    LEFT JOIN doctors d ON lr.doctor_id = d.id;
    """
]


def run_schema_migration():
    conn = get_db_connection()
    raw_conn = getattr(conn, 'raw_conn', conn)
    raw_cur = raw_conn.cursor()
    print("[INFO] Starting PostgreSQL schema migration for synthetic records...")

    for idx, ddl in enumerate(DDL_STATEMENTS, 1):
        try:
            raw_cur.execute(ddl)
            raw_conn.commit()
            print(f" [PASS] DDL step {idx}/{len(DDL_STATEMENTS)} executed successfully.")
        except Exception as e:
            raw_conn.rollback()
            print(f" [FAIL] DDL step {idx} failed: {e}")
            raise e

    raw_cur.close()
    conn.close()
    print("[SUCCESS] All hospital management tables and views verified in PostgreSQL!")


if __name__ == "__main__":
    run_schema_migration()
