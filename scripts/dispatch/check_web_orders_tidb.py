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
    cur.execute("SELECT * FROM orders WHERE caller_name LIKE '%Website%' OR caller_name LIKE '%Web%';")
    for r in cur.fetchall():
        print(r['order_id'], r['order_date'], r['caller_name'], r['customer_name'], r['customer_phone'], r['amount'], r['payment_mode'], r['products_ordered'])
t_conn.close()
