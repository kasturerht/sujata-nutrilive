import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

print('=== Messages from +91 86001 40344 ===')
for m in messages:
    if m['sender'] == '+91 86001 40344':
        print(f"IDX {m['index']} ({m['timestamp']}): {m['content']}")

print('\n=== Messages from +91 99700 02285 ===')
for m in messages:
    if m['sender'] == '+91 99700 02285':
        print(f"IDX {m['index']} ({m['timestamp']}): {m['content']}")

print('\n=== Messages from +91 98900 70524 ===')
for m in messages:
    if m['sender'] == '+91 98900 70524':
        print(f"IDX {m['index']} ({m['timestamp']}): {m['content']}")
