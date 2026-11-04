import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for sender in ['+91 88051 68275', 'Sujata Nutrilive']:
    print(f"\n==================== SENDER: {sender} ====================")
    for i, m in enumerate(msgs):
        if m['sender'] == sender:
            print(f"IDX {i} | {m['date']} {m['time']}")
            print(m['text'])
            print("-" * 50)
