from database import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

cur.execute('''
    SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY';
''')
print('=== FOREIGN KEYS ===')
for row in cur.fetchall():
    print(f"{row['table_name']}.{row['column_name']} -> {row['foreign_table_name']}.{row['foreign_column_name']}")

cur.execute('''
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
''')
print('\n=== COLUMNS ===')
current_table = ''
for r in cur.fetchall():
    if r['table_name'] != current_table:
        current_table = r['table_name']
        print(f"\nTable: {current_table}")
    def_str = str(r['column_default'])[:30] if r['column_default'] else 'None'
    print(f"  {r['column_name']:28} {r['data_type']:20} nullable={r['is_nullable']:4} default={def_str}")

conn.close()
