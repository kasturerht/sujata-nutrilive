import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

for m in messages:
    if m['sender'] in ['SYSTEM', '+91 98900 70524', '+91 86001 40344']:
        print(f"IDX {m['index']} ({m['timestamp']}) | {m['sender']}: {m['content']}")
