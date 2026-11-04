import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Let's inspect Monu's messages
monu_msgs = [m for m in messages if m['sender'] == 'Sujata Nutrilive']
print(f"Total Monu messages: {len(monu_msgs)}")

# Let's inspect Yash's messages
yash_msgs = [m for m in messages if m['sender'] == 'Yash R. Suryawanshi']
print(f"Total Yash messages: {len(yash_msgs)}")

# Let's inspect +91 86001 40344 messages
admin_msgs = [m for m in messages if m['sender'] == '+91 86001 40344']
print(f"Total +91 86001 40344 messages: {len(admin_msgs)}")

# Function to detect if a message looks like an order
def is_order_candidate(msg):
    c = msg['content'].lower()
    has_phone = bool(re.search(r'\b[6-9]\d{9}\b', c) or re.search(r'\b[6-9]\d{4}\s*\d{5}\b', c))
    has_address = any(w in c for w in ['address', 'पत्ता', 'मु.', 'मुकाम', 'post', 'tal', 'dist', 'road', 'nagar', 'near', 'flat', 'room', 'floor', 'plot', 'sector'])
    has_name = any(w in c for w in ['name', 'नाव', 'shri', 'mr.', 'suresh', 'shinde', 'patil', 'kumar', 'singh'])
    has_qty = any(w in c for w in ['capsule', 'powder', 'tab', 'bottle', 'bottel', 'facewash', 'facepack', 'cream'])
    
    score = (1 if has_phone else 0) + (1 if has_address else 0) + (1 if has_name else 0) + (1 if has_qty else 0)
    return score >= 2, score

monu_orders = []
for m in monu_msgs:
    cand, score = is_order_candidate(m)
    if cand:
        monu_orders.append((m['index'], m['timestamp'], score, m['content']))

print(f"\nMonu order candidates: {len(monu_orders)}")
for idx, ts, sc, c in monu_orders:
    first_line = c.split('\n')[0]
    print(f"IDX {idx} ({ts}): {first_line[:80]}")
