import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect all Yash messages
yash_msgs = [(i, m) for i, m in enumerate(msgs) if m['sender'] == 'Yash R. Suryawanshi']

# Let's trace every order candidate from Yash
# Yash orders usually have an address (recipient name, town, pincode, phone)
# Or they are pairs: address msg + product msg
for idx, m in yash_msgs:
    t = clean(m['text']).strip()
    if not t or t == '<Media omitted>' or 'This message was deleted' in t:
        continue
    # Let's check if this looks like a customer address / order
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    
    # print all lines if has_phone or has_pin
    if has_phone or has_pin or any(kw in t.lower() for kw in ['address', 'pincode', 'mob', 'sample', 'combo', 'spirulina', 'seabuckthorn']):
        print(f"IDX {idx:3d} | {m['date']} {m['time']} | Lines: {len(lines)} | Phone: {has_phone} | Pin: {has_pin}")
        print(f"     Preview: {repr(lines[0] if lines else '')}")
        if len(lines) > 1:
            print(f"     Line 2:  {repr(lines[1])}")
        print("-" * 50)
