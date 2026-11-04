import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

yash_msgs = [m for m in msgs if m['sender'] == 'Yash R. Suryawanshi']
print(f"Total Yash messages in TRUE: {len(yash_msgs)}")

yash_orders = []
yash_non_orders = []

for idx, m in enumerate(yash_msgs, 1):
    t = m['text'].strip()
    if t in ['<Media omitted>', 'This message was deleted']:
        yash_non_orders.append((idx, m, 'Media/Deleted'))
        continue
    if 'pack kartana check kara' in t or 'porter karshil monu' in t or 'cancel' in t.lower() or 'dispatch zali' in t.lower():
        yash_non_orders.append((idx, m, 'Instruction/Chatter'))
        continue
        
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina', t, re.I))
    has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I))
    is_web = 'SUJATA NUTRILIVE — NEW ORDER' in t or 'Website order' in t
    
    if (has_phone or has_pin) and has_prod and len(t) > 40:
        yash_orders.append((idx, m))
    elif is_web:
        yash_orders.append((idx, m))
    else:
        yash_non_orders.append((idx, m, 'Chatter / Admin'))

print(f"Total Yash orders detected: {len(yash_orders)}")
print(f"Total Yash non-orders: {len(yash_non_orders)}")

print("\n--- Detected Yash Orders ---")
for i, (idx, m) in enumerate(yash_orders, 1):
    first_line = m['text'].replace('\n', ' ')[:65]
    print(f"{i:02d}. Msg #{idx:03d} [{m['date']} {m['time']}]: {first_line}")
