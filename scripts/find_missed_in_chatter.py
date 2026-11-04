import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', encoding='utf-8') as f:
    msgs = json.load(f)

from audit_august_all import is_valid_aug_order, order_sections

potential_missed_orders = []

for idx, m in enumerate(msgs):
    t = m['text']
    # Check if this was classified as chatter
    # Find caller section
    caller_name = None
    for name, fn in order_sections:
        if fn(m):
            caller_name = name
            break
    if not caller_name:
        caller_name = 'Unknown'
        
    is_ord, reason = is_valid_aug_order(m, caller_name)
    if not is_ord:
        # Check if it has indicators of an order
        has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
        has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
        has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|seabukthon|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina|bottle|wheatgrass', t, re.I))
        has_cod_pre = bool(re.search(r'cod|prepaid|advance|paid', t, re.I))
        
        # If it has at least 2 strong indicators, let's inspect it!
        score = sum([has_phone, has_pin, has_prod, has_cod_pre])
        if score >= 2 and len(t.strip()) > 25:
            potential_missed_orders.append((idx, m, caller_name, reason, score))

print(f"Total potential missed orders in chatter: {len(potential_missed_orders)}")
for idx, m, caller, reason, score in potential_missed_orders:
    print(f"[{m['date']} {m['time']}] {caller} ({m['sender']}) | Excluded Reason: {reason} | Score: {score}")
    print(repr(m['text'][:120]))
    print("-" * 50)
