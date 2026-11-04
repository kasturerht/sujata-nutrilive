import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect messages around each potential order
# First, let's categorize each message into:
# - Candidate Order Main (has customer details)
# - Candidate Order Part (product/amount continuation)
# - Definite Chatter / Status / Media / Deleted / System

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')

def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect indices 0 to 50
print("=== INSPECTING FIRST 50 MESSAGES ===")
for i in range(50):
    m = msgs[i]
    print(f"IDX {i:3d} | {m['sender']:<25} | {m['date']} {m['time']} | {repr(clean(m['text']).strip()[:60])}")
