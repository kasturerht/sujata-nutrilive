import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/september_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

wh_senders = {'+91 90967 59653', '+91 96072 59661', '+91 86001 40344', '+91 95185 05481'}
wh_msgs = [m for m in msgs if m['sender'] in wh_senders]
print(f"Total warehouse messages: {len(wh_msgs)}")

wh_orders = []
for idx, m in enumerate(wh_msgs, 1):
    t = m['text'].strip()
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina', t, re.I))
    
    if (has_phone or has_pin) and has_prod and len(t) > 35 and not 'return' in t.lower() and not 'delivered' in t.lower() and not 'unable to scan' in t.lower():
        wh_orders.append((idx, m))

print(f"Detected Warehouse Orders: {len(wh_orders)}")
for idx, m in wh_orders:
    print(f"  Msg #{idx} [{m['date']} {m['time']}] {m['sender']}: {repr(m['text'][:80])}")
