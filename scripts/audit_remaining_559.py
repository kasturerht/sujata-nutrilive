import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

from test_all_july_orders_extract import ORDERS_MAP

mapped_indices = set()
for main_idx, merged_idxs, _, _, _ in ORDERS_MAP:
    mapped_indices.add(main_idx)
    for m in merged_idxs:
        mapped_indices.add(m)

unmapped_indices = [i for i in range(len(msgs)) if i not in mapped_indices]
print(f"Total unmapped messages: {len(unmapped_indices)}")

# Check if any unmapped message has phone, pin, or order keywords
phone_re = re.compile(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b')
pin_re = re.compile(r'\b[1-9]\d{5}\b')

suspicious = []
for i in unmapped_indices:
    m = msgs[i]
    t = clean(m['text']).strip()
    if not t or t == '<Media omitted>' or 'This message was deleted' in t:
        continue
    has_p = bool(phone_re.search(t))
    has_pin = bool(pin_re.search(t))
    lines = [l for l in t.split('\n') if l.strip()]
    if has_p or has_pin or len(lines) >= 3:
        suspicious.append((i, m['sender'], m['date'], m['time'], t))

print(f"Suspicious unmapped messages: {len(suspicious)}")
for idx, sender, date, time, text in suspicious:
    print(f"IDX {idx:3d} | {sender:<25} | {date} {time}")
    for l in text.split('\n')[:3]:
        print(f"     {l.strip()[:60]}")
    print("-" * 50)
