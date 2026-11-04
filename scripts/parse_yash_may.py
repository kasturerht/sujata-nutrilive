import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/yash_may_candidates.txt', 'r', encoding='utf-8') as f:
    text = f.read()

entries = text.split("=== IDX ")
print(f"Total Yash candidate entries in May: {len(entries)-1}")

with open('scripts/yash_may_candidates_inspected.txt', 'w', encoding='utf-8') as out:
    for i, e in enumerate(entries[1:], 1):
        lines = e.strip().split("\n")
        header = lines[0]
        body = "\n".join(lines[1:])
        out.write(f"**************** CANDIDATE {i} [IDX {header.split('|')[0].strip()}] ****************\n")
        out.write(e.strip() + "\n\n")

print("Saved to scripts/yash_may_candidates_inspected.txt")
