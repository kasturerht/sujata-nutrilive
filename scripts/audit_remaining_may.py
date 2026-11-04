import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

from reconcile_may_master import main_map, merged_map

remaining_indices = [i for i in range(len(msgs)) if i not in main_map and i not in merged_map]
print(f"Total remaining indices: {len(remaining_indices)}")

phone_regex = re.compile(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}')
pin_regex = re.compile(r'\b[1-9]\d{5}\b')

suspicious = []

for i in remaining_indices:
    m = msgs[i]
    sender = m['sender']
    text = m['text']
    
    # ignore Om Amazon Dispatch (warehouse slips/chatter)
    if sender == 'Om Amazon Dispatch':
        continue
    
    # ignore tags like @+91 95034 34653
    text_clean = re.sub(r'@\+?91[\s-]?95034[\s-]?34653', '', text)
    text_clean = re.sub(r'9021735051', '', text_clean)
    
    has_phone = bool(phone_regex.search(text_clean))
    has_pin = bool(pin_regex.search(text_clean))
    has_order_words = any(w in text.lower() for w in ['name-', 'name:', 'नाव:', 'गाव', 'पत्ता', 'address:', 'mukkam', 'order-', 'payment -', 'cod -', 'prepaid'])
    
    if has_phone or has_pin or has_order_words:
        suspicious.append((i, sender, text))

print(f"Suspicious remaining messages: {len(suspicious)}")
for i, sender, text in suspicious:
    print(f"=== REMAINING SUSPICIOUS IDX {i} | {sender} ===")
    print(text)
    print("-" * 50)
