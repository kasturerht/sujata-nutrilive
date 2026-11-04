import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's map out every customer order in Yash messages
# We will check every candidate customer address / recipient in Yash's messages

# Let's find all candidate starts of orders for Yash:
# An order usually starts with a customer name, "Name - ", or address, and contains phone/pin or recipient info
yash_order_starts = []

# List of message indices from Yash that are main customer orders or start of paired orders:
# We will identify them by scanning
for i in range(len(msgs)):
    m = msgs[i]
    if m['sender'] != 'Yash R. Suryawanshi':
        continue
    t = clean(m['text']).strip()
    if not t or t == '<Media omitted>' or 'This message was deleted' in t:
        continue
    
    # Check if this message has customer address / name
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    
    # Conditions for being an order or start of order:
    # 1. Contains phone or pin and has address keywords or at least 2 lines of address
    # 2. Or explicitly starts with Name / To / customer name
    is_address_block = False
    if (has_phone or has_pin) and len(lines) >= 2:
        # Check that it's not admin chatter like "add this number"
        if not any(k in t.lower() for k in ['add this number', 'possible zal tar', 'pack ready karashil']):
            is_address_block = True
    elif len(lines) >= 3 and any(k in t.lower() for k in ['address', 'nagar', 'road', 'flat', 'society', 'plot', 'near', 'opp', 'tal', 'dist', 'post']):
        is_address_block = True
        
    if is_address_block:
        yash_order_starts.append((i, t))

print(f"Identified {len(yash_order_starts)} candidate order start messages for Yash:")
for idx, t in yash_order_starts:
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    first_line = lines[0] if lines else ''
    print(f"IDX {idx:3d} | {first_line[:40]} | Lines: {len(lines)}")
