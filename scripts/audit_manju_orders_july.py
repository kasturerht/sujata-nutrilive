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

# Let's inspect each of the 107 messages and decide: Order or Chatter
# We will print each one with our classification
orders = []
chatter = []

for idx, m in manju_msgs:
    t = clean(m['text']).strip()
    # Check if it has address / customer details
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}\b|\b[6-9]\d{9}\b|\b\d{2}\s+\d{2}\s+\d{2}\s+\d{2}\s+\d{2}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b|\b[1-9]\d{2}\s+\d{3}\b', t))
    is_deleted = 'This message was deleted' in t
    
    # Special cases:
    # IDX 119: Pallavi Kulkarni (has pin 52, phone added in 127) -> Order
    # IDX 343: Prabhakar Rumale (has pin 444004, phone added in 349) -> Order
    
    if is_deleted:
        chatter.append((idx, 'Deleted message', t))
    elif not t or t == '<Media omitted>':
        chatter.append((idx, 'Media/Empty', t))
    elif idx in [119, 343] or ((has_phone or has_pin) and len(lines) >= 3):
        orders.append((idx, t))
    else:
        chatter.append((idx, 'Chatter/Status', t))

print(f"Total Manju Orders: {len(orders)}")
print(f"Total Manju Chatter: {len(chatter)}")
print(f"Sum: {len(orders) + len(chatter)} == {len(manju_msgs)}")

with open('scripts/manju_orders_list.txt', 'w', encoding='utf-8') as out:
    for idx, t in orders:
        out.write(f"IDX {idx}:\n{t}\n" + "="*40 + "\n")

with open('scripts/manju_chatter_list.txt', 'w', encoding='utf-8') as out:
    for idx, reason, t in chatter:
        out.write(f"IDX {idx} | {reason} | {repr(t)}\n")
