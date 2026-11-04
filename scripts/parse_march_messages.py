import sys, re, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Extract lines from 4473 to 5650 (1-indexed, so 4472 to 5650 0-indexed)
mar_raw_lines = lines[4472:5650]

msg_pattern = re.compile(r'^(\d{2}/\d{2}/\d{4},\s\d{1,2}:\d{2})\s-\s([^:]+?):\s(.*)$')
sys_pattern = re.compile(r'^(\d{2}/\d{2}/\d{4},\s\d{1,2}:\d{2})\s-\s(.*)$')

messages = []
curr = None

for line_idx, line in enumerate(mar_raw_lines, start=4473):
    m = msg_pattern.match(line)
    if m:
        if curr:
            messages.append(curr)
        curr = {
            'index': len(messages) + 1,
            'line_start': line_idx,
            'timestamp': m.group(1),
            'sender': m.group(2).strip(),
            'content': m.group(3).strip()
        }
    else:
        sm = sys_pattern.match(line)
        if sm and not ':' in line[line.find(' - ') + 3:]:
            if curr:
                messages.append(curr)
            curr = {
                'index': len(messages) + 1,
                'line_start': line_idx,
                'timestamp': sm.group(1),
                'sender': 'SYSTEM',
                'content': sm.group(2).strip()
            }
        else:
            if curr:
                if curr['content']:
                    curr['content'] += '\n' + line.strip()
                else:
                    curr['content'] = line.strip()
            else:
                print(f'Warning: unhandled line {line_idx}: {line.strip()}')

if curr:
    messages.append(curr)

print(f'Total parsed messages in March 2026: {len(messages)}')
with open('scripts/march_whatsapp_messages_TRUE.json', 'w', encoding='utf-8') as f:
    json.dump(messages, f, ensure_ascii=False, indent=2)

# Senders breakdown
senders = {}
for m in messages:
    s = m['sender']
    senders[s] = senders.get(s, 0) + 1

print("\n--- Senders Breakdown in March 2026 ---")
for s, c in sorted(senders.items(), key=lambda x: x[1], reverse=True):
    print(f'{s}: {c}')
