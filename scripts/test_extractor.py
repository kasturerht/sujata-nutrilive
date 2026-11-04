import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total October TRUE messages: {len(msgs)}")

# Define all senders
STAFF_PHONES = {
    '9922534443', '9272471529', '9922500344', '9922577344',
    '9503434653', '9096759653', '8600140344', '9518505481'
}

def clean_phone(p):
    p = re.sub(r'[\s\-\(\)\+]', '', p)
    if p.startswith('91') and len(p) == 12:
        p = p[2:]
    return p

def extract_order_fields(m, caller_name, order_type_override=None):
    t = m['text'].replace('\r', '').strip()
    
    # 1. Website Template (SUJATA NUTRILIVE — NEW ORDER)
    if 'SUJATA NUTRILIVE — NEW ORDER' in t:
        client_m = re.search(r'👤 Client:\s*([^•\n]+)', t)
        phone_m = re.search(r'👤 Client:[^•\n]+•\s*([+\d\s\-]+)', t)
        addr_m = re.search(r'📍 Address:\s*([^\n\r]+(?:\n[^\n\r]+)?)', t)
        item_m = re.search(r'📦 Item:\s*([^\n\r]+)', t)
        amt_m = re.search(r'•\s*₹([\d\.]+)', t)
        
        name = client_m.group(1).strip() if client_m else 'Website Customer'
        phone = clean_phone(phone_m.group(1)) if phone_m else ''
        addr = addr_m.group(1).strip() if addr_m else ''
        prod = item_m.group(1).strip() if item_m else 'Healthy Life Combo Pack'
        amt = round(float(amt_m.group(1))) if amt_m else 990
        pin_m = re.search(r'\b([1-9]\d{5})\b', addr)
        pin = pin_m.group(1) if pin_m else ''
        pay_mode = 'Prepaid' if 'PREPAID' in t else 'COD'
        return {
            'date': m['date'],
            'time': m['time'],
            'caller': caller_name,
            'name': name,
            'phone': phone,
            'pin': pin,
            'address': addr,
            'products': prod,
            'amount': amt,
            'payment_mode': pay_mode,
            'order_type': 'Website Order (Forwarded)'
        }

    # Extract all phone numbers
    phones = re.findall(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)
    valid_phones = []
    for p in phones:
        cp = clean_phone(p)
        if len(cp) == 10 and cp not in STAFF_PHONES and cp not in valid_phones:
            valid_phones.append(cp)
    alt_phones = re.findall(r'\b[6-9]\d{9}\b', t)
    for ap in alt_phones:
        if ap not in STAFF_PHONES and ap not in valid_phones:
            valid_phones.append(ap)
    mobile_str = " / ".join(valid_phones)

    is_office = 'office' in t.lower() or 'office order' in t.lower() or 'delivered from office' in t.lower()
    if not mobile_str and is_office:
        mobile_str = 'Office Pickup (Nashik)'

    # Extract pincode
    pin = ''
    pin_m = re.search(r'(?:pin|pincode|post\s*code|code|pine|पिनकोड\s*नंबर)\s*[-:]?\s*(\d{3}\s*\d{3})\b', t, re.IGNORECASE)
    if pin_m:
        pin = pin_m.group(1).replace(' ', '')
    else:
        t_no_p = t
        for vp in valid_phones:
            t_no_p = t_no_p.replace(vp, ' ')
        m6 = re.findall(r'\b([1-9]\d{2}\s*\d{3})\b', t_no_p)
        for c in m6:
            c_clean = c.replace(' ', '')
            if not c_clean.startswith('2026') and not c_clean.startswith('2024'):
                pin = c_clean
                break
                
    # Fallback known pins
    if not pin:
        if '4000612' in t or '400612' in t or 'Ujwala Hule' in t: pin = '400612'
        elif 'Biswajit Kumar Mahraj' in t or 'ichapur' in t.lower(): pin = '743144'
        elif 'Annasaheb Tukaram Gawande' in t or '431011' in t: pin = '431011'
        elif 'आशिष नानाजी वनकर' in t or '445304' in t: pin = '445304'
        elif 'Sandeep Pawar' in t: pin = '422005'
        elif 'Patel Varsha' in t or '380061' in t: pin = '380061'
        elif is_office: pin = 'Office (Nashik)'

    # Amount extraction
    del_charges = 0
    m_del = re.search(r'(?:delivery|courier)\s*charges?\s*[:=-]?\s*(?:rs\.?|₹)?\s*(\d{2,4})', t, re.I)
    if m_del:
        del_charges = int(m_del.group(1))

    # Base amount search
    clean_no_phone = t
    for vp in valid_phones:
        clean_no_phone = clean_no_phone.replace(vp, ' [PHONE] ')
    if pin:
        clean_no_phone = clean_no_phone.replace(pin, ' [PIN] ')
    clean_no_phone = re.sub(r'(\d),(\d{3})', r'\1\2', clean_no_phone)

    amount = 0
    m_tot = re.search(r'(?:total\s*cod\s*amount|total\s*amount|total\s*cod|totalcod|rec\s*by\s*cod|total\s*[-:])\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})', clean_no_phone, re.I)
    if m_tot:
        amount = int(m_tot.group(1))
    else:
        m_cod = re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5}(?:\.\d{1,2})?)', clean_no_phone, re.I)
        if m_cod:
            amount = round(float(m_cod.group(1)))
        else:
            m_rs = re.search(r'(?:rs\.?|inr|₹)\s*(\d{3,5}(?:\.\d{1,2})?)', clean_no_phone, re.I)
            if m_rs:
                amount = round(float(m_rs.group(1)))
            else:
                m_slash = re.search(r'(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid|paid)?|\s*\/\s*cod|\s*rs\b)', clean_no_phone, re.I)
                if m_slash:
                    amount = int(m_slash.group(1))
                else:
                    m_num = re.search(r'(\d{3,5})\s*(?:\/-\s*|\s*-\s*|\s*)(?:cod|prepaid|paid)', clean_no_phone, re.I)
                    if m_num:
                        amount = int(m_num.group(1))

    if del_charges > 0 and amount > 0:
        if re.search(rf'cod\s*{amount}\s*\+\s*delivery', t, re.I):
            amount += del_charges
        elif f"{amount}/- COD" in t and f"Delivery charges {del_charges}" in t:
            amount += del_charges
        elif f"COD {amount}/-" in t and f"Delivery charges {del_charges}" in t:
            amount += del_charges
        elif f"COD{amount}/-" in t and f"Delivery charges {del_charges}" in t:
            amount += del_charges
        elif f"COD {amount}/-." in t and f"Delivery charges {del_charges}" in t:
            amount += del_charges
        elif f"{amount}/-" in t and f"delivery charges {del_charges}" in t.lower():
            amount += del_charges

    if 'Nilesh Kharade' in t:
        amount = 1079
    if 'Vijay Desai' in t and amount == 999:
        amount = 1079

    # Payment Mode
    pay_mode = 'COD'
    if re.search(r'\bprepaid\b', t, re.I) or 'PREPAID' in t or 'paid' in t.lower():
        pay_mode = 'Prepaid'
    elif 'office order' in t.lower() or 'cash' in t.lower() or 'delivered from office' in t.lower():
        pay_mode = 'Office Cash' if 'prepaid' not in t.lower() else 'Prepaid (Office)'

    # Name and Products extraction
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    prod_lines = []
    addr_parts = []
    name = ''

    # Specific known name overrides for office orders & unusual formats
    if 'Adhikar Chaudhari' in t or m['date'] == '05/10/2026' and '1700' in t and is_office:
        name = 'Adhikar Chaudhari'
        addr_parts = ['Sujata Nutrilive Office, Nashik']
        prod_lines = ['Spirulina & Sea Buckthorn Combo']
    elif 'Vijay bharambe' in t or (m['date'] == '06/10/2026' and '1500' in t and is_office):
        name = 'Vijay Bharambe'
        addr_parts = ['Sujata Nutrilive Office, Nashik']
        prod_lines = ['Spirulina & Sea Buckthorn Combo']
    elif 'Prakash jadhav' in t or (m['date'] == '06/10/2026' and '2400' in t and is_office):
        name = 'Prakash Jadhav'
        addr_parts = ['Sujata Nutrilive Office, Nashik']
        prod_lines = ['Spirulina & Sea Buckthorn Combo Pack']
    elif 'Sachin jaadhav' in t:
        name = 'Sachin Jadhav'
        addr_parts = ['Sujata Nutrilive Office, Nashik']
    elif '9773463025' in t and 'Sai Srushti' in t:
        name = 'Chetankumari Deepak Mahale'
    elif 'Deepak patil :- cod 1700' in t:
        name = 'Deepak Patil'
    elif 'SK JASIMUDDIN' in t:
        name = 'SK Jasimuddin'
    elif 'Vimalbhai mohanbhai Patel' in t:
        name = 'Vimalbhai Mohanbhai Patel'
    elif 'Anil Narayan Bundele' in t:
        name = 'Anil Narayan Bundele'
    elif 'विद्याधर खडकीकर' in t:
        name = 'विद्याधर खडकीकर'
    elif 'Upendra pathak' in t.lower():
        name = 'Upendra Pathak'
    elif 'Biswajit kumar Mahraj' in t or 'Biswajit Kumar Mahraj' in t:
        name = 'Biswajit Kumar Mahraj'
    elif 'देवमन नामदेव वाघ' in t:
        name = 'देवमन नामदेव वाघ'
    elif 'Gopal nanasaheb patil' in t:
        name = 'Gopal Nanasaheb Patil'
    elif 'Sulai nandan Therapy' in t:
        name = 'Sulai Nandan Therapy Center'
    elif 'Om naturopathy' in t:
        name = 'Om Naturopathy and Therapy Center'
    elif 'Dhiraj Pawar' in t:
        name = 'Dhiraj Pawar'
    elif 'vikram jojare' in t.lower():
        name = 'Vikram Jojare'
    elif 'Saurabh Kukreja' in t:
        name = 'Saurabh Kukreja'
    elif 'Zahid Khan' in t:
        name = 'Zahid Khan'
    elif 'Babu Dhotre' in t:
        name = 'Babu Dhotre'
    elif 'Asha nandgaonkar' in t:
        name = 'Asha Nandgaonkar'
    elif 'Shriram Yeola' in t:
        name = 'Shriram Yeola'
    elif 'Ujwala Hule' in t:
        name = 'Ujwala Hule'
    elif 'Vijay Desai' in t:
        name = 'Vijay Desai'

    for line in lines:
        l_lower = line.lower()
        # Product lines
        if re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|facewash|oil|shampoo|paste|d3|tulshi|drops|spurlina', line, re.I):
            if not re.search(r'^(?:prepaid\b|cod\b|order\s*status|rec\s*by\s*cod)', line, re.I):
                cleaned_prod = re.sub(r'^\s*(?:[\*\-\#•]|\d+[\.\)]\s+)', '', line).strip()
                cleaned_prod = re.sub(r'[\*]+', '', cleaned_prod).strip()
                if cleaned_prod and len(cleaned_prod) > 2 and not re.search(r'^(?:prepaid|cod|amount)\s*[:=-]?\s*\d', cleaned_prod, re.I):
                    prod_lines.append(cleaned_prod)
            continue
            
        if re.search(r'^(?:cod\b|prepaid\b|advance\b|paid\b|delivery\s*charges|total\s*[-:]|courier|free\s*delivery|location:)', line, re.I):
            continue
        if re.search(r'^(?:jevdha|lavkar|ok\b|done\b|speed\s*post|please|this\s*message|return|hi\s*order\s*ashi)', line, re.I):
            continue
        if line.strip() in ['Address,', 'Address:', 'पत्ता,', 'पत्ता:']:
            continue

        # Explicit Name
        m_name = re.match(r'^(?:Name|नाव|Customer Name|Client)\s*[:=-]?\s*(.+)', line, re.I)
        if m_name and not name:
            cand = m_name.group(1).strip()
            parts = re.split(r'(?:Address|पत्ता|Mob|Ph|Pin|Contact|District|मु\s*पोस्ट|मु\.\s*पो|मुक्काम|तालुका|प्लॉट)', cand, flags=re.I)
            name = parts[0].strip('.,-:#* ')
            if len(parts) > 1 and len(parts[1].strip()) > 3:
                addr_parts.append(parts[1].strip())
            continue

        # Explicit Address
        m_addr = re.match(r'^(?:Address|पत्ता)\s*[:=-]?\s*(.+)', line, re.I)
        if m_addr:
            addr_parts.append(m_addr.group(1).strip())
            continue

        if re.match(r'^(?:Mob|Mobile|Phone|Ph|Mo\.|Mb)?\s*[:=-]?\s*(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', line, re.I) or re.match(r'^\+?[\d\s\-\/]{10,25}$', line):
            continue
        if re.match(r'^(?:Pin|Pincode|Post|Code)?\s*[-:]?\s*\d{6}\b', line, re.I):
            continue

        # If name not yet set
        if not name:
            if '.' in line and len(line) > 25 and ('plot' in l_lower or 'colony' in l_lower or 'nagar' in l_lower or 'road' in l_lower):
                split_dot = line.split('.', 1)
                name = split_dot[0].strip('.,-:#* ')
                addr_parts.append(split_dot[1].strip())
            elif ' at ' in l_lower or ' मु ' in line or ' post ' in l_lower or ' मु.पो ' in line or ' मु ' in line:
                split_at = re.split(r'(?:\bat\b|\bpost\b|मु\s*पोस्ट|मु\.\s*पो|मुक्काम)', line, flags=re.I)
                name = split_at[0].strip('.,-:#* ')
                addr_parts.append(line[len(split_at[0]):].strip())
            else:
                name = line.strip('.,-:#* ')
            continue

        addr_parts.append(line)

    def clean_address_text(addr, phones, pin, cust_name):
        for p in phones:
            addr = re.sub(rf'(?:Mob|Mobile|Phone|Ph|Mo\.|Mb)?\s*[:=-]?\s*(?:\+91[\-\s]?)?{p}\b', '', addr, flags=re.I)
        addr = re.sub(r'(?:Mob|Mobile|Phone|Ph|Mo\.|Mb)\s*[:=-]?\s*[\d\s\+\-\/]{10,}', '', addr, flags=re.I)
        addr = re.sub(r'(?:COD|Prepaid|Paid|Advance)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*\d+(?:\.\d{1,2})?(?:\s*(?:\/-|\+)\s*(?:delivery\s*charges?)?\s*\d*)?', '', addr, flags=re.I)
        addr = re.sub(r'(?:rs\.?|inr|₹)\s*\d+(?:\.\d{1,2})?(?:\s*(?:\/-|\+)\s*(?:delivery\s*charges?)?\s*\d*)?', '', addr, flags=re.I)
        addr = re.sub(r'\d+\s*(?:\/-|\/|\-)\s*(?:COD|Prepaid|Paid)', '', addr, flags=re.I)
        addr = re.sub(r'Payment\s*Mode\s*:\s*[^\n\r,]+', '', addr, flags=re.I)
        addr = re.sub(r'<This message was edited>', '', addr, flags=re.I)
        addr = re.sub(r'\bOrder on hold\b', '', addr, flags=re.I)
        addr = re.sub(r'\bWebsite order\b', '', addr, flags=re.I)
        addr = re.sub(r'[━•]', '', addr)
        addr = re.sub(r'\bSample Requirements:\b', '', addr, flags=re.I)
        addr = re.sub(rf'^(?:Name|नाव|Customer\s*Name)?\s*[:=-]?\s*{re.escape(cust_name)}\s*[,.:-]?\s*', '', addr, flags=re.I)
        addr = re.sub(r'^(?:Mo\.|Mb\.|Phone|Mob|Ph|Mobile\s*Number|Mobile\s*No\.?)\s*[,.:-]?\s*', '', addr, flags=re.I)
        addr = re.sub(r'^(?:Mobile\s*-\s*\(\+91\)\.?|Mob\s*no)\s*[,.:-]?\s*', '', addr, flags=re.I)
        addr = re.sub(r'[,]+', ', ', addr)
        addr = re.sub(r'\s+', ' ', addr)
        return addr.strip(' ,.-')

    raw_addr = ", ".join(addr_parts)
    full_address = clean_address_text(raw_addr, valid_phones, pin, name)

    if not name or len(name) < 2:
        name = 'Customer'
    name = re.sub(r'[\*\#]', '', name).strip(' ,.-')

    if not full_address or full_address.lower() == name.lower():
        if is_office:
            full_address = 'Sujata Nutrilive Office, Nashik'
        else:
            full_address = lines[1] if len(lines) > 1 else 'Address on File'

    # Clean product string
    prod_str = "; ".join(prod_lines) if prod_lines else "Healthy Life Combo Pack (Spirulina & Sea Buckthorn)"

    order_type = order_type_override or ('Website Order (Forwarded)' if 'website' in t.lower() else 'Direct Dispatch')

    return {
        'date': m['date'],
        'time': m['time'],
        'caller': caller_name,
        'name': name,
        'phone': mobile_str,
        'pin': pin,
        'address': full_address,
        'products': prod_str,
        'amount': amount,
        'payment_mode': pay_mode,
        'order_type': order_type
    }

print("Extractor defined successfully.")
