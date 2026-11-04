import json
import re
import os
import sys
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')

# Load files
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

def clean_address_text(addr, phones, pin, cust_name):
    for p in phones:
        addr = re.sub(rf'(?:Mob|Mobile|Phone|Ph|Mo\.|Mb)?\s*[:=-]?\s*(?:\+91[\-\s]?)?{p}\b', '', addr, flags=re.I)
    addr = re.sub(r'(?:Mob|Mobile|Phone|Ph|Mo\.|Mb)\s*[:=-]?\s*[\d\s\+\-\/]{10,}', '', addr, flags=re.I)
    addr = re.sub(r'(?:COD|Prepaid|Paid|Advance)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*\d+(?:\s*(?:\/-|\+)\s*(?:delivery\s*charges?)?\s*\d*)?', '', addr, flags=re.I)
    addr = re.sub(r'\d+\s*(?:\/-|\/|\-)\s*(?:COD|Prepaid|Paid)', '', addr, flags=re.I)
    addr = re.sub(r'Payment\s*Mode\s*:\s*[^\n\r,]+', '', addr, flags=re.I)
    addr = re.sub(r'<This message was edited>', '', addr, flags=re.I)
    addr = re.sub(r'\bOrder on hold\b', '', addr, flags=re.I)
    addr = re.sub(r'\bSample Requirements:\b', '', addr, flags=re.I)
    addr = re.sub(rf'^(?:Name|नाव|Customer\s*Name)?\s*[:=-]?\s*{re.escape(cust_name)}\s*[,.:-]?\s*', '', addr, flags=re.I)
    addr = re.sub(r'^(?:Mo\.|Mb\.|Phone|Mob|Ph|Mobile\s*Number|Mobile\s*No\.?)\s*[,.:-]?\s*', '', addr, flags=re.I)
    addr = re.sub(r'^(?:Mobile\s*-\s*\(\+91\)\.?|Mob\s*no)\s*[,.:-]?\s*', '', addr, flags=re.I)
    addr = re.sub(r'\s+', ' ', addr)
    return addr.strip(' ,.-')

def parse_full_order(raw_text, caller_name, meta_order, sr_no):
    t = raw_text.replace('\r', '').strip()
    
    # 1. Website Template
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
        amt = round(float(amt_m.group(1))) if amt_m else meta_order.get('amt', 0)
        pin_m = re.search(r'\b([1-9]\d{5})\b', addr)
        pin = pin_m.group(1) if pin_m else ''
        pay_mode = 'Prepaid' if 'PREPAID' in t else 'COD'
        return {
            'Sr No': sr_no,
            'Date': meta_order.get('date', ''),
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

    is_office = 'office' in t.lower() or meta_order.get('type') == 'Office Delivery' or meta_order.get('type') == 'Office Order'
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
                
    if not pin:
        if 'Biswajit Kumar Mahraj' in t: pin = '743144'
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

    base_amt = meta_order.get('amt', 0)
    m_tot = re.search(r'(?:total\s*cod\s*amount|total\s*amount|total\s*cod|totalcod|total\s*[-:])\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})', t, re.I)
    if m_tot:
        amount = int(m_tot.group(1))
    elif del_charges > 0 and base_amt > 0:
        if re.search(rf'cod\s*{base_amt}\s*\+\s*delivery', t, re.I):
            amount = base_amt + del_charges
        elif f"{base_amt}/- COD" in t and f"Delivery charges {del_charges}" in t:
            amount = base_amt + del_charges
        elif f"COD {base_amt}/-" in t and f"Delivery charges {del_charges}" in t:
            amount = base_amt + del_charges
        elif f"COD{base_amt}/-" in t and f"Delivery charges {del_charges}" in t:
            amount = base_amt + del_charges
        elif f"{base_amt}/-" in t and f"delivery charges {del_charges}" in t.lower():
            amount = base_amt + del_charges
        else:
            amount = base_amt
    else:
        amount = base_amt

    if 'Nilesh Kharade' in t:
        amount = 1079

    pay_mode = 'COD'
    if re.search(r'\bprepaid\b', t, re.I) or 'PREPAID' in t or 'paid' in t.lower():
        pay_mode = 'Prepaid'
    elif 'office order' in t.lower() or 'cash' in t.lower():
        pay_mode = 'Office Cash'

    # Customer Name overrides
    name = ''
    addr_parts = []
    prod_lines = []

    if 'Adhikar Chaudhari' in meta_order.get('cust', ''):
        name = 'Adhikar Chaudhari'
        addr_parts = ['Sujata Nutrilive Office, Nashik']
    elif 'Prakash Jadhav' in meta_order.get('cust', ''):
        name = 'Prakash Jadhav'
        addr_parts = ['Sujata Nutrilive Office, Nashik']
    elif 'Vijay Bharambe' in meta_order.get('cust', ''):
        name = 'Vijay Bharambe'
        addr_parts = ['Sujata Nutrilive Office, Nashik']
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
    elif 'Upendra pathak' in t:
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

    lines = [l.strip() for l in t.split('\n') if l.strip()]

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

    raw_addr = ", ".join(addr_parts)
    full_address = clean_address_text(raw_addr, valid_phones, pin, name)

    if not name or len(name) < 2:
        name = meta_order.get('cust', 'Customer')
    name = re.sub(r'[\*\#]', '', name).strip(' ,.-')

    if not full_address or full_address.lower() == name.lower():
        if is_office:
            full_address = 'Sujata Nutrilive Office, Nashik'
        else:
            full_address = raw_text.split('\n')[1] if len(lines) > 1 else 'Address on File'

    prod_str = "; ".join(prod_lines) if prod_lines else "Healthy Life Combo Pack (Spirulina & Sea Buckthorn)"

    return {
        'Sr No': sr_no,
        'Date': meta_order.get('date', ''),
        'Telecaller': caller_name,
        'Customer Name': name,
        'Mobile Number': mobile_str,
        'Pincode': pin,
        'Full Address': full_address,
        'Products Ordered': prod_str,
        'Amount (₹)': amount,
        'Payment Mode': pay_mode,
        'Order Type': meta_order.get('type', 'Direct Dispatch')
    }

# Process all records
all_records = []
sr = 1

for caller_key in ['Manjushree Kasture', 'Vaishnavi Diwate', 'Monu', 'Punam Kasture', 'Karishma Patil']:
    c_msgs = caller_msgs[caller_key]
    info = verified_data[caller_key]
    orders = info['directOrders'] + info['webOrders'] if caller_key == 'Manjushree Kasture' else info['orders']
    
    for o in orders:
        orig = c_msgs[o['idx'] - 1]
        rec = parse_full_order(orig['text'], caller_key, o, sr)
        all_records.append(rec)
        sr += 1

# Process Yash's direct orders
yash_msgs = [m for m in msgs if m['sender'] == 'Yash R. Suryawanshi']
for i, m in enumerate(yash_msgs):
    t = m['text'].replace('\r', '').strip()
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t))
    has_pin = bool(re.search(r'\b(?:4\d{5}|5\d{5}|7\d{5}|1\d{5}|2\d{5}|3\d{5}|6\d{5}|8\d{5})\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|sea\s*buckthorn|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3', t, re.I))
    
    if 'pack kartana check kara' in t or 'porter karshil monu' in t:
        continue

    if (has_phone or has_pin) and has_prod and len(t) > 40:
        clean = re.sub(r'(\d),(\d{3})', r'\1\2', t)
        clean_no_phone = re.sub(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', ' [PHONE] ', clean)
        clean_no_phone = re.sub(r'\b[1-9]\d{5}\b', ' [PIN] ', clean_no_phone)
        amt = 0
        mTotal = re.search(r'(?:total\s*cod\s*amount|total\s*amount|total\s*cod|totalcod|rec\s*by\s*cod|cod\s*amount|order\s*amount|total\s*[-:])\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})', clean_no_phone, re.I)
        if mTotal: amt = int(mTotal.group(1))
        if not amt:
            mCod = re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})', clean_no_phone, re.I)
            if mCod: amt = int(mCod.group(1))
        if not amt:
            mSlash = re.search(r'(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?|\s*\/\s*cod|\s*rs\b)', clean_no_phone, re.I)
            if mSlash: amt = int(mSlash.group(1))
        if not amt:
            mPre = re.search(r'(\d{3,5})\s*(?:\/-\s*|\s*-\s*|\s*)(?:cod|prepaid|paid)', clean_no_phone, re.I)
            if mPre: amt = int(mPre.group(1))

        rec = parse_full_order(t, 'Yash Suryawanshi (Founder Direct)', {'date': m['dateStr'], 'amt': amt, 'type': 'Founder Direct Order'}, sr)
        all_records.append(rec)
        sr += 1

df = pd.DataFrame(all_records)

# Build workbook
wb = openpyxl.Workbook()
ws1 = wb.active
ws1.title = "ऑक्टोबर 2026 सर्व ग्राहक (All)"

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
            
        if col_name in ['Sr No', 'Date', 'Mobile Number', 'Pincode', 'Payment Mode']:
            cell.alignment = align_center
        elif col_name == 'Amount (₹)':
            cell.alignment = align_right
            cell.number_format = '₹#,##0'
        else:
            cell.alignment = align_left

ws2 = wb.create_sheet(title="टेलिकॉलर कामगिरी (Summary)")
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
    ['मंजुश्री कस्तुरे (Manjushree) - Direct Calling', len(manju_dir), int(manju_dir['Amount (₹)'].sum()), int(manju_dir['Amount (₹)'].mean())],
    ['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website', len(manju_web), int(manju_web['Amount (₹)'].sum()), int(manju_web['Amount (₹)'].mean())],
    ['मंजुश्री कस्तुरे एकूण (Manjushree Total)', len(manju_dir) + len(manju_web), int(manju_dir['Amount (₹)'].sum()) + int(manju_web['Amount (₹)'].sum()), int((manju_dir['Amount (₹)'].sum() + manju_web['Amount (₹)'].sum()) / (len(manju_dir) + len(manju_web)))],
    ['वैष्णवी दिवटे (Vaishnavi Diwate)', len(vaishnavi), int(vaishnavi['Amount (₹)'].sum()), int(vaishnavi['Amount (₹)'].mean())],
    ['मोनू (Monu)', len(monu), int(monu['Amount (₹)'].sum()), int(monu['Amount (₹)'].mean())],
    ['पूनम कस्तुरे (Punam Kasture)', len(punam), int(punam['Amount (₹)'].sum()), int(punam['Amount (₹)'].mean())],
    ['करिश्मा पाटील (Karishma Patil)', len(karishma), int(karishma['Amount (₹)'].sum()), int(karishma['Amount (₹)'].mean())],
    ['सर्व टेलिकॉलर्स एकूण (All Telecallers Total)', len(tele_df), int(tele_df['Amount (₹)'].sum()), int(tele_df['Amount (₹)'].mean())],
    ['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)', len(yash), int(yash['Amount (₹)'].sum()), int(yash['Amount (₹)'].mean())],
    ['एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total October)', len(df), int(df['Amount (₹)'].sum()), int(df['Amount (₹)'].mean())]
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

for ws in [ws1, ws2]:
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 48)

excel_path1 = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx'
excel_path2 = r'f:\RK\Sujata Nutrilive\sujata-nutrilive\data\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx'
wb.save(excel_path1)
wb.save(excel_path2)
print(f"Master file rebuilt successfully: {excel_path1}")
