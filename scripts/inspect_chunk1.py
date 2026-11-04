import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== CHUNK 1: 1 to 120 ===")
for m in msgs[0:120]:
    if m['sender'] != 'Om Amazon Dispatch' or 'cancel' in m['content'].lower():
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")
