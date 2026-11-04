import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== ALL OM AMAZON DISPATCH MESSAGES WITH TEXT ===")
for m in msgs:
    if m['sender'] == 'Om Amazon Dispatch' and m['content'].strip() != '<Media omitted>' and m['content'].strip() != '':
        print(f"[{m['index']}] {m['timestamp']}: {m['content']}")
