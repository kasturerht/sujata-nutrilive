import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Import orders from reconcile_april
from reconcile_april import orders, main_indices, all_sub_indices

accounted = main_indices | all_sub_indices
remaining_msgs = [m for m in messages if m['index'] not in accounted]

print(f"Total remaining messages: {len(remaining_msgs)}")

# Scan for any phone, pin, address, product, price
suspicious = []
for m in remaining_msgs:
    c = m['content'].strip()
    idx = m['index']
    sender = m['sender']
    ts = m['timestamp']
    
    phones = re.findall(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}', c)
    pincodes = re.findall(r'\b[1-9]\d{5}\b', c)
    prices = re.findall(r'(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:/-|rs|cod|prepaid)?', c, re.IGNORECASE)
    has_prod = any(w in c.lower() for w in ['capsule', 'powder', 'tab', 'bottle', 'facewash', 'facepack', 'cream', 'soap', 'oil', 'shampoo'])
    has_addr = any(w in c.lower() for w in ['address', 'पत्ता', 'road', 'nagar', 'tal', 'dist', 'post', 'flat', 'plot', 'room', 'colony'])
    
    if phones or pincodes or (has_prod and len(c) > 20) or has_addr:
        suspicious.append((idx, sender, ts, phones, pincodes, c))

print(f"Suspicious messages in remaining: {len(suspicious)}")
for idx, sender, ts, ph, pins, c in suspicious:
    print(f"\n[{idx}] {sender} ({ts}) | Phones: {ph} | Pins: {pins}")
    for l in c.split('\n')[:5]:
        print(f"   {l}")
