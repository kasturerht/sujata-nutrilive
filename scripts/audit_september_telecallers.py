import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/september_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total September 2026 TRUE messages: {len(msgs)}")

def audit_sender(sender_filter, caller_display):
    c_msgs = [m for m in msgs if sender_filter(m)]
    print(f"\n=======================================================")
    print(f"AUDITING {caller_display}: {len(c_msgs)} messages")
    print(f"=======================================================")
    
    orders = []
    chatter = []
    
    for idx, m in enumerate(c_msgs, 1):
        t = m['text'].strip()
        first_line = t.split('\n')[0].strip()
        
        # Check chatter / media / delete
        if t in ['<Media omitted>', 'This message was deleted']:
            chatter.append((idx, m, 'Media/Deleted'))
            continue
        if 'donda takli ahe delete kara' in t.lower() or 'this order is cancelled' in t.lower() or 'cancel keleli order' in t.lower() or 'order cancel kara' in t.lower() or 'cancel this order' in t.lower():
            chatter.append((idx, m, 'Cancellation'))
            continue
            
        has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
        has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
        has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina', t, re.I))
        has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I))
        is_web = 'SUJATA NUTRILIVE — NEW ORDER' in t or 'Website order' in t or '• ₹' in t
        is_office = 'office' in t.lower() and ('prepaid' in t.lower() or 'delivered' in t.lower() or 'cash' in t.lower())
        
        if (has_phone or has_pin) and (has_prod or has_cod_pre or is_web) and len(t) > 30:
            orders.append((idx, m))
        elif is_web:
            orders.append((idx, m))
        elif is_office and ('1700' in t or '2400' in t or '1500' in t or 'hair oil' in t.lower() or 'facepack' in t.lower() or 'delivered from office' in t.lower()):
            orders.append((idx, m))
        else:
            chatter.append((idx, m, 'Chatter / Query'))
            
    print(f"Detected Orders: {len(orders)}")
    print(f"Chatter / Non-Orders: {len(chatter)}")
    print("\nNon-orders sample:")
    for idx, m, reason in chatter:
        preview = m['text'].replace('\n', ' ')[:75]
        print(f"  Msg #{idx:02d} [{m['date']} {m['time']}] ({reason}): {repr(preview)}")
        
    return orders, chatter

manju_orders, manju_chatter = audit_sender(lambda m: 'Manju' in m['sender'], 'Manjushree Kasture')
vaish_orders, vaish_chatter = audit_sender(lambda m: 'Vaishnavi' in m['sender'], 'Vaishnavi Diwate')
monu_orders, monu_chatter = audit_sender(lambda m: m['sender'] == 'Sujata Nutrilive', 'Monu')
punam_orders, punam_chatter = audit_sender(lambda m: 'Punam' in m['sender'], 'Punam Kasture')
karishma_orders, karishma_chatter = audit_sender(lambda m: 'Karishma' in m['sender'], 'Karishma Patil')
