import json
import re
import sys
import os
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')

# Load July Messages
with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Common clean helpers
def extract_phone(text):
    t = clean(text)
    t_norm = re.sub(r'(\d)\s+(\d)', r'\1\2', t)
    t_norm = re.sub(r'(\d)\s+(\d)', r'\1\2', t_norm)
    m = re.findall(r'(?:\+?91[\s-]?)?([6-9]\d{9})\b', t_norm)
    if m: return m[0]
    m = re.findall(r'\b([6-9]\d{9})\b', t_norm)
    if m: return m[0]
    return ""

def extract_pincode(text):
    t = clean(text)
    m = re.search(r'(?:pin|pincode|code|पिन|पिनकोड)[\s:.-]*([1-9]\d{5})\b', t, re.IGNORECASE)
    if m: return m.group(1)
    m = re.search(r'(?:pin|pincode|code|पिन|पिनकोड)[\s:.-]*([1-9]\d{2})\s+(\d{3})\b', t, re.IGNORECASE)
    if m: return m.group(1) + m.group(2)
    all_pins = re.findall(r'\b([1-9]\d{5})\b', t)
    filtered = [p for p in all_pins if not re.search(r'\d' + p, t) and not re.search(p + r'\d', t)]
    if filtered: return filtered[-1]
    return ""

def extract_amount_and_payment(text):
    t = clean(text).lower()
    t_clean = t.replace(',', '').replace('₹', 'rs').replace('/-', ' ').replace('-/', ' ')
    
    payment_type = "COD"
    if 'prepaid' in t_clean or 'pre-paid' in t_clean or 'paid' in t_clean:
        if 'cod' not in t_clean or t_clean.find('prepaid') < t_clean.find('cod') or 'pre-paid' in t_clean:
            payment_type = "Prepaid"
            
    patterns = [
        r'(?:total\s+amount|total\s+cod|total|amount|amt)[\s:=]*(\d{3,5})\b',
        r'(?:cod|prepaid|paid)[\s:=]*(\d{3,5})\b',
        r'(\d{3,5})\s*(?:cod|prepaid|paid)\b',
        r'(?:rs\.?|inr)[\s:=]*(\d{3,5})\b',
        r'(\d{3,5})\s*(?:rs|inr)\b',
    ]
    amount = 0
    for pat in patterns:
        m = re.search(pat, t_clean)
        if m:
            val = int(m.group(1))
            if 150 <= val <= 50000:
                amount = val
                break
    if not amount:
        m_plus = re.search(r'(\d{3,4})\s*\+\s*(\d{2,3})', t_clean)
        if m_plus:
            amount = int(m_plus.group(1)) + int(m_plus.group(2))
    return amount, payment_type

def extract_customer_name(text):
    t = clean(text).strip()
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    if not lines: return "ग्राहक"
    first = lines[0]
    # Check prefixes
    for prefix in ['name', 'नाव', 'to', 'cust name', 'customer name', 'name:']:
        if first.lower().startswith(prefix):
            cleaned = re.sub(r'^(?:name|नाव|to|cust name|customer name)[\s:.-]*', '', first, flags=re.IGNORECASE).strip()
            if cleaned: return cleaned
    # Check if first line has phone number, if so take name after/before or next line
    if re.search(r'\b[6-9]\d{9}\b', first) and len(lines) > 1:
        # maybe format "Phone \n Name"
        name_cand = re.sub(r'(?:\+?91[\s-]?)?[6-9]\d{9}', '', first).strip()
        if len(name_cand) > 3: return name_cand
        return lines[1]
    # Remove phone from first line if present
    cleaned = re.sub(r'\(?\+?91[\s-]?[6-9]\d{9}\)?', '', first).strip()
    cleaned = re.sub(r'\b[6-9]\d{9}\b', '', cleaned).strip()
    if cleaned and len(cleaned) > 2:
        return cleaned
    if len(lines) > 1:
        return lines[1]
    return "ग्राहक"

def extract_products(text):
    t = clean(text)
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    prod_lines = []
    keywords = ['spirulina', 'seabuckthorn', 'seebukhthorn', 'moringa', 'ashwagandha', 'ashwaganda',
                'facewash', 'face pack', 'facepack', 'soap', 'oil', 'shilajit', 'wheat grass', 'b 12',
                'capsule', 'tablet', 'tab', 'powder', 'combo', 'pack', 'korean cream', 'bride cream']
    for l in lines:
        if any(k in l.lower() for k in keywords):
            # clean out price/cod if appended
            l_clean = re.sub(r'(?:cod|prepaid|paid)[\s:=]*\d+.*$', '', l, flags=re.IGNORECASE).strip()
            l_clean = re.sub(r'\d+\s*(?:\/-|-\/|\/)\s*(?:cod|prepaid|paid)?.*$', '', l_clean, flags=re.IGNORECASE).strip()
            if l_clean:
                prod_lines.append(l_clean)
    if prod_lines:
        return ", ".join(prod_lines)
    return "स्पिरुलिना / सीबकथॉर्न कॉम्बो"

print("Helper functions verified.")
