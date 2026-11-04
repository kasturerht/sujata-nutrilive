import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for m in msgs:
    c = m['content'].lower()
    if 'कांताराम' in c or 'चवरे' in c or '9970693961' in c or '99706 93961' in c:
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")
