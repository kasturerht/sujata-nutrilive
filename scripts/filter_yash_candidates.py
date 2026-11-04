import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Filter out Monu's tag from candidate phone detection
def has_customer_phone(text):
    t = clean(text)
    # Remove mentions of @+91 95034 34653
    t_no_tag = re.sub(r'@\s*(?:\+?91[\s-]?)?95034[\s-]?34653', '', t)
    # Match any 10-digit number
    m = re.findall(r'(?:\+?91[\s-]?)?([6-9]\d{9})\b', t_no_tag)
    return bool(m)

def has_pincode(text):
    t = clean(text)
    return bool(re.search(r'\b[1-9]\d{5}\b', t))

# Inspect Yash candidates without Monu tag
yash_candidates = []
for m in msgs:
    if m['sender'] == 'Yash R. Suryawanshi':
        t = clean(m['text']).strip()
        if not t or t == '<Media omitted>' or 'This message was deleted' in t:
            continue
        hp = has_customer_phone(t)
        hpin = has_pincode(t)
        lines = [l for l in t.split('\n') if l.strip()]
        if (hp or hpin) and 'pinned a message' not in t:
            yash_candidates.append(m['idx'])

print(f"Yash candidates after excluding Monu tag: {len(yash_candidates)}")
print(yash_candidates)
