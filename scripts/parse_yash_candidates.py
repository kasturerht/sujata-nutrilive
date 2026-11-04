import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect all 63 candidates and determine which are orders and what multi-parts they have
with open('scripts/yash_63_detailed.txt', 'r', encoding='utf-8') as f:
    text = f.read()

entries = text.split("=== IDX ")
print(f"Total entries: {len(entries)-1}")

for e in entries[1:]:
    lines = e.strip().split("\n")
    header = lines[0]
    idx_str = header.split("|")[0].strip()
    idx = int(idx_str)
    
    # print summary of candidate
    first_lines = "\n".join(lines[1:6])
    print(f"[{idx}] {header}")
    print(first_lines[:150])
    print("-" * 50)
