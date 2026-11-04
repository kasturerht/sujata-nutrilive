import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== 110 to 135 ===")
for m in msgs[110:135]:
    print(f"[{m['index']}] {m['timestamp']} {m['sender']}: {m['content']}")
