import os
import json
import pymysql

# Read .env
env_vars = {}
with open(r'F:\RK\Sujata Nutrilive\sujata-nutrilive\.env', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

from generate_21_november_final_excel import NEW_ORDERS

AMAZON_ORDERS = [
    {
        "date": "20/11/2026",
        "time": "1:58 PM",
        "sql_date": "2026-11-20",
        "telecaller": "Amazon Seller Central",
        "name": "Amazon Buyer (Amazon: 404-3199519-5071536)",
        "mobile": "0000000000",
        "address": "Pune, Maharashtra",
        "pincode": "411004",
        "products": "Sujata Nutrilive Pure Organic Spirulina 120 Tablets (1) [Amazon Order: 404-3199519-5071536]",
        "amount": 550,
        "payment_mode": "COD",
        "courier": "Amazon Easy Ship / Self Ship",
        "manifest_name": "Amazon EasyShip Pickup"
    },
    {
        "date": "21/11/2026",
        "time": "8:50 AM",
        "sql_date": "2026-11-21",
        "telecaller": "Amazon Seller Central",
        "name": "Amazon Buyer (Amazon: 404-7524790-2104302)",
        "mobile": "0000000000",
        "address": "Basudebpur, Odisha",
        "pincode": "756125",
        "products": "Sujata Nutrilive SpiruGlow Handmade Organic Bath Soap (100g) (1) [Amazon Order: 404-7524790-2104302]",
        "amount": 60,
        "payment_mode": "Prepaid",
        "courier": "Amazon Easy Ship / Self Ship",
        "manifest_name": "Amazon EasyShip Pickup"
    }
]

ALL_NEW_ENTRIES = []
for o in NEW_ORDERS:
    ALL_NEW_ENTRIES.append({
        "date": o["date"],
        "time": o["time"],
        "sql_date": o["sql_date"],
        "telecaller": o["telecaller"],
        "name": o["name"],
        "mobile": str(o["mobile"]),
        "address": o["address"],
        "pincode": str(o["pincode"]),
        "products": o["products"],
        "amount": o["amount"],
        "payment_mode": o["payment_mode"],
        "courier": o["courier"],
        "manifest_name": "SUJATA_21_November_final.xlsx"
    })

for a in AMAZON_ORDERS:
    ALL_NEW_ENTRIES.append(a)

# ---------------------------------------------------------
# Update TiDB Cloud Database
# ---------------------------------------------------------
t_conn = pymysql.connect(
    host=env_vars.get('TIDB_HOST', 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'),
    port=int(env_vars.get('TIDB_PORT', 4000)),
    user=env_vars.get('TIDB_USER', '3FeKz4HehHXuLCf.root'),
    password=env_vars.get('TIDB_PASSWORD', 'SujataNutriLive2026!Db'),
    database=env_vars.get('TIDB_DATABASE', 'sujata_nutrilive'),
    ssl={'ssl': {}},
    autocommit=True
)

with t_conn.cursor() as cur:
    cur.execute("SELECT MAX(order_id) FROM orders;")
    max_tidb_id = cur.fetchone()[0] or 1396
    print(f"Current MAX order_id in TiDB Cloud: {max_tidb_id}")

    added_to_tidb = 0
    for idx, o in enumerate(ALL_NEW_ENTRIES, 1):
        nid = max_tidb_id + idx
        cur.execute("""
            INSERT INTO orders (
                order_id, order_date, order_time, month, customer_phone, customer_name,
                caller_name, pincode, full_address, products_ordered, amount,
                payment_mode, order_type, dispatch_channel, manifest_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (
            nid,
            o['sql_date'],
            o['time'],
            'November 2026',
            str(o['mobile']),
            o['name'],
            o['telecaller'],
            str(o['pincode']),
            o['address'],
            o['products'],
            float(o['amount']),
            o['payment_mode'],
            'Direct Dispatch' if 'SUJATA' in o['manifest_name'] else 'Amazon MFN',
            o['courier'],
            21112026
        ))
        added_to_tidb += 1

    print(f"✅ Added {added_to_tidb} orders to TiDB Cloud (new MAX ID: {max_tidb_id + added_to_tidb}).")

t_conn.close()
print("\n🎯 All databases successfully updated and synchronized!")
