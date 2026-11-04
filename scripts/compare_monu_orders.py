import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

with open('scripts/verified_october_telecaller_orders.json', 'r', encoding='utf-8') as f:
    v = json.load(f)

monu_old = v['Monu']['orders']
monu_msgs = [m for m in msgs if m['sender'] == 'Sujata Nutrilive']

from audit_punam_karishma_monu import audit_caller

monu_detected = audit_caller('Sujata Nutrilive', 'Monu', monu_old)

print("\n--- Comparing Monu by customer text ---")
old_custs = [o['cust'].lower() for o in monu_old]

new_orders = []
for idx, m in monu_detected:
    t = m['text'].lower()
    found = any(c in t for c in old_custs if len(c) > 3)
    if not found:
        new_orders.append((idx, m))

print(f"Monu orders not matching old cust names: {len(new_orders)}")
for idx, m in new_orders:
    print(f"  Msg #{idx} [{m['date']} {m['time']}]: {repr(m['text'].split(chr(10))[0])}")
