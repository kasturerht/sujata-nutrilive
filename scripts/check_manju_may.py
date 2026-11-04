import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

manju_msgs = [(i, m) for i, m in enumerate(msgs) if m['sender'] == 'Sujata Nutrilive Manju']
print(f"Total Manju messages in May: {len(manju_msgs)}")

for i, m in manju_msgs:
    print(f"=== IDX {i} | Line {m['start_line']} | {m['date']} {m['time']} ===")
    print(m['text'])
    print("-" * 50)
