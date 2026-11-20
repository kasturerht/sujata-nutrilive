import os
import json
import sqlite3
import pymysql
# Read .env manually
env_vars = {}
with open(r'F:\RK\Sujata Nutrilive\sujata-nutrilive\.env', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")


# 10 Official Orders
from generate_20_november_final_excel import NEW_ORDERS

print("="*75)
print("📦 UPDATING DATABASES (TiDB Cloud, Local JSON, and Local SQLite)")
print("="*75)

# ---------------------------------------------------------
# 1. Update Local JSON Database (november_master_orders_127.json)
# ---------------------------------------------------------
json_in = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_117.json'
json_out = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_127.json'

with open(json_in, 'r', encoding='utf-8') as f:
    master_orders = json.load(f)

print(f"Existing orders in november JSON: {len(master_orders)}")
last_sr = master_orders[-1]['sr_no'] if master_orders else 437

added_to_json = 0
for idx, o in enumerate(NEW_ORDERS, 1):
    new_sr = last_sr + idx
    new_entry = {
        'sr_no': new_sr,
        'month': 'November 2026',
        'date': o['date'],
        'time': o['time'],
        'telecaller': o['telecaller'],
        'customer_name': o['name'],
        'mobile_number': str(o['mobile']),
        'pincode': str(o['pincode']),
        'address': o['address'],
        'products_ordered': o['products'],
        'amount': o['amount'],
        'payment_mode': o['payment_mode'],
        'order_type': 'Direct Dispatch',
        'dispatch_channel': o['courier'],
        'manifest_name': 'SUJATA_20_November_final.xlsx'
    }
    master_orders.append(new_entry)
    added_to_json += 1

with open(json_out, 'w', encoding='utf-8') as f:
    json.dump(master_orders, f, indent=2, ensure_ascii=False)

print(f"✅ Created {json_out} with {len(master_orders)} total orders (+{added_to_json} new orders).")

# ---------------------------------------------------------
# 2. Update Local SQLite Database (sujata_master.db)
# ---------------------------------------------------------
sqlite_db = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\sujata_master.db'
con = sqlite3.connect(sqlite_db)
cur = con.cursor()

max_sql_id = cur.execute("SELECT MAX(order_id) FROM orders").fetchone()[0] or 1279
print(f"Current MAX order_id in SQLite: {max_sql_id}")

added_to_sqlite = 0
for idx, o in enumerate(NEW_ORDERS, 1):
    nid = max_sql_id + idx
    cur.execute("""
        INSERT INTO orders (order_id, order_date, order_time, customer_phone, customer_name, caller_name, pincode, full_address, products_ordered, amount, payment_mode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (nid, o['sql_date'], o['time'], str(o['mobile']), o['name'], o['telecaller'], str(o['pincode']), o['address'], o['products'], float(o['amount']), o['payment_mode']))
    added_to_sqlite += 1

con.commit()
con.close()
print(f"✅ Inserted {added_to_sqlite} orders into SQLite {sqlite_db}")

# ---------------------------------------------------------
# 3. Update TiDB Cloud Database (gateway01.ap-southeast-1.prod.aws.tidbcloud.com)
# ---------------------------------------------------------
tidb_host = env_vars.get('TIDB_HOST', 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com')
tidb_user = env_vars.get('TIDB_USER', '3FeKz4HehHXuLCf.root')
tidb_password = env_vars.get('TIDB_PASSWORD', 'SujataNutriLive2026!Db')
tidb_database = env_vars.get('TIDB_DATABASE', 'sujata_nutrilive')
tidb_port = int(env_vars.get('TIDB_PORT', 4000))

t_conn = pymysql.connect(
    host=tidb_host,
    port=tidb_port,
    user=tidb_user,
    password=tidb_password,
    database=tidb_database,
    ssl={'ssl': {}},
    autocommit=True
)

with t_conn.cursor() as t_cur:
    t_cur.execute("SELECT MAX(order_id) as max_id FROM orders")
    max_tidb_id = t_cur.fetchone()[0] or 1386
    print(f"Current MAX order_id in TiDB Cloud: {max_tidb_id}")

    added_to_tidb = 0
    for idx, o in enumerate(NEW_ORDERS, 1):
        nid = max_tidb_id + idx
        t_cur.execute("""
            INSERT INTO orders 
            (order_id, order_date, order_time, month, customer_phone, customer_name, caller_name, pincode, full_address, products_ordered, amount, payment_mode, order_type, dispatch_channel, manifest_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            nid, o['sql_date'], o['time'], 'November 2026', str(o['mobile']),
            o['name'], o['telecaller'], str(o['pincode']), o['address'],
            o['products'], float(o['amount']), o['payment_mode'],
            'Direct Dispatch', 'India Post', 20112026
        ))
        
        # Upsert customer
        t_cur.execute("""
            INSERT INTO customers (phone, full_name, default_address, pincode, total_orders, total_revenue, customer_segment)
            VALUES (%s, %s, %s, %s, 1, %s, 'Active')
            ON DUPLICATE KEY UPDATE 
                total_orders = total_orders + 1,
                total_revenue = total_revenue + VALUES(total_revenue),
                full_name = VALUES(full_name),
                default_address = VALUES(default_address),
                pincode = VALUES(pincode)
        """, (str(o['mobile']), o['name'], o['address'], str(o['pincode']), float(o['amount'])))
        added_to_tidb += 1

    t_cur.execute("SELECT COUNT(*) as total, MAX(order_date) as latest FROM orders")
    stats = t_cur.fetchone()
    print(f"✅ Inserted {added_to_tidb} orders into TiDB Cloud! New Total: {stats[0]}, Latest Date: {stats[1]}")

t_conn.close()
print("="*75)
print("🎉 ALL DATABASES UPDATED SUCCESSFULLY!")
print("="*75)
