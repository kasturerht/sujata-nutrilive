import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's list all messages that contain any name, phone number, address, or product
print(f"Total messages: {len(msgs)}")

# Let's build a timeline of potential orders
potential_orders = []
for i, m in enumerate(msgs):
    c = m['content']
    sender = m['sender']
    has_phone = bool(re.search(r'\b[6-9]\d{9}\b', c) or re.search(r'\b[6-9]\d{4}\s*\d{5}\b', c) or re.search(r'[०-९]{10}', c))
    has_addr = any(w in c.lower() for w in ['pin', 'road', 'nagar', 'tal', 'dist', 'room', 'flat', 'plot', 'near', 'post', 'मु.', 'पत्ता', 'पिनकोड'])
    has_prod = any(w in c.lower() for w in ['tab', 'capsule', 'powder', 'soap', 'oil', 'shampoo', 'cream', 'facewash', 'cookies', 'moringa', 'ashwagandha', 'seabuckthorn', 'sea buckthorn', 'seabackthorn'])
    
    if (has_phone or (has_addr and has_prod)) and '<media omitted>' not in c.lower() and sender != 'Om Amazon Dispatch':
        potential_orders.append((i, m))

print(f"Found {len(potential_orders)} potential order anchors.")
for idx, m in potential_orders:
    first_line = m['content'].strip().split('\n')[0][:80]
    print(f"[{m['index']}] {m['timestamp']} | {m['sender']} | {first_line}")
