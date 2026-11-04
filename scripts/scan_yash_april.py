import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

yash_msgs = [m for m in messages if m['sender'] == 'Yash R. Suryawanshi']

def is_order_candidate(msg):
    c = msg['content'].lower()
    has_phone = bool(re.search(r'\b[6-9]\d{9}\b', c) or re.search(r'\b[6-9]\d{4}\s*\d{5}\b', c))
    has_address = any(w in c for w in ['address', 'पत्ता', 'मु.', 'मुकाम', 'post', 'tal', 'dist', 'road', 'nagar', 'near', 'flat', 'room', 'floor', 'plot', 'sector', 'pincode', 'pin'])
    has_name = any(w in c for w in ['name', 'नाव', 'shri', 'mr.', 'suresh', 'shinde', 'patil', 'kumar', 'singh'])
    has_qty = any(w in c for w in ['capsule', 'powder', 'tab', 'bottle', 'bottel', 'facewash', 'facepack', 'cream'])
    
    score = (1 if has_phone else 0) + (1 if has_address else 0) + (1 if has_name else 0) + (1 if has_qty else 0)
    return score >= 2, score

yash_orders = []
for m in yash_msgs:
    cand, score = is_order_candidate(m)
    if cand:
        yash_orders.append((m['index'], m['timestamp'], score, m['content']))

print(f"\nYash order candidates: {len(yash_orders)}")
for idx, ts, sc, c in yash_orders:
    first_line = c.split('\n')[0]
    print(f"IDX {idx} ({ts}): {first_line[:80]}")
