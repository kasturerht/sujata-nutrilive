import os
import json
import pymysql

# 1. Load Meta daily
with open('scripts/meta_oct_nov_daywise.json', 'r', encoding='utf-8') as f:
    meta_daily = json.load(f)

# 2. Connect TiDB
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
    ssl={'ssl': {}},
    autocommit=True
)

with t_conn.cursor(pymysql.cursors.DictCursor) as cur:
    cur.execute("""
        SELECT order_id, order_date, caller_name, amount, payment_mode
        FROM orders
        WHERE order_date >= '2026-10-01' AND order_date <= '2026-10-20'
        ORDER BY order_date ASC;
    """)
    orders = cur.fetchall()
t_conn.close()

TELECALLERS = [
    {'id': 'manjushree', 'name': 'Manjushree Kasture', 'phone': '9272471529', 'camp': '9272471529', 'db': ['manju']},
    {'id': 'vaishnavi', 'name': 'Vaishnavi Diwate', 'phone': '99225 34443', 'camp': '99225 34443', 'db': ['vaishnavi']},
    {'id': 'punam', 'name': 'Punam Kasture', 'phone': '99225 00344', 'camp': '9922500344', 'db': ['punam']},
    {'id': 'monu', 'name': 'Monu (Pooja)', 'phone': '95034 34653', 'camp': '95034', 'db': ['monu', 'pooja', '95034', 'system notification']},
    {'id': 'karishma', 'name': 'Karishma Patil', 'phone': '99225 77344', 'camp': '9922577344', 'db': ['karishma']}
]

stats = {tc['id']: {'name': tc['name'], 'phone': tc['phone'], 'spend': 0.0, 'leads': 0, 'orders': 0, 'prepaid': 0, 'cod': 0, 'rev': 0.0} for tc in TELECALLERS}

for r in meta_daily:
    d = r.get('date_start')
    if d and '2026-10-01' <= d <= '2026-10-20':
        cname = r.get('campaign_name', '')
        for tc in TELECALLERS:
            if tc['camp'] in cname:
                stats[tc['id']]['spend'] += float(r.get('spend', 0))
                for a in r.get('actions', []):
                    if a.get('action_type') == 'onsite_conversion.messaging_conversation_started_7d':
                        stats[tc['id']]['leads'] += int(a.get('value', 0))
                        break
                break

for o in orders:
    c_raw = (o['caller_name'] or '').lower()
    matched_id = None
    for tc in TELECALLERS:
        if any(needle in c_raw for needle in tc['db']):
            matched_id = tc['id']
            break
    if matched_id:
        stats[matched_id]['orders'] += 1
        amt = float(o['amount'] or 0)
        stats[matched_id]['rev'] += amt
        if (o['payment_mode'] or 'COD').upper() == 'COD':
            stats[matched_id]['cod'] += 1
        else:
            stats[matched_id]['prepaid'] += 1

print("\n" + "="*80)
print("🎯 1 OCT - 20 OCT 2026 STATS")
print("="*80)
for cid, s in stats.items():
    sp = s['spend']
    ld = s['leads']
    cpl = (sp / ld) if ld > 0 else 0
    ord_c = s['orders']
    cr = (ord_c / ld * 100) if ld > 0 else 0
    rev = s['rev']
    aov = (rev / ord_c) if ord_c > 0 else 0
    roas = (rev / sp) if sp > 0 else 0
    prep_pct = (s['prepaid'] / ord_c * 100) if ord_c > 0 else 0
    print(f"{s['name']:20} | Spend: ₹{sp:8.2f} | Leads: {ld:4} | CPL: ₹{cpl:5.2f} | Orders: {ord_c:2} (P: {s['prepaid']:2}, C: {s['cod']:2}, {prep_pct:4.1f}%) | Rev: ₹{rev:8.2f} | CR%: {cr:5.2f}% | AOV: ₹{aov:7.2f} | ROAS: {roas:5.2f}x")

# Team total
tot_sp = sum(s['spend'] for s in stats.values())
tot_ld = sum(s['leads'] for s in stats.values())
tot_ord = sum(s['orders'] for s in stats.values())
tot_prep = sum(s['prepaid'] for s in stats.values())
tot_cod = sum(s['cod'] for s in stats.values())
tot_rev = sum(s['rev'] for s in stats.values())
tot_cr = (tot_ord / tot_ld * 100) if tot_ld > 0 else 0
tot_aov = (tot_rev / tot_ord) if tot_ord > 0 else 0
tot_roas = (tot_rev / tot_sp) if tot_sp > 0 else 0
tot_cpl = (tot_sp / tot_ld) if tot_ld > 0 else 0
tot_prep_pct = (tot_prep / tot_ord * 100) if tot_ord > 0 else 0
print("-" * 80)
print(f"{'TOTAL TEAM':20} | Spend: ₹{tot_sp:8.2f} | Leads: {tot_ld:4} | CPL: ₹{tot_cpl:5.2f} | Orders: {tot_ord:2} (P: {tot_prep:2}, C: {tot_cod:2}, {tot_prep_pct:4.1f}%) | Rev: ₹{tot_rev:8.2f} | CR%: {tot_cr:5.2f}% | AOV: ₹{tot_aov:7.2f} | ROAS: {tot_roas:5.2f}x")
