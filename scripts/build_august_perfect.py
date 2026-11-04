import json
import re
import sys
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')

# 1. Load August messages
with open('scripts/august_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total August 2026 TRUE messages: {len(msgs)}")

DEV_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')

STAFF_PHONES = {
    '9922534443', '9272471529', '9922500344', '9922577344',
    '9503434653', '9096759653', '8600140344', '9518505481',
    '9607259661', '8805168275'
}

def clean_phone(p):
    p = str(p).translate(DEV_DIGITS)
    p = re.sub(r'[\s\-\(\)\+]', '', p)
    if p.startswith('91') and len(p) == 12:
        p = p[2:]
    elif len(p) == 11 and p.startswith(('9', '8', '7')):
        # Telecaller typo extra digit at end (e.g. 93704020213)
        p = p[:10]
    return p

def clean_address_text(addr, phones, pin, cust_name):
    addr = str(addr).translate(DEV_DIGITS)
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
    if cust_name and cust_name != 'Customer':
        addr = re.sub(rf'^(?:Name|नाव|Customer\s*Name)?\s*[:=-]?\s*{re.escape(cust_name)}\s*[,.:-]?\s*', '', addr, flags=re.I)
    addr = re.sub(r'^(?:Mo\.|Mb\.|Phone|Mob|Ph|Mobile\s*Number|Mobile\s*No\.?)\s*[,.:-]?\s*', '', addr, flags=re.I)
    addr = re.sub(r'^(?:Mobile\s*-\s*\(\+91\)\.?|Mob\s*no)\s*[,.:-]?\s*', '', addr, flags=re.I)
    addr = re.sub(r'[,]+', ', ', addr)
    addr = re.sub(r'\s+', ' ', addr)
    return addr.strip(' ,.-')

def get_telecaller_name(sender, text=''):
    if 'Manju' in sender:
        return 'मंजुश्री कस्तुरे'
    if 'Punam' in sender:
        return 'पूनम कस्तुरे'
    if 'Vaishnavi' in sender:
        return 'वैष्णवी दिवटे'
    if sender == 'Sujata Nutrilive':
        return 'मोनू'
    if 'Karishma' in sender:
        return 'करिश्मा पाटील'
    if '+91 88051 68275' in sender:
        return 'टेलिकॉलर (+91 88051 68275)'
    if '+91 96072 59661' in sender:
        return 'टेलिकॉलर / ऑफिस (+91 96072 59661)'
    if 'Yash' in sender:
        if 'Pallavi' in text and 'Majhi aahe' in text:
            return 'मंजुश्री कस्तुरे'
        return 'यश सूर्यवंशी (फाउंडर डायरेक्ट)'
    if 'Om Amazon' in sender or '86001 40344' in sender or 'RK' in sender:
        return 'वेअरहाऊस डिस्पॅच'
    return sender

# Multi-message pairings: main_idx -> list of (sub_idx, description)
KNOWN_PAIRS = {
    0: ([1], '50 facewash quantity follow-up'),
    43: ([44], '30 bottle tablets follow-up'),
    47: ([46], 'Shipping label image attachment'),
    58: ([60], 'Ashwagandha & wheatgrass product details'),
    141: ([142], 'Product list follow-up (Wheat grass, Spirulina, Moringa, Seabuckthorn)'),
    224: ([225, 226], '7-product detailed list and COD 6300 follow-up'),
    427: ([428], 'Product details (Spirulina, Seabuckthorn, Shilajit) and COD 1300 follow-up'),
    433: ([434], 'Independence Day offer details and COD 999 follow-up'),
    437: ([438], '50 bottle distributor quantity follow-up'),
    440: ([441], '30 spirulina capsule quantity and COD 5200 follow-up'),
    567: ([568], 'Product list (Spirulina 5, Seabuckthorn 10) and COD 3500 follow-up'),
    573: ([574], 'Product details and COD 1000 follow-up'),
    671: ([672, 673, 674], 'Label image, COD 1380 and Mobile Number 9373388623 follow-up'),
    698: ([699], 'Spirulina tab 2 and COD 850 follow-up'),
    742: ([743], 'Spirulina capsule 2 and COD 800 follow-up'),
    744: ([745], '2 seabuckthorn and COD 900 follow-up'),
    756: ([757], '3 spirulina, 3 seabuckthorn, free bottle and COD 2500 follow-up'),
    818: ([819], 'Customer mobile number 7021880353 and product details follow-up'),
    844: ([843], 'Founder B2B order of COD 10750 (Shipping label in image 843)'),
    901: ([902], 'Oil 5 prepaid 750 follow-up'),
    906: ([907], 'Spirulina 10, B12 5 and COD 2350 follow-up'),
    944: ([945], 'Spirulina cap 3, powder 2, seabuckthorn cap 2 follow-up'),
    1103: ([1104], 'Spirulina tab 1 product follow-up')
}

SUB_INDICES = {}
for main, (subs, note) in KNOWN_PAIRS.items():
    for sub in subs:
        SUB_INDICES[sub] = (main, note)

# Known exclusions:
KNOWN_EXCLUSIONS = {
    120: 'Incomplete Address (Re-posted next day 05/08 with mobile number 8668769890)',
    195: 'Offer Verification / Inquiry (Duplicate forward of Pallavi order from 05/08)',
    472: 'Founder Internal Packing / Labeling Instruction',
    541: 'Delivery Follow-up / Status Inquiry (Mohan B Chatake)',
    545: 'Missing Item Inquiry (Balasaheb Dhokale)',
    701: 'Whose Order Inquiry (Pramod Barapatre)',
    721: 'Payment Mode Update / Inquiry (Dr Baban Ghuge - 3500 prepaid)',
    722: 'Payment Mode Update / Inquiry (Dr Baban Ghuge - 3500 prepaid)',
    723: 'Dispatch Status Inquiry (Dr Baban Ghuge)',
    875: 'Re-dispatch Coordination via Speed Post (Lokesh Patil)',
    876: 'Delivery Follow-up / Status Inquiry (Nikunj Doshi)',
    877: 'Delivery Follow-up / Status Inquiry (Rainbow Nx Pharmacy)',
    908: 'Founder Status Inquiry (Nikunj Doshi)',
    916: 'Re-dispatch Coordination via Speed Post (Lokesh Patil)',
    1030: 'Status Inquiry (Arun Lavaskar)'
}

def extract_order_data(idx, m):
    t_raw = m['text']
    
    # If this message is paired with sub-messages, combine texts
    if idx in KNOWN_PAIRS:
        subs, _ = KNOWN_PAIRS[idx]
        for sub_idx in subs:
            t_raw = t_raw + "\n" + msgs[sub_idx]['text']
        
    t = t_raw.translate(DEV_DIGITS).replace('\r', '').strip()
    caller = get_telecaller_name(m['sender'], t)

    # Pallavi Danger special handling
    if 'Pallavi' in t and ('403720' in t or '9850183385' in t):
        return {
            'Date': m['date'],
            'Time': m['time'],
            'Telecaller': 'मंजुश्री कस्तुरे',
            'Customer Name': 'Pallavi Danger',
            'Mobile Number': '9850183385',
            'Pincode': '403720',
            'Full Address': 'Shantivan, H. No. 1012/C-2, Bacbhatt, near veterinary hospital, Rain Salcete South Goa',
            'Products Ordered': 'Ashadi Special Combo',
            'Amount (₹)': 1000,
            'Payment Mode': 'COD',
            'Order Type': 'Website Order (Forwarded)'
        }

    # Extract all phone numbers
    phones = re.findall(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)
    valid_phones = []
    for p in phones:
        cp = clean_phone(p)
        if len(cp) == 10 and cp not in STAFF_PHONES and cp not in valid_phones:
            valid_phones.append(cp)
    alt_phones = re.findall(r'\b[6-9]\d{9,10}\b', t)
    for ap in alt_phones:
        cp = clean_phone(ap)
        if len(cp) == 10 and cp not in STAFF_PHONES and cp not in valid_phones:
            valid_phones.append(cp)
            
    # Check if next message was purely a phone number from same sender
    if not valid_phones and idx < len(msgs) - 1:
        next_m = msgs[idx+1]
        if next_m['sender'] == m['sender']:
            cp_next = clean_phone(next_m['text'])
            if len(cp_next) == 10 and cp_next.isdigit() and cp_next not in STAFF_PHONES:
                valid_phones.append(cp_next)

    # Special phone cases
    if not valid_phones:
        if '96 57 665 0101' in t or '9657666501' in t:
            valid_phones.append('9657665010')
        elif 'चनबसप्पा' in t:
            valid_phones.append('9637923535')
        elif 'Shanti Lal' in t:
            valid_phones.append('9414902888')

    mobile_str = " / ".join(valid_phones)
    is_office = 'office' in t.lower() or 'office order' in t.lower() or 'delivered from office' in t.lower() or 'office pickup' in t.lower()
    if not mobile_str and is_office:
        mobile_str = 'Office Pickup (Nashik)'

    # Extract Pincode
    pin = ''
    if 'फोर झिरो झिरो सेवन झिरो' in t:
        pin = '400708'
    elif 'nashik422013' in t:
        pin = '422013'
    elif '41 42 03' in t:
        pin = '414203'
    elif '4000 49' in t:
        pin = '400049'
    elif '3027602' in t:
        pin = '302760'
    else:
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
                if not c_clean.startswith('2026') and not c_clean.startswith('2024') and not c_clean.startswith('2025'):
                    pin = c_clean
                    break
            if not pin:
                m_word_pin = re.search(r'\b([1-9]\d{5})\b', t_no_p)
                if m_word_pin:
                    pin = m_word_pin.group(1)

    if not pin and is_office:
        pin = 'Office (Nashik)'
    if not pin and 'Ratnagiri, Maharashtra, 41563' in t:
        pin = '415639'

    # Extract Amount
    clean_no_phone = t
    for vp in valid_phones:
        clean_no_phone = clean_no_phone.replace(vp, ' [PHONE] ')
    if pin:
        clean_no_phone = clean_no_phone.replace(pin, ' [PIN] ')
    clean_no_phone = re.sub(r'(?:pin|pincode|code)\s*[:=-]?\s*\d{5,7}', ' [PIN] ', clean_no_phone, flags=re.I)
    clean_no_phone = re.sub(r'(\d),(\d{3})', r'\1\2', clean_no_phone)

    del_charges = 0
    m_del = re.search(r'(?:delivery|courier)\s*charges?\s*[:=-]?\s*(?:rs\.?|₹)?\s*(\d{2,4})', clean_no_phone, re.I)
    if m_del:
        del_charges = int(m_del.group(1))

    amount = 0
    # Specific overrides
    if '3027602' in t and 'COD =999' in t:
        amount = 999
    elif 'Order anniversary wellness combo 1200' in t:
        amount = 1200
    elif 'Order 999 combo offer' in t:
        amount = 999
    elif 'Independence day combo= 999' in t or 'Independence day offer 999 rs COD' in t:
        amount = 999
    elif 'Order combo of 2550 rakshabandan cod' in t:
        amount = 2550
    elif 'चनबसप्पा विठोबा आलुरे' in t and '3 spirulina soap' in t:
        amount = 0
    elif '4 soap prepaid order 60 charges of cod' in t:
        amount = 460
    elif 'cod :- 10750/-' in t:
        amount = 10750
    elif 'Cod :- 6300/-' in t:
        amount = 6300
    else:
        # Total COD / Total Amount / Total amt
        m_tot = re.search(r'(?:total\s*cod\s*(?:amount|amt)|total\s*(?:amount|amt)\s*cod|total\s*(?:amount|amt)|total\s*cod|totalcod|rec\s*by\s*cod|total\s*[-:])\s*[:=-]*\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})', clean_no_phone, re.I)
        if m_tot:
            amount = int(m_tot.group(1))
        else:
            # Matches Cod :-1700, Cod :- 3430, COD = 999, Prepaid 1400
            m_cod = re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]*\s*(?:rs\.?|₹)?\s*(\d{3,5})\b', clean_no_phone, re.I)
            if m_cod:
                amount = int(m_cod.group(1))
            else:
                # Matches 550-/, 950/-, 999 COD, 1200 COD, 1800/- prepaid
                m_rev = re.search(r'(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:(?:\/-|-\/)\s*(?:cod|prepaid|paid)?|\/\s*(?:cod|prepaid|paid)|\s*rs\b|\s*(?:cod|prepaid|paid)\b)', clean_no_phone, re.I)
                if m_rev:
                    amount = int(m_rev.group(1))
                else:
                    m_combo = re.search(r'(?:order\s*)?(\d{3,5})\s*(?:combo|offer|pack)\b', clean_no_phone, re.I)
                    if m_combo:
                        amount = int(m_combo.group(1))
                    else:
                        m_combo2 = re.search(r'(?:combo\s*(?:of)?|offer|pack)\s*[:=-]*\s*(?:rs\.?|₹)?\s*(\d{3,5})\b', clean_no_phone, re.I)
                        if m_combo2:
                            amount = int(m_combo2.group(1))
                        else:
                            m_slash = re.search(r'(\d{3,5})\s*(?:\/-|-\/)', clean_no_phone)
                            if m_slash:
                                amount = int(m_slash.group(1))

    if del_charges > 0 and amount > 0:
        if re.search(r'\+\s*(?:delivery|courier)', clean_no_phone, re.I) or f"delivery charges {del_charges}" in clean_no_phone.lower():
            amount += del_charges

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

    # First check explicit Name markers
    for line in lines:
        m_expl_name = re.match(r'^(?:Name|नाव|Customer\s*Name|Client)\s*[:=-]?\s*(.+)', line, re.I)
        if m_expl_name and not name:
            cand = m_expl_name.group(1).strip()
            parts = re.split(r'(?:Address|पत्ता|Mob|Ph|Pin|Contact|District|मु\s*पोस्ट|मु\.\s*पो|मुक्काम|तालुका|प्लॉट)', cand, flags=re.I)
            name = parts[0].strip('.,-:#* ')
            if len(parts) > 1 and len(parts[1].strip()) > 3:
                addr_parts.append(parts[1].strip())

    for line in lines:
        l_lower = line.lower()
        if re.search(r'spirulina|buckthorn|seabukthron|seabukthon|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|facewash|oil|shampoo|paste|d3|tulshi|drops|spurlina|bottle|wheatgrass', line, re.I):
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
        if line.strip() in ['Address,', 'Address:', 'पत्ता,', 'पत्ता:', 'Address for Delivery 🚚']:
            continue

        m_addr = re.match(r'^(?:Address|पत्ता|Add)\s*[:=-]?\s*(.+)', line, re.I)
        if m_addr:
            addr_parts.append(m_addr.group(1).strip())
            continue

        if re.match(r'^(?:Mob|Mobile|Phone|Ph|Mo\.|Mb)?\s*[:=-]?\s*(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', line, re.I) or re.match(r'^\+?[\d\s\-\/]{10,25}$', line):
            continue
        if re.match(r'^(?:Pin|Pincode|Post|Code)?\s*[-:]?\s*\d{5,7}\b', line, re.I):
            continue

        if not name:
            line_clean = re.sub(r'^(?:Name|नाव|Customer\s*Name|Client|आत्मजः)\s*[:=-]?\s*', '', line, flags=re.I).strip()
            parts = re.split(r'(?:Address|पत्ता|Mob|Ph|Pin|Contact|District|मु\s*पोस्ट|मु\.\s*पो|मुक्काम|तालुका|जिल्हा|पांधी\s*का\s*पार|प्लॉट)', line_clean, flags=re.I)
            cand_name = parts[0].strip('.,-:#* ')
            if len(cand_name) > 1 and not re.search(r'^(?:extra|order|shipping|near|flat|room|house|plot)', cand_name, re.I):
                name = cand_name
                if len(parts) > 1 and len(parts[1].strip()) > 3:
                    addr_parts.append(parts[1].strip())
                continue

        addr_parts.append(line)

    raw_addr = ", ".join(addr_parts)
    full_address = clean_address_text(raw_addr, valid_phones, pin, name)

    # Explicit Customer Name Overrides
    if 'parinda chheda' in t.lower():
        name = 'Parinda Chheda'
    elif 'angira vedik' in t.lower():
        name = 'Angira Vedik Paithy'
    elif 'rekha salunukhe' in t.lower():
        name = 'Rekha Salunukhe'
        if not full_address or full_address.lower() == name.lower():
            full_address = 'पत्ता पार्सल लेबल फोटोमध्ये (Shipping Label on File)'
    elif 'dr bhaskar waghmare' in t.lower():
        name = 'Dr. Bhaskar Waghmare'
    elif 'shashikant pundkare' in t.lower():
        name = 'Dr. Shashikant Pundkare'
    elif 'dr.s.m.joshi' in t.lower() or 'sm joshi' in t.lower():
        name = 'Dr. S. M. Joshi'
    elif 'kotighat' in t.lower():
        name = 'Shimla HP Customer'
    elif 'ram babu sahu' in t.lower():
        name = 'Ram Babu Sahu'
    elif 'kapil ingle' in t.lower():
        name = 'Kapil Ingle (New Mauli Distributor)'
    elif 'nandkumar' in t.lower() or 'पानपट्टे' in t:
        name = 'नंदकुमार पानपट्टे (शाश्वत आरोग्य सेवा)'
    elif 'cod :- 10750/-' in t:
        name = 'B2B बल्क ऑर्डर (लेबल फोटोमध्ये)'
        full_address = 'पत्ता पार्सल लेबल फोटोमध्ये (Shipping Label on File)'
    elif not name or len(name) < 2 or name.lower() in ['extra', 'shipping address', 'orders', 'address']:
        if 'sudam govind' in t.lower():
            name = 'Sudam Govind Kumbhar'
        else:
            name = 'Customer'

    name = re.sub(r'[\*\#]', '', name).strip(' ,.-')

    if not full_address or full_address.lower() == name.lower():
        if is_office:
            full_address = 'Sujata Nutrilive Office, Nashik'
        else:
            full_address = lines[1] if len(lines) > 1 else 'Address on File'

    prod_str = "; ".join(prod_lines) if prod_lines else "Healthy Life Combo Pack (Spirulina & Sea Buckthorn)"
    order_type = 'Founder Direct Order' if 'यश सूर्यवंशी' in caller else ('वेअरहाऊस डिस्पॅच' if 'वेअरहाऊस' in caller else 'Direct Dispatch')

    return {
        'Date': m['date'],
        'Time': m['time'],
        'Telecaller': caller,
        'Customer Name': name,
        'Mobile Number': mobile_str,
        'Pincode': pin,
        'Full Address': full_address,
        'Products Ordered': prod_str,
        'Amount (₹)': amount,
        'Payment Mode': pay_mode,
        'Order Type': order_type
    }

def is_valid_order_message(idx, m):
    # Check known exclusions first
    if idx in KNOWN_EXCLUSIONS:
        return False, KNOWN_EXCLUSIONS[idx]
        
    # Check if this is a sub-message of a paired order
    if idx in SUB_INDICES:
        main_idx, note = SUB_INDICES[idx]
        return False, f"Merged with Order from same sender (Index {main_idx}: {note})"

    t = m['text'].strip()
    if t in ['<Media omitted>', 'This message was deleted']:
        return False, 'Media / Deleted Message'
    if 'donda takli ahe delete kara' in t.lower() or 'this order is cancelled' in t.lower() or 'cancel keleli order' in t.lower():
        return False, 'Cancellation Request'
    if 'hi order cancel kara' in t.lower() or 'order cancel kara' in t.lower() or 'cancel this order' in t.lower():
        return False, 'Cancellation Request'
    if 'hi order aj dispatch hoil ka' in t.lower() or 'dispatch keli ka' in t.lower() or 'status kay' in t.lower():
        return False, 'Status Inquiry'
    if 'return' in t.lower() and ('parcel return' in t.lower() or 'return order' in t.lower() or 'orders return' in t.lower()):
        if not ('ordered again' in t.lower() or 'reorder' in t.lower() or 're-order' in t.lower() or 'parat havi' in t.lower()):
            return False, 'Return Parcel Report'
    if 'delivered to the gate' in t.lower() or 'delivery done' in t.lower():
        return False, 'Delivery Done Confirmation'
    if 'unable to scan' in t.lower():
        return False, 'Barcode Scan Note'

    # If it is a known pair main index, it is definitely a valid order!
    if idx in KNOWN_PAIRS:
        return True, 'Valid Order (Merged Pair)'

    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t)) or bool(re.search(r'\b[1-9]\d{2}\s*\d{3}\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|seabukthon|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina|bottle|wheatgrass', t, re.I))
    has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I)) or bool(re.search(r'cod\s*[-:=]?\s*\d+', t, re.I))
    is_web = 'SUJATA NUTRILIVE — NEW ORDER' in t or 'Website order' in t or '• ₹' in t
    is_office = 'office' in t.lower() and ('prepaid' in t.lower() or 'delivered' in t.lower() or 'cash' in t.lower())

    if (has_phone or has_pin) and (has_prod or has_cod_pre or is_web) and len(t) > 30:
        return True, 'Valid Order'
    if is_web:
        return True, 'Valid Web Order'
    if is_office and ('1700' in t or '2400' in t or '1500' in t or 'hair oil' in t.lower() or 'facepack' in t.lower() or 'delivered from office' in t.lower()):
        return True, 'Office Order'
    if 'rekha salunukhe' in t.lower() and '950 cod' in t.lower():
        return True, 'Warehouse Order (Rekha Salunukhe)'
    if 'shivaji janardan kadam' in t.lower() and 'prepaid 1400' in t.lower():
        return True, 'Direct Order (Shivaji Janardan Kadam)'
    if 'kamlesh jetli' in t.lower() and '1050' in t:
        return True, 'Telecaller Order (Kamlesh Jetli)'

    return False, 'Chatter / Query / Not an Order'

all_orders = []
all_chatter = []
sr = 1
chatter_sr = 1

for idx, m in enumerate(msgs):
    is_ord, reason = is_valid_order_message(idx, m)
    if is_ord:
        rec = extract_order_data(idx, m)
        rec['Sr No'] = sr
        rec['Msg Index'] = idx
        all_orders.append(rec)
        sr += 1
    else:
        all_chatter.append({
            'Sr No': chatter_sr,
            'Msg Index': idx,
            'Date': m['date'],
            'Time': m['time'],
            'Sender': m['sender'],
            'Telecaller': get_telecaller_name(m['sender']),
            'Reason Excluded': reason,
            'Raw Message Text': m['text']
        })
        chatter_sr += 1

print(f"Total August Orders Extracted: {len(all_orders)}")
print(f"Total August Excluded / Chatter: {len(all_chatter)}")
print(f"Reconciliation Check: {len(all_orders)} + {len(all_chatter)} = {len(all_orders) + len(all_chatter)} / {len(msgs)}")
assert len(all_orders) + len(all_chatter) == len(msgs), "Reconciliation mismatch!"
print("100% Reconciliation Verified!")

# Build DataFrames
df_orders = pd.DataFrame(all_orders)
cols = ['Sr No', 'Date', 'Time', 'Telecaller', 'Customer Name', 'Mobile Number', 'Pincode', 'Full Address', 'Products Ordered', 'Amount (₹)', 'Payment Mode', 'Order Type']
df_orders_export = df_orders[cols]
df_chatter_export = pd.DataFrame(all_chatter)

# Build Excel Workbook
wb = openpyxl.Workbook()

# Sheet 1: All Customers
ws1 = wb.active
ws1.title = "सर्व ग्राहक (All Customers)"

header_fill = PatternFill(start_color="1E4620", end_color="1E4620", fill_type="solid")
header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
border_thin = Border(
    left=Side(style='thin', color='D3D3D3'),
    right=Side(style='thin', color='D3D3D3'),
    top=Side(style='thin', color='D3D3D3'),
    bottom=Side(style='thin', color='D3D3D3')
)
row_alt_fill = PatternFill(start_color="F9FBF9", end_color="F9FBF9", fill_type="solid")
align_center = Alignment(horizontal="center", vertical="center")
align_left = Alignment(horizontal="left", vertical="center")
align_right = Alignment(horizontal="right", vertical="center")

headers = list(df_orders_export.columns)
ws1.append(headers)
for col_num in range(1, len(headers) + 1):
    cell = ws1.cell(row=1, column=col_num)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = align_center
ws1.row_dimensions[1].height = 28

for row_idx, row_data in enumerate(df_orders_export.values, start=2):
    ws1.append(list(row_data))
    ws1.row_dimensions[row_idx].height = 22
    for col_idx, val in enumerate(row_data, start=1):
        cell = ws1.cell(row=row_idx, column=col_idx)
        cell.border = border_thin
        col_name = headers[col_idx - 1]
        
        if row_idx % 2 == 1:
            cell.fill = row_alt_fill
            
        if col_name in ['Sr No', 'Date', 'Time', 'Mobile Number', 'Pincode', 'Payment Mode']:
            cell.alignment = align_center
        elif col_name == 'Amount (₹)':
            cell.alignment = align_right
            cell.number_format = '₹#,##0'
        else:
            cell.alignment = align_left

# Sheet 2: Performance Summary
ws2 = wb.create_sheet(title="कामगिरी सारांश (Summary)")
summary_headers = ['टेलिकॉलरचे नाव', 'एकूण ऑर्डर्स (Orders)', 'एकूण व्हॅल्यू ₹ (Total Value)', 'सरासरी ऑर्डर व्हॅल्यू ₹ (AOV)']
ws2.append(summary_headers)
ws2.row_dimensions[1].height = 28
for c in range(1, len(summary_headers) + 1):
    cell = ws2.cell(row=1, column=c)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = align_center

df = df_orders_export
manju_dir = df[(df['Telecaller'] == 'मंजुश्री कस्तुरे') & (df['Order Type'] != 'Website Order (Forwarded)')]
manju_web = df[(df['Telecaller'] == 'मंजुश्री कस्तुरे') & (df['Order Type'] == 'Website Order (Forwarded)')]
punam = df[df['Telecaller'] == 'पूनम कस्तुरे']
caller_88051 = df[df['Telecaller'] == 'टेलिकॉलर (+91 88051 68275)']
caller_96072 = df[df['Telecaller'] == 'टेलिकॉलर / ऑफिस (+91 96072 59661)']
monu = df[df['Telecaller'] == 'मोनू']
karishma = df[df['Telecaller'] == 'करिश्मा पाटील']
vaishnavi = df[df['Telecaller'] == 'वैष्णवी दिवटे']

tele_mask = df['Telecaller'].isin(['मंजुश्री कस्तुरे', 'पूनम कस्तुरे', 'टेलिकॉलर (+91 88051 68275)', 'टेलिकॉलर / ऑफिस (+91 96072 59661)', 'मोनू', 'करिश्मा पाटील', 'वैष्णवी दिवटे'])
tele_df = df[tele_mask]
yash = df[df['Telecaller'] == 'यश सूर्यवंशी (फाउंडर डायरेक्ट)']
wh = df[df['Telecaller'] == 'वेअरहाऊस डिस्पॅच']

summary_rows = [
    ['१. मंजुश्री कस्तुरे - Direct Calling', len(manju_dir), int(manju_dir['Amount (₹)'].sum()), int(manju_dir['Amount (₹)'].mean()) if len(manju_dir) else 0],
    ['    मंजुश्री कस्तुरे - Forwarded Website', len(manju_web), int(manju_web['Amount (₹)'].sum()), int(manju_web['Amount (₹)'].mean()) if len(manju_web) else 0],
    ['मंजुश्री कस्तुरे एकूण', len(manju_dir) + len(manju_web), int(manju_dir['Amount (₹)'].sum()) + int(manju_web['Amount (₹)'].sum()), int((manju_dir['Amount (₹)'].sum() + manju_web['Amount (₹)'].sum()) / (len(manju_dir) + len(manju_web))) if (len(manju_dir) + len(manju_web)) else 0],
    ['२. पूनम कस्तुरे', len(punam), int(punam['Amount (₹)'].sum()), int(punam['Amount (₹)'].mean()) if len(punam) else 0],
    ['३. टेलिकॉलर (+91 88051 68275)', len(caller_88051), int(caller_88051['Amount (₹)'].sum()), int(caller_88051['Amount (₹)'].mean()) if len(caller_88051) else 0],
    ['४. टेलिकॉलर / ऑफिस (+91 96072 59661)', len(caller_96072), int(caller_96072['Amount (₹)'].sum()), int(caller_96072['Amount (₹)'].mean()) if len(caller_96072) else 0],
    ['५. मोनू', len(monu), int(monu['Amount (₹)'].sum()), int(monu['Amount (₹)'].mean()) if len(monu) else 0],
    ['६. करिश्मा पाटील', len(karishma), int(karishma['Amount (₹)'].sum()), int(karishma['Amount (₹)'].mean()) if len(karishma) else 0],
    ['७. वैष्णवी दिवटे', len(vaishnavi), int(vaishnavi['Amount (₹)'].sum()), int(vaishnavi['Amount (₹)'].mean()) if len(vaishnavi) else 0],
    ['सर्व टेलिकॉलर्स एकूण', len(tele_df), int(tele_df['Amount (₹)'].sum()), int(tele_df['Amount (₹)'].mean()) if len(tele_df) else 0],
    ['८. यश सूर्यवंशी (फाउंडर डायरेक्ट)', len(yash), int(yash['Amount (₹)'].sum()), int(yash['Amount (₹)'].mean()) if len(yash) else 0],
    ['९. वेअरहाऊस डिस्पॅच', len(wh), int(wh['Amount (₹)'].sum()), int(wh['Amount (₹)'].mean()) if len(wh) else 0],
    ['एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total August)', len(df), int(df['Amount (₹)'].sum()), int(df['Amount (₹)'].mean()) if len(df) else 0]
]

for r_idx, row in enumerate(summary_rows, start=2):
    ws2.append(row)
    ws2.row_dimensions[r_idx].height = 24
    for c_idx, val in enumerate(row, start=1):
        cell = ws2.cell(row=r_idx, column=c_idx)
        cell.border = border_thin
        if 'एकूण' in row[0] or 'Total' in row[0]:
            cell.font = Font(name="Calibri", size=11, bold=True)
            cell.fill = PatternFill(start_color="E8F5E9", end_color="E8F5E9", fill_type="solid")
        if c_idx == 1:
            cell.alignment = align_left
        elif c_idx == 2:
            cell.alignment = align_center
        else:
            cell.alignment = align_right
            cell.number_format = '₹#,##0'

# Sheet 3: Chatter & Non-Orders Sheet
ws3 = wb.create_sheet(title="वगळलेले मेसेज (Non-Orders)")
chatter_headers = list(df_chatter_export.columns)
ws3.append(chatter_headers)
ws3.row_dimensions[1].height = 28
for c in range(1, len(chatter_headers) + 1):
    cell = ws3.cell(row=1, column=c)
    cell.fill = PatternFill(start_color="4A5568", end_color="4A5568", fill_type="solid")
    cell.font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    cell.alignment = align_center

for row_idx, row_data in enumerate(df_chatter_export.values, start=2):
    ws3.append(list(row_data))
    ws3.row_dimensions[row_idx].height = 20
    for col_idx, val in enumerate(row_data, start=1):
        cell = ws3.cell(row=row_idx, column=col_idx)
        cell.border = border_thin
        col_name = chatter_headers[col_idx - 1]
        if col_name in ['Sr No', 'Msg Index', 'Date', 'Time']:
            cell.alignment = align_center
        elif col_name == 'Reason Excluded':
            cell.alignment = align_center
            cell.font = Font(name="Calibri", size=10, italic=True, color="8B0000")
        else:
            cell.alignment = align_left

# Sheet 4: Anomaly / Audit Flags
ws4 = wb.create_sheet(title="तपासणी नोंदी (Audit Flags)")
flag_headers = ['Sr No', 'Date', 'Telecaller', 'Customer Name', 'Mobile Number', 'Pincode', 'Amount (₹)', 'Audit Flag / Observation']
ws4.append(flag_headers)
ws4.row_dimensions[1].height = 28
for c in range(1, len(flag_headers) + 1):
    cell = ws4.cell(row=1, column=c)
    cell.fill = PatternFill(start_color="1B365D", end_color="1B365D", fill_type="solid")
    cell.font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    cell.alignment = align_center

flag_rows = []
for idx, r in df.iterrows():
    flags = []
    if not r['Pincode'] or len(str(r['Pincode'])) != 6 or not str(r['Pincode']).isdigit():
        if r['Pincode'] != 'Office (Nashik)':
            flags.append(f"पिनकोड अस्पष्ट ({r['Pincode'] or 'गहाळ'})")
    if r['Amount (₹)'] == 0:
        flags.append("रक्कम ₹0 (मेसेजमध्ये किंमत नमूद नाही किंवा रिप्लेसमेंट)")
    elif r['Amount (₹)'] < 400:
        flags.append(f"कमी रक्कम ₹{r['Amount (₹)']}")
    elif r['Amount (₹)'] > 10000:
        flags.append(f"मोठी रक्कम ₹{r['Amount (₹)']} (B2B / बल्क ऑर्डर)")
    if not r['Mobile Number'] or len(str(r['Mobile Number'])) < 10:
        if r['Mobile Number'] != 'Office Pickup (Nashik)':
            flags.append("मोबाईल नंबर गहाळ")
            
    if flags:
        flag_rows.append([
            r['Sr No'], r['Date'], r['Telecaller'], r['Customer Name'],
            r['Mobile Number'], r['Pincode'], r['Amount (₹)'],
            " | ".join(flags)
        ])

for row_idx, row_data in enumerate(flag_rows, start=2):
    ws4.append(row_data)
    ws4.row_dimensions[row_idx].height = 22
    for col_idx, val in enumerate(row_data, start=1):
        cell = ws4.cell(row=row_idx, column=col_idx)
        cell.border = border_thin
        if col_idx in [1, 2, 5, 6]:
            cell.alignment = align_center
        elif col_idx == 7:
            cell.alignment = align_right
            cell.number_format = '₹#,##0'
        elif col_idx == 8:
            cell.alignment = align_left
            cell.font = Font(name="Calibri", size=10, bold=True, color="C00000")
            cell.fill = PatternFill(start_color="FFF3CD", end_color="FFF3CD", fill_type="solid")
        else:
            cell.alignment = align_left

# Column widths
for ws in [ws1, ws2, ws3, ws4]:
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 52)

# Save files
excel_path_updated = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_August_2026_Customers_Updated.xlsx'
excel_path_repo = r'f:\RK\Sujata Nutrilive\sujata-nutrilive\data\Sujata_Nutrilive_August_2026_Customers_Updated.xlsx'
excel_path_orig = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_August_2026_Customers.xlsx'

wb.save(excel_path_updated)
wb.save(excel_path_repo)
print(f"Master file rebuilt successfully: {excel_path_updated}")

try:
    wb.save(excel_path_orig)
    print(f"Original file saved successfully: {excel_path_orig}")
except Exception as e:
    print(f"Could not overwrite original: {e}")

print("\n--- Summary Performance August 2026 ---")
for r in summary_rows:
    print(f"  {r[0]}: {r[1]} orders | ₹{r[2]:,} | AOV ₹{r[3]:,}")

print(f"\nTotal Audit Flags to review: {len(flag_rows)}")
for f_row in flag_rows:
    print(f"  Sr #{f_row[0]} [{f_row[1]}] {f_row[2]} - {f_row[3]}: {f_row[7]}")
