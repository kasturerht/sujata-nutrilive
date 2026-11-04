import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pattern = sys.argv[1]

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    chat_lines = f.readlines()

print(f"Searching for: {pattern}")
matches = 0
for idx, line in enumerate(chat_lines):
    if re.search(pattern, line, re.IGNORECASE):
        matches += 1
        print(f"Line {idx+1}: {line.strip()}")
        # print 1 line before and after
        if idx > 0:
            print(f"   prev: {chat_lines[idx-1].strip()}")
        if idx + 1 < len(chat_lines):
            print(f"   next: {chat_lines[idx+1].strip()}")
        print("-" * 40)

print(f"Total matches: {matches}")
