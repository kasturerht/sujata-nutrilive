import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for m in msgs[540:560]:
    print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")
