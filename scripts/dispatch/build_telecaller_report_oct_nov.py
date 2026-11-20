import os
import json
import pymysql

# 1. Load Meta daily insights
with open('scripts/meta_oct_nov_daywise.json', 'r', encoding='utf-8') as f:
    meta_daily = json.load(f)

# Map campaign names to telecallers
def get_caller_key(cname):
    c = cname.lower()
    if '9272471529' in c or 'manju' in c:
        return 'Manjushree Kasture'
    elif '99225 34443' in c or '9922534443' in c or 'vaishnavi' in c:
        return 'Vaishnavi Diwate'
    elif '95034 34653' in c or '9503434653' in c or 'monu' in c or 'hindi' in c:
        return 'Monu'
    elif '9922500344' in c or 'punam' in c:
        return 'Punam Kasture'
    elif '9922577344' in c or 'karishma' in c:
        return 'Karishma Patil'
    return None

meta_by_caller_day = {}
for r in meta_daily:
    caller = get_caller_key(r.get('campaign_name', ''))
    if not caller:
        continue
    day = r.get('date_start')
    if not day or day < '2026-10-01':
        continue
    
    spend = float(r.get('spend', 0))
    msgs = 0
    for a in r.get('actions', []):
        at = a.get('action_type', '')
        if at in ['onsite_conversion.messaging_conversation_started_7d', 'onsite_conversion.total_messaging_connection']:
            msgs = max(msgs, int(a.get('value', 0)))
    
    if caller not in meta_by_caller_day:
        meta_by_caller_day[caller] = {}
    if day not in meta_by_caller_day[caller]:
        meta_by_caller_day[caller][day] = {'spend': 0.0, 'leads': 0}
    meta_by_caller_day[caller][day]['spend'] += spend
    meta_by_caller_day[caller][day]['leads'] += msgs

# 2. Query TiDB for orders from 2026-10-01 to 2026-11-20
env_vars = {}
with open('.env', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

t_conn = pymysql.connect(
    host=env_vars.get('TIDB_HOST', 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'),
    port=int(env_vars.get('TIDB_PORT', 4000)),
    user=env_vars.get('TIDB_USER', '3FeKz4HehHXuLCf.root'),
    password=env_vars.get('TIDB_PASSWORD', 'SujataNutriLive2026!Db'),
    database=env_vars.get('TIDB_DATABASE', 'sujata_nutrilive'),
    ssl={'ssl': {}},
    autocommit=True
)

def map_db_caller(raw_name):
    n = (raw_name or '').lower()
    if 'manju' in n:
        return 'Manjushree Kasture'
    elif 'vaishnavi' in n:
        return 'Vaishnavi Diwate'
    elif 'monu' in n or 'pooja' in n or '95034' in n or 'system notification' in n:
        return 'Monu'
    elif 'punam' in n:
        return 'Punam Kasture'
    elif 'karishma' in n:
        return 'Karishma Patil'
    return None

orders_by_caller_day = {}
with t_conn.cursor(pymysql.cursors.DictCursor) as cur:
    cur.execute("""
        SELECT order_id, order_date, caller_name, amount, payment_mode, products_ordered
        FROM orders
        WHERE order_date >= '2026-10-01'
        ORDER BY order_date ASC;
    """)
    rows = cur.fetchall()
    print(f"Total orders fetched from TiDB since Oct 1: {len(rows)}")

for r in rows:
    c = map_db_caller(r['caller_name'])
    if not c:
        continue
    day = str(r['order_date'])
    amt = float(r['amount'] or 0)
    pm = (r['payment_mode'] or 'COD').upper()
    
    if c not in orders_by_caller_day:
        orders_by_caller_day[c] = {}
    if day not in orders_by_caller_day[c]:
        orders_by_caller_day[c][day] = {
            'orders': 0, 'revenue': 0.0, 'prepaid_orders': 0, 'prepaid_rev': 0.0,
            'cod_orders': 0, 'cod_rev': 0.0, 'products': []
        }
    
    orders_by_caller_day[c][day]['orders'] += 1
    orders_by_caller_day[c][day]['revenue'] += amt
    if pm == 'COD':
        orders_by_caller_day[c][day]['cod_orders'] += 1
        orders_by_caller_day[c][day]['cod_rev'] += amt
    else:
        orders_by_caller_day[c][day]['prepaid_orders'] += 1
        orders_by_caller_day[c][day]['prepaid_rev'] += amt
    
    if r['products_ordered']:
        orders_by_caller_day[c][day]['products'].append(r['products_ordered'])

t_conn.close()

# Print Totals by Caller
print("\n" + "="*80)
print("🎯 TELECALLER AGGREGATE SUMMARY (01 OCT 2026 - 20 NOV 2026)")
print("="*80)

callers = ['Manjushree Kasture', 'Vaishnavi Diwate', 'Monu', 'Punam Kasture', 'Karishma Patil']
for c in callers:
    # aggregate meta
    c_meta = meta_by_caller_day.get(c, {})
    total_spend = sum(d['spend'] for d in c_meta.values())
    total_leads = sum(d['leads'] for d in c_meta.values())
    
    # aggregate orders
    c_orders = orders_by_caller_day.get(c, {})
    total_orders = sum(d['orders'] for d in c_orders.values())
    total_rev = sum(d['revenue'] for d in c_orders.values())
    total_prepaid = sum(d['prepaid_orders'] for d in c_orders.values())
    total_cod = sum(d['cod_orders'] for d in c_orders.values())
    
    cr = (total_orders / total_leads * 100) if total_leads > 0 else 0
    aov = (total_rev / total_orders) if total_orders > 0 else 0
    cpl = (total_spend / total_leads) if total_leads > 0 else 0
    roas = (total_rev / total_spend) if total_spend > 0 else 0

    print(f"\n👤 {c}:")
    print(f"  • Meta Spend: ₹{total_spend:,.2f} | Total Leads: {total_leads} | CPL: ₹{cpl:.2f}")
    print(f"  • Orders: {total_orders} (Prepaid: {total_prepaid}, COD: {total_cod})")
    print(f"  • Total Revenue: ₹{total_rev:,.2f} | AOV: ₹{aov:,.2f}")
    print(f"  • Conversion Ratio (CR): {cr:.2f}% | Telecaller ROAS: {roas:.2f}x")
