from database import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

tables = [
    "departments",
    "doctors",
    "staff",
    "medicines",
    "rooms",
    "beds",
    "patients",
    "appointments",
    "medical_records",
    "prescriptions",
    "prescription_items",
    "lab_results",
    "admissions",
    "discharges",
    "billing_records",
    "payments"
]

print("CURRENT TABLE ROW COUNTS:")
print("=" * 40)
total = 0
for t in tables:
    cur.execute(f"SELECT COUNT(*) FROM {t};")
    cnt = cur.fetchone()[0]
    total += cnt
    print(f"{t:22}: {cnt:>8,d}")
print("=" * 40)
print(f"TOTAL ROWS            : {total:>8,d}")

conn.close()
