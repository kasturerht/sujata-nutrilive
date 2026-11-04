import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

chat_path = 'scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt'

with open(chat_path, 'r', encoding='utf-8') as f:
    raw_lines = f.readlines()

may_lines = raw_lines[6589:7713] # 0-indexed: line 6590 to 7713 inclusive

msg_header_pattern = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{2}:\d{2})\s*-\s*(.*?)$')

messages = []
current_msg = None

for line_idx, line in enumerate(may_lines, start=6590):
    match = msg_header_pattern.match(line)
    if match:
        if current_msg:
            messages.append(current_msg)
        date_str = match.group(1)
        time_str = match.group(2)
        rest = match.group(3)
        
        # Check if user message or system message
        if ': ' in rest:
            sender, text = rest.split(': ', 1)
        else:
            sender = "SYSTEM"
            text = rest
            
        current_msg = {
            'idx': len(messages),
            'start_line': line_idx,
            'date': date_str,
            'time': time_str,
            'sender': sender.strip(),
            'text': text.strip()
        }
    else:
        if current_msg:
            current_msg['text'] += '\n' + line.strip()

if current_msg:
    messages.append(current_msg)

print(f"Total messages parsed in May 2026: {len(messages)}")

# Fix idx numbering
for i, m in enumerate(messages):
    m['idx'] = i

# Senders breakdown
senders_count = {}
for m in messages:
    s = m['sender']
    senders_count[s] = senders_count.get(s, 0) + 1

print("\n--- Message Breakdown by Sender ---")
for s, c in sorted(senders_count.items(), key=lambda x: -x[1]):
    print(f"  {s}: {c} messages ({c/len(messages):.1%})")

with open('scripts/may_whatsapp_messages_TRUE.json', 'w', encoding='utf-8') as f:
    json.dump(messages, f, ensure_ascii=False, indent=2)

print("\nSaved cleanly to scripts/may_whatsapp_messages_TRUE.json")
