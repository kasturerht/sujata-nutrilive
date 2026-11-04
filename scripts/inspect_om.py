import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

om_msgs = [m for m in msgs if m['sender'] == 'Om Amazon Dispatch']
print(f"Total Om Amazon Dispatch messages: {len(om_msgs)}")

# Let's see how many look like orders (contain phone numbers or address keywords)
order_like = []
for i, m in enumerate(msgs):
    if m['sender'] == 'Om Amazon Dispatch':
        t = m['text']
        # check if contains pin code or phone number
        has_phone = bool(re.search(r'\b[6-9]\d{9}\b', t))
        has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
        is_media = '<Media omitted>' in t or not t.strip()
        is_tracking = any(kw in t.lower() for kw in ['tracking', 'awb', 'icdr', 'dtdc', 'delhivery', 'speed post', 'consignment', 'dispatch', 'total parcel'])
        
        if (has_phone or has_pin) and not is_tracking:
            order_like.append((i, m))

print(f"Om Amazon Dispatch order-like messages: {len(order_like)}")
for idx, m in order_like[:20]:
    print(f"IDX {idx} | {m['date']} {m['time']}")
    print(repr(m['text'][:150]))
    print("-" * 40)
