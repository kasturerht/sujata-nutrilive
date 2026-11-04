import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

print("=== Context for IDX 368 ===")
for m in messages:
    if 364 <= m['index'] <= 374:
        print(f"IDX {m['index']} | {m['timestamp']} | {m['sender']}: {m['content']}")

print("\n=== Context for IDX 388 ===")
for m in messages:
    if 384 <= m['index'] <= 395:
        print(f"IDX {m['index']} | {m['timestamp']} | {m['sender']}: {m['content']}")
