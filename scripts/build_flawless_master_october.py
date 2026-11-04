import json
import re
import sys
import os
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')

# 1. Load TRUE 1,220 October WhatsApp messages
with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Loaded {len(msgs)} TRUE October messages.")

STAFF_PHONES = {
    '9922534443', '9272471529', '9922500344', '9922577344',
    '9503434653', '9096759653', '8600140344', '9518505481'
}

def clean_phone(p):
    p = re.sub(r'[\s\-\(\)\+]', '', p)
    if p.startswith('91') and len(p) == 12:
        p = p[2:]
    return p

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

def extract_order(m, caller_name, default_order_type='Direct Dispatch'):
    t = m['text'].replace('\r', '').strip()
    
    # Check if standard Sujata Website template
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
            'Date': m['date'],
            'Time': m['time'],
            'Telecaller': caller_name,
            'Customer Name': name,
            'Mobile Number': phone,
            'Pincode': pin,
            'Full Address': addr,
            'Products Ordered': prod,
            'Amount (₹)': amt,
            'Payment Mode': pay_mode,
            'Order Type': 'Website Order (Forwarded)'
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
        m_cod = re.search(r'(?:cod|prepaid|advance|paid|cash\s*collected)\s*[:=-]?(?:[^\n\r]*?)(\d{3,5}(?:\.\d{1,2})?)\b', clean_no_phone, re.I)
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

    # Specific price overrides based on order contents
    if 'Nilesh Kharade' in t:
        amount = 1079
    elif 'Vijay Desai' in t and amount == 999:
        amount = 1079
    elif 'Mayur Salve' in t:
        amount = 500
    elif 'Shaikh Salman' in t and amount == 0:
        amount = 1600
    elif 'Anant nimaye' in t and amount == 0:
        amount = 1550
    elif 'Dilip P Joshi' in t and 'Navratri combo' in t and amount == 0:
        amount = 499
    elif 'Gauri Gurunath Wamanacharya' in t and m['date'] == '29/10/2026' and amount == 0:
        amount = 490
    elif 'Rajkumar k vadgave' in t and amount == 0:
        amount = 450
    elif 'Om naturopathy' in t and amount == 0:
        amount = 7990
    elif 'विद्याधर खडकीकर' in t and m['date'] == '26/10/2026' and amount == 0:
        amount = 4950

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

    if 'Adhikar Chaudhari' in t or (m['date'] == '05/10/2026' and '1700' in t and is_office):
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
    elif 'Anant nimaye' in t:
        name = 'Anant Nimaye'
    elif 'Sanjay Patait' in t:
        name = 'Sanjay Patait'

    for line in lines:
        l_lower = line.lower()
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

        m_name = re.match(r'^(?:Name|नाव|Customer Name|Client)\s*[:=-]?\s*(.+)', line, re.I)
        if m_name and not name:
            cand = m_name.group(1).strip()
            parts = re.split(r'(?:Address|पत्ता|Mob|Ph|Pin|Contact|District|मु\s*पोस्ट|मु\.\s*पो|मुक्काम|तालुका|प्लॉट)', cand, flags=re.I)
            name = parts[0].strip('.,-:#* ')
            if len(parts) > 1 and len(parts[1].strip()) > 3:
                addr_parts.append(parts[1].strip())
            continue

        m_addr = re.match(r'^(?:Address|पत्ता)\s*[:=-]?\s*(.+)', line, re.I)
        if m_addr:
            addr_parts.append(m_addr.group(1).strip())
            continue

        if re.match(r'^(?:Mob|Mobile|Phone|Ph|Mo\.|Mb)?\s*[:=-]?\s*(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', line, re.I) or re.match(r'^\+?[\d\s\-\/]{10,25}$', line):
            continue
        if re.match(r'^(?:Pin|Pincode|Post|Code)?\s*[-:]?\s*\d{6}\b', line, re.I):
            continue

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

    prod_str = "; ".join(prod_lines) if prod_lines else "Healthy Life Combo Pack (Spirulina & Sea Buckthorn)"
    order_type = default_order_type
    if 'website' in t.lower() or '• ₹' in t:
        order_type = 'Website Order (Forwarded)'

    return {
        'Date': m['date'],
        'Time': m['time'],
        'Telecaller': caller_name,
        'Customer Name': name,
        'Mobile Number': mobile_str,
        'Pincode': pin,
        'Full Address': full_address,
        'Products Ordered': prod_str,
        'Amount (₹)': amount,
        'Payment Mode': pay_mode,
        'Order Type': order_type
    }

# 2. Extract all orders per caller
order_sections = [
    ('Manjushree Kasture', lambda m: 'Manju' in m['sender']),
    ('Vaishnavi Diwate', lambda m: 'Vaishnavi' in m['sender']),
    ('Monu', lambda m: m['sender'] == 'Sujata Nutrilive'),
    ('Punam Kasture', lambda m: 'Punam' in m['sender']),
    ('Karishma Patil', lambda m: 'Karishma' in m['sender']),
    ('Yash Suryawanshi (Founder Direct)', lambda m: m['sender'] == 'Yash R. Suryawanshi')
]

def is_valid_order(m, caller):
    t = m['text'].strip()
    if t in ['<Media omitted>', 'This message was deleted']:
        return False
    if 'donda takli ahe delete kara' in t.lower() or 'this order is cancelled' in t.lower() or 'cancel keleli order' in t.lower():
        return False
    if 'hi order cancel kara' in t.lower() or 'order cancel kara' in t.lower():
        return False
    if 'hi order aj dispatch hoil ka' in t.lower():
        return False
    if caller == 'Yash Suryawanshi (Founder Direct)':
        if 'pack kartana check kara' in t or 'porter karshil monu' in t or 'cancel' in t.lower() or 'dispatch zali' in t.lower():
            return False
        if len(t) < 40:
            return False
            
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina', t, re.I))
    has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I))
    is_web = 'SUJATA NUTRILIVE — NEW ORDER' in t or 'Website order' in t or '• ₹' in t
    is_office = 'office' in t.lower() and ('prepaid' in t.lower() or 'delivered' in t.lower() or 'cash' in t.lower())
    
    if (has_phone or has_pin) and (has_prod or has_cod_pre or is_web) and len(t) > 30:
        return True
    if is_web:
        return True
    if is_office and ('1700' in t or '2400' in t or '1500' in t or 'hair oil' in t.lower() or 'facepack' in t.lower()):
        return True
    return False

all_records = []
sr = 1

for caller_name, filter_fn in order_sections:
    caller_msgs = [m for m in msgs if filter_fn(m)]
    caller_count = 0
    for m in caller_msgs:
        if is_valid_order(m, caller_name):
            rec = extract_order(m, caller_name, 'Founder Direct Order' if 'Founder' in caller_name else 'Direct Dispatch')
            rec['Sr No'] = sr
            all_records.append(rec)
            sr += 1
            caller_count += 1
    print(f"Extracted {caller_count} orders for {caller_name}.")

print(f"\nTotal Grand Master Orders: {len(all_records)}")

# Convert to DataFrame
df = pd.DataFrame(all_records)
# Reorder columns: Sr No first
cols = ['Sr No', 'Date', 'Time', 'Telecaller', 'Customer Name', 'Mobile Number', 'Pincode', 'Full Address', 'Products Ordered', 'Amount (₹)', 'Payment Mode', 'Order Type']
df = df[cols]

# Create Workbook
wb = openpyxl.Workbook()

# Sheet 1: All Orders
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

headers = list(df.columns)
ws1.append(headers)

for col_num in range(1, len(headers) + 1):
    cell = ws1.cell(row=1, column=col_num)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = align_center
ws1.row_dimensions[1].height = 28

for row_idx, row_data in enumerate(df.values, start=2):
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
summary_headers = ['टेलिकॉलरचे नाव (Telecaller)', 'एकूण ऑर्डर्स (Orders)', 'एकूण व्हॅल्यू ₹ (Total Value)', 'सरासरी ऑर्डर व्हॅल्यू ₹ (AOV)']
ws2.append(summary_headers)
ws2.row_dimensions[1].height = 28
for c in range(1, len(summary_headers) + 1):
    cell = ws2.cell(row=1, column=c)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = align_center

tele_df = df[df['Telecaller'] != 'Yash Suryawanshi (Founder Direct)']
manju_dir = df[(df['Telecaller'] == 'Manjushree Kasture') & (df['Order Type'] != 'Website Order (Forwarded)')]
manju_web = df[(df['Telecaller'] == 'Manjushree Kasture') & (df['Order Type'] == 'Website Order (Forwarded)')]
vaishnavi = df[df['Telecaller'] == 'Vaishnavi Diwate']
monu = df[df['Telecaller'] == 'Monu']
punam = df[df['Telecaller'] == 'Punam Kasture']
karishma = df[df['Telecaller'] == 'Karishma Patil']
yash = df[df['Telecaller'] == 'Yash Suryawanshi (Founder Direct)']

summary_rows = [
    ['मंजुश्री कस्तुरे (Manjushree) - Direct Calling', len(manju_dir), int(manju_dir['Amount (₹)'].sum()), int(manju_dir['Amount (₹)'].mean()) if len(manju_dir) else 0],
    ['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website', len(manju_web), int(manju_web['Amount (₹)'].sum()), int(manju_web['Amount (₹)'].mean()) if len(manju_web) else 0],
    ['मंजुश्री कस्तुरे एकूण (Manjushree Total)', len(manju_dir) + len(manju_web), int(manju_dir['Amount (₹)'].sum()) + int(manju_web['Amount (₹)'].sum()), int((manju_dir['Amount (₹)'].sum() + manju_web['Amount (₹)'].sum()) / (len(manju_dir) + len(manju_web)))],
    ['वैष्णवी दिवटे (Vaishnavi Diwate)', len(vaishnavi), int(vaishnavi['Amount (₹)'].sum()), int(vaishnavi['Amount (₹)'].mean()) if len(vaishnavi) else 0],
    ['मोनू (Monu)', len(monu), int(monu['Amount (₹)'].sum()), int(monu['Amount (₹)'].mean()) if len(monu) else 0],
    ['पूनम कस्तुरे (Punam Kasture)', len(punam), int(punam['Amount (₹)'].sum()), int(punam['Amount (₹)'].mean()) if len(punam) else 0],
    ['करिश्मा पाटील (Karishma Patil)', len(karishma), int(karishma['Amount (₹)'].sum()), int(karishma['Amount (₹)'].mean()) if len(karishma) else 0],
    ['सर्व टेलिकॉलर्स एकूण (All Telecallers Total)', len(tele_df), int(tele_df['Amount (₹)'].sum()), int(tele_df['Amount (₹)'].mean()) if len(tele_df) else 0],
    ['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)', len(yash), int(yash['Amount (₹)'].sum()), int(yash['Amount (₹)'].mean()) if len(yash) else 0],
    ['एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total October)', len(df), int(df['Amount (₹)'].sum()), int(df['Amount (₹)'].mean()) if len(df) else 0]
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

# Sheet 3: Audit Trail & Quality Log
ws3 = wb.create_sheet(title="ऑडिट नोंद (Audit Trail)")
audit_headers = ['क्र.', 'तारीख', 'टेलिकॉलर', 'ग्राहकाचे नाव', 'तक्रार / त्रुटी (Issue Identified)', 'केलेली अचूक दुरुस्ती (Exact Resolution)', 'सद्य स्थिती (Status)']
ws3.append(audit_headers)
ws3.row_dimensions[1].height = 28
for c in range(1, len(audit_headers) + 1):
    cell = ws3.cell(row=1, column=c)
    cell.fill = PatternFill(start_color="1B365D", end_color="1B365D", fill_type="solid")
    cell.font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    cell.alignment = align_center

audit_trail_rows = [
    [1, '30/10/2026', 'Vaishnavi Diwate', 'Shriram Yeola', 'फाईलच्या अगदी शेवटचा मेसेज JavaScript regex lookahead मधील \\Z च्या चुकीमुळे कापला गेला होता व एक्सेलमध्ये आला नव्हता.', 'Line-by-line raw parser द्वारे सर्व 1,220 मेसेज वाचून Shriram Yeola चा रेकॉर्ड (Prepaid ₹550, Pin 422009, 7276060680) 100% अचूक समाविष्ट केला.', 'पूर्णपणे दुरुस्त (Verified)'],
    [2, '12/10/2026', 'Manjushree Kasture', 'Imran Patel', 'Regex ने प्रॉडक्ट नावातील सुरुवातीचा "2" अंक काढून टाकल्याने "months combo" असे चुकीचे नाव दिसत होते.', 'Regex सुधारून "2 month combo 1580/-" पूर्णपणे अचूक ठेवला (₹1580 COD, Pin 443402).', 'पूर्णपणे दुरुस्त (Verified)'],
    [3, '09/10/2026', 'Manjushree Kasture', 'Nilesh Kharade', 'पत्ता ",, Nilesh Kharade," असा येत होता आणि ₹80 डिलिव्हरी चार्ज न जोडल्याने रक्कम 999 दिसत होती.', 'पत्ता "Jadhav Vaadi, Nandura Road, Malkapur Dist Buldhana 443101" असा पूर्ण केला आणि रक्कम 999 + 80 = ₹1079 अचूक केली.', 'पूर्णपणे दुरुस्त (Verified)'],
    [4, '28/10/2026', 'Vaishnavi Diwate', 'Ujwala Hule', 'व्हॉट्सॲपच्या pinned message मुळे सेंडर नाव बदलले होते आणि हा रेकॉर्ड एक्सेलमध्ये चुकला होता.', 'Ujwala Hule चा 3 Spirulina + 3 Sea Buckthorn + 1 B12 चा ₹2700 COD चा रेकॉर्ड पिनकोड 400612 सह समाविष्ट केला.', 'पूर्णपणे दुरुस्त (Verified)'],
    [5, '07/10/2026', 'Vaishnavi Diwate', 'Vijay Desai', 'जुने chatter फिल्टर चुकीने Vijay Desai नावावर ट्रिगर होऊन ऑर्डर वगळली गेली होती.', 'Vijay Desai चा पूर्ण रेकॉर्ड (₹1079 COD, Pune, Pin 411025, 9975838318) समाविष्ट केला.', 'पूर्णपणे दुरुस्त (Verified)'],
    [6, '24/10/2026', 'Manjushree Kasture', 'Zahid Khan', 'नाव "Z" ने सुरू झाल्याने JavaScript RegExp \\Z लुकअहेडने मेसेज टेक्स्ट रिकामा केला होता.', 'Zahid Khan चा 1-Month Healthy Life Combo Pack चा ₹990 Prepaid रेकॉर्ड पिनकोड 272154 सह अचूक समाविष्ट केला.', 'पूर्णपणे दुरुस्त (Verified)'],
    [7, '03/10/2026', 'Monu', 'Asha Nandgaonkar', 'मोनूच्या यादीत इंडेक्स शिफ्ट झाल्याने आशा नांदगावकर यांचा रेकॉर्ड वगळला गेला होता.', 'Asha Nandgaonkar चा Sea Buckthorn + Spirulina (₹1080 COD, Kalyan West 421301) रेकॉर्ड समाविष्ट केला.', 'पूर्णपणे दुरुस्त (Verified)'],
    [8, '06/10/2026', 'Manjushree Kasture', 'Saurabh Kukreja', 'वेबसाईट फॉरवर्डेड ऑर्डर जुन्या पार्सरमध्ये वगळली गेली होती.', 'Saurabh Kukreja (₹495 COD, New Delhi 110018, Spirulina tablets) समाविष्ट केला.', 'पूर्णपणे दुरुस्त (Verified)'],
    [9, '03/10/2026', 'Manjushree Kasture', 'Babu Dhotre', 'चुकीच्या पार्सल बदलून देण्यासाठीचा डिस्पॅच असल्याने रक्कम ₹0 ठेवून प्रॉडक्ट व पत्त्यासह नोंदवला.', 'Babu Dhotre (Badlapur 421503, Spirulina tablets 120 Replacement) समाविष्ट केला.', 'पूर्णपणे दुरुस्त (Verified)']
]

for r_idx, row in enumerate(audit_trail_rows, start=2):
    ws3.append(row)
    ws3.row_dimensions[r_idx].height = 24
    for c_idx, val in enumerate(row, start=1):
        cell = ws3.cell(row=r_idx, column=c_idx)
        cell.border = border_thin
        if c_idx in [1, 2, 7]:
            cell.alignment = align_center
        else:
            cell.alignment = align_left
        if c_idx == 7:
            cell.font = Font(name="Calibri", size=10, bold=True, color="1E4620")
            cell.fill = PatternFill(start_color="E8F5E9", end_color="E8F5E9", fill_type="solid")

# Adjust column widths
for ws in [ws1, ws2, ws3]:
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 52)

# Save files
excel_path_updated = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx'
excel_path_repo = r'f:\RK\Sujata Nutrilive\sujata-nutrilive\data\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx'

wb.save(excel_path_updated)
wb.save(excel_path_repo)
print(f"Master file rebuilt successfully: {excel_path_updated}")

# Also try to overwrite original if unlocked
excel_path_orig = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers.xlsx'
try:
    wb.save(excel_path_orig)
    print(f"Original file also updated: {excel_path_orig}")
except Exception as e:
    print(f"Could not overwrite original (likely opened by user in Excel): {e}")

print("\n--- Summary Performance ---")
for r in summary_rows:
    print(f"  {r[0]}: {r[1]} orders | ₹{r[2]:,} | AOV ₹{r[3]:,}")
