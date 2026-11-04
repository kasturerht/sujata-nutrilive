import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/yash_63_detailed.txt', 'r', encoding='utf-8') as f:
    text = f.read()

entries = text.split("=== IDX ")

with open('scripts/yash_all_candidates_inspected.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total Yash candidate entries: {len(entries)-1}\n\n")
    for i, e in enumerate(entries[1:], 1):
        out.write(f"**************** CANDIDATE {i} ****************\n")
        out.write(e.strip() + "\n\n")

print("Successfully written UTF-8 file.")
