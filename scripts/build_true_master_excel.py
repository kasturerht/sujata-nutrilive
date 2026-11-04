import json
import re
import sys
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total October TRUE messages: {len(msgs)}")

from test_extractor import extract_order_fields

# 1. Identify all orders for each telecaller
caller_configs = [
    {
        'key': 'Manju',
        'display': 'Manjushree Kasture',
        'marathi': 'मंजुश्री कस्तुरे',
        'filter': lambda m: 'Manju' in m['sender']
    },
    {
        'key': 'Vaishnavi',
        'display': 'Vaishnavi Diwate',
        'marathi': 'वैष्णवी दिवटे',
        'filter': lambda m: 'Vaishnavi' in m['sender']
    },
    {
        'key': 'Monu',
        'display': 'Monu',
        'marathi': 'मोनू',
        'filter': lambda m: m['sender'] == 'Sujata Nutrilive'
    },
    {
        'key': 'Punam',
        'display': 'Punam Kasture',
        'marathi': 'पूनम कस्तुरे',
        'filter': lambda m: 'Punam' in m['sender']
    },
    {
        'key': 'Karishma',
        'display': 'Karishma Patil',
        'marathi': 'करिश्मा पाटील',
        'filter': lambda m: 'Karishma' in m['sender']
    },
    {
        'key': 'Yash',
        'display': 'Yash Suryawanshi (Founder Direct)',
        'marathi': 'यश सूर्यवंशी (फाउंडर डायरेक्ट)',
        'filter': lambda m: m['sender'] == 'Yash R. Suryawanshi'
    }
]

def is_order_message(m, caller_key):
    t = m['text'].strip()
    if t in ['<Media omitted>', 'This message was deleted']:
        return False
    if 'donda takli ahe delete kara' in t.lower() or 'this order is cancelled' in t.lower() or 'cancel keleli order' in t.lower():
        return False
    if 'hi order cancel kara' in t.lower() or 'order cancel kara' in t.lower():
        return False
    if caller_key == 'Yash':
        if 'pack kartana check kara' in t or 'porter karshil monu' in t or 'cancel' in t.lower() or 'dispatch zali' in t.lower():
            return False
        if len(t) < 40:
            return False
            
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina', t, re.I))
    has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I))
    is_web = 'SUJATA NUTRILIVE — NEW ORDER' in t or 'Website order' in t or '• ₹' in t
    is_office = 'office' in t.lower() and ('prepaid' in t.lower() or 'delivered' in t.lower() or 'cash' in t.lower())
    
    if (has_phone or has_pin) and (has_prod or has_cod_pre or is_web) and len(t) > 30:
        return True
    if is_web:
        return True
    if is_office and ('1700' in t or '2400' in t or '1500' in t or 'hair oil' in t.lower() or 'facepack' in t.lower()):
        return True
    return False

all_extracted_orders = []
sr = 1

for cfg in caller_configs:
    caller_msgs = [m for m in msgs if cfg['filter'](m)]
    caller_orders = []
    for m in caller_msgs:
        if is_order_message(m, cfg['key']):
            rec = extract_order_fields(m, cfg['display'], 'Founder Direct Order' if cfg['key'] == 'Yash' else None)
            rec['Sr No'] = sr
            caller_orders.append(rec)
            all_extracted_orders.append(rec)
            sr += 1
    print(f"{cfg['display']}: {len(caller_orders)} orders detected.")

print(f"\nTotal Orders Across All Sources: {len(all_extracted_orders)}")

# Check for any zero amounts
zeroes = [o for o in all_extracted_orders if o['amount'] == 0]
print(f"Zero amount orders: {len(zeroes)}")
for z in zeroes:
    print(f"  Sr #{z['Sr No']} [{z['date']}] {z['caller']} - {z['name']}: {z['products']}")
