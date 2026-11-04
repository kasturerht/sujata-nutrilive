import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

for m in messages:
    if 505 <= m['index'] <= 515:
        print(f"IDX {m['index']} ({m['timestamp']}) | {m['sender']}: {m['content']}")
