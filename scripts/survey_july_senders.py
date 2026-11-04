import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

msgs = json.load(open('scripts/july_whatsapp_messages_TRUE.json', encoding='utf-8'))

DEV_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')

def has_phone(t):
    t_clean = t.translate(DEV_DIGITS)
    return bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t_clean)) or bool(re.search(r'\b[6-9]\d{9}\b', t_clean))

def has_pin(t):
    t_clean = t.translate(DEV_DIGITS)
    return bool(re.search(r'\b[1-9]\d{5}\b', t_clean)) or bool(re.search(r'\b[1-9]\d{2}\s*\d{3}\b', t_clean))

def has_prod(t):
    return bool(re.search(r'spirulina|buckthorn|seabukthron|seabukthon|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|facewash|oil|shampoo|paste|d3|tulshi|drops|spurlina|bottle|wheatgrass', t, re.I))

def has_amt(t):
    return bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]*\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|-\/|\/|-)\s*(?:cod|prepaid)', t, re.I)) or bool(re.search(r'\d+\s*\/-', t))

# Check orders per sender
senders = set(m['sender'] for m in msgs)
for s in sorted(senders):
    s_msgs = [m for m in msgs if m['sender'] == s]
    likely_orders = []
    for m in s_msgs:
        t = m['text']
        score = sum([has_phone(t), has_pin(t), has_prod(t), has_amt(t)])
        is_web = 'SUJATA NUTRILIVE — NEW ORDER' in t or '• ₹' in t or 'Website order' in t
        if (score >= 2 and len(t) > 30) or is_web:
            likely_orders.append(m)
    print(f"{s}: Total {len(s_msgs)} msgs, Likely orders: {len(likely_orders)}")
