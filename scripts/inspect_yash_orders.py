import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

yash_orders = []
for i, m in enumerate(msgs):
    if m['sender'] == 'Yash R. Suryawanshi':
        t = m['text'].replace('\r', '').strip()
        has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t))
        has_pin = bool(re.search(r'\b(?:4\d{5}|5\d{5}|7\d{5}|1\d{5}|2\d{5}|3\d{5}|6\d{5}|8\d{5})\b', t))
        has_prod = bool(re.search(r'spirulina|buckthorn|sea\s*buckthorn|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3', t, re.I))
        
        if (has_phone or has_pin) and has_prod and len(t) > 40:
            yash_orders.append((i, m, t))

print(f"Yash orders identified: {len(yash_orders)}")
for idx, (msg_idx, m, t) in enumerate(yash_orders, 1):
    first_line = t.split('\n')[0][:30]
    print(f"[{idx}] {m['dateStr']} | {first_line}")
