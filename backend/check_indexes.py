from database import get_db_connection
conn = get_db_connection()
cur = conn.cursor()
cur.execute('''
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
''')
for r in cur.fetchall():
    print(f"{r['tablename']:25} {r['indexname']}")
conn.close()
