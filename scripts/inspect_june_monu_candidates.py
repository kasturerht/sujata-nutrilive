import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

monu_candidates = []
for m in msgs:
    if m['sender'] == 'Sujata Nutrilive':
        t = clean(m['text']).strip()
        has_phone = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b', t))
        has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
        if has_phone or has_pin:
            monu_candidates.append(m['idx'])

print(f"Total Monu candidate indices: {len(monu_candidates)}")
print(monu_candidates)

for idx in monu_candidates:
    m = msgs[idx]
    print(f"\n==================== CANDIDATE IDX {idx} | {m['date']} {m['time']} ====================")
    print(clean(m['text']).strip())
    # check adjacent
    if idx > 0 and msgs[idx-1]['sender'] == 'Sujata Nutrilive':
        print(f"  [PREV IDX {idx-1}]: {repr(clean(msgs[idx-1]['text'])[:60])}")
    if idx < len(msgs) - 1 and msgs[idx+1]['sender'] == 'Sujata Nutrilive':
        print(f"  [NEXT IDX {idx+1}]: {repr(clean(msgs[idx+1]['text'])[:60])}")
