import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's map every message from 0 to 758
print(f"Total messages to reconcile: {len(msgs)}")
