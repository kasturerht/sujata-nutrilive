import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Scan Monu messages for candidate orders
monu_orders = []
monu_non_orders = []

phone_pattern = re.compile(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}')

for idx, m in enumerate(msgs):
    if m['sender'] != 'Sujata Nutrilive':
        continue
    
    text = m.get('text', '')
    text_clean = re.sub(r'@\+?91[\s-]?95034[\s-]?34653', '', text)
    has_phone = bool(phone_pattern.search(text_clean))
    has_pin = bool(re.search(r'\b(?:pin|pincode|\b)[-:\s]*\d{6}\b', text, re.IGNORECASE))
    
    # check keywords
    is_candidate = has_phone or has_pin or any(w in text.lower() for w in ['name-', 'name:', 'नाव:', 'गाव', 'पत्ता', 'address:', 'mukkam', 'order-', 'payment -', 'cod -', 'prepaid'])
    
    if is_candidate:
        monu_orders.append((idx, m))
    else:
        monu_non_orders.append((idx, m))

print(f"Monu candidate orders count: {len(monu_orders)}")
print(f"Monu non-orders count: {len(monu_non_orders)}")

with open('scripts/monu_may_candidates.txt', 'w', encoding='utf-8') as f:
    for idx, m in monu_orders:
        f.write(f"=== IDX {idx} | Line {m['start_line']} | {m['date']} {m['time']} ===\n{m['text']}\n\n")

print("Saved to scripts/monu_may_candidates.txt")
