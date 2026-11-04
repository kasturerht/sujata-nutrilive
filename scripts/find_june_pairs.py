import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Find pairs of messages from the same sender within 10 minutes where one might be address and another product/amount
pairs = []
for i in range(len(msgs) - 1):
    m1 = msgs[i]
    m2 = msgs[i+1]
    
    if m1['sender'] == m2['sender'] and m1['date'] == m2['date']:
        t1 = clean(m1['text']).strip()
        t2 = clean(m2['text']).strip()
        
        # Check if one has address/phone/pin and other has products/cod
        has_addr = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b|\b[1-9]\d{5}\b|address|pincode|post|tal|dist', t1, re.I))
        has_prod = bool(re.search(r'spirulina|seabuckthorn|moringa|capsule|tablet|tab|powder|cod|prepaid|paid|\d+[\/-]', t2, re.I))
        
        # or vice versa
        has_addr2 = bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{9}\b|\b[6-9]\d{4}\s*\d{5}\b|\b[1-9]\d{5}\b|address|pincode|post|tal|dist', t2, re.I))
        has_prod1 = bool(re.search(r'spirulina|seabuckthorn|moringa|capsule|tablet|tab|powder|cod|prepaid|paid|\d+[\/-]', t1, re.I))
        
        if (has_addr and has_prod) or (has_addr2 and has_prod1):
            pairs.append((i, i+1, m1['sender'], m1['date'], m1['time'], t1, t2))

print(f"Total candidate pairs found: {len(pairs)}")

with open('scripts/june_pairs_inspection.txt', 'w', encoding='utf-8') as out:
    for idx1, idx2, sender, date, time, t1, t2 in pairs:
        out.write(f"=== PAIR: IDX {idx1} & {idx2} | {sender} | {date} {time} ===\n")
        out.write(f"M1 [IDX {idx1}]:\n{t1}\n")
        out.write(f"M2 [IDX {idx2}]:\n{t2}\n")
        out.write("=" * 60 + "\n\n")

print("Generated scripts/june_pairs_inspection.txt")
