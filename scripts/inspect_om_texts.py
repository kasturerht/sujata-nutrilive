import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect Om Amazon Dispatch messages around these dates
# Om messages:
om_msgs = [(i, m) for i, m in enumerate(msgs) if m.get('sender') == 'Om Amazon Dispatch']
print(f"Total Om messages: {len(om_msgs)}")

# Print text of Om messages that have text
for i, m in om_msgs:
    t = m.get('text', '').strip()
    if t and t != '<Media omitted>':
        print(f"[{i}] {m.get('date')} {m.get('time')}: {t}")
