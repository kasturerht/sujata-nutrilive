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

def extract_customer_record_v2(raw_text, caller_name, meta, sr_no):
    t = raw_text.replace('\r', '').strip()
    
    # 1. Customer Name
    name = ''
    if 'SUJATA NUTRILIVE — NEW ORDER' in t:
        m = re.search(r'👤 Client:\s*([^•\n]+)', t)
        if m:
            name = m.group(1).strip()
    
    if not name:
        m = re.search(r'(?:Name|नाव|Customer Name|Client)\s*[:=-]?\s*([^\n\r]+)', t, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            candidate = re.split(r'(?:Address|पत्ता|Mob|Ph|Pin|Contact|District|मु\s*पोस्ट|मु\.\s*पो|मुक्काम|तालुका|प्लॉट)', candidate, flags=re.IGNORECASE)[0].strip()
            if len(candidate) > 2:
                name = candidate
                
    if not name or len(name) < 2:
        lines = [l.strip() for l in t.split('\n') if l.strip()]
        for l in lines:
            if not re.search(r'^(?:🌿|🛒|📦|📍|🌐|COD|Prepaid|Name|नाव|Pin|Mobile|Phone|\+91|http|sample|hi\b|order|return)', l, re.IGNORECASE):
                cleaned = re.sub(r'^\s*(?:[\*\-\#•]|\d+[\.\)\-]\s*)+', '', l).strip()
                cleaned = re.sub(r'[\*]+', '', cleaned).strip()
                cleaned = re.split(r'(?:Address|पत्ता|Mob|Ph|Pin|Contact|District|मु\s*पोस्ट|मु\.\s*पो|मुक्काम|तालुका|प्लॉट|\b\d{6}\b)', cleaned, flags=re.IGNORECASE)[0].strip()
                if len(cleaned) > 2 and not re.search(r'spirulina|combo|capsule|tablet|soap|oil|shampoo|chikki|drops', cleaned, re.IGNORECASE):
                    name = cleaned
                    break
    
    if not name or len(name) < 2:
        name = meta.get('cust', 'Customer')
        
    name = re.sub(r'[\*\#]', '', name).strip()
    name = re.sub(r'\s+', ' ', name).strip()
    name = name.rstrip('.,-:')

    # 2. Mobile Number
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
    
    if not mobile_str:
        if 'Adhikar Chaudhari' in name:
            mobile_str = 'Office Pickup (Nashik)'
        elif 'Prakash Jadhav' in name or 'Vijay Bharambe' in name:
            mobile_str = 'Office Pickup (Nashik)'
        elif 'Sachin jaadhav' in name:
            mobile_str = 'Office Pickup (Nashik)'

    # 3. Pincode
    pincode = ''
    pin_m = re.search(r'(?:pin|pincode|post\s*code|code|pine|पिनकोड\s*नंबर)\s*[-:]?\s*(\d{3}\s*\d{3})\b', t, re.IGNORECASE)
    if pin_m:
        pincode = pin_m.group(1).replace(' ', '')
    else:
        phones_all = re.findall(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t)
        t_no_p = t
        for p in phones_all:
            t_no_p = t_no_p.replace(p, ' ')
        m6 = re.findall(r'\b([1-9]\d{2}\s*\d{3})\b', t_no_p)
        for c in m6:
            c_clean = c.replace(' ', '')
            if not c_clean.startswith('2026') and not c_clean.startswith('2024'):
                pincode = c_clean
                break
                
    if not pincode:
        if 'Biswajit Kumar Mahraj' in name:
            pincode = '743144'
        elif 'Annasaheb Tukaram Gawande' in name or '431011' in t:
            pincode = '431011'
        elif 'आशिष नानाजी वनकर' in name or 'Ashish Nanaji' in name or '445304' in t:
            pincode = '445304'
        elif 'Sandeep Pawar' in name:
            pincode = '422005'
        elif 'Office' in meta.get('type', '') or 'office' in t.lower():
            pincode = 'Office (Nashik)'
        elif 'Patel Varsha' in name or '380061' in t:
            pincode = '380061'

    # 4. Payment Mode
    pay_mode = 'COD'
    if re.search(r'\bprepaid\b', t, re.IGNORECASE) or 'PREPAID' in t or 'paid' in t.lower():
        pay_mode = 'Prepaid'
    elif 'office order' in t.lower() or 'cash' in t.lower():
        pay_mode = 'Office Cash'

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
        lines = [l.strip() for l in t.split('\n') if l.strip()]
        addr_lines = []
        for l in lines:
            if not re.search(r'(?:name|नाव|phone|mob|mo\.|pin|cod|prepaid|amount|rs\.|spirulina|combo|capsule|tablet|₹|\bfree\b|gift|order|details)', l, re.IGNORECASE):
                if len(l) > 4 and not l.startswith('http'):
                    addr_lines.append(l)
        if addr_lines:
            address = ", ".join(addr_lines)

    address = re.sub(r'[\*\#]', '', address).strip()
    address = re.sub(r'\s+', ' ', address).strip()
    if not address and ('Office' in meta.get('type', '') or 'office' in t.lower()):
        address = 'Sujata Nutrilive Office, Nashik'

    # 6. Products (FIXED: KEEP EXACT QUANTITIES LIKE 2, 3, etc.)
    products = []
    for line in t.split('\n'):
        l = line.strip()
        if re.search(r'spirulina|buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|facewash|oil|shampoo|paste|d3|tulshi|drops|spurlina', l, re.IGNORECASE):
            if not re.search(r'^(?:prepaid\b|cod\b|order\s*status|rec\s*by\s*cod)', l, re.IGNORECASE):
                # Only remove leading bullet symbols like -, *, •, or numbered list markers like "1. ", "2) "
                cleaned_prod = re.sub(r'^\s*(?:[\*\-\#•]|\d+[\.\)]\s+)', '', l).strip()
                cleaned_prod = re.sub(r'[\*]+', '', cleaned_prod).strip()
                if cleaned_prod and len(cleaned_prod) > 2 and not re.search(r'^(?:prepaid|cod|amount)\s*[:=-]?\s*\d', cleaned_prod, re.I):
                    products.append(cleaned_prod)
    
    prod_str = "; ".join(products) if products else "Healthy Life Combo Pack (Spirulina & Sea Buckthorn)"

    return {
        'Sr No': sr_no,
        'Date': meta.get('date', ''),
        'Telecaller': caller_name,
        'Customer Name': name,
        'Mobile Number': mobile_str,
        'Pincode': pincode,
        'Full Address': address,
        'Products Ordered': prod_str,
        'Amount (₹)': meta.get('amt', 0),
        'Payment Mode': pay_mode,
        'Order Type': meta.get('type', 'Direct Dispatch')
    }

records = []
sr = 1

for caller_key in ['Manjushree Kasture', 'Vaishnavi Diwate', 'Monu', 'Punam Kasture', 'Karishma Patil']:
    c_msgs = caller_msgs[caller_key]
    info = verified_data[caller_key]
    orders = info['directOrders'] + info['webOrders'] if caller_key == 'Manjushree Kasture' else info['orders']
    
    for o in orders:
        orig_msg = c_msgs[o['idx'] - 1]
        rec = extract_customer_record_v2(orig_msg['text'], caller_key, o, sr)
        records.append(rec)
        sr += 1

yash_msgs = [m for m in msgs if m['sender'] == 'Yash R. Suryawanshi']
yash_orders = []
for i, m in enumerate(yash_msgs):
    t = m['text'].replace('\r', '').strip()
    has_phone = bool(re.search(r'(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b', t))
    has_pin = bool(re.search(r'\b(?:4\d{5}|5\d{5}|7\d{5}|1\d{5}|2\d{5}|3\d{5}|6\d{5}|8\d{5})\b', t))
    has_prod = bool(re.search(r'spirulina|buckthorn|sea\s*buckthorn|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3', t, re.I))
    
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
            
        yash_orders.append({
            'text': t,
            'meta': {
                'date': m['dateStr'],
                'time': m['timeStr'],
                'amt': amt,
                'type': 'Founder Direct Order'
            }
        })

for yo in yash_orders:
    rec = extract_customer_record_v2(yo['text'], 'Yash Suryawanshi (Founder Direct)', yo['meta'], sr)
    records.append(rec)
    sr += 1

df = pd.DataFrame(records)

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

summary_rows = [
    ['मंजुश्री कस्तुरे (Manjushree) - Direct Calling', 68, 89732, 1320],
    ['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website', 15, 13566, 904],
    ['मंजुश्री कस्तुरे एकूण (Manjushree Total)', 83, 103298, 1245],
    ['वैष्णवी दिवटे (Vaishnavi Diwate)', 59, 79291, 1344],
    ['मोनू (Monu)', 61, 72860, 1194],
    ['पूनम कस्तुरे (Punam Kasture)', 47, 66620, 1417],
    ['करिश्मा पाटील (Karishma Patil)', 15, 15010, 1001],
    ['सर्व टेलिकॉलर्स एकूण (All Telecallers Total)', 265, 337079, 1272],
    ['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)', 27, 54010, 2000],
    ['एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total October)', 292, 391089, 1339]
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
excel_path_orig = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers.xlsx'
excel_path2 = r'f:\RK\Sujata Nutrilive\sujata-nutrilive\data\Sujata_Nutrilive_October_2026_Customers.xlsx'
csv_path = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers_Updated.csv'

wb.save(excel_path1)
wb.save(excel_path2)
try:
    wb.save(excel_path_orig)
    print("Saved original file as well.")
except Exception as e:
    print("Original file is currently open in Excel, saved to Updated file instead.")

df.to_csv(csv_path, index=False, encoding='utf-8-sig')

print(f"Successfully generated updated Excel at: {excel_path1}")
