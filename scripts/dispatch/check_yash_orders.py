import pymysql

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
        SELECT order_id, order_date, caller_name, customer_name, customer_phone, amount, payment_mode, products_ordered
        FROM orders
        WHERE caller_name LIKE '%Yash%' AND order_date >= '2026-10-01'
        ORDER BY order_date ASC, order_id ASC;
    """)
    rows = cur.fetchall()

print(f"Total Yash orders since Oct 1: {len(rows)}")
total_amt = sum(float(r['amount'] or 0) for r in rows)
prepaid = sum(1 for r in rows if r['payment_mode'] == 'Prepaid')
cod = sum(1 for r in rows if r['payment_mode'] != 'Prepaid')
print(f"Total Revenue: ₹{total_amt:,.2f} | Prepaid: {prepaid} | COD: {cod}")

# Group by month
oct_rows = [r for r in rows if str(r['order_date']).startswith('2026-10')]
nov_rows = [r for r in rows if str(r['order_date']).startswith('2026-11')]
print(f"October: {len(oct_rows)} orders, ₹{sum(float(r['amount'] or 0) for r in oct_rows):,.2f}")
print(f"November: {len(nov_rows)} orders, ₹{sum(float(r['amount'] or 0) for r in nov_rows):,.2f}")

for r in rows:
    print(r['order_id'], r['order_date'], r['customer_name'], r['customer_phone'], r['amount'], r['payment_mode'], (r['products_ordered'] or '')[:40])

t_conn.close()
