import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Devnagari mapping
DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')

def clean_text(text):
    return text.translate(DEVNAGARI_DIGITS)

def has_phone(text):
    t = clean_text(text)
    return bool(re.search(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b', t) or re.search(r'\b[6-9]\d{9}\b', t))

def has_pincode(text):
    t = clean_text(text)
    return bool(re.search(r'\b[1-9]\d{5}\b', t))

def has_order_keywords(text):
    t = clean_text(text).lower()
    keywords = ['spirulina', 'seabuckthorn', 'seebukhthorn', 'moringa', 'ashwagandha', 'ashwaganda', 
                'facewash', 'face pack', 'facepack', 'soap', 'oil', 'shilajit', 'wheat grass', 'b 12',
                'capsule', 'tablet', 'tab', 'powder', 'combo', 'pack']
    return any(k in t for k in keywords)

def has_payment_keywords(text):
    t = clean_text(text).lower()
    return any(k in t for k in ['cod', 'prepaid', 'paid', 'total', 'amount', 'rs', '₹'])

yash_indices = [i for i, m in enumerate(msgs) if m['sender'] == 'Yash R. Suryawanshi']

categories = {
    'clear_order': [],
    'has_phone_or_pin_no_payment': [],
    'payment_or_product_no_address': [],
    'short_chatter': [],
    'deleted_or_media': []
}

for idx in yash_indices:
    m = msgs[idx]
    t = m['text'].strip()
    if not t or t == '<Media omitted>' or 'This message was deleted' in t:
        categories['deleted_or_media'].append((idx, t))
    elif has_phone(t) and (has_order_keywords(t) or has_payment_keywords(t)) and len(t.split('\n')) >= 3:
        categories['clear_order'].append((idx, t))
    elif has_phone(t) or has_pincode(t):
        categories['has_phone_or_pin_no_payment'].append((idx, t))
    elif has_order_keywords(t) or has_payment_keywords(t):
        categories['payment_or_product_no_address'].append((idx, t))
    else:
        categories['short_chatter'].append((idx, t))

for cat, lst in categories.items():
    print(f"{cat}: {len(lst)}")

print("\n--- Listing has_phone_or_pin_no_payment ---")
for idx, t in categories['has_phone_or_pin_no_payment']:
    print(f"IDX {idx}: {repr(t[:80])}")

print("\n--- Listing payment_or_product_no_address ---")
for idx, t in categories['payment_or_product_no_address']:
    print(f"IDX {idx}: {repr(t[:80])}")
