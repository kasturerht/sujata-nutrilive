import json
import re

with open('scripts/october_whatsapp_messages.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

with open('scripts/telecallers_all_messages_october.json', 'r', encoding='utf-8') as f:
    caller_msgs = json.load(f)

with open('scripts/verified_october_telecaller_orders.json', 'r', encoding='utf-8') as f:
    verified_data = json.load(f)

STAFF_PHONES = {
    '9922534443', '9272471529', '9922500344', '9922577344',
    '9503434653', '9096759653', '8600140344', '9518505481'
}

def clean_phone(p):
    p = re.sub(r'[\s\-\(\)\+]', '', p)
    if p.startswith('91') and len(p) == 12:
        p = p[2:]
    return p

def extract_details(raw_text, caller_name, idx, meta):
    t = raw_text.replace('\r', '')
    
    # 1. Customer Name
    name = ''
    if 'SUJATA NUTRILIVE — NEW ORDER' in t:
        m = re.search(r'👤 Client:\s*([^•\n]+)', t)
        if m:
            name = m.group(1).strip()
    
    if not name:
        m = re.search(r'(?:Name|नाव|Customer Name|Client)\s*[:=-]?\s*([^\n\r]+)', t, re.IGNORECASE)
        if m:
            name = m.group(1).strip()
            # clean if phone or address leaked into name
            name = re.sub(r'(?:Address|Mob|Ph|Pin).*', '', name, flags=re.IGNORECASE).strip()
            
    if not name or len(name) < 2:
        # First non-empty line
        lines = [l.strip() for l in t.split('\n') if l.strip()]
        for l in lines:
            if not re.search(r'^(?:🌿|🛒|📦|📍|🌐|COD|Prepaid|Name|नाव|Pin|Mobile|Phone|\+91)', l, re.IGNORECASE):
                # Clean asterisks or leading dashes
                cleaned = re.sub(r'^[\*\-\#\d\.\s]+', '', l).strip()
                cleaned = re.sub(r'[\*]+', '', cleaned).strip()
                if len(cleaned) > 2 and not re.search(r'spirulina|combo|capsule|tablet', cleaned, re.IGNORECASE):
                    name = cleaned
                    break
    
    if not name and meta.get('cust'):
        name = meta['cust']

    # 2. Mobile Numbers
    # Find all potential phone numbers
    phones = re.findall(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)
    valid_phones = []
    for p in phones:
        cp = clean_phone(p)
        if len(cp) == 10 and cp not in STAFF_PHONES and cp not in valid_phones:
            valid_phones.append(cp)
    
    # Check alternate patterns like "9822071487/ 9657130450"
    alt_phones = re.findall(r'\b[6-9]\d{9}\b', t)
    for ap in alt_phones:
        if ap not in STAFF_PHONES and ap not in valid_phones:
            valid_phones.append(ap)
            
    mobile_str = " / ".join(valid_phones)

    # 3. Pincode
    pincode = ''
    # Specific pattern like "Pin - 422003" or "Pincode: 412308"
    pin_m = re.search(r'(?:pin|pincode|post\s*code|code)\s*[-:]?\s*(\d{6})\b', t, re.IGNORECASE)
    if pin_m:
        pincode = pin_m.group(1)
    else:
        # Any 6 digit number that is not part of a 10-digit phone
        # Replace phones first
        t_no_phone = t
        for vp in valid_phones:
            t_no_phone = t_no_phone.replace(vp, ' [PHONE] ')
        
        all_6 = re.findall(r'\b([1-9]\d{5})\b', t_no_phone)
        # Avoid matching numbers like 100000 or dates
        for c in all_6:
            if not c.startswith('2026') and not c.startswith('2024'):
                pincode = c
                break

    # 4. Payment Mode
    pay_mode = 'COD'
    if re.search(r'\bprepaid\b', t, re.IGNORECASE) or 'PREPAID' in t or 'paid' in t.lower():
        pay_mode = 'Prepaid'
    elif 'office order' in t.lower() or 'cash' in t.lower():
        pay_mode = 'Cash / Office'

    # 5. Full Address
    address = ''
    if '📍 Address:' in t:
        m = re.search(r'📍 Address:\s*([^\n\r]+(?:\n[^\n\r]+)?)', t)
        if m:
            address = m.group(1).strip()
    if not address:
        addr_m = re.search(r'(?:Address|पत्ता)\s*[:=-]?\s*(.+?)(?=(?:Mobile|Phone|Mo\.|Pin|Order|Spirulina|COD|Prepaid|$))', t, re.IGNORECASE | re.DOTALL)
        if addr_m:
            address = addr_m.group(1).strip().replace('\n', ', ')
    if not address:
        # Fallback to lines that look like address
        lines = [l.strip() for l in t.split('\n') if l.strip()]
        addr_lines = []
        for l in lines:
            if not re.search(r'(?:name|नाव|phone|mob|mo\.|pin|cod|prepaid|amount|rs\.|spirulina|combo|capsule|tablet|₹|\bfree\b)', l, re.IGNORECASE):
                if len(l) > 5 and not l.startswith('http'):
                    addr_lines.append(l)
        if addr_lines:
            address = ", ".join(addr_lines)

    # Clean address
    address = re.sub(r'[\*\#]', '', address).strip()
    address = re.sub(r'\s+', ' ', address).strip()

    # 6. Products
    products = []
    for line in t.split('\n'):
        l = line.strip()
        if re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|facewash|oil|shampoo|paste|d3|tulshi|drops|spurlina', l, re.IGNORECASE):
            if not re.search(r'^(?:prepaid|cod|order\s*status)', l, re.IGNORECASE):
                cleaned_prod = re.sub(r'^[\*\-\#•\d\.\s]+', '', l).strip()
                cleaned_prod = re.sub(r'[\*]+', '', cleaned_prod).strip()
                if cleaned_prod and len(cleaned_prod) > 3:
                    products.append(cleaned_prod)
    
    prod_str = "; ".join(products) if products else "Healthy Life Combo / Spirulina & Sea Buckthorn"

    return {
        'caller': caller_name,
        'idx': idx,
        'date': meta.get('date', ''),
        'time': meta.get('time', ''),
        'customer_name': name,
        'mobile': mobile_str,
        'pincode': pincode,
        'address': address,
        'products': prod_str,
        'amount': meta.get('amt', 0),
        'payment_mode': pay_mode,
        'order_type': meta.get('type', 'Direct Dispatch')
    }

# Test across all callers
all_extracted = []

for caller_key in ['Vaishnavi Diwate', 'Manjushree Kasture', 'Punam Kasture', 'Karishma Patil', 'Monu']:
    c_msgs = caller_msgs[caller_key]
    info = verified_data[caller_key]
    
    if caller_key == 'Manjushree Kasture':
        orders = info['directOrders'] + info['webOrders']
    else:
        orders = info['orders']
        
    for o in orders:
        orig_msg = c_msgs[o['idx'] - 1]
        ext = extract_details(orig_msg['text'], caller_key, o['idx'], o)
        all_extracted.append(ext)

print(f"Total extracted orders: {len(all_extracted)}")
missing_mobile = [e for e in all_extracted if not e['mobile']]
missing_pin = [e for e in all_extracted if not e['pincode']]
print(f"Missing mobile: {len(missing_mobile)}")
for mm in missing_mobile:
    print(f"  [{mm['caller']} #{mm['idx']}] {mm['customer_name']} | Amt: {mm['amount']} | Type: {mm['order_type']}")

print(f"Missing pincode: {len(missing_pin)}")
for mp in missing_pin:
    print(f"  [{mp['caller']} #{mp['idx']}] {mp['customer_name']} | Mobile: {mp['mobile']} | Type: {mp['order_type']}")
