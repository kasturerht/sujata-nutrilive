import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

om_msgs = [m for m in msgs if m['sender'] == 'Om Amazon Dispatch']
print(f"Total Om Amazon Dispatch messages: {len(om_msgs)}")

# Check for customer address / phone / order
for m in om_msgs:
    t = clean(m['text']).strip()
    has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    lines = [l for l in t.split('\n') if l.strip()]
    if has_phone or has_pin or len(lines) >= 3:
        print(f"IDX {m['idx']:3d} | {m['date']} {m['time']} | Lines: {len(lines)}")
        print(repr(t[:100]))
        print("-" * 40)
