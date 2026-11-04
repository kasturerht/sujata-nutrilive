import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Find all Monu messages
monu_orders = []
monu_non_orders = []

phone_pattern = re.compile(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}')

for idx, m in enumerate(msgs):
    if m.get('sender') != 'Sujata Nutrilive':
        continue
    
    text = m.get('text', '')
    # strip @+91 95034 34653 which is Monu's own tag
    text_clean = re.sub(r'@\+?91[\s-]?95034[\s-]?34653', '', text)
    has_phone = bool(phone_pattern.search(text_clean))
    has_pin = bool(re.search(r'\b(?:pin|pincode|\b)[-:\s]*\d{6}\b', text, re.IGNORECASE))
    
    # check keywords
    is_candidate = has_phone or has_pin or any(w in text.lower() for w in ['name', 'नाव', 'गाव', 'पत्ता', 'address', 'cod', 'prepaid'])
    
    if is_candidate:
        monu_orders.append((idx, text))
    else:
        monu_non_orders.append((idx, text))

print(f"Monu Candidate Orders: {len(monu_orders)}")
print(f"Monu Non-Orders: {len(monu_non_orders)}")

with open('scripts/monu_candidates.txt', 'w', encoding='utf-8') as f:
    for idx, text in monu_orders:
        f.write(f"=== IDX {idx} ===\n{text}\n\n")
