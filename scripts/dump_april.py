import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

out_lines = []

for m in messages:
    idx = m['index']
    sender = m['sender']
    ts = m['timestamp']
    c = m['content'].strip()
    
    phones = re.findall(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}', c)
    pincodes = re.findall(r'\b[1-9]\d{2}\s?\d{3}\b', c)
    
    has_addr_kw = any(w in c.lower() for w in ['name', 'नाव', 'address', 'पत्ता', 'tal', 'dist', 'pin', 'road', 'at post', 'मु.', 'पो.', 'flat', 'plot', 'room', 'colony', 'nagar'])
    has_prod_kw = any(w in c.lower() for w in ['capsule', 'powder', 'tab', 'bottle', 'bottel', 'facewash', 'facepack', 'cream'])
    has_order_kw = any(w in c.lower() for w in ['cod', 'prepaid', 'dispatch', 'courier', 'speed post', 'पार्सल', 'ऑर्डर', 'order'])
    
    # We want to catch everything that is NOT purely routine chatter or isolated media
    out_lines.append(f"=== IDX {idx} | {ts} | {sender} ===")
    out_lines.append(c)
    out_lines.append(f"Flags: phones={phones}, pins={pincodes}, addr={has_addr_kw}, prod={has_prod_kw}, order={has_order_kw}\n")

with open('scripts/april_all_messages_dump.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out_lines))

print(f"Wrote all 529 messages to scripts/april_all_messages_dump.txt")
