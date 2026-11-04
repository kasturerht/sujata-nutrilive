import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for i in range(585, 595):
    m = msgs[i]
    print(f"IDX {i} | {m['sender']} | {m['date']} {m['time']}")
    print(repr(m['text']))
    print("-" * 30)
