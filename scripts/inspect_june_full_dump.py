import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Write all messages to text dump for complete visibility
with open('scripts/june_all_messages_dump.txt', 'w', encoding='utf-8') as out:
    for m in msgs:
        out.write(f"IDX {m['idx']:3d} | {m['sender']} | {m['date']} {m['time']}\n")
        out.write(clean(m['text']).strip() + "\n")
        out.write("=" * 60 + "\n")

print(f"Dumped all {len(msgs)} messages to scripts/june_all_messages_dump.txt")
