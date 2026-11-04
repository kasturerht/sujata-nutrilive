import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

for m in messages:
    c = m['content'].lower()
    if 'ragnidan' in c or 'uklana' in c or '9467133913' in c or 'hissar' in c:
        print(f"IDX {m['index']} | {m['timestamp']} | {m['sender']}: {m['content']}")
