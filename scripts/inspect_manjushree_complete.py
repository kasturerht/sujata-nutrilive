import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

m_msgs = [m for m in msgs if 'Manju' in m['sender']]
print(f"Total Manjushree messages in TRUE: {len(m_msgs)}")

# Load old verified
with open('scripts/verified_october_telecaller_orders.json', 'r', encoding='utf-8') as f:
    v = json.load(f)

old_direct = v['Manjushree Kasture']['directOrders']
old_web = v['Manjushree Kasture']['webOrders']
print(f"Old verified direct: {len(old_direct)}, old web: {len(old_web)}, total old: {len(old_direct) + len(old_web)}")

orders = []
non_orders = []

for idx, m in enumerate(m_msgs, 1):
    t = m['text'].strip()
    
    # Check if cancellation or note
    if t.startswith('Cancel') or 'cancel kara' in t.lower() or 'hi order donda takli ahe delete kara' in t.lower() or 'this order is cancelled' in t.lower():
        non_orders.append((idx, m, 'Cancellation / deletion request'))
        continue
    if t in ['<Media omitted>', 'This message was deleted']:
        non_orders.append((idx, m, 'Media/Deleted'))
        continue
    if len(t) < 30 and not any(k in t.lower() for k in ['combo', 'spirulina', 'buckthorn', 'cod', 'prepaid']):
        non_orders.append((idx, m, 'Short chatter'))
        continue
        
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina', t, re.I))
    has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I))
    is_web = 'SUJATA NUTRILIVE — NEW ORDER' in t or 'Website order' in t
    
    if (has_phone or has_pin) and (has_prod or has_cod_pre or is_web):
        orders.append((idx, m))
    elif is_web:
        orders.append((idx, m))
    else:
        non_orders.append((idx, m, 'Follow-up / Chatter / Instruction'))

print(f"\nTotal Manjushree orders detected: {len(orders)}")
print(f"Total Manjushree non-orders: {len(non_orders)}")

print("\n--- Non-orders detail ---")
for idx, m, reason in non_orders:
    preview = m['text'].replace('\n', ' ')[:75]
    print(f"Msg #{idx:02d} [{m['date']} {m['time']}] ({reason}): {preview}")

print("\n--- Comparing Manjushree orders ---")
old_orders_all = old_direct + old_web
old_order_texts = [m_msgs[o['idx'] - 1]['text'][:40] for o in old_orders_all]
old_indices = {o['idx'] for o in old_orders_all}

for idx, m in orders:
    if idx not in old_indices:
        print(f"NEW ORDER FOR MANJUSHREE: Msg #{idx} [{m['date']} {m['time']}]: {repr(m['text'][:60])}")
