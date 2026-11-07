from database import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

# 1. Find all available beds not used by any active admission
cur.execute("""
    SELECT id FROM beds
    WHERE id NOT IN (SELECT bed_id FROM admissions WHERE status = 'Admitted')
    ORDER BY id;
""")
free_bed_ids = [r[0] for r in cur.fetchall()]
print(f"Available free beds: {len(free_bed_ids)}")

# 2. Find duplicate active admissions
cur.execute("""
    SELECT a.id, a.bed_id
    FROM admissions a
    WHERE a.status = 'Admitted'
    AND a.bed_id IN (
        SELECT bed_id FROM admissions WHERE status = 'Admitted' GROUP BY bed_id HAVING COUNT(*) > 1
    )
    ORDER BY a.bed_id, a.id;
""")
dups = cur.fetchall()
print(f"Active admissions sharing beds: {len(dups)}")

seen_beds = set()
reassigned = 0
for r in dups:
    adm_id = r[0]
    b_id = r[1]
    if b_id in seen_beds:
        # Reassign to a truly free bed
        new_bed = free_bed_ids.pop(0)
        cur.execute("UPDATE admissions SET bed_id = %s WHERE id = %s;", (new_bed, adm_id))
        cur.execute("UPDATE beds SET status = 'Occupied' WHERE id = %s;", (new_bed,))
        reassigned += 1
    else:
        seen_beds.add(b_id)

conn.commit()
print(f"Reassigned {reassigned} duplicate active admissions to unique free beds!")

# Sync bed statuses: Occupied for beds with an active admission, Available otherwise
cur.execute("""
    UPDATE beds
    SET status = 'Occupied'
    WHERE id IN (SELECT bed_id FROM admissions WHERE status = 'Admitted');
""")
cur.execute("""
    UPDATE beds
    SET status = 'Available'
    WHERE id NOT IN (SELECT bed_id FROM admissions WHERE status = 'Admitted');
""")
conn.commit()
print("Synchronized all bed status values with active admissions!")

# Final check
cur.execute("""
    SELECT COUNT(*) FROM (
        SELECT bed_id FROM admissions WHERE status = 'Admitted' GROUP BY bed_id HAVING COUNT(*) > 1
    ) t;
""")
remaining = cur.fetchone()[0]
print(f"Remaining active duplicate bed allocations: {remaining}")

conn.close()
