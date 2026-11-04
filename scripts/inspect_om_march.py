import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

om_msgs = [m for m in messages if m['sender'] == 'Om Amazon Dispatch']
print(f"Total messages from Om Amazon Dispatch in March: {len(om_msgs)}")

for m in om_msgs:
    c = m['content'].strip()
    has_phone = bool(re.search(r'\b[6-9]\d{9}\b', c) or re.search(r'\b[6-9]\d{4}\s*\d{5}\b', c))
    has_name_addr = any(w in c.lower() for w in ['name', 'address', 'पत्ता', 'नाव', 'pin', 'pincode', 'road', 'at post', 'tal', 'dist'])
    if (has_phone or has_name_addr) and '<media omitted>' not in c.lower():
        print(f"IDX {m['index']} ({m['timestamp']}): {c}")
