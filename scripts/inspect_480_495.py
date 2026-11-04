import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

for m in messages:
    if 480 <= m['index'] <= 495:
        print(f"IDX {m['index']} | {m['timestamp']} | {m['sender']}:")
        print(m['content'])
        print('-'*40)
