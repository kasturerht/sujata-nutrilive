import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total messages: {len(msgs)}")
yash_msgs = [(i, m) for i, m in enumerate(msgs) if m['sender'] == 'Yash R. Suryawanshi']
print(f"Total Yash messages: {len(yash_msgs)}")

# Print all Yash messages with their index, date, time, and text
with open('scripts/yash_all_dump.txt', 'w', encoding='utf-8') as out:
    for idx, m in yash_msgs:
        t = m['text']
        out.write(f"IDX {idx} | {m['date']} {m['time']}\n")
        out.write(t + "\n")
        out.write("=" * 60 + "\n")

print("Dumped all Yash messages to scripts/yash_all_dump.txt")
