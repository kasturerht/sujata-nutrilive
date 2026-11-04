import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Find all messages with phone, pin, or address keywords
phone_re = re.compile(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b')
pin_re = re.compile(r'\b[1-9]\d{5}\b')

customer_msgs = []
for i, m in enumerate(msgs):
    t = clean(m['text']).strip()
    if not t or t == '<Media omitted>' or 'This message was deleted' in t:
        continue
    has_p = bool(phone_re.search(t))
    has_pin = bool(pin_re.search(t))
    lines = [l for l in t.split('\n') if l.strip()]
    
    if (has_p or has_pin) and 'pinned a message' not in t:
        customer_msgs.append((i, m['sender'], m['date'], m['time'], has_p, has_pin, len(lines), lines[0]))

print(f"Total candidate customer messages: {len(customer_msgs)}")
by_sender = {}
for item in customer_msgs:
    s = item[1]
    by_sender[s] = by_sender.get(s, 0) + 1

for s, count in by_sender.items():
    print(f"{s:<30}: {count} candidate messages")
