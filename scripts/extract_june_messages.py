import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

chat_path = r'scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt'

with open(chat_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in chat file: {len(lines):,}")

# Pattern for message start: "DD/MM/YYYY, HH:MM - Sender: Message" or "DD/MM/YYYY, HH:MM - Message"
msg_pattern = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{2}:\d{2})\s*-\s*(.*?)$')

june_messages = []
current_msg = None
start_june_line = -1
end_june_line = -1

for line_idx, line in enumerate(lines, 1):
    m = msg_pattern.match(line)
    if m:
        date_str, time_str, rest = m.groups()
        # Check if June 2026: "/06/2026"
        if date_str.endswith('/06/2026'):
            if start_june_line == -1:
                start_june_line = line_idx
            end_june_line = line_idx
            
            # Save previous if it was June
            if current_msg and current_msg['date'].endswith('/06/2026'):
                june_messages.append(current_msg)
                
            # Parse sender
            if ': ' in rest:
                sender, text = rest.split(': ', 1)
            else:
                sender = 'SYSTEM'
                text = rest
                
            current_msg = {
                'idx': len(june_messages),
                'date': date_str,
                'time': time_str,
                'sender': sender.strip(),
                'text': text,
                'start_line': line_idx
            }
        else:
            # If we were in June and now date is after June, save last June msg
            if current_msg and current_msg['date'].endswith('/06/2026'):
                june_messages.append(current_msg)
                current_msg = None
    else:
        # Multiline continuation
        if current_msg and current_msg['date'].endswith('/06/2026'):
            current_msg['text'] += line

if current_msg and current_msg['date'].endswith('/06/2026'):
    june_messages.append(current_msg)

print(f"June 2026 Line Range: {start_june_line} to {end_june_line}")
print(f"Total June 2026 Messages Extracted: {len(june_messages)}")

# Update idx in june_messages
for i, m in enumerate(june_messages):
    m['idx'] = i

with open('scripts/june_whatsapp_messages_TRUE.json', 'w', encoding='utf-8') as f:
    json.dump(june_messages, f, ensure_ascii=False, indent=2)

print("Saved to scripts/june_whatsapp_messages_TRUE.json")
