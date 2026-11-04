import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect all potential Yash orders:
# For each Yash message with address/customer, let's see what follows it!
yash_orders = []

i = 0
while i < len(msgs):
    m = msgs[i]
    sender = m['sender']
    t = clean(m['text']).strip()
    
    # We want to identify if m is an order, or the start of a paired order
    # Let's write out each case
    i += 1
