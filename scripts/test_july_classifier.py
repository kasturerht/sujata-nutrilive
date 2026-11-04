import json
import re
import sys
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEV_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
STAFF_PHONES = {
    '9922534443', '9272471529', '9922500344', '9922577344',
    '9503434653', '9096759653', '8600140344', '9518505481',
    '9607259661', '8805168275'
}

def clean_phone(p):
    p = str(p).translate(DEV_DIGITS)
    p = re.sub(r'[\s\-\(\)\+]', '', p)
    if p.startswith('91') and len(p) == 12:
        p = p[2:]
    elif len(p) == 11 and p.startswith(('9', '8', '7')):
        p = p[:10]
    return p

def clean_address_text(addr, phones, pin, cust_name):
    addr = str(addr).translate(DEV_DIGITS)
    for p in phones:
        addr = re.sub(rf'(?:Mob|Mobile|Phone|Ph|Mo\.|Mb)?\s*[:=-]?\s*(?:\+91[\-\s]?)?{p}\b', '', addr, flags=re.I)
    addr = re.sub(r'(?:Mob|Mobile|Phone|Ph|Mo\.|Mb)\s*[:=-]?\s*[\d\s\+\-\/]{10,}', '', addr, flags=re.I)
    addr = re.sub(r'(?:COD|Prepaid|Paid|Advance)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*\d+(?:\.\d{1,2})?(?:\s*(?:\/-|\+)\s*(?:delivery\s*charges?)?\s*\d*)?', '', addr, flags=re.I)
    addr = re.sub(r'(?:rs\.?|inr|₹)\s*\d+(?:\.\d{1,2})?(?:\s*(?:\/-|\+)\s*(?:delivery\s*charges?)?\s*\d*)?', '', addr, flags=re.I)
    addr = re.sub(r'\d+\s*(?:\/-|\/|\-)\s*(?:COD|Prepaid|Paid)', '', addr, flags=re.I)
    addr = re.sub(r'Payment\s*Mode\s*:\s*[^\n\r,]+', '', addr, flags=re.I)
    addr = re.sub(r'<This message was edited>', '', addr, flags=re.I)
    addr = re.sub(r'\bOrder on hold\b', '', addr, flags=re.I)
    addr = re.sub(r'\bWebsite order\b', '', addr, flags=re.I)
    addr = re.sub(r'[━•]', '', addr)
    addr = re.sub(r'\bSample Requirements:\b', '', addr, flags=re.I)
    if cust_name and cust_name != 'Customer':
        addr = re.sub(rf'^(?:Name|नाव|Customer\s*Name)?\s*[:=-]?\s*{re.escape(cust_name)}\s*[,.:-]?\s*', '', addr, flags=re.I)
    addr = re.sub(r'^(?:Mo\.|Mb\.|Phone|Mob|Ph|Mobile\s*Number|Mobile\s*No\.?)\s*[,.:-]?\s*', '', addr, flags=re.I)
    addr = re.sub(r'^(?:Mobile\s*-\s*\(\+91\)\.?|Mob\s*no)\s*[,.:-]?\s*', '', addr, flags=re.I)
    addr = re.sub(r'[,]+', ', ', addr)
    addr = re.sub(r'\s+', ' ', addr)
    return addr.strip(' ,.-')

def get_telecaller_name(sender):
    if 'Manju' in sender:
        return 'मंजुश्री कस्तुरे'
    if 'Punam' in sender:
        return 'पूनम कस्तुरे'
    if sender == 'Sujata Nutrilive':
        return 'मोनू'
    if '+91 88051 68275' in sender:
        return 'टेलिकॉलर (+91 88051 68275)'
    if 'Yash' in sender:
        return 'यश सूर्यवंशी (फाउंडर डायरेक्ट)'
    if 'Om Amazon' in sender or '98900 70524' in sender or 'RK' in sender:
        return 'वेअरहाऊस डिस्पॅच'
    return sender

# Multi-message pairings in July:
# Let's inspect potential pairs
# We'll map main_idx -> (list_of_subs, note)
print("Classifier script initialized.")
