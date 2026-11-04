import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== ALL 107 MESSAGES OF Sujata Nutrilive Manju ===")
for i, m in enumerate(msgs):
    if m['sender'] == 'Sujata Nutrilive Manju':
        print(f"IDX {i} | {m['date']} {m['time']}")
        print(repr(m['text']))
