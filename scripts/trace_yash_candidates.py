import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect all candidate orders from Yash.
# Let's write a script that displays all candidate blocks from Yash with full details
# and check if we have any ambiguities.

yash_indices = [i for i, m in enumerate(msgs) if m['sender'] == 'Yash R. Suryawanshi']

# Known paired order groups for Yash:
# Let's write a function to detect each Yash order group
