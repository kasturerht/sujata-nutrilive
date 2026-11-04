import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== CHUNK 5: 651 to 743 ===")
for m in msgs[650:]:
    if m['sender'] != 'Om Amazon Dispatch' or 'cancel' in m['content'].lower() or 'slip' in m['content'].lower():
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")
