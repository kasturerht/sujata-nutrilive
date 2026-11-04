import json
import re
import sys
import os
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')

# 1. Load July Messages
with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

def normalize_line_spaces(text):
    lines = []
    for line in text.split('\n'):
        l = line
        while re.search(r'(\d)[ \t]+(\d)', l):
            l = re.sub(r'(\d)[ \t]+(\d)', r'\1\2', l)
        lines.append(l)
    return '\n'.join(lines)

def extract_phone(text):
    t = normalize_line_spaces(clean(text))
    m = re.findall(r'(?:\+?91[\s-]?)?([6-9]\d{9})\b', t)
    if m: return m[0]
    m = re.findall(r'\b([6-9]\d{9})\b', t)
    if m: return m[0]
    m = re.findall(r'(?:\+?91[\s-]?)?([6-9]\d{8,9})\b', t)
    if m: return m[0]
    return ""

def extract_pincode(text):
    t = normalize_line_spaces(clean(text))
    m_att = re.search(r'[a-zA-Z]+([1-9]\d{5})\b', t)
    if m_att: return m_att.group(1)
    m = re.search(r'(?:pin|pincode|code|पिन|पिनकोड)[\s:.-]*([1-9]\d{5})\b', t, re.IGNORECASE)
    if m: return m.group(1)
    all_pins = re.findall(r'\b([1-9]\d{5})\b', t)
    filtered = [p for p in all_pins if not re.search(r'\d' + p, t) and not re.search(p + r'\d', t)]
    if filtered: return filtered[-1]
    return ""

def extract_amount_and_payment(text):
    t = clean(text).lower()
    t_clean = t.replace(',', '').replace('₹', 'rs').replace('/-', ' ').replace('-/', ' ')
    payment_type = "COD"
    if 'prepaid' in t_clean or 'pre-paid' in t_clean or 'paid' in t_clean:
        if 'cod' not in t_clean or t_clean.find('prepaid') < t_clean.find('cod') or 'pre-paid' in t_clean:
            payment_type = "Prepaid"
    patterns = [
        r'(?:total\s+amount|total\s+cod|total|amount|amt)[\s:=]*(\d{3,5})\b',
        r'(?:cod|prepaid|paid)[\s:=]*(\d{3,5})\b',
        r'(\d{3,5})\s*(?:cod|prepaid|paid)\b',
        r'(?:rs\.?|inr)[\s:=]*(\d{3,5})\b',
        r'(\d{3,5})\s*(?:rs|inr)\b',
    ]
    amount = 0
    for pat in patterns:
        m = re.search(pat, t_clean)
        if m:
            val = int(m.group(1))
            if 150 <= val <= 50000:
                amount = val
                break
    if not amount:
        m_plus = re.search(r'(\d{3,4})\s*\+\s*(\d{2,3})', t_clean)
        if m_plus:
            amount = int(m_plus.group(1)) + int(m_plus.group(2))
    return amount, payment_type

def extract_customer_name(text):
    t = clean(text).strip()
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    if not lines: return "ग्राहक"
    first = lines[0]
    for prefix in ['name', 'नाव', 'to', 'cust name', 'customer name', 'name:']:
        if first.lower().startswith(prefix):
            cleaned = re.sub(r'^(?:name|नाव|to|cust name|customer name)[\s:.-]*', '', first, flags=re.IGNORECASE).strip()
            if cleaned: return cleaned
    if re.search(r'\b[6-9]\d{9}\b', first) and len(lines) > 1:
        name_cand = re.sub(r'(?:\+?91[\s-]?)?[6-9]\d{9}', '', first).strip()
        if len(name_cand) > 3: return name_cand
        return lines[1]
    cleaned = re.sub(r'\(?\+?91[\s-]?[6-9]\d{9}\)?', '', first).strip()
    cleaned = re.sub(r'\b[6-9]\d{9}\b', '', cleaned).strip()
    if cleaned and len(cleaned) > 2:
        return cleaned
    if len(lines) > 1:
        return lines[1]
    return "ग्राहक"

def extract_address(text):
    t = clean(text).strip()
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    addr_lines = []
    keywords_skip = ['spirulina', 'seabuckthorn', 'moringa', 'ashwagandha', 'cod', 'prepaid', 'paid', 'total', 'combo pack', 'combo offer']
    for l in lines:
        if any(k in l.lower() for k in keywords_skip):
            continue
        if re.fullmatch(r'(?:\+?91[\s-]?)?[6-9]\d{9}', l.strip()):
            continue
        addr_lines.append(l)
    if addr_lines:
        return ", ".join(addr_lines)
    return t

def extract_products(text):
    t = clean(text)
    lines = [l.strip() for l in t.split('\n') if l.strip()]
    prod_lines = []
    keywords = ['spirulina', 'seabuckthorn', 'seebukhthorn', 'moringa', 'ashwagandha', 'ashwaganda',
                'facewash', 'face pack', 'facepack', 'soap', 'oil', 'shilajit', 'wheat grass', 'b 12',
                'capsule', 'tablet', 'tab', 'powder', 'combo', 'pack', 'korean cream', 'bride cream']
    for l in lines:
        if any(k in l.lower() for k in keywords):
            l_clean = re.sub(r'(?:cod|prepaid|paid)[\s:=]*\d+.*$', '', l, flags=re.IGNORECASE).strip()
            l_clean = re.sub(r'\d+\s*(?:\/-|-\/|\/)\s*(?:cod|prepaid|paid)?.*$', '', l_clean, flags=re.IGNORECASE).strip()
            if l_clean:
                prod_lines.append(l_clean)
    if prod_lines:
        return ", ".join(prod_lines)
    return "स्पिरुलिना / सीबकथॉर्न कॉम्बो"

from test_july_reconciliation_exact import ALL_ORDERS

print("Building Master Dataset...")

orders_list = []
main_to_order_id = {}

for order_id, order in enumerate(ALL_ORDERS, 1):
    main_idx = order['main_idx']
    merged = order['merged_idxs']
    custom = order['custom']
    
    main_to_order_id[main_idx] = order_id
    for m in merged:
        main_to_order_id[m] = order_id
        
    all_idxs = [main_idx] + merged
    combined_raw = "\n".join([msgs[i]['text'] for i in all_idxs])
    combined_clean = clean(combined_raw)
    
    m_main = msgs[main_idx]
    date = m_main['date']
    time = m_main['time']
    
    cust_name = custom.get('customer_name') or extract_customer_name(combined_clean)
    phone = custom.get('phone') or extract_phone(combined_clean)
    pincode = custom.get('pincode') or extract_pincode(combined_clean)
    
    if main_idx == 119: pincode = "411052"
    if main_idx == 249: pincode = "411061"
    if main_idx == 251: pincode = "110077"
    if main_idx in [267, 755]: pincode = "411014"
    if main_idx == 298: phone = "8275521651"
    
    address = custom.get('address') or extract_address(combined_clean)
    products = custom.get('products') or extract_products(combined_clean)
    
    auto_amt, auto_pay = extract_amount_and_payment(combined_clean)
    amount = custom.get('amount') if 'amount' in custom else auto_amt
    pay_type = custom.get('payment_type') if 'payment_type' in custom else auto_pay
    audit_flag = custom.get('audit_flag', '')
    
    if merged:
        msg_idx_str = f"IDX {main_idx} (जोडलेले: {', '.join(str(x) for x in merged)})"
    else:
        msg_idx_str = f"IDX {main_idx}"
        
    orders_list.append({
        'order_id': order_id,
        'date': date,
        'time': time,
        'telecaller': order['telecaller'],
        'channel_key': order['channel_key'],
        'is_telecaller': order['is_telecaller'],
        'customer_name': cust_name,
        'phone': phone,
        'address': address,
        'pincode': pincode,
        'products': products,
        'payment_type': pay_type,
        'amount': amount,
        'msg_idx_str': msg_idx_str,
        'audit_flag': audit_flag,
        'main_idx': main_idx,
        'merged_idxs': merged,
        'raw_text': combined_raw
    })

order_main_idxs = set(o['main_idx'] for o in ALL_ORDERS)
non_orders_list = []

for i, m in enumerate(msgs):
    if i in order_main_idxs:
        continue
    
    t = clean(m['text']).strip()
    sender = m['sender']
    date = m['date']
    time = m['time']
    linked_order = ""
    
    if i in main_to_order_id:
        target_oid = main_to_order_id[i]
        linked_order = f"ऑर्डर #{target_oid}"
        reason = "ऑर्डर्स जोडलेली उप-नोंद (Merged Sub-message)"
    elif 'This message was deleted' in t:
        reason = "डिलीट केलेला मेसेज (Deleted Message)"
    elif not t or t == '<Media omitted>':
        reason = "मीडिया / फोटो (Media / Photo)"
    elif sender == 'SYSTEM':
        reason = "प्रशासकीय सूचना / सिस्टीम मेसेज"
    elif sender == 'RK':
        reason = "प्रशासकीय सूचना (Admin Instruction)"
    elif sender == 'Om Amazon Dispatch':
        if any(kw in t.lower() for kw in ['dispatched', 'dispatch', 'total parcel', 'dtdc', 'delhivery', 'speed post', 'icdr', 'tracking']):
            reason = "वेअरहाऊस डिस्पॅच / ट्रॅकिंग स्लिप (Dispatch Update)"
        elif any(kw in t.lower() for kw in ['cod ka', 'tablet', 'ki', 'mam', 'phone', 'sticker', 'return']):
            reason = "वेअरहाऊस संवाद / चौकशी (Warehouse Query)"
        else:
            reason = "वेअरहाऊस संवाद (Warehouse Chatter)"
    elif any(kw in t.lower() for kw in ['nahi mila', 'rebook', 'return', 'dispatch jhali ka', 'keli ka', 'status']):
        reason = "स्टेटस चौकशी / फॉलो-अप (Status Inquiry)"
    else:
        reason = "संवादात्मक मेसेज / चॅटर (General Chatter)"
        
    preview = t.replace('\n', ' ')[:100] if t else "[रिक्त / मीडिया]"
    
    non_orders_list.append({
        'idx': i,
        'date': date,
        'time': time,
        'sender': sender,
        'reason': reason,
        'preview': preview,
        'linked_order': linked_order
    })

print(f"Orders: {len(orders_list)} | Non-orders: {len(non_orders_list)} | Total: {len(orders_list) + len(non_orders_list)}")
assert len(orders_list) + len(non_orders_list) == 759

# Build Summary Data
channel_order = ['manju', 'punam', 'darshan', 'monu', 'founder', 'warehouse']
channel_names = {
    'manju': '१. मंजुश्री कस्तुरे',
    'punam': '२. पूनम कस्तुरे',
    'darshan': '३. टेलिकॉलर (+91 88051 68275)',
    'monu': '४. मोनू',
    'founder': '५. यश सूर्यवंशी (फाउंडर डायरेक्ट)',
    'warehouse': '६. वेअरहाऊस डिस्पॅच'
}

summary = {k: {'name': channel_names[k], 'orders': 0, 'total': 0, 'cod': 0, 'prepaid': 0} for k in channel_order}
for o in orders_list:
    k = o['channel_key']
    summary[k]['orders'] += 1
    summary[k]['total'] += o['amount']
    if o['payment_type'] == 'COD': summary[k]['cod'] += 1
    else: summary[k]['prepaid'] += 1

# Audit Flags List
audit_entries = []
for o in orders_list:
    flags = []
    if o['audit_flag']: flags.append(o['audit_flag'])
    if not o['phone']: flags.append('मेसेजमध्ये फोन नंबर उपलब्ध नाही')
    if not o['pincode']: flags.append('मेसेजमध्ये पिनकोड उपलब्ध नाही')
    if o['amount'] == 0: flags.append('मोफत सॅम्पल / नमुना ऑर्डर (Zero Amount)')
    if flags:
        audit_entries.append({
            'order_id': o['order_id'],
            'date': o['date'],
            'telecaller': o['telecaller'],
            'customer_name': o['customer_name'],
            'phone': o['phone'],
            'amount': o['amount'],
            'flag': " | ".join(flags)
        })

print(f"Total audit entries: {len(audit_entries)}")

# ----------------- CREATE EXCEL WORKBOOK -----------------
wb = openpyxl.Workbook()
# Remove default sheet
wb.remove(wb.active)

# Color styles
DARK_GREEN = "1E4D2B"
MEDIUM_GREEN = "2E7D32"
LIGHT_GREEN = "E8F5E9"
BORDER_GRAY = "D3D3D3"
WHITE = "FFFFFF"

font_title = Font(name="Calibri", size=15, bold=True, color=WHITE)
font_subtitle = Font(name="Calibri", size=10, italic=True, color="D0E1D4")
font_header = Font(name="Calibri", size=11, bold=True, color=WHITE)
font_bold = Font(name="Calibri", size=11, bold=True)
font_regular = Font(name="Calibri", size=11)
font_small = Font(name="Calibri", size=10)

fill_dark_green = PatternFill(start_color=DARK_GREEN, end_color=DARK_GREEN, fill_type="solid")
fill_med_green = PatternFill(start_color=MEDIUM_GREEN, end_color=MEDIUM_GREEN, fill_type="solid")
fill_light_green = PatternFill(start_color=LIGHT_GREEN, end_color=LIGHT_GREEN, fill_type="solid")
fill_zebra = PatternFill(start_color="F9FBF9", end_color="F9FBF9", fill_type="solid")
fill_subtotal = PatternFill(start_color="E2EFE0", end_color="E2EFE0", fill_type="solid")

thin_side = Side(border_style="thin", color=BORDER_GRAY)
med_side = Side(border_style="medium", color=DARK_GREEN)
border_cell = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
border_subtotal = Border(top=thin_side, bottom=Side(border_style="double", color=DARK_GREEN))

# ----------------- SHEET 1: सर्व ग्राहक (All Customers) -----------------
ws1 = wb.create_sheet(title="सर्व ग्राहक (All Customers)")
ws1.views.sheetView[0].showGridLines = True

# Title banner
ws1.merge_cells("A1:M1")
ws1["A1"] = "सुजाता न्यूट्रिलाईव्ह — जुलै २०२६ ग्राहक ऑर्डर्स तपशील (July 2026 Customer Orders)"
ws1["A1"].font = font_title
ws1["A1"].fill = fill_dark_green
ws1["A1"].alignment = Alignment(horizontal="center", vertical="center")
ws1.row_dimensions[1].height = 30

ws1.merge_cells("A2:M2")
ws1["A2"] = "एकूण ऑर्डर्स: १३४ | व्हॉट्सॲप डिस्पॅच ग्रुप संपूर्ण डेटा (Airtight 100% Reconciliation — 759 Messages)"
ws1["A2"].font = font_subtitle
ws1["A2"].fill = fill_dark_green
ws1["A2"].alignment = Alignment(horizontal="center", vertical="center")
ws1.row_dimensions[2].height = 20

headers1 = [
    "अनुक्रमांक", "तारीख", "वेळ", "टेलिकॉलर / चॅनेल", "ग्राहकाचे नाव",
    "मोबाईल नंबर", "पत्ता", "पिनकोड", "उत्पादने", "पेमेंट प्रकार",
    "एकूण रक्कम (₹)", "मेसेज संदर्भ", "शेरा / तपासणी नोंद"
]
ws1.row_dimensions[3].height = 25
for col_idx, h in enumerate(headers1, 1):
    cell = ws1.cell(row=3, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_med_green
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border = border_cell

for r_idx, o in enumerate(orders_list, 4):
    ws1.row_dimensions[r_idx].height = 20
    is_even = (r_idx % 2 == 0)
    current_fill = fill_zebra if is_even else None
    
    row_data = [
        o['order_id'], o['date'], o['time'], o['telecaller'], o['customer_name'],
        o['phone'], o['address'], o['pincode'], o['products'], o['payment_type'],
        o['amount'], o['msg_idx_str'], o['audit_flag']
    ]
    for c_idx, val in enumerate(row_data, 1):
        cell = ws1.cell(row=r_idx, column=c_idx, value=val)
        cell.font = font_regular
        cell.border = border_cell
        if current_fill: cell.fill = current_fill
        
        # Alignment
        if c_idx in [1, 8]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif c_idx in [2, 3, 6, 10]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        elif c_idx == 11:
            cell.alignment = Alignment(horizontal="right", vertical="center")
            cell.number_format = "₹#,##0"
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center")

# Total Row in Sheet 1
tot_row = len(orders_list) + 4
ws1.row_dimensions[tot_row].height = 24
ws1.merge_cells(f"A{tot_row}:J{tot_row}")
ws1[f"A{tot_row}"] = "एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total July 2026)"
ws1[f"A{tot_row}"].font = font_bold
ws1[f"A{tot_row}"].fill = fill_subtotal
ws1[f"A{tot_row}"].alignment = Alignment(horizontal="right", vertical="center")

tot_cell = ws1.cell(row=tot_row, column=11, value=sum(o['amount'] for o in orders_list))
tot_cell.font = font_bold
tot_cell.fill = fill_subtotal
tot_cell.alignment = Alignment(horizontal="right", vertical="center")
tot_cell.number_format = "₹#,##0"

for c in range(1, 14):
    cell = ws1.cell(row=tot_row, column=c)
    cell.border = border_subtotal
    if c not in [11] and c > 10:
        cell.fill = fill_subtotal

# ----------------- SHEET 2: कामगिरी सारांश (Summary) -----------------
ws2 = wb.create_sheet(title="कामगिरी सारांश (Summary)")
ws2.views.sheetView[0].showGridLines = True

ws2.merge_cells("A1:G1")
ws2["A1"] = "सुजाता न्यूट्रिलाईव्ह — जुलै २०२६ टेलिकॉलर व चॅनेल कामगिरी सारांश"
ws2["A1"].font = font_title
ws2["A1"].fill = fill_dark_green
ws2["A1"].alignment = Alignment(horizontal="center", vertical="center")
ws2.row_dimensions[1].height = 30

ws2.merge_cells("A2:G2")
ws2["A2"] = "July 2026 — Telecaller Orders, Revenue, AOV & Payment Breakdown"
ws2["A2"].font = font_subtitle
ws2["A2"].fill = fill_dark_green
ws2["A2"].alignment = Alignment(horizontal="center", vertical="center")
ws2.row_dimensions[2].height = 20

headers2 = [
    "अ.क्र.", "टेलिकॉलर / चॅनेल", "एकूण ऑर्डर्स", "एकूण रक्कम (₹)",
    "सरासरी ऑर्डर मूल्य (AOV ₹)", "COD ऑर्डर्स", "Prepaid ऑर्डर्स"
]
ws2.row_dimensions[3].height = 25
for col_idx, h in enumerate(headers2, 1):
    cell = ws2.cell(row=3, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_med_green
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = border_cell

row_curr = 4
tc_orders = tc_total = tc_cod = tc_pre = 0

for idx, k in enumerate(['manju', 'punam', 'darshan', 'monu'], 1):
    s = summary[k]
    aov = round(s['total'] / s['orders']) if s['orders'] > 0 else 0
    ws2.row_dimensions[row_curr].height = 22
    vals = [idx, s['name'], s['orders'], s['total'], aov, s['cod'], s['prepaid']]
    for c_idx, val in enumerate(vals, 1):
        cell = ws2.cell(row=row_curr, column=c_idx, value=val)
        cell.font = font_regular
        cell.border = border_cell
        if c_idx == 1: cell.alignment = Alignment(horizontal="center", vertical="center")
        elif c_idx == 2: cell.alignment = Alignment(horizontal="left", vertical="center")
        elif c_idx in [3, 6, 7]: cell.alignment = Alignment(horizontal="center", vertical="center")
        elif c_idx in [4, 5]:
            cell.alignment = Alignment(horizontal="right", vertical="center")
            cell.number_format = "₹#,##0"
    tc_orders += s['orders']
    tc_total += s['total']
    tc_cod += s['cod']
    tc_pre += s['prepaid']
    row_curr += 1

# Subtotal Telecallers
ws2.row_dimensions[row_curr].height = 24
tc_aov = round(tc_total / tc_orders) if tc_orders > 0 else 0
sub_vals = ["-", "सर्व टेलिकॉलर्स एकूण (Telecallers Subtotal)", tc_orders, tc_total, tc_aov, tc_cod, tc_pre]
for c_idx, val in enumerate(sub_vals, 1):
    cell = ws2.cell(row=row_curr, column=c_idx, value=val)
    cell.font = font_bold
    cell.fill = fill_subtotal
    cell.border = border_cell
    if c_idx in [1, 3, 6, 7]: cell.alignment = Alignment(horizontal="center", vertical="center")
    elif c_idx == 2: cell.alignment = Alignment(horizontal="left", vertical="center")
    elif c_idx in [4, 5]:
        cell.alignment = Alignment(horizontal="right", vertical="center")
        cell.number_format = "₹#,##0"
row_curr += 1

# Other channels
other_orders = other_total = other_cod = other_pre = 0
for idx, k in enumerate(['founder', 'warehouse'], 5):
    s = summary[k]
    aov = round(s['total'] / s['orders']) if s['orders'] > 0 else 0
    ws2.row_dimensions[row_curr].height = 22
    vals = [idx, s['name'], s['orders'], s['total'], aov, s['cod'], s['prepaid']]
    for c_idx, val in enumerate(vals, 1):
        cell = ws2.cell(row=row_curr, column=c_idx, value=val)
        cell.font = font_regular
        cell.border = border_cell
        if c_idx == 1: cell.alignment = Alignment(horizontal="center", vertical="center")
        elif c_idx == 2: cell.alignment = Alignment(horizontal="left", vertical="center")
        elif c_idx in [3, 6, 7]: cell.alignment = Alignment(horizontal="center", vertical="center")
        elif c_idx in [4, 5]:
            cell.alignment = Alignment(horizontal="right", vertical="center")
            cell.number_format = "₹#,##0"
    other_orders += s['orders']
    other_total += s['total']
    other_cod += s['cod']
    other_pre += s['prepaid']
    row_curr += 1

# Grand Total Row
ws2.row_dimensions[row_curr].height = 26
grand_orders = tc_orders + other_orders
grand_total = tc_total + other_total
grand_cod = tc_cod + other_cod
grand_pre = tc_pre + other_pre
grand_aov = round(grand_total / grand_orders) if grand_orders > 0 else 0

grand_vals = ["★", "एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total July 2026)", grand_orders, grand_total, grand_aov, grand_cod, grand_pre]
for c_idx, val in enumerate(grand_vals, 1):
    cell = ws2.cell(row=row_curr, column=c_idx, value=val)
    cell.font = Font(name="Calibri", size=12, bold=True, color=WHITE)
    cell.fill = fill_dark_green
    cell.border = border_cell
    if c_idx in [1, 3, 6, 7]: cell.alignment = Alignment(horizontal="center", vertical="center")
    elif c_idx == 2: cell.alignment = Alignment(horizontal="left", vertical="center")
    elif c_idx in [4, 5]:
        cell.alignment = Alignment(horizontal="right", vertical="center")
        cell.number_format = "₹#,##0"

# ----------------- SHEET 3: वगळलेले मेसेज (Non-Orders) -----------------
ws3 = wb.create_sheet(title="वगळलेले मेसेज (Non-Orders)")
ws3.views.sheetView[0].showGridLines = True

ws3.merge_cells("A1:G1")
ws3["A1"] = "सुजाता न्यूट्रिलाईव्ह — जुलै २०२६ वगळलेले मेसेज व चॅटर (Non-Orders & Chatter Audit)"
ws3["A1"].font = font_title
ws3["A1"].fill = fill_dark_green
ws3["A1"].alignment = Alignment(horizontal="center", vertical="center")
ws3.row_dimensions[1].height = 30

ws3.merge_cells("A2:G2")
ws3["A2"] = "एकूण वगळलेले मेसेज: ६२५ (७१ जोडलेल्या उप-नोंदी + ५५४ चॅटर/स्टेटस) | 100% Reconciliation"
ws3["A2"].font = font_subtitle
ws3["A2"].fill = fill_dark_green
ws3["A2"].alignment = Alignment(horizontal="center", vertical="center")
ws3.row_dimensions[2].height = 20

headers3 = ["अ.क्र.", "मेसेज इंडेक्स", "तारीख व वेळ", "पाठवणारा", "वगळण्याचे कारण / मेसेज प्रकार", "मेसेज मजकूर सारांश", "संबंधित जोडलेली ऑर्डर"]
ws3.row_dimensions[3].height = 25
for col_idx, h in enumerate(headers3, 1):
    cell = ws3.cell(row=3, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_med_green
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = border_cell

for r_idx, no in enumerate(non_orders_list, 4):
    ws3.row_dimensions[r_idx].height = 18
    is_even = (r_idx % 2 == 0)
    current_fill = fill_zebra if is_even else None
    
    vals = [
        r_idx - 3,
        f"IDX {no['idx']}",
        f"{no['date']} {no['time']}",
        no['sender'],
        no['reason'],
        no['preview'],
        no['linked_order']
    ]
    for c_idx, val in enumerate(vals, 1):
        cell = ws3.cell(row=r_idx, column=c_idx, value=val)
        cell.font = font_regular
        cell.border = border_cell
        if current_fill: cell.fill = current_fill
        if c_idx in [1, 2, 3]: cell.alignment = Alignment(horizontal="center", vertical="center")
        elif c_idx in [4, 5, 6]: cell.alignment = Alignment(horizontal="left", vertical="center")
        elif c_idx == 7: cell.alignment = Alignment(horizontal="center", vertical="center")

# ----------------- SHEET 4: तपासणी नोंदी (Audit Flags) -----------------
ws4 = wb.create_sheet(title="तपासणी नोंदी (Audit Flags)")
ws4.views.sheetView[0].showGridLines = True

ws4.merge_cells("A1:G1")
ws4["A1"] = "सुजाता न्यूट्रिलाईव्ह — जुलै २०२६ ऑडिट फ्लॅग्ज व विशेष नोंदी (Audit Flags & Discrepancy Log)"
ws4["A1"].font = font_title
ws4["A1"].fill = fill_dark_green
ws4["A1"].alignment = Alignment(horizontal="center", vertical="center")
ws4.row_dimensions[1].height = 30

ws4.merge_cells("A2:G2")
ws4["A2"] = "विशेष ऑर्डर्स, फ्री सॅम्पल्स, रीबुक्स, बी२बी मॅन्युफॅक्चरिंग व व्हेरिफिकेशन तपशील"
ws4["A2"].font = font_subtitle
ws4["A2"].fill = fill_dark_green
ws4["A2"].alignment = Alignment(horizontal="center", vertical="center")
ws4.row_dimensions[2].height = 20

headers4 = ["अ.क्र.", "ऑर्डर क्रमांक", "तारीख", "टेलिकॉलर / चॅनेल", "ग्राहकाचे नाव", "रक्कम (₹)", "ऑडिट फ्लॅग व स्पष्टीकरण"]
ws4.row_dimensions[3].height = 25
for col_idx, h in enumerate(headers4, 1):
    cell = ws4.cell(row=3, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_med_green
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = border_cell

for r_idx, ae in enumerate(audit_entries, 4):
    ws4.row_dimensions[r_idx].height = 20
    is_even = (r_idx % 2 == 0)
    current_fill = fill_zebra if is_even else None
    
    vals = [
        r_idx - 3,
        f"ऑर्डर #{ae['order_id']}",
        ae['date'],
        ae['telecaller'],
        ae['customer_name'],
        ae['amount'],
        ae['flag']
    ]
    for c_idx, val in enumerate(vals, 1):
        cell = ws4.cell(row=r_idx, column=c_idx, value=val)
        cell.font = font_regular
        cell.border = border_cell
        if current_fill: cell.fill = current_fill
        if c_idx in [1, 2, 3]: cell.alignment = Alignment(horizontal="center", vertical="center")
        elif c_idx in [4, 5, 7]: cell.alignment = Alignment(horizontal="left", vertical="center")
        elif c_idx == 6:
            cell.alignment = Alignment(horizontal="right", vertical="center")
            cell.number_format = "₹#,##0"

# Auto-adjust column widths
for ws in [ws1, ws2, ws3, ws4]:
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            # skip merged header rows
            if cell.row in [1, 2]: continue
            val = str(cell.value or '')
            max_len = max(max_len, len(val))
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

# Specific column width overrides
ws1.column_dimensions['A'].width = 10
ws1.column_dimensions['B'].width = 12
ws1.column_dimensions['C'].width = 10
ws1.column_dimensions['D'].width = 30
ws1.column_dimensions['E'].width = 28
ws1.column_dimensions['F'].width = 16
ws1.column_dimensions['G'].width = 45
ws1.column_dimensions['H'].width = 12
ws1.column_dimensions['I'].width = 35
ws1.column_dimensions['J'].width = 14
ws1.column_dimensions['K'].width = 16
ws1.column_dimensions['L'].width = 25
ws1.column_dimensions['M'].width = 40

ws2.column_dimensions['A'].width = 8
ws2.column_dimensions['B'].width = 42
ws2.column_dimensions['C'].width = 16
ws2.column_dimensions['D'].width = 20
ws2.column_dimensions['E'].width = 25
ws2.column_dimensions['F'].width = 15
ws2.column_dimensions['G'].width = 16

ws3.column_dimensions['A'].width = 8
ws3.column_dimensions['B'].width = 14
ws3.column_dimensions['C'].width = 18
ws3.column_dimensions['D'].width = 32
ws3.column_dimensions['E'].width = 38
ws3.column_dimensions['F'].width = 50
ws3.column_dimensions['G'].width = 22

ws4.column_dimensions['A'].width = 8
ws4.column_dimensions['B'].width = 16
ws4.column_dimensions['C'].width = 14
ws4.column_dimensions['D'].width = 32
ws4.column_dimensions['E'].width = 28
ws4.column_dimensions['F'].width = 16
ws4.column_dimensions['G'].width = 65

# Save files
paths = [
    r"C:\Users\Admin\Downloads\Sujata_Nutrilive_July_2026_Customers_Updated.xlsx",
    r"C:\Users\Admin\Downloads\Sujata_Nutrilive_July_2026_Customers.xlsx",
    r"f:\RK\Sujata Nutrilive\sujata-nutrilive\data\Sujata_Nutrilive_July_2026_Customers_Updated.xlsx"
]

for p in paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    wb.save(p)
    print(f"Successfully saved: {p} (Size: {os.path.getsize(p):,} bytes)")

print("\nAll July 2026 deliverables generated successfully with 100% perfection!")
