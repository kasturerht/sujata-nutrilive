import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

sn_msgs = [(m['idx'], m) for m in msgs if m['sender'] == 'Sujata Nutrilive']
print(f"Total Sujata Nutrilive messages: {len(sn_msgs)}")

# Check for customer address / phone / order
orders = []
chatter = []

for idx, m in sn_msgs:
    t = clean(m['text']).strip()
    is_deleted = 'This message was deleted' in t
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    
    if (has_phone or has_pin) and len(lines) >= 3 and not is_deleted:
        orders.append((idx, t))
    else:
        chatter.append((idx, t))

print(f"Sujata Nutrilive Orders identified: {len(orders)}")
print(f"Sujata Nutrilive Chatter/Other: {len(chatter)}")

print("\n--- Sujata Nutrilive Orders Preview ---")
for idx, t in orders[:15]:
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    print(f"IDX {idx:3d} | {lines[0][:60]}")

print("\n--- Sujata Nutrilive Chatter Preview ---")
for idx, t in chatter[:15]:
    print(f"IDX {idx:3d} | {repr(t[:60])}")
