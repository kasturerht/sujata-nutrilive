import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

# Read entire raw text file
with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    raw_lines = f.readlines()

print(f"Total lines in raw text file: {len(raw_lines)}")

# Parse line by line robustly without regex lookaheads
msg_header_re = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s*-\s*([^:]+):\s*(.*)$')
system_msg_re = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s*-\s*(.*)$')

all_parsed_msgs = []
current_msg = None

for line_num, line in enumerate(raw_lines, 1):
    m = msg_header_re.match(line)
    if m:
        if current_msg:
            all_parsed_msgs.append(current_msg)
        current_msg = {
            'date': m.group(1),
            'time': m.group(2),
            'sender': m.group(3).strip(),
            'text': m.group(4)
        }
    else:
        # Check if system message
        sm = system_msg_re.match(line)
        if sm and not ':' in line[20:]: # system event like "added you"
            if current_msg:
                all_parsed_msgs.append(current_msg)
            current_msg = {
                'date': sm.group(1),
                'time': sm.group(2),
                'sender': 'SYSTEM',
                'text': sm.group(3)
            }
        else:
            # Continuation of previous message
            if current_msg:
                current_msg['text'] += '\n' + line.rstrip('\r\n')

if current_msg:
    all_parsed_msgs.append(current_msg)

print(f"Total messages parsed line-by-line: {len(all_parsed_msgs)}")

oct_msgs = [m for m in all_parsed_msgs if m['date'].endswith('/10/2026') and m['sender'] != 'SYSTEM']
print(f"Total October 2026 messages: {len(oct_msgs)}")

# Save the true October messages
with open('scripts/october_whatsapp_messages_TRUE.json', 'w', encoding='utf-8') as f:
    json.dump(oct_msgs, f, ensure_ascii=False, indent=2)

print("Saved scripts/october_whatsapp_messages_TRUE.json")
print("Last 3 October messages:")
for m in oct_msgs[-3:]:
    print(f"  {m['date']} {m['time']} [{m['sender']}]: {m['text'][:50].replace('\n', ' ')}")
