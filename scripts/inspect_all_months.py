import re
from collections import Counter
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    raw_lines = f.readlines()

msg_header_re = re.compile(r'^(\d{2})/(\d{2})/(\d{4}),\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s*-\s*([^:]+):\s*(.*)$')

all_msgs = []
curr = None
for line in raw_lines:
    m = msg_header_re.match(line)
    if m:
        if curr: all_msgs.append(curr)
        curr = {
            'day': m.group(1),
            'month': m.group(2),
            'year': m.group(3),
            'date': f"{m.group(1)}/{m.group(2)}/{m.group(3)}",
            'month_year': f"{m.group(2)}/{m.group(3)}",
            'time': m.group(4),
            'sender': m.group(5).strip(),
            'text': m.group(6)
        }
    else:
        if curr: curr['text'] += '\n' + line.rstrip('\r\n')

if curr: all_msgs.append(curr)

print(f"Total user messages with valid sender: {len(all_msgs)}")
print(f"First message date: {all_msgs[0]['date']} by {all_msgs[0]['sender']}")
print(f"Last message date: {all_msgs[-1]['date']} by {all_msgs[-1]['sender']}")

months = Counter(m['month_year'] for m in all_msgs)
print("\n--- Month-wise Message Distribution ---")
for my, cnt in sorted(months.items(), key=lambda x: (x[0].split('/')[1], x[0].split('/')[0])):
    print(f"  {my}: {cnt} messages")
