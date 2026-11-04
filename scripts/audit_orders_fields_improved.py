import sys
sys.stdout.reconfigure(encoding='utf-8')

import json
import re

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

def normalize_line_spaces(text):
    lines = []
    for line in text.split('\n'):
        l = line
        while re.search(r'(\d)[ \t]+(\d)', l):
            l = re.sub(r'(\d)[ \t]+(\d)', r'\1\2', l)
        lines.append(l)
    return '\n'.join(lines)

def extract_phone(text):
    t = normalize_line_spaces(clean(text))
    m = re.findall(r'(?:\+?91[\s-]?)?([6-9]\d{9})\b', t)
    if m: return m[0]
    m = re.findall(r'\b([6-9]\d{9})\b', t)
    if m: return m[0]
    m = re.findall(r'(?:\+?91[\s-]?)?([6-9]\d{8,9})\b', t)
    if m: return m[0]
    return ""

def extract_pincode(text):
    t = normalize_line_spaces(clean(text))
    m = re.search(r'(?:pin|pincode|code|पिन|पिनकोड)[\s:.-]*([1-9]\d{5})\b', t, re.IGNORECASE)
    if m: return m.group(1)
    all_pins = re.findall(r'\b([1-9]\d{5})\b', t)
    filtered = [p for p in all_pins if not re.search(r'\d' + p, t) and not re.search(p + r'\d', t)]
    if filtered: return filtered[-1]
    return ""

from test_july_reconciliation_exact import ALL_ORDERS

print("Re-auditing orders fields...")
issues = []
for i, order in enumerate(ALL_ORDERS, 1):
    main_idx = order['main_idx']
    merged = order['merged_idxs']
    custom = order['custom']
    
    all_idxs = [main_idx] + merged
    combined_raw = "\n".join([msgs[i]['text'] for i in all_idxs])
    combined_clean = clean(combined_raw)
    
    name = custom.get('customer_name')
    phone = custom.get('phone') or extract_phone(combined_clean)
    pin = custom.get('pincode') or extract_pincode(combined_clean)
    amt = custom.get('amount')
    flag = custom.get('audit_flag', '')
    
    missing = []
    if not phone: missing.append("Phone missing")
    if not pin: missing.append("Pincode missing")
    if amt == 0 and 'सॅम्पल' not in flag and 'Sample' not in flag and 'Linked' not in flag:
        missing.append("Amount 0")
        
    if missing:
        issues.append((i, main_idx, order['telecaller'], name, phone, pin, amt, ", ".join(missing)))

print(f"Remaining flagged orders: {len(issues)}")
for item in issues:
    print(item)
