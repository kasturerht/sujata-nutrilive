import re
from collections import Counter
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Read entire raw text file line-by-line
with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    raw_lines = f.readlines()

print(f"Total lines in raw text file: {len(raw_lines)}")

msg_header_re = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s*-\s*([^:]+):\s*(.*)$')
system_msg_re = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s*-\s*(.*)$')

all_msgs = []
curr = None

for line in raw_lines:
    m = msg_header_re.match(line)
    if m:
        if curr: all_msgs.append(curr)
        curr = {
            'date': m.group(1),
            'time': m.group(2),
            'sender': m.group(3).strip(),
            'text': m.group(4)
        }
    else:
        sm = system_msg_re.match(line)
        if sm and not ':' in line[20:]:
            if curr: all_msgs.append(curr)
            curr = {
                'date': sm.group(1),
                'time': sm.group(2),
                'sender': 'SYSTEM',
                'text': sm.group(3)
            }
        else:
            if curr: curr['text'] += '\n' + line.rstrip('\r\n')

if curr: all_msgs.append(curr)

print(f"Total messages parsed: {len(all_msgs)}")

# Filter September 2026 messages
sept_msgs = [m for m in all_msgs if m['date'].endswith('/09/2026') and m['sender'] != 'SYSTEM']
print(f"Total September 2026 user messages: {len(sept_msgs)}")

# Senders in September 2026
senders = Counter(m['sender'] for m in sept_msgs)
print("\n--- Senders in September 2026 ---")
for s, c in senders.most_common():
    print(f"  {s}: {c} messages")

with open('scripts/september_whatsapp_messages_TRUE.json', 'w', encoding='utf-8') as f:
    json.dump(sept_msgs, f, ensure_ascii=False, indent=2)

print("\nSaved scripts/september_whatsapp_messages_TRUE.json")
