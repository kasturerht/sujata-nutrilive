import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

from verify_order_sets import all_accounted_ids

remaining_ids = [i for i in range(len(msgs)) if i not in all_accounted_ids]
print(f"Total remaining messages: {len(remaining_ids)}")

phone_regex = re.compile(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}')
pin_regex = re.compile(r'\b[1-9]\d{5}\b')

suspicious_remaining = []

for i in remaining_ids:
    m = msgs[i]
    sender = m.get('sender', '')
    text = m.get('text', '')
    
    # ignore Om Amazon Dispatch (warehouse slips/chatter)
    # ignore known tags like @+91 95034 34653
    text_clean = re.sub(r'@\+?91[\s-]?95034[\s-]?34653', '', text)
    text_clean = re.sub(r'9021735051', '', text_clean) # company support number
    
    has_phone = bool(phone_regex.search(text_clean))
    has_pin = bool(pin_regex.search(text_clean))
    has_order_words = any(w in text.lower() for w in ['name-', 'name:', 'नाव:', 'पत्ता', 'address:', 'vill', 'mukkam', 'order-', 'payment -', 'cod -'])
    
    if has_phone or has_pin or has_order_words:
        suspicious_remaining.append((i, sender, text))

print(f"Suspicious remaining messages found: {len(suspicious_remaining)}")
for i, sender, text in suspicious_remaining:
    print(f"=== REMAINING SUSPICIOUS IDX {i} | {sender} ===")
    print(text)
    print("-" * 50)
