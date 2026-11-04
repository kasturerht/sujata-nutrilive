import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Let's check Om's messages around 165-175, 315-320, 330-335, 395-405
print("=== OM MESSAGES AROUND TARGETS ===")
for m in messages:
    if m['sender'] == 'Om Amazon Dispatch' and any([
        165 <= m['index'] <= 175,
        315 <= m['index'] <= 322,
        330 <= m['index'] <= 340,
        398 <= m['index'] <= 406
    ]):
        print(f"IDX {m['index']} | {m['timestamp']}: {m['content']}")
