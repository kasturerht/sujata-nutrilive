import os
import json
import pymysql
import datetime

# 1. Load Meta daily insights (updated to 21 Nov)
with open('scripts/meta_oct_nov_daywise.json', 'r', encoding='utf-8') as f:
    meta_daily = json.load(f)

# 2. Load Amazon orders from SP-API (updated to 21 Nov)
with open('scripts/amazon_orders_oct_nov.json', 'r', encoding='utf-8') as f:
    amazon_orders = json.load(f)

# 3. Load TiDB Orders (01 Oct to 21 Nov)
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

with t_conn.cursor(pymysql.cursors.DictCursor) as cur:
    cur.execute("""
        SELECT order_id, order_date, order_time, customer_name, customer_phone, caller_name, amount, payment_mode, products_ordered, dispatch_channel
        FROM orders
        WHERE order_date >= '2026-10-01'
        ORDER BY order_date ASC, order_id ASC;
    """)
    tidb_orders = cur.fetchall()
t_conn.close()

# Entity mapping
ENTITIES = [
    {
        'id': 'manjushree',
        'name': 'Manjushree Kasture',
        'type': 'Telecaller',
        'phone': '9272471529',
        'meta_match': '9272471529',
        'db_match': lambda n: 'manju' in n.lower() and 'website' not in n.lower()
    },
    {
        'id': 'vaishnavi',
        'name': 'Vaishnavi Diwate',
        'type': 'Telecaller',
        'phone': '99225 34443',
        'meta_match': '99225 34443',
        'db_match': lambda n: 'vaishnavi' in n.lower()
    },
    {
        'id': 'punam',
        'name': 'Punam Kasture',
        'type': 'Telecaller',
        'phone': '99225 00344',
        'meta_match': '9922500344',
        'db_match': lambda n: 'punam' in n.lower()
    },
    {
        'id': 'monu',
        'name': 'Monu (Pooja)',
        'type': 'Telecaller',
        'phone': '95034 34653',
        'meta_match': '95034',
        'db_match': lambda n: any(k in n.lower() for k in ['monu', 'pooja', '95034', 'system notification'])
    },
    {
        'id': 'karishma',
        'name': 'Karishma Patil',
        'type': 'Telecaller',
        'phone': '99225 77344',
        'meta_match': '9922577344',
        'db_match': lambda n: 'karishma' in n.lower()
    },
    {
        'id': 'yash',
        'name': 'Yash Suryawanshi (Founder Direct)',
        'type': 'Founder Direct & B2B',
        'phone': 'Direct / VIP',
        'meta_match': None,
        'db_match': lambda n: 'yash' in n.lower()
    },
    {
        'id': 'website',
        'name': 'Website Direct (Shopify)',
        'type': 'E-Commerce Website',
        'phone': 'sujatanutrilive.com',
        'meta_match': None, # will attach website ads
        'db_match': lambda n: 'website' in n.lower()
    },
    {
        'id': 'amazon',
        'name': 'Amazon India (Amazon.in)',
        'type': 'Marketplace',
        'phone': 'Amazon SP-API',
        'meta_match': None,
        'db_match': lambda n: False # will use SP-API data for 100% accuracy
    }
]

# Separate Meta Campaigns into Categories
meta_spend_by_entity = {e['id']: {'all': 0.0, 'oct': 0.0, 'nov': 0.0, 'leads_all': 0, 'leads_oct': 0, 'leads_nov': 0} for e in ENTITIES}
website_brand_spend = {'all': 0.0, 'oct': 0.0, 'nov': 0.0}

for r in meta_daily:
    cname = r.get('campaign_name', '')
    d = r.get('date_start', '')
    sp = float(r.get('spend', 0))
    leads = 0
    for a in r.get('actions', []):
        if a.get('action_type') == 'onsite_conversion.messaging_conversation_started_7d':
            leads = int(a.get('value', 0))
            break
            
    is_oct = d.startswith('2026-10')
    is_nov = d.startswith('2026-11')
    
    matched = False
    for e in ENTITIES:
        if e['meta_match'] and e['meta_match'] in cname:
            matched = True
            meta_spend_by_entity[e['id']]['all'] += sp
            meta_spend_by_entity[e['id']]['leads_all'] += leads
            if is_oct:
                meta_spend_by_entity[e['id']]['oct'] += sp
                meta_spend_by_entity[e['id']]['leads_oct'] += leads
            if is_nov:
                meta_spend_by_entity[e['id']]['nov'] += sp
                meta_spend_by_entity[e['id']]['leads_nov'] += leads
            break
            
    if not matched:
        # Website / Brand Video / ASC campaign
        website_brand_spend['all'] += sp
        if is_oct: website_brand_spend['oct'] += sp
        if is_nov: website_brand_spend['nov'] += sp

# Attributing website brand spend to Website channel
meta_spend_by_entity['website']['all'] = website_brand_spend['all']
meta_spend_by_entity['website']['oct'] = website_brand_spend['oct']
meta_spend_by_entity['website']['nov'] = website_brand_spend['nov']

# Process Orders by Entity
orders_by_entity = {e['id']: {
    'all': {'orders': 0, 'prepaid': 0, 'cod': 0, 'rev': 0.0},
    'oct': {'orders': 0, 'prepaid': 0, 'cod': 0, 'rev': 0.0},
    'nov': {'orders': 0, 'prepaid': 0, 'cod': 0, 'rev': 0.0}
} for e in ENTITIES}

# 1. Map TiDB Orders (Telecallers, Yash, Website)
for o in tidb_orders:
    c_raw = o['caller_name'] or ''
    # Ignore Amazon from TiDB because we use SP-API for Amazon (complete 30 orders)
    if 'amazon' in c_raw.lower() or 'om amazon' in c_raw.lower():
        continue
        
    matched_id = None
    for e in ENTITIES:
        if e['db_match'] and e['db_match'](c_raw):
            matched_id = e['id']
            break
            
    if not matched_id:
        print(f"Unmatched TiDB order: {o['order_id']} | {c_raw} | ₹{o['amount']}")
        continue
        
    d = str(o['order_date'])
    amt = float(o['amount'] or 0)
    pm = (o['payment_mode'] or 'COD').upper()
    is_prep = (pm == 'PREPAID')
    is_oct = d.startswith('2026-10')
    is_nov = d.startswith('2026-11')
    
    ent_orders = orders_by_entity[matched_id]
    for scope, flag in [('all', True), ('oct', is_oct), ('nov', is_nov)]:
        if flag:
            ent_orders[scope]['orders'] += 1
            ent_orders[scope]['rev'] += amt
            if is_prep:
                ent_orders[scope]['prepaid'] += 1
            else:
                ent_orders[scope]['cod'] += 1

# 2. Map Amazon SP-API Orders (exclude canceled)
for ao in amazon_orders:
    if ao.get('OrderStatus') == 'Canceled':
        continue
    d = ao.get('PurchaseDate', '')[:10]
    amt = float(ao.get('OrderTotal', {}).get('Amount', 0))
    is_cod = 'COD' in ao.get('ShipServiceLevel', '') or ao.get('PaymentMethod') == 'COD'
    is_oct = d.startswith('2026-10')
    is_nov = d.startswith('2026-11')
    
    amz_rec = orders_by_entity['amazon']
    for scope, flag in [('all', True), ('oct', is_oct), ('nov', is_nov)]:
        if flag:
            amz_rec[scope]['orders'] += 1
            amz_rec[scope]['rev'] += amt
            if is_cod:
                amz_rec[scope]['cod'] += 1
            else:
                amz_rec[scope]['prepaid'] += 1

# Export summary JSON
output = {
    'meta_spend': meta_spend_by_entity,
    'orders': orders_by_entity,
    'website_brand_spend': website_brand_spend
}

with open('scripts/omnichannel_master_summary.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2)

print("\n" + "="*100)
print("📊 OMNICHANNEL BUSINESS & SALES AUDIT (01 OCT 2026 - 21 NOV 2026)")
print("="*100)

for scope_name, scope_key in [("FULL PERIOD (01 OCT - 21 NOV 2026)", 'all'), ("OCTOBER 2026 (FULL MONTH)", 'oct'), ("NOVEMBER 2026 (01 - 21 NOV)", 'nov')]:
    print(f"\n📌 {scope_name}:")
    print(f"{'Channel / Person':35} | {'Type':18} | {'Ad Spend':11} | {'Leads':6} | {'Orders':6} | {'Prepaid':7} | {'COD':5} | {'Revenue':12} | {'AOV':8} | {'ROAS':6}")
    print("-" * 125)
    
    tot_sp = 0
    tot_ld = 0
    tot_ord = 0
    tot_prep = 0
    tot_cod = 0
    tot_rev = 0
    
    for e in ENTITIES:
        eid = e['id']
        sp = meta_spend_by_entity[eid][scope_key]
        ld = meta_spend_by_entity[eid][f"leads_{scope_key}"]
        ord_info = orders_by_entity[eid][scope_key]
        ord_cnt = ord_info['orders']
        prep = ord_info['prepaid']
        cod = ord_info['cod']
        rev = ord_info['rev']
        aov = (rev / ord_cnt) if ord_cnt else 0
        roas = (rev / sp) if sp else 0
        
        tot_sp += sp
        tot_ld += ld
        tot_ord += ord_cnt
        tot_prep += prep
        tot_cod += cod
        tot_rev += rev
        
        sp_str = f"₹{sp:,.2f}" if sp else "—"
        ld_str = str(ld) if ld else "—"
        roas_str = f"{roas:.2f}x" if sp else "—"
        
        print(f"{e['name'][:35]:35} | {e['type'][:18]:18} | {sp_str:11} | {ld_str:6} | {ord_cnt:6} | {prep:7} | {cod:5} | ₹{rev:10,.2f} | ₹{aov:7,.2f} | {roas_str:6}")
        
    print("-" * 125)
    tot_aov = (tot_rev / tot_ord) if tot_ord else 0
    tot_roas = (tot_rev / tot_sp) if tot_sp else 0
    print(f"{'OMNICHANNEL GRAND TOTAL':35} | {'All Channels':18} | ₹{tot_sp:9,.2f} | {tot_ld:6} | {tot_ord:6} | {tot_prep:7} | {tot_cod:5} | ₹{tot_rev:10,.2f} | ₹{tot_aov:7,.2f} | {tot_roas:.2f}x")
