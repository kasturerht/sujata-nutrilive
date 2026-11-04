import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== ALL 28 MESSAGES OF +91 88051 68275 ===")
for i, m in enumerate(msgs):
    if m['sender'] == '+91 88051 68275':
        print(f"IDX {i} | {m['date']} {m['time']}")
        print(repr(m['text']))
