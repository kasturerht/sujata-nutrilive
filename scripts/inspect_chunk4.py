import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== CHUNK 4: 431 to 650 ===")
for m in msgs[430:650]:
    if m['sender'] != 'Om Amazon Dispatch' or 'cancel' in m['content'].lower() or 'slip' in m['content'].lower():
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")
