import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

from reconcile_913_june import all_orders

print(f"Auditing {len(all_orders)} orders...")

zero_amounts = []
missing_phones = []
missing_pins = []
missing_names = []

for idx, o in enumerate(all_orders, 1):
    m_idx = o['main_idx']
    c_name = o['customer_name']
    phone = o['phone']
    pin = o['pincode']
    amt = o['amount']
    pay = o['payment_type']
    prod = o['products']
    tele = o['telecaller']
    
    if amt == 0:
        zero_amounts.append((idx, m_idx, c_name, tele, prod, o['audit_flag']))
    if not phone:
        missing_phones.append((idx, m_idx, c_name, tele, o['audit_flag']))
    if not pin:
        missing_pins.append((idx, m_idx, c_name, tele, o['audit_flag']))
    if not c_name:
        missing_names.append((idx, m_idx, tele))

print(f"\n--- Zero Amount Orders ({len(zero_amounts)}) ---")
for item in zero_amounts:
    print(f"Row {item[0]} | Main IDX {item[1]} | {item[2]} | {item[3]} | {item[4]} | Note: {item[5]}")

print(f"\n--- Missing Phone Orders ({len(missing_phones)}) ---")
for item in missing_phones:
    print(f"Row {item[0]} | Main IDX {item[1]} | {item[2]} | {item[3]} | Note: {item[4]}")

print(f"\n--- Missing Pincode Orders ({len(missing_pins)}) ---")
for item in missing_pins:
    print(f"Row {item[0]} | Main IDX {item[1]} | {item[2]} | {item[3]} | Note: {item[4]}")

print("\n--- Summary by Telecaller ---")
tele_summary = {}
for o in all_orders:
    t = o['telecaller']
    if t not in tele_summary:
        tele_summary[t] = {'count': 0, 'amount': 0, 'prepaid': 0, 'cod': 0}
    tele_summary[t]['count'] += 1
    tele_summary[t]['amount'] += o['amount']
    if o['payment_type'] == 'Prepaid':
        tele_summary[t]['prepaid'] += 1
    else:
        tele_summary[t]['cod'] += 1

for t, s in tele_summary.items():
    print(f"{t}: {s['count']} orders | Total: Rs {s['amount']:,} (Prepaid: {s['prepaid']}, COD: {s['cod']})")
