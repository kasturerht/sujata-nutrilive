import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

with open('scripts/verified_october_telecaller_orders.json', 'r', encoding='utf-8') as f:
    v = json.load(f)

def audit_caller(exact_sender, caller_name, old_orders):
    c_msgs = [m for m in msgs if m['sender'] == exact_sender]
    print(f"\n=======================================================")
    print(f"AUDITING {caller_name}: {len(c_msgs)} messages")
    print(f"Old verified count: {len(old_orders)}")
    print(f"=======================================================")
    
    orders = []
    non_orders = []
    
    for idx, m in enumerate(c_msgs, 1):
        t = m['text'].strip()
        if t in ['<Media omitted>', 'This message was deleted'] or 'cancel' in t.lower() or 'donda takli' in t.lower() or 'already hyanni cancel keleli' in t.lower() or 'cancel keleli order' in t.lower():
            non_orders.append((idx, m, 'Media/Deleted/Cancelled'))
            continue
            
        has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
        has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
        has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina', t, re.I))
        has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I))
        is_web = 'SUJATA NUTRILIVE — NEW ORDER' in t or 'Website order' in t
        is_office = 'office' in t.lower() and ('prepaid' in t.lower() or 'delivered' in t.lower() or 'cash' in t.lower())
        
        if (has_phone or has_pin) and (has_prod or has_cod_pre or is_web) and len(t) > 30:
            orders.append((idx, m))
        elif is_web or is_office:
            orders.append((idx, m))
        else:
            non_orders.append((idx, m, 'Chatter / status'))
            
    print(f"Detected Orders: {len(orders)}")
    print(f"Non-Orders: {len(non_orders)}")
    
    old_indices = {o['idx'] for o in old_orders}
    new_found = [o for o in orders if o[0] not in old_indices]
    print(f"New / unrecorded orders: {len(new_found)}")
    for idx, m in new_found:
        print(f"  NEW: Msg #{idx} [{m['date']} {m['time']}]: {repr(m['text'].replace(chr(10), ' ')[:70])}")
        
    return orders

audit_caller('Sujata Nutrilive Agrotech Punam kasture', 'Punam Kasture', v['Punam Kasture']['orders'])
audit_caller('Karishma Patil Sujata Nutrilive', 'Karishma Patil', v['Karishma Patil']['orders'])
audit_caller('Sujata Nutrilive', 'Monu', v['Monu']['orders'])
