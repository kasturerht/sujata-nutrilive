import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

msgs = json.load(open('scripts/july_whatsapp_messages_TRUE.json', encoding='utf-8'))
print(f"Total July msgs: {len(msgs)}")

DEV_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')

def has_addr_or_phone(t):
    t_clean = t.translate(DEV_DIGITS)
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t_clean)) or bool(re.search(r'\b[6-9]\d{9}\b', t_clean))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t_clean)) or bool(re.search(r'\b[1-9]\d{2}\s*\d{3}\b', t_clean))
    return has_phone or has_pin

def has_prod_or_amt(t):
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|seabukthon|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|facewash|oil|shampoo|paste|d3|tulshi|drops|spurlina|bottle|wheatgrass', t, re.I))
    has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]*\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|-\/|\/|-)\s*(?:cod|prepaid)', t, re.I)) or bool(re.search(r'cod\s*[-:=]*\s*\d+', t, re.I)) or bool(re.search(r'\b\d+\s*\/-', t))
    return has_prod or has_cod_pre

pairs = []
for i in range(len(msgs)-1):
    m1 = msgs[i]
    m2 = msgs[i+1]
    if m1['sender'] == m2['sender'] and m1['date'] == m2['date']:
        t1, t2 = m1['text'], m2['text']
        if (has_addr_or_phone(t1) and not has_prod_or_amt(t1) and has_prod_or_amt(t2)) or \
           (has_prod_or_amt(t1) and not has_addr_or_phone(t1) and has_addr_or_phone(t2)):
            pairs.append((i, i+1, m1['sender'], m1['date'], m1['time'], t1, t2))

print(f"Found {len(pairs)} sequential pairs in July:")
for p in pairs:
    print(f"[{p[2]}] IDX {p[0]} & {p[1]} on {p[3]} {p[4]}:")
    print(f"  M1: {repr(p[5][:90])}")
    print(f"  M2: {repr(p[6][:90])}")
    print("-" * 50)
