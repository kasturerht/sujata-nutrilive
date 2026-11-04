import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total August msgs: {len(msgs)}")

# Let's inspect how many multi-message pairs exist
def has_addr_or_phone(t):
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t)) or bool(re.search(r'\b[1-9]\d{2}\s*\d{3}\b', t))
    return has_phone or has_pin

def has_prod_or_amt(t):
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|seabukthon|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|facewash|oil|shampoo|paste|d3|tulshi|drops|spurlina|bottle|wheatgrass', t, re.I))
    has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I)) or bool(re.search(r'cod\s*[-:=]?\s*\d+', t, re.I))
    return has_prod or has_cod_pre

pairs = []
for i in range(len(msgs)-1):
    m1 = msgs[i]
    m2 = msgs[i+1]
    if m1['sender'] == m2['sender'] and m1['date'] == m2['date']:
        t1, t2 = m1['text'], m2['text']
        if (has_addr_or_phone(t1) and not has_prod_or_amt(t1) and has_prod_or_amt(t2)) or \
           (has_prod_or_amt(t1) and not has_addr_or_phone(t1) and has_addr_or_phone(t2)):
            pairs.append((i, i+1, m1['sender'], t1, t2))

print(f"Found {len(pairs)} sequential pairs from same sender on same day:")
for p in pairs:
    print(f"[{p[2]}] IDX {p[0]} & {p[1]}:")
    print(f"  M1: {repr(p[3][:80])}")
    print(f"  M2: {repr(p[4][:80])}")
    print("-" * 50)
