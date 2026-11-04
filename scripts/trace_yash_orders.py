import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect every message of Yash where text is not deleted and not empty
with open('scripts/yash_analysis.txt', 'w', encoding='utf-8') as out:
    for i, m in enumerate(msgs):
        if m['sender'] == 'Yash R. Suryawanshi':
            t = clean(m['text']).strip()
            if t and t != '<Media omitted>' and 'This message was deleted' not in t:
                out.write(f"IDX {i:3d} | {m['date']} {m['time']}\n{t}\n")
                out.write("=" * 50 + "\n")

print("Written yash_analysis.txt")
