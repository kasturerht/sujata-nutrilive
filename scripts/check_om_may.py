import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

om_msgs = [(i, m) for i, m in enumerate(msgs) if m['sender'] == 'Om Amazon Dispatch']
print(f"Total Om messages in May: {len(om_msgs)}")

for i, m in om_msgs:
    t = m.get('text', '').strip()
    if t != '<Media omitted>':
        print(f"[{i}] {m['date']} {m['time']}: {t}")
