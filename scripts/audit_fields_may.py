import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

from calculate_may_totals import ALL_ORDERS

print(f"Auditing {len(ALL_ORDERS)} orders in May 2026...")

zero_amounts = []
missing_phones = []
missing_pins = []

for idx, o in enumerate(ALL_ORDERS, 1):
    m_idx = o['main_idx']
    c_name = o['customer_name']
    phone = o['phone']
    pin = o['pincode']
    amt = o['amount']
    pay = o['payment_type']
    prod = o['products']
    tele = o['telecaller']
    flag = o['audit_flag']
    
    if amt == 0:
        zero_amounts.append((idx, m_idx, c_name, tele, prod, flag))
    if not phone:
        missing_phones.append((idx, m_idx, c_name, tele, flag))
    if not pin:
        missing_pins.append((idx, m_idx, c_name, tele, flag))

print(f"\n--- Zero Amount Orders ({len(zero_amounts)}) ---")
for item in zero_amounts:
    print(f"Row {item[0]} | Main IDX {item[1]} | {item[2]} | {item[3]} | {item[4]} | Note: {item[5]}")

print(f"\n--- Missing Phone Orders ({len(missing_phones)}) ---")
for item in missing_phones:
    print(f"Row {item[0]} | Main IDX {item[1]} | {item[2]} | {item[3]} | Note: {item[4]}")

print(f"\n--- Missing Pincode Orders ({len(missing_pins)}) ---")
for item in missing_pins:
    print(f"Row {item[0]} | Main IDX {item[1]} | {item[2]} | {item[3]} | Note: {item[4]}")
