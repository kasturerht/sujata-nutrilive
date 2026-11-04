import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Let's inspect messages around IDX 163
print("=== Around IDX 163 (06/04) ===")
for m in messages:
    if 154 <= m['index'] <= 175:
        print(f"IDX {m['index']} | {m['sender']}: {m['content'][:80]}")

print("\n=== Around IDX 310 (12/04) ===")
for m in messages:
    if 305 <= m['index'] <= 325:
        print(f"IDX {m['index']} | {m['sender']}: {m['content'][:80]}")

print("\n=== Around IDX 329 (15/04) ===")
for m in messages:
    if 325 <= m['index'] <= 335:
        print(f"IDX {m['index']} | {m['sender']}: {m['content'][:80]}")

print("\n=== Around IDX 391 (17/04) ===")
for m in messages:
    if 385 <= m['index'] <= 397:
        print(f"IDX {m['index']} | {m['sender']}: {m['content'][:80]}")
