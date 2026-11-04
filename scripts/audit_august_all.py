import json
import re
import sys
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total August 2026 TRUE messages: {len(msgs)}")

STAFF_PHONES = {
    '9922534443', '9272471529', '9922500344', '9922577344',
    '9503434653', '9096759653', '8600140344', '9518505481',
    '9607259661', '8805168275'
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

def extract_order_fields(m, caller_name, default_order_type='Direct Dispatch'):
    t = m['text'].replace('\r', '').strip()
    
    # Website Template
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

    is_office = 'office' in t.lower() or 'office order' in t.lower() or 'delivered from office' in t.lower() or 'office pickup' in t.lower()
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
            if not c_clean.startswith('2026') and not c_clean.startswith('2024') and not c_clean.startswith('2025'):
                pin = c_clean
                break
                
    if not pin and is_office:
        pin = 'Office (Nashik)'

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
        # Check number before /-
        m_slash = re.search(r'(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid|paid)?|\s*\/\s*cod|\s*rs\b)', clean_no_phone, re.I)
        if m_slash:
            amount = int(m_slash.group(1))
        else:
            # Same line scan for COD/Prepaid with text
            m_same_line = re.search(r'(?:cod|prepaid|advance|paid|cash\s*collected)\s*[:=-]?(?:[^\r\n]*?)(\d{3,5})\b', clean_no_phone, re.I)
            if m_same_line:
                amount = int(m_same_line.group(1))
            else:
                m_rs = re.search(r'(?:rs\.?|inr|₹)[^\S\r\n]*(\d{3,5}(?:\.\d{1,2})?)', clean_no_phone, re.I)
                if m_rs:
                    amount = round(float(m_rs.group(1)))
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

print("August order extractor initialized.")

# Define sections
order_sections = [
    ('Manjushree Kasture', lambda m: 'Manju' in m['sender']),
    ('Punam Kasture', lambda m: 'Punam' in m['sender']),
    ('Vaishnavi Diwate', lambda m: 'Vaishnavi' in m['sender']),
    ('Monu', lambda m: m['sender'] == 'Sujata Nutrilive'),
    ('Karishma Patil', lambda m: 'Karishma' in m['sender']),
    ('टेलिकॉलर (+91 88051 68275)', lambda m: m['sender'] == '+91 88051 68275'),
    ('टेलिकॉलर / ऑफिस (+91 96072 59661)', lambda m: m['sender'] == '+91 96072 59661'),
    ('Yash Suryawanshi (Founder Direct)', lambda m: m['sender'] == 'Yash R. Suryawanshi'),
    ('Amazon / Warehouse Dispatch', lambda m: m['sender'] in ['Om Amazon Dispatch', '+91 86001 40344', 'RK'])
]

def is_valid_aug_order(m, caller):
    t = m['text'].strip()
    if t in ['<Media omitted>', 'This message was deleted']:
        return False, 'Media/Deleted'
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
    if caller == 'Yash Suryawanshi (Founder Direct)':
        if 'pack kartana check kara' in t or 'porter karshil monu' in t or 'cancel' in t.lower() or 'dispatch zali' in t.lower():
            return False, 'Founder Admin Instruction'
        if len(t) < 40:
            return False, 'Short Query / Chatter'
            
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)) or bool(re.search(r'\b[6-9]\d{9}\b', t))
    has_pin = bool(re.search(r'\b[1-9]\d{5}\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|seabukthron|seabukthon|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops|spurlina|bottle|wheatgrass', t, re.I))
    has_cod_pre = bool(re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*\d+', t, re.I)) or bool(re.search(r'\d+\s*(?:\/-|\/|\-)\s*(?:cod|prepaid)', t, re.I))
    is_web = 'SUJATA NUTRILIVE — NEW ORDER' in t or 'Website order' in t or '• ₹' in t
    is_office = 'office' in t.lower() and ('prepaid' in t.lower() or 'delivered' in t.lower() or 'cash' in t.lower())
    
    if (has_phone or has_pin) and (has_prod or has_cod_pre or is_web) and len(t) > 30:
        return True, 'Valid Order'
    if is_web:
        return True, 'Valid Web Order'
    if is_office and ('1700' in t or '2400' in t or '1500' in t or 'hair oil' in t.lower() or 'facepack' in t.lower() or 'delivered from office' in t.lower()):
        return True, 'Office Order'
    return False, 'Chatter / Query / Not an Order'

all_aug_records = []
all_chatter_records = []
sr = 1
chatter_sr = 1

for caller_name, filter_fn in order_sections:
    caller_msgs = [m for m in msgs if filter_fn(m)]
    order_cnt = 0
    chatter_cnt = 0
    for m in caller_msgs:
        is_order, reason = is_valid_aug_order(m, caller_name)
        if is_order:
            default_t = 'Founder Direct Order' if 'Founder' in caller_name else ('Amazon/Warehouse Order' if 'Warehouse' in caller_name else 'Direct Dispatch')
            rec = extract_order_fields(m, caller_name, default_t)
            rec['Sr No'] = sr
            all_aug_records.append(rec)
            sr += 1
            order_cnt += 1
        else:
            all_chatter_records.append({
                'Sr No': chatter_sr,
                'Date': m['date'],
                'Time': m['time'],
                'Sender': m['sender'],
                'Telecaller': caller_name,
                'Reason Excluded': reason,
                'Raw Message Text': m['text']
            })
            chatter_sr += 1
            chatter_cnt += 1
    print(f"{caller_name}: {order_cnt} orders, {chatter_cnt} chatter/non-orders.")

print(f"\nTotal August Orders: {len(all_aug_records)}")
print(f"Total August Chatter / Non-orders: {len(all_chatter_records)}")

accounted_msgs = len(all_aug_records) + len(all_chatter_records)
print(f"Accounted Messages: {accounted_msgs} / {len(msgs)}")

# Build DataFrame
df = pd.DataFrame(all_aug_records)
cols = ['Sr No', 'Date', 'Time', 'Telecaller', 'Customer Name', 'Mobile Number', 'Pincode', 'Full Address', 'Products Ordered', 'Amount (₹)', 'Payment Mode', 'Order Type']
df = df[cols]

chatter_df = pd.DataFrame(all_chatter_records)

# Build Excel Workbook
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

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

tele_df = df[~df['Telecaller'].isin(['Yash Suryawanshi (Founder Direct)', 'Amazon / Warehouse Dispatch'])]
manju_dir = df[(df['Telecaller'] == 'Manjushree Kasture') & (df['Order Type'] != 'Website Order (Forwarded)')]
manju_web = df[(df['Telecaller'] == 'Manjushree Kasture') & (df['Order Type'] == 'Website Order (Forwarded)')]
punam = df[df['Telecaller'] == 'Punam Kasture']
caller_88051 = df[df['Telecaller'] == 'टेलिकॉलर (+91 88051 68275)']
caller_96072 = df[df['Telecaller'] == 'टेलिकॉलर / ऑफिस (+91 96072 59661)']
monu = df[df['Telecaller'] == 'Monu']
vaishnavi = df[df['Telecaller'] == 'Vaishnavi Diwate']
karishma = df[df['Telecaller'] == 'Karishma Patil']
yash = df[df['Telecaller'] == 'Yash Suryawanshi (Founder Direct)']
wh = df[df['Telecaller'] == 'Amazon / Warehouse Dispatch']

summary_rows = [
    ['मंजुश्री कस्तुरे (Manjushree) - Direct Calling', len(manju_dir), int(manju_dir['Amount (₹)'].sum()), int(manju_dir['Amount (₹)'].mean()) if len(manju_dir) else 0],
    ['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website', len(manju_web), int(manju_web['Amount (₹)'].sum()), int(manju_web['Amount (₹)'].mean()) if len(manju_web) else 0],
    ['मंजुश्री कस्तुरे एकूण (Manjushree Total)', len(manju_dir) + len(manju_web), int(manju_dir['Amount (₹)'].sum()) + int(manju_web['Amount (₹)'].sum()), int((manju_dir['Amount (₹)'].sum() + manju_web['Amount (₹)'].sum()) / (len(manju_dir) + len(manju_web))) if (len(manju_dir) + len(manju_web)) else 0],
    ['पूनम कस्तुरे (Punam Kasture)', len(punam), int(punam['Amount (₹)'].sum()), int(punam['Amount (₹)'].mean()) if len(punam) else 0],
    ['टेलिकॉलर (+91 88051 68275)', len(caller_88051), int(caller_88051['Amount (₹)'].sum()), int(caller_88051['Amount (₹)'].mean()) if len(caller_88051) else 0],
    ['टेलिकॉलर / ऑफिस (+91 96072 59661)', len(caller_96072), int(caller_96072['Amount (₹)'].sum()), int(caller_96072['Amount (₹)'].mean()) if len(caller_96072) else 0],
    ['मोनू (Monu)', len(monu), int(monu['Amount (₹)'].sum()), int(monu['Amount (₹)'].mean()) if len(monu) else 0],
    ['वैष्णवी दिवटे (Vaishnavi Diwate)', len(vaishnavi), int(vaishnavi['Amount (₹)'].sum()), int(vaishnavi['Amount (₹)'].mean()) if len(vaishnavi) else 0],
    ['करिश्मा पाटील (Karishma Patil)', len(karishma), int(karishma['Amount (₹)'].sum()), int(karishma['Amount (₹)'].mean()) if len(karishma) else 0],
    ['सर्व टेलिकॉलर्स एकूण (All Telecallers Total)', len(tele_df), int(tele_df['Amount (₹)'].sum()), int(tele_df['Amount (₹)'].mean()) if len(tele_df) else 0],
    ['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)', len(yash), int(yash['Amount (₹)'].sum()), int(yash['Amount (₹)'].mean()) if len(yash) else 0],
    ['ॲमेझॉन / वेअरहाऊस डिस्पॅच (Amazon / Warehouse)', len(wh), int(wh['Amount (₹)'].sum()), int(wh['Amount (₹)'].mean()) if len(wh) else 0],
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
chatter_headers = list(chatter_df.columns)
ws3.append(chatter_headers)
ws3.row_dimensions[1].height = 28
for c in range(1, len(chatter_headers) + 1):
    cell = ws3.cell(row=1, column=c)
    cell.fill = PatternFill(start_color="4A5568", end_color="4A5568", fill_type="solid")
    cell.font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    cell.alignment = align_center

for row_idx, row_data in enumerate(chatter_df.values, start=2):
    ws3.append(list(row_data))
    ws3.row_dimensions[row_idx].height = 20
    for col_idx, val in enumerate(row_data, start=1):
        cell = ws3.cell(row=row_idx, column=col_idx)
        cell.border = border_thin
        col_name = chatter_headers[col_idx - 1]
        if col_name in ['Sr No', 'Date', 'Time']:
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
    if not r['Pincode'] or len(r['Pincode']) != 6 or not r['Pincode'].isdigit():
        if r['Pincode'] != 'Office (Nashik)':
            flags.append(f"पिनकोड अस्पष्ट ({r['Pincode'] or 'गहाळ'})")
    if r['Amount (₹)'] == 0:
        flags.append("रक्कम ₹0 (मेसेजमध्ये किंमत नमूद नाही किंवा रिप्लेसमेंट)")
    elif r['Amount (₹)'] < 400:
        flags.append(f"कमी रक्कम ₹{r['Amount (₹)']}")
    elif r['Amount (₹)'] > 10000:
        flags.append(f"मोठी रक्कम ₹{r['Amount (₹)']} (B2B / बल्क ऑर्डर)")
    if not r['Mobile Number'] or len(r['Mobile Number']) < 10:
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
for f_row in flag_rows[:10]:
    print(f"  Sr #{f_row[0]} [{f_row[1]}] {f_row[2]} - {f_row[3]}: {f_row[7]}")
