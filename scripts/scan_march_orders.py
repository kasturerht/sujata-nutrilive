import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Candidate order detector
def get_order_score(msg):
    c = msg['content'].lower()
    has_phone = bool(re.search(r'\b[6-9]\d{9}\b', c) or re.search(r'\b[6-9]\d{4}\s*\d{5}\b', c))
    has_addr = any(w in c for w in ['address', 'पत्ता', 'मु.', 'मुकाम', 'post', 'tal', 'dist', 'road', 'nagar', 'near', 'flat', 'room', 'floor', 'plot', 'sector', 'pincode', 'pin'])
    has_name = any(w in c for w in ['name', 'नाव', 'shri', 'mr.', 'dr.', 'dr '])
    has_prod = any(w in c for w in ['capsule', 'powder', 'tab', 'bottle', 'bottel', 'facewash', 'facepack', 'cream', 'soap', 'oil', 'shampoo'])
    
    score = (1 if has_phone else 0) + (1 if has_addr else 0) + (1 if has_name else 0) + (1 if has_prod else 0)
    return score, has_phone, has_addr, has_name, has_prod

monu_candidates = []
yash_candidates = []

for m in messages:
    score, has_phone, has_addr, has_name, has_prod = get_order_score(m)
    if (score >= 2 or has_phone) and '<media omitted>' not in m['content'].lower():
        if m['sender'] == 'Sujata Nutrilive':
            monu_candidates.append(m)
        elif m['sender'] == 'Yash R. Suryawanshi':
            yash_candidates.append(m)

print(f"Monu candidate messages: {len(monu_candidates)}")
print(f"Yash candidate messages: {len(yash_candidates)}")
