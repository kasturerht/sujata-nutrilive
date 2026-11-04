import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

from filter_yash_candidates import yash_candidates

print(f"Inspecting all {len(yash_candidates)} Yash candidates...")

with open('scripts/yash_63_detailed.txt', 'w', encoding='utf-8') as out:
    for idx in yash_candidates:
        m = msgs[idx]
        out.write(f"=== IDX {idx:3d} | {m['date']} {m['time']} ===\n")
        out.write(clean(m['text']).strip() + "\n")
        # Print following messages from Yash
        for offset in range(1, 4):
            nxt = idx + offset
            if nxt < len(msgs):
                nm = msgs[nxt]
                if nm['sender'] == 'Yash R. Suryawanshi':
                    out.write(f"  +NEXT {offset} (IDX {nxt} Yash): {repr(clean(nm['text']).strip())}\n")
                elif nm['sender'] == 'Sujata Nutrilive':
                    out.write(f"  +NEXT {offset} (IDX {nxt} Monu): {repr(clean(nm['text']).strip()[:60])}\n")
        out.write("-" * 50 + "\n\n")

print("Generated scripts/yash_63_detailed.txt")
