import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Scan all messages from all senders where line count is 1 or 2
# that might be an order or address
for i, m in enumerate(msgs):
    t = clean(m['text']).strip()
    if not t or t == '<Media omitted>' or 'This message was deleted' in t:
        continue
    lines = [l for l in t.split('\n') if l.strip()]
    if len(lines) <= 2:
        # check if contains pin or phone or address keywords
        has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b', t))
        has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
        has_kw = any(k in t.lower() for k in ['vill', 'post', 'road', 'nagar', 'district', 'dist', 'tal', 'pin', 'near', 'opp', 'station'])
        if (has_phone or has_pin) and has_kw:
            print(f"IDX {i:3d} | {m['sender']:<20} | Lines: {len(lines)} | {repr(t[:80])}")
