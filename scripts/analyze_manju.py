import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')

def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

manju_msgs = [(i, m) for i, m in enumerate(msgs) if m['sender'] == 'Sujata Nutrilive Manju']

print(f"Total Manju messages: {len(manju_msgs)}")

# Classify each message
manju_orders = []
manju_chatter = []

for idx, m in manju_msgs:
    t = clean(m['text']).strip()
    # Check if has address/customer indicators (phone, pin, or address keywords)
    has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    is_deleted = 'This message was deleted' in t
    is_media = '<Media omitted>' in t or not t
    
    # An order typically has phone or pin or multiple lines with address
    if (has_phone or has_pin) and len(t.split('\n')) >= 3 and not is_deleted:
        manju_orders.append((idx, m))
    else:
        manju_chatter.append((idx, m))

print(f"Manju Orders identified: {len(manju_orders)}")
print(f"Manju Chatter/Other: {len(manju_chatter)}")

print("\n--- Manju Chatter/Other Messages ---")
for idx, m in manju_chatter:
    print(f"IDX {idx} | {repr(clean(m['text'])[:80])}")
