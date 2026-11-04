import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/september_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

om_msgs = [m for m in msgs if m['sender'] == 'Om Amazon Dispatch']
print(f"Total Om Amazon Dispatch messages: {len(om_msgs)}")

om_orders = []
om_chatter = []

for idx, m in enumerate(om_msgs, 1):
    t = m['text'].strip()
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina', t, re.I))
    
    if (has_phone or has_pin) and has_prod and len(t) > 35 and not 'return' in t.lower() and not 'delivered' in t.lower():
        om_orders.append((idx, m))
    else:
        om_chatter.append((idx, m))

print(f"Detected Om Amazon Orders: {len(om_orders)}")
print(f"Detected Om Amazon Chatter/Updates: {len(om_chatter)}")
for idx, m in om_orders:
    print(f"  Msg #{idx} [{m['date']} {m['time']}]: {repr(m['text'][:80])}")
