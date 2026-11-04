import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for m in msgs:
    c = m['content'].lower()
    if 'karle' in c or '7558273645' in c or '75582 73645' in c or 'aakkalkot' in c or 'devikavatha' in c or 'kalewadi' in c:
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")
