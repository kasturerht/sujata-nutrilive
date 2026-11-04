import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Helper functions for field extraction
def extract_pincode(text):
    t = clean(text)
    # Match standard 6-digit pin code
    # Avoid matching phone numbers
    # Look for pin/pincode pattern first
    m = re.search(r'(?:pin|pincode|code|पिन|पिनकोड)[\s:.-]*([1-9]\d{5})\b', t, re.IGNORECASE)
    if m: return m.group(1)
    m = re.search(r'(?:pin|pincode|code|पिन|पिनकोड)[\s:.-]*([1-9]\d{2})\s+(\d{3})\b', t, re.IGNORECASE)
    if m: return m.group(1) + m.group(2)
    # Fallback to any 6-digit number that starts with 1-9
    all_pins = re.findall(r'\b([1-9]\d{5})\b', t)
    # Filter out if it is part of a 10 digit number
    filtered = []
    for p in all_pins:
        # Check if preceded or followed by digits
        if not re.search(r'\d' + p, t) and not re.search(p + r'\d', t):
            # Check not part of phone
            filtered.append(p)
    if filtered:
        return filtered[-1]
    return ""

def extract_phone(text):
    t = clean(text)
    # Remove obvious non-phone sequences
    # Try finding 10 digit numbers starting with 6-9
    # Handle spaces: e.g. 96 57 66 65 01 or 98902 67652
    t_norm = re.sub(r'(\d)\s+(\d)', r'\1\2', t)
    t_norm = re.sub(r'(\d)\s+(\d)', r'\1\2', t_norm)
    
    m = re.findall(r'(?:\+?91[\s-]?)?([6-9]\d{9})\b', t_norm)
    if m:
        return m[0]
    # Check international or other
    m = re.findall(r'\b([6-9]\d{9})\b', t_norm)
    if m:
        return m[0]
    return ""

def extract_amount_and_payment(text):
    t = clean(text).lower()
    # Normalize
    t = t.replace(',', '').replace('₹', 'rs').replace('/-', ' ').replace('-/', ' ')
    
    payment_type = "COD"
    if 'prepaid' in t or 'pre-paid' in t or 'paid' in t:
        if 'cod' not in t or t.find('prepaid') < t.find('cod'):
            payment_type = "Prepaid"
            
    # Amount patterns:
    # 1. cod/prepaid 950 or 950 cod/prepaid
    patterns = [
        r'(?:total\s+amount|total\s+cod|total|amount|amt)[\s:=]*(\d{3,5})\b',
        r'(?:cod|prepaid|paid)[\s:=]*(\d{3,5})\b',
        r'(\d{3,5})\s*(?:cod|prepaid|paid)\b',
        r'(?:rs\.?|inr)[\s:=]*(\d{3,5})\b',
        r'(\d{3,5})\s*(?:rs|inr)\b',
    ]
    
    amount = 0
    for pat in patterns:
        m = re.search(pat, t)
        if m:
            val = int(m.group(1))
            # sanity check: amount between 150 and 50000
            if 150 <= val <= 50000:
                amount = val
                break
                
    # If no amount found, check explicit combinations like "850 + 50"
    if not amount:
        m_plus = re.search(r'(\d{3,4})\s*\+\s*(\d{2,3})', t)
        if m_plus:
            amount = int(m_plus.group(1)) + int(m_plus.group(2))
            
    return amount, payment_type

print("Helper functions ready.")
