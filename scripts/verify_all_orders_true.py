import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

v_msgs = [m for m in msgs if 'Vaishnavi' in m['sender']]

orders = []
for idx, m in enumerate(v_msgs, 1):
    t = m['text'].strip()
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina', t, re.I))
    has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I))
    
    if (has_phone or has_pin) and (has_prod or has_cod_pre):
        orders.append((idx, m))
    elif 'office' in t.lower() and ('1700' in t or '2400' in t or '1500' in t):
        orders.append((idx, m))

print(f"Total Vaishnavi orders identified: {len(orders)}")
for i, (idx, m) in enumerate(orders, 1):
    cust = m['text'].split('\n')[0][:40]
    print(f"{i:02d}. [Msg #{idx:02d}] {m['date']} {m['time']}: {repr(cust)}")

with open('scripts/verified_october_telecaller_orders.json', 'r', encoding='utf-8') as f:
    v = json.load(f)

v_orders_old = v['Vaishnavi Diwate']['orders']
print(f"Old verified orders count: {len(v_orders_old)}")
old_custs = [o.get('cust', '') for o in v_orders_old]

print("\n--- Checking which of the 62 are new ---")
for i, (idx, m) in enumerate(orders, 1):
    first_line = m['text'].split('\n')[0].strip('.,-:#* ')
    match = any(first_line.lower() in oc.lower() or oc.lower() in first_line.lower() for oc in old_custs)
    if not match:
        print(f"NEW/DIFFERENT: #{i} [Msg #{idx}] {m['date']} {m['time']} -> {first_line}")
