import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect every message from Yash
yash_msgs = [(i, m) for i, m in enumerate(msgs) if m['sender'] == 'Yash R. Suryawanshi']

# Let's inspect all Yash messages that have potential customer info
order_candidates = []
for idx, m in yash_msgs:
    t = clean(m['text']).strip()
    if not t or t == '<Media omitted>' or 'This message was deleted' in t:
        continue
    # Check if this message has customer address, name, or products
    has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    lines = [l for l in t.split('\n') if l.strip()]
    
    order_candidates.append((idx, t, has_phone, has_pin, len(lines)))

print(f"Total non-empty Yash messages: {len(order_candidates)}")

# Write to file for complete review
with open('scripts/yash_order_candidates.txt', 'w', encoding='utf-8') as out:
    for idx, t, has_p, has_pin, n_lines in order_candidates:
        out.write(f"IDX {idx:3d} | Phone: {has_p} | Pin: {has_pin} | Lines: {n_lines}\n")
        out.write(t + "\n")
        out.write("-" * 40 + "\n")

print("Generated yash_order_candidates.txt")
