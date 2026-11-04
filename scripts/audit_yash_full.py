import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect all messages sent by Yash that could be orders or order parts
yash_candidates = []
for i, m in enumerate(msgs):
    if m['sender'] == 'Yash R. Suryawanshi':
        t = clean(m['text']).strip()
        yash_candidates.append((i, t))

print(f"Total Yash messages: {len(yash_candidates)}")
