import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Read yash_63_detailed.txt to group orders and merged parts
# Let's inspect each candidate index in 63 candidates
from filter_yash_candidates import yash_candidates

print(f"Total candidates: {len(yash_candidates)}")
