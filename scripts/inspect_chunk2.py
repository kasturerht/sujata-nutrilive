import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== CHUNK 2: 121 to 270 ===")
for m in msgs[120:270]:
    if m['sender'] != 'Om Amazon Dispatch' or 'cancel' in m['content'].lower():
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")
