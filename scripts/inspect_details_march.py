import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Inspect around 500-530
print("=== 500 to 530 ===")
for m in msgs[499:530]:
    print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")

# Inspect around 695 to 725
print("\n=== 695 to 725 ===")
for m in msgs[694:725]:
    print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")
