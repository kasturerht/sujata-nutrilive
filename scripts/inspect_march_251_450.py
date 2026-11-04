import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

for m in messages[250:450]:
    c = m['content'].strip()
    idx = m['index']
    sender = m['sender']
    ts = m['timestamp']
    if any(w in c.lower() for w in ['name', 'नाव', 'address', 'पत्ता', 'pin', 'mob', 'phone', 'cod', 'prepaid', 'capsule', 'powder', 'tab', 'bottel', 'bottle', 'dr.']) or len(c) > 60:
        print(f"[{idx}] {ts} | {sender}:")
        for l in c.split('\n')[:6]:
            print(f"   {l}")
        print('-'*40)
