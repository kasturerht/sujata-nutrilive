import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total TRUE October messages: {len(msgs)}")

def audit_sender(sender_key, label):
    sender_msgs = [m for m in msgs if sender_key in m['sender']]
    print(f"\n=======================================================")
    print(f"AUDITING {label}: {len(sender_msgs)} messages")
    print(f"=======================================================")
    
    orders = []
    non_orders = []
    
    for idx, m in enumerate(sender_msgs, 1):
        t = m['text'].strip()
        has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
        has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
        has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina', t, re.I))
        has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I))
        is_web = 'SUJATA NUTRILIVE — NEW ORDER' in t or 'Website order' in t
        
        # Check if this is an order
        score = sum([has_phone, has_pin, has_prod, has_cod_pre])
        
        # Let's inspect
        first_line = t.split('\n')[0].strip()
        if (score >= 2 or is_web) and not t.startswith('Lavkar') and not 'order cancel' in t.lower() and not 'cancel kara' in t.lower() and not 'hold' in t.lower():
            orders.append({
                'idx': idx,
                'date': m['date'],
                'time': m['time'],
                'first_line': first_line,
                'full_text': t,
                'score': score
            })
        else:
            non_orders.append({
                'idx': idx,
                'date': m['date'],
                'time': m['time'],
                'text': t
            })
            
    print(f"Detected Orders: {len(orders)}")
    print(f"Non-Orders: {len(non_orders)}")
    print("\nNon-orders summary:")
    for no in non_orders:
        preview = no['text'].replace('\n', ' ')[:70]
        print(f"  Msg #{no['idx']} [{no['date']} {no['time']}]: {preview}")
        
    return orders, non_orders

audit_sender('Vaishnavi Diwate', 'VAISHNAVI DIWATE')
audit_sender('Sujata Nutrilive Manju', 'MANJUSHREE KASTURE')
audit_sender('Punam kasture', 'PUNAM KASTURE')
audit_sender('Karishma Patil', 'KARISHMA PATIL')
audit_sender('Sujata Nutrilive', 'MONU (SUJATA NUTRILIVE)')
