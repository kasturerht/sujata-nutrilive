import pymysql

env_vars = {}
with open('.env', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

t_conn = pymysql.connect(
    host=env_vars.get('TIDB_HOST'),
    port=int(env_vars.get('TIDB_PORT', 4000)),
    user=env_vars.get('TIDB_USER'),
    password=env_vars.get('TIDB_PASSWORD'),
    database=env_vars.get('TIDB_DATABASE'),
    ssl={'ssl': {}}
)

with t_conn.cursor(pymysql.cursors.DictCursor) as cur:
    cur.execute("SELECT * FROM orders WHERE caller_name LIKE '%Amazon%' ORDER BY order_id DESC LIMIT 5;")
    rows = cur.fetchall()
t_conn.close()

for r in rows:
    print(r['order_id'], r['order_date'], r['caller_name'], r['customer_name'], r['products_ordered'], r['amount'], r['dispatch_channel'])
