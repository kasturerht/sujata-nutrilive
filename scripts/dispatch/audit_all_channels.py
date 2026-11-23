import os
import json
import pymysql

# 1. Connect TiDB
t_conn = pymysql.connect(
    host='gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port=4000,
    user='3FeKz4HehHXuLCf.root',
    password='SujataNutriLive2026!Db',
    database='sujata_nutrilive',
    ssl={'ssl': {}}
)

with t_conn.cursor(pymysql.cursors.DictCursor) as cur:
    cur.execute("""
        SELECT 
            caller_name,
            COUNT(*) as orders_count,
            SUM(amount) as total_rev,
            SUM(CASE WHEN payment_mode = 'Prepaid' THEN 1 ELSE 0 END) as prepaid_orders,
            SUM(CASE WHEN payment_mode != 'Prepaid' THEN 1 ELSE 0 END) as cod_orders,
            MIN(order_date) as first_date,
            MAX(order_date) as last_date
        FROM orders
        WHERE order_date >= '2026-10-01'
        GROUP BY caller_name
        ORDER BY total_rev DESC;
    """)
    rows = cur.fetchall()

print("="*90)
print("TIDB ORDERS BY CALLER/CHANNEL (01 OCT - 21 NOV 2026):")
print("="*90)
total_orders = 0
total_rev = 0
for r in rows:
    cname = r['caller_name'] or 'Unknown'
    cnt = r['orders_count']
    rev = float(r['total_rev'] or 0)
    p = r['prepaid_orders']
    c = r['cod_orders']
    f_d = r['first_date']
    l_d = r['last_date']
    total_orders += cnt
    total_rev += rev
    print(f"{cname[:35]:35} | Orders: {cnt:3} | Rev: ₹{rev:10,.2f} | P: {p:2} | C: {c:2} | {f_d} to {l_d}")

print("-" * 90)
print(f"{'TOTAL':35} | Orders: {total_orders:3} | Rev: ₹{total_rev:10,.2f}")
t_conn.close()
