import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

minor_senders = ['SYSTEM', '+91 99700 02285', '+91 98900 70524']

for i, m in enumerate(msgs):
    if m['sender'] in minor_senders:
        print(f"=== IDX {i} | Line {m['start_line']} | {m['sender']} | {m['date']} {m['time']} ===")
        print(m['text'])
        print("-" * 50)
