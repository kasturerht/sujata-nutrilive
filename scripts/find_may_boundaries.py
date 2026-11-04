import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

chat_path = 'scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt'

with open(chat_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in chat: {len(lines)}")

# WhatsApp timestamp regex: e.g. 02/05/2025 or 01/05/2026
msg_start_regex = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{2}:\d{2})\s*-\s*([^:]+?):\s*(.*)$')
system_regex = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{2}:\d{2})\s*-\s*(.*)$')

# Find where May 2026 starts and ends
may_2026_lines = []
for idx, line in enumerate(lines):
    m = msg_start_regex.match(line) or system_regex.match(line)
    if m:
        dt = m.group(1)
        if dt.endswith('/05/2026'):
            may_2026_lines.append((idx + 1, dt, line.strip()))

if may_2026_lines:
    print(f"May 2026 line range: {may_2026_lines[0][0]} ({may_2026_lines[0][1]}) to {may_2026_lines[-1][0]} ({may_2026_lines[-1][1]})")
    print(f"Total May 2026 message start lines: {len(may_2026_lines)}")
    print("First 3:", may_2026_lines[:3])
    print("Last 3:", may_2026_lines[-3:])
else:
    print("No lines matching /05/2026 found. Checking other years or formats...")
    # Check what months exist before June 2026 (line 7714)
    dates_found = set()
    for line in lines[:7715]:
        m = re.match(r'^(\d{2}/\d{2}/\d{4})', line)
        if m:
            dates_found.add(m.group(1)[3:])
    print("Months found before June 2026:", sorted(list(dates_found)))
