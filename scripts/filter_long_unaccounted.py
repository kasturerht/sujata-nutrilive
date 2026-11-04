import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/long_unaccounted.txt', 'r', encoding='utf-8') as f:
    text = f.read()

entries = text.split("=== IDX ")

for e in entries[1:]:
    lines = e.strip().split("\n")
    header = lines[0]
    body = "\n".join(lines[1:])
    # check if body has any phone number, pin code, or order keywords
    has_digits = len(re.findall(r'\d{3,}', body)) > 0
    has_caps = bool(re.search(r'\b(spirulina|capsule|tablet|bottel|bottle|soap|cream|shampoo|moringa|ashwagandha|cod|prepaid)\b', body, re.IGNORECASE))
    
    if has_digits or has_caps:
        print(f"[{header}]")
        print(body[:120])
        print("-" * 40)
