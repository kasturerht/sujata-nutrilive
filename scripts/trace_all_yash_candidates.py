import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Print all Yash messages with line count, whether it has digits, whether it has keywords
with open('scripts/yash_detailed_inventory.txt', 'w', encoding='utf-8') as out:
    for i, m in enumerate(msgs):
        if m['sender'] == 'Yash R. Suryawanshi':
            t = clean(m['text']).strip()
            out.write(f"IDX {i:3d} | {m['date']} {m['time']} | {repr(t)}\n")

print("Generated yash_detailed_inventory.txt")
