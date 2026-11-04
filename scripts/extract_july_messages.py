import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

msg_pattern = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{2}:\d{2})\s*-\s*([^:]+):\s*(.*)$')
notice_pattern = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{2}:\d{2})\s*-\s*(.*)$')

all_msgs = []
curr_msg = None

for line_idx, line in enumerate(lines):
    m = msg_pattern.match(line)
    if m:
        if curr_msg:
            all_msgs.append(curr_msg)
        curr_msg = {
            'date': m.group(1),
            'time': m.group(2),
            'sender': m.group(3).strip(),
            'text': m.group(4),
            'start_line': line_idx + 1
        }
    else:
        m_not = notice_pattern.match(line)
        if m_not and ':' not in m_not.group(3):
            if curr_msg:
                all_msgs.append(curr_msg)
            curr_msg = {
                'date': m_not.group(1),
                'time': m_not.group(2),
                'sender': 'SYSTEM',
                'text': m_not.group(3).strip(),
                'start_line': line_idx + 1
            }
        else:
            if curr_msg:
                curr_msg['text'] += '\n' + line.rstrip('\r\n')

if curr_msg:
    all_msgs.append(curr_msg)

print(f"Total parsed messages in whole chat: {len(all_msgs)}")

# Filter July 2026 messages
july_msgs = [m for m in all_msgs if m['date'].endswith('/07/2026')]
print(f"Total July 2026 messages: {len(july_msgs)}")

if july_msgs:
    first_m = july_msgs[0]
    last_m = july_msgs[-1]
    print(f"First July msg: line {first_m['start_line']} [{first_m['date']} {first_m['time']}] {first_m['sender']}: {repr(first_m['text'][:60])}")
    print(f"Last July msg: line {last_m['start_line']} [{last_m['date']} {last_m['time']}] {last_m['sender']}: {repr(last_m['text'][:60])}")

with open('scripts/july_whatsapp_messages_TRUE.json', 'w', encoding='utf-8') as f:
    json.dump(july_msgs, f, ensure_ascii=False, indent=2)

print("Saved scripts/july_whatsapp_messages_TRUE.json successfully.")
