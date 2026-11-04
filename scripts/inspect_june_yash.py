import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

yash_candidates = []
for m in msgs:
    if m['sender'] == 'Yash R. Suryawanshi':
        t = clean(m['text']).strip()
        has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b', t))
        has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
        lines = [l for l in t.split('\n') if l.strip()]
        if (has_phone or has_pin) and 'pinned a message' not in t:
            yash_candidates.append((m['idx'], len(lines), lines[0], t))

print(f"Total Yash candidate messages: {len(yash_candidates)}")
with open('scripts/june_yash_candidates.txt', 'w', encoding='utf-8') as out:
    for idx, n_lines, first, t in yash_candidates:
        out.write(f"IDX {idx:3d} | Lines: {n_lines} | First: {first[:50]}\n")
        out.write(t + "\n")
        out.write("=" * 50 + "\n")

print("Generated scripts/june_yash_candidates.txt")
