import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect all 101 messages of Manju
manju_indices = [m['idx'] for m in msgs if m['sender'] == 'Sujata Nutrilive Manju']

print("=== ALL MANJU MESSAGES DETAILED INSPECTION ===")
for idx in manju_indices:
    m = msgs[idx]
    t = clean(m['text']).strip()
    if not t or t == '<Media omitted>' or 'This message was deleted' in t:
        continue
    # print line count and first 2 lines
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    print(f"IDX {idx:3d} | {m['date']} {m['time']} | Lines: {len(lines)} | Phone: {has_phone} | Pin: {has_pin}")
    for l in lines[:2]:
        print(f"     {l[:70]}")
    if len(lines) > 2:
        print(f"     [Last Line]: {lines[-1][:70]}")
    print("-" * 50)
