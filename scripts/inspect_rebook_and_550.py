import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== MESSAGES 460 - 470 ===")
for i in range(460, 471):
    m = msgs[i]
    print(f"IDX {i} | {m['sender']} | {m['date']} {m['time']}")
    print(repr(m['text']))
    print("-" * 30)

print("\n=== MESSAGES 550 - 555 ===")
for i in range(550, 556):
    m = msgs[i]
    print(f"IDX {i} | {m['sender']} | {m['date']} {m['time']}")
    print(repr(m['text']))
    print("-" * 30)
