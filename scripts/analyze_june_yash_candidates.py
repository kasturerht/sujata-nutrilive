import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Read june_yash_candidates.txt and parse
with open('scripts/june_yash_candidates.txt', 'r', encoding='utf-8') as f:
    text = f.read()

blocks = text.split("=" * 50)
print(f"Total blocks in yash candidates: {len(blocks) - 1}")

# Let's inspect the candidate indices
candidate_indices = []
for b in blocks[:-1]:
    m = re.search(r'IDX\s+(\d+)', b)
    if m:
        candidate_indices.append(int(m.group(1)))

print("Candidate indices:", candidate_indices)
