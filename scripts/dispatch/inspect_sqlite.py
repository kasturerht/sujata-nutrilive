import sqlite3

con = sqlite3.connect(r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\sujata_master.db')
cur = con.cursor()
tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print('SQLite tables:', tables)
for t in tables:
    cnt = cur.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
    cols = [c[1] for c in cur.execute(f"PRAGMA table_info({t})").fetchall()]
    print(f"Table {t} ({cnt} rows): {cols}")
    last_row = cur.execute(f"SELECT * FROM {t} ORDER BY rowid DESC LIMIT 1").fetchone()
    print(f"  Last row: {last_row}")
