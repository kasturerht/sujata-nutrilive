import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/telecallers_all_messages_october.json', 'r', encoding='utf-8') as f:
    caller_msgs = json.load(f)

with open('scripts/verified_october_telecaller_orders.json', 'r', encoding='utf-8') as f:
    verified_data = json.load(f)

for caller_key in ['Vaishnavi Diwate', 'Manjushree Kasture', 'Punam Kasture', 'Karishma Patil', 'Monu']:
    c_msgs = caller_msgs[caller_key]
    info = verified_data[caller_key]
    orders = info['directOrders'] + info['webOrders'] if caller_key == 'Manjushree Kasture' else info['orders']
    
    for o in orders:
        orig = c_msgs[o['idx'] - 1]['text']
        # check pincode
        pin_m = re.search(r'(?:pin|pincode|post\s*code|code|pine)\s*[-:]?\s*(\d{3}\s*\d{3})\b', orig, re.IGNORECASE)
        pin = ''
        if pin_m:
            pin = pin_m.group(1).replace(' ', '')
        else:
            phones = re.findall(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', orig)
            t_no_p = orig
            for p in phones:
                t_no_p = t_no_p.replace(p, ' ')
            m6 = re.findall(r'\b([1-9]\d{2}\s*\d{3})\b', t_no_p)
            for c in m6:
                c_clean = c.replace(' ', '')
                if not c_clean.startswith('2026') and not c_clean.startswith('2024'):
                    pin = c_clean
                    break
        
        if not pin and o.get('type') != 'Office Delivery' and 'office' not in orig.lower():
            print(f"Missing PIN: [{caller_key} #{o['idx']}]")
            print(orig)
            print("-" * 40)
