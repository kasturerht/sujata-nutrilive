import json
import re
import sys
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

from calculate_may_totals import ALL_ORDERS, main_map, merged_map

print(f"Loaded {len(msgs)} total messages in May.")
print(f"Loaded {len(ALL_ORDERS)} master orders.")
print(f"Loaded {len(merged_map)} merged sub-messages.")

# Build Sheet 3 rows (627 rows: 99 merged + 528 excluded)
sheet3_rows = []

merged_info = {}
for o in ALL_ORDERS:
    p_id = o['main_idx']
    p_name = o['customer_name']
    p_tele = o['telecaller']
    for sub in o['merged_idxs']:
        merged_info[sub] = (p_id, p_name, p_tele)

for i, m in enumerate(msgs):
    if i in main_map:
        continue # Sheet 1
    
    sender = m.get('sender', '')
    dt_date = m.get('date', '')
    dt_time = m.get('time', '')
    text = m.get('text', '').strip()
    
    if i in merged_map:
        p_id, p_name, p_tele = merged_info[i]
        cat = "ऑर्डर्स जोडलेली उप-नोंद (Merged Sub-message)"
        reason = f"ऑर्डर IDX {p_id} ({p_name} - {p_tele}) शी जोडलेली उप-नोंद (पत्ता/फोन/प्रॉडक्ट/रक्कम/स्मरणपत्र)"
    else:
        # Excluded category classification
        if text == "This message was deleted":
            cat = "रद्द / हटवलेला मेसेज (Deleted Message)"
            reason = "युझरने पाठवल्यानंतर डिलीट केलेला मेसेज"
        elif sender == "SYSTEM":
            cat = "सिस्टम मेसेज (System Notification)"
            reason = "व्हॉट्सॲप ग्रुप सिस्टम सूचना (उदा. सदस्य जोडणी)"
        elif sender == "Om Amazon Dispatch":
            if text.startswith("<Media"):
                cat = "पार्सल ट्रॅकिंग / पावती (Tracking Slips & Receipts)"
                reason = "वेअरहाऊस डिस्पॅच / कुरिअर पावतीचा फोटो"
            elif any(k in text.lower() for k in ['dispatched', 'ok', 'jaiel', 'nahi', 'mam', 'phone', 'pincode', 'name', 'prepaid', 'cod', 'post office']):
                cat = "वेअरहाऊस चौकशी / संभाषण (Warehouse Chatter)"
                reason = "पॅकिंग, कुरिअर व डिस्पॅच संदर्भातील अंतर्गत संवाद"
            else:
                cat = "वेअरहाऊस अपडेट (Warehouse Update)"
                reason = "वेअरहाऊस डिस्पॅच माहिती"
        elif text.startswith("<Media"):
            cat = "पॅकिंग व डिझाईन फोटो (Product & Packing Photos)"
            reason = "उत्पादन / पॅकिंग / पेमेंट स्क्रीनशॉट"
        elif any(k in text.lower() for k in ['icarry', 'track', 'awb', 'delhivery', 'dtdc', 'speed post', 'ekart', 'docket']):
            cat = "पार्सल ट्रॅकिंग / पावती (Tracking Slips & Receipts)"
            reason = "कुरिअर ट्रॅकिंग माहिती किंवा डॉकेट चौकशी"
        elif any(k in text.lower() for k in ['status', 'return', 'cancel', 'pending', 'confirm', 'kiti divas']):
            cat = "डिलिव्हरी चौकशी (Delivery / Status Query)"
            reason = "ऑर्डर स्थिती किंवा डिस्पॅच फॉलो-अप"
        elif text in ['Ok', 'Okay', 'Okk', 'Ho', 'Thik hai', 'Thikey', '..', '.', 'Yes', 'Ya..']:
            cat = "चॅट संभाषण (General Chatter)"
            reason = "संक्षिप्त संभाषण / पावती"
        else:
            cat = "अंतर्गत संभाषण (Internal Discussion)"
            reason = "ऑपरेशन व स्टॉक संदर्भातील चर्चा"
            
    sheet3_rows.append({
        'msg_idx': i,
        'date': dt_date,
        'time': dt_time,
        'sender': sender,
        'text': text if len(text) < 500 else text[:497] + "...",
        'category': cat,
        'reason': reason
    })

print(f"Sheet 3 rows count: {len(sheet3_rows)}")
assert len(ALL_ORDERS) + len(sheet3_rows) == len(msgs), "Reconciliation mismatch!"
print(f"100% RECONCILIATION VERIFIED: {len(ALL_ORDERS)} + {len(sheet3_rows)} == {len(msgs)}!")

# Create Workbook
wb = openpyxl.Workbook()
wb.remove(wb.active)

# Color Palette (Forest Green Theme)
COLOR_DARK_GREEN = "1E4D2B"
COLOR_MID_GREEN = "2E7D32"
COLOR_LIGHT_GREEN = "E8F5E9"
COLOR_ACCENT_GREEN = "C8E6C9"
COLOR_WHITE = "FFFFFF"
COLOR_GRAY_LIGHT = "F5F5F5"
COLOR_BORDER = "CCCCCC"

font_title = Font(name="Segoe UI", size=15, bold=True, color=COLOR_WHITE)
font_subtitle = Font(name="Segoe UI", size=10, italic=True, color=COLOR_WHITE)
font_header = Font(name="Segoe UI", size=10, bold=True, color=COLOR_WHITE)
font_bold = Font(name="Segoe UI", size=10, bold=True)
font_regular = Font(name="Segoe UI", size=10)

fill_title = PatternFill(start_color=COLOR_DARK_GREEN, end_color=COLOR_DARK_GREEN, fill_type="solid")
fill_header = PatternFill(start_color=COLOR_MID_GREEN, end_color=COLOR_MID_GREEN, fill_type="solid")
fill_subtotal = PatternFill(start_color=COLOR_ACCENT_GREEN, end_color=COLOR_ACCENT_GREEN, fill_type="solid")
fill_total = PatternFill(start_color="A5D6A7", end_color="A5D6A7", fill_type="solid")
fill_zebra = PatternFill(start_color=COLOR_LIGHT_GREEN, end_color=COLOR_LIGHT_GREEN, fill_type="solid")
fill_gray_zebra = PatternFill(start_color=COLOR_GRAY_LIGHT, end_color=COLOR_GRAY_LIGHT, fill_type="solid")

thin_side = Side(border_style="thin", color=COLOR_BORDER)
thick_top = Side(border_style="thin", color="000000")
double_bottom = Side(border_style="double", color="000000")

border_cell = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
border_total = Border(left=thin_side, right=thin_side, top=thick_top, bottom=double_bottom)

align_center = Alignment(horizontal="center", vertical="center")
align_left = Alignment(horizontal="left", vertical="center")
align_right = Alignment(horizontal="right", vertical="center")

# ==========================================
# SHEET 1: सर्व ग्राहक (All Customers)
# ==========================================
ws1 = wb.create_sheet(title="सर्व ग्राहक (All Customers)")
ws1.views.sheetView[0].showGridLines = True

ws1.merge_cells("A1:N1")
ws1["A1"] = "सुजाता न्यूट्रिलाईव्ह — मे २०२६ ग्राहकांच्या सर्व ऑर्डर्स (Master Customer Orders)"
ws1["A1"].font = font_title
ws1["A1"].fill = fill_title
ws1["A1"].alignment = align_center
ws1.row_dimensions[1].height = 35

ws1.merge_cells("A2:N2")
ws1["A2"] = "व्हॉट्सॲप डिस्पॅच ग्रुप (Daily orders dispatch) मधील मे २०२६ च्या सर्व पडताळणी केलेल्या ऑर्डर्स"
ws1["A2"].font = font_subtitle
ws1["A2"].fill = PatternFill(start_color=COLOR_MID_GREEN, end_color=COLOR_MID_GREEN, fill_type="solid")
ws1["A2"].alignment = align_center
ws1.row_dimensions[2].height = 20

headers1 = [
    "अ.क्र.", "तारीख", "वेळ", "मेसेज आयडी", "टेलिकॉलर / चॅनल", "पाठवणारा",
    "ग्राहकाचे नाव", "मोबाईल नंबर", "पिनकोड", "मागवलेली उत्पादने",
    "पेमेंट पद्धत", "रक्कम (₹)", "जोडलेले मेसेज आयडी", "तपासणी शेरा"
]

ws1.row_dimensions[3].height = 26
for col_idx, h in enumerate(headers1, 1):
    cell = ws1.cell(row=3, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = border_cell

for row_idx, o in enumerate(ALL_ORDERS, 4):
    ws1.row_dimensions[row_idx].height = 22
    merged_str = ", ".join(f"IDX {m}" for m in o['merged_idxs']) if o['merged_idxs'] else "-"
    
    row_data = [
        row_idx - 3,
        o['date'],
        o['time'],
        f"IDX {o['main_idx']}",
        o['telecaller'],
        o['sender'],
        o['customer_name'],
        o['phone'],
        o['pincode'],
        o['products'],
        o['payment_type'],
        o['amount'],
        merged_str,
        o['audit_flag'] if o['audit_flag'] else "पडताळणी पूर्ण (100% Verified)"
    ]
    
    is_zebra = (row_idx % 2 == 0)
    for col_idx, val in enumerate(row_data, 1):
        cell = ws1.cell(row=row_idx, column=col_idx, value=val)
        cell.font = font_regular
        cell.border = border_cell
        if is_zebra:
            cell.fill = fill_zebra
            
        if col_idx in [1, 2, 3, 4, 8, 9, 11]:
            cell.alignment = align_center
        elif col_idx == 12:
            cell.alignment = align_right
            cell.number_format = "₹#,##0"
        else:
            cell.alignment = align_left

# Total Row on Sheet 1
total_row_1 = len(ALL_ORDERS) + 4
ws1.row_dimensions[total_row_1].height = 25
ws1.merge_cells(f"A{total_row_1}:K{total_row_1}")
tot_cell = ws1.cell(row=total_row_1, column=1, value="एकूण संपूर्ण मे २०२६ विक्री (Grand Total May 2026)")
tot_cell.font = font_bold
tot_cell.alignment = align_right
tot_cell.fill = fill_total

val_cell = ws1.cell(row=total_row_1, column=12, value=f"=SUM(L4:L{total_row_1-1})")
val_cell.font = font_bold
val_cell.alignment = align_right
val_cell.number_format = "₹#,##0"
val_cell.fill = fill_total

for c in range(1, 15):
    cell = ws1.cell(row=total_row_1, column=c)
    cell.border = border_total
    if c not in [1, 12]:
        cell.fill = fill_total

# ==========================================
# SHEET 2: कामगिरी सारांश (Summary)
# ==========================================
ws2 = wb.create_sheet(title="कामगिरी सारांश (Summary)")
ws2.views.sheetView[0].showGridLines = True

ws2.merge_cells("A1:H1")
ws2["A1"] = "सुजाता न्यूट्रिलाईव्ह — मे २०२६ टेलिकॉलर कामगिरी सारांश (Performance Summary)"
ws2["A1"].font = font_title
ws2["A1"].fill = fill_title
ws2["A1"].alignment = align_center
ws2.row_dimensions[1].height = 35

ws2.merge_cells("A2:H2")
ws2["A2"] = "May 2026 — Telecaller Orders and Total Value"
ws2["A2"].font = font_subtitle
ws2["A2"].fill = PatternFill(start_color=COLOR_MID_GREEN, end_color=COLOR_MID_GREEN, fill_type="solid")
ws2["A2"].alignment = align_center
ws2.row_dimensions[2].height = 20

headers2 = [
    "अ.क्र.", "टेलिकॉलर / चॅनल", "एकूण ऑर्डर्स", "एकूण विक्री मूल्य (₹)",
    "प्रीपेड ऑर्डर्स", "सीओडी ऑर्डर्स", "सरासरी मूल्य (AOV ₹)", "विक्री वाटा (%)"
]

ws2.row_dimensions[4].height = 26
for col_idx, h in enumerate(headers2, 1):
    cell = ws2.cell(row=4, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = border_cell

manju_list = [o for o in ALL_ORDERS if o['telecaller'] == 'मंजुश्री कस्तुरे']
monu_list = [o for o in ALL_ORDERS if o['telecaller'] == 'मोनू']
yash_list = [o for o in ALL_ORDERS if o['telecaller'] == 'यश सूर्यवंशी (फाउंडर डायरेक्ट)']

grand_total_amount = sum(o['amount'] for o in ALL_ORDERS)

summary_rows = [
    ("१", "मंजुश्री कस्तुरे", len(manju_list), sum(o['amount'] for o in manju_list),
     sum(1 for o in manju_list if o['payment_type'] == 'Prepaid'),
     sum(1 for o in manju_list if o['payment_type'] == 'COD')),
    ("२", "मोनू", len(monu_list), sum(o['amount'] for o in monu_list),
     sum(1 for o in monu_list if o['payment_type'] == 'Prepaid'),
     sum(1 for o in monu_list if o['payment_type'] == 'COD')),
]

current_r = 5
for sr, tele, cnt, amt, prep, cod in summary_rows:
    ws2.row_dimensions[current_r].height = 22
    aov = amt / cnt if cnt > 0 else 0
    share = amt / grand_total_amount if grand_total_amount > 0 else 0
    
    ws2.cell(row=current_r, column=1, value=sr).alignment = align_center
    ws2.cell(row=current_r, column=2, value=tele).alignment = align_left
    ws2.cell(row=current_r, column=3, value=cnt).alignment = align_center
    
    c_amt = ws2.cell(row=current_r, column=4, value=amt)
    c_amt.alignment = align_right
    c_amt.number_format = "₹#,##0"
    
    ws2.cell(row=current_r, column=5, value=prep).alignment = align_center
    ws2.cell(row=current_r, column=6, value=cod).alignment = align_center
    
    c_aov = ws2.cell(row=current_r, column=7, value=aov)
    c_aov.alignment = align_right
    c_aov.number_format = "₹#,##0"
    
    c_share = ws2.cell(row=current_r, column=8, value=share)
    c_share.alignment = align_right
    c_share.number_format = "0.0%"
    
    for c in range(1, 9):
        cell = ws2.cell(row=current_r, column=c)
        cell.font = font_regular
        cell.border = border_cell
    current_r += 1

# Subtotal Telecallers
tele_cnt = len(manju_list) + len(monu_list)
tele_amt = sum(o['amount'] for o in manju_list) + sum(o['amount'] for o in monu_list)
tele_prep = sum(1 for o in manju_list if o['payment_type'] == 'Prepaid') + sum(1 for o in monu_list if o['payment_type'] == 'Prepaid')
tele_cod = sum(1 for o in manju_list if o['payment_type'] == 'COD') + sum(1 for o in monu_list if o['payment_type'] == 'COD')
tele_aov = tele_amt / tele_cnt if tele_cnt > 0 else 0
tele_share = tele_amt / grand_total_amount if grand_total_amount > 0 else 0

ws2.row_dimensions[current_r].height = 23
ws2.cell(row=current_r, column=1, value="").alignment = align_center
ws2.cell(row=current_r, column=2, value="सर्व टेलिकॉलर्स एकूण (Subtotal)").alignment = align_left
ws2.cell(row=current_r, column=3, value=tele_cnt).alignment = align_center
c_amt = ws2.cell(row=current_r, column=4, value=tele_amt)
c_amt.alignment = align_right
c_amt.number_format = "₹#,##0"
ws2.cell(row=current_r, column=5, value=tele_prep).alignment = align_center
ws2.cell(row=current_r, column=6, value=tele_cod).alignment = align_center
c_aov = ws2.cell(row=current_r, column=7, value=tele_aov)
c_aov.alignment = align_right
c_aov.number_format = "₹#,##0"
c_share = ws2.cell(row=current_r, column=8, value=tele_share)
c_share.alignment = align_right
c_share.number_format = "0.0%"

for c in range(1, 9):
    cell = ws2.cell(row=current_r, column=c)
    cell.font = font_bold
    cell.fill = fill_subtotal
    cell.border = border_cell
current_r += 1

# Yash Row
y_cnt = len(yash_list)
y_amt = sum(o['amount'] for o in yash_list)
y_prep = sum(1 for o in yash_list if o['payment_type'] == 'Prepaid')
y_cod = sum(1 for o in yash_list if o['payment_type'] == 'COD')
y_aov = y_amt / y_cnt if y_cnt > 0 else 0
y_share = y_amt / grand_total_amount if grand_total_amount > 0 else 0

ws2.row_dimensions[current_r].height = 22
ws2.cell(row=current_r, column=1, value="३").alignment = align_center
ws2.cell(row=current_r, column=2, value="यश सूर्यवंशी (फाउंडर डायरेक्ट)").alignment = align_left
ws2.cell(row=current_r, column=3, value=y_cnt).alignment = align_center
c_amt = ws2.cell(row=current_r, column=4, value=y_amt)
c_amt.alignment = align_right
c_amt.number_format = "₹#,##0"
ws2.cell(row=current_r, column=5, value=y_prep).alignment = align_center
ws2.cell(row=current_r, column=6, value=y_cod).alignment = align_center
c_aov = ws2.cell(row=current_r, column=7, value=y_aov)
c_aov.alignment = align_right
c_aov.number_format = "₹#,##0"
c_share = ws2.cell(row=current_r, column=8, value=y_share)
c_share.alignment = align_right
c_share.number_format = "0.0%"

for c in range(1, 9):
    cell = ws2.cell(row=current_r, column=c)
    cell.font = font_regular
    cell.border = border_cell
current_r += 1

# Grand Total Row
g_cnt = len(ALL_ORDERS)
g_amt = grand_total_amount
g_prep = sum(1 for o in ALL_ORDERS if o['payment_type'] == 'Prepaid')
g_cod = sum(1 for o in ALL_ORDERS if o['payment_type'] == 'COD')
g_aov = g_amt / g_cnt if g_cnt > 0 else 0
g_share = 1.0

ws2.row_dimensions[current_r].height = 25
ws2.cell(row=current_r, column=1, value="").alignment = align_center
ws2.cell(row=current_r, column=2, value="एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total May)").alignment = align_left
ws2.cell(row=current_r, column=3, value=g_cnt).alignment = align_center
c_amt = ws2.cell(row=current_r, column=4, value=g_amt)
c_amt.alignment = align_right
c_amt.number_format = "₹#,##0"
ws2.cell(row=current_r, column=5, value=g_prep).alignment = align_center
ws2.cell(row=current_r, column=6, value=g_cod).alignment = align_center
c_aov = ws2.cell(row=current_r, column=7, value=g_aov)
c_aov.alignment = align_right
c_aov.number_format = "₹#,##0"
c_share = ws2.cell(row=current_r, column=8, value=g_share)
c_share.alignment = align_right
c_share.number_format = "0.0%"

for c in range(1, 9):
    cell = ws2.cell(row=current_r, column=c)
    cell.font = font_bold
    cell.fill = fill_total
    cell.border = border_total

# ==========================================
# SHEET 3: वगळलेले मेसेज (Non-Orders)
# ==========================================
ws3 = wb.create_sheet(title="वगळलेले मेसेज (Non-Orders)")
ws3.views.sheetView[0].showGridLines = True

ws3.merge_cells("A1:G1")
ws3["A1"] = "सुजाता न्यूट्रिलाईव्ह — मे २०२६ वगळलेले सर्व मेसेज व उप-नोंदी (Non-Orders & Merged Log)"
ws3["A1"].font = font_title
ws3["A1"].fill = fill_title
ws3["A1"].alignment = align_center
ws3.row_dimensions[1].height = 35

ws3.merge_cells("A2:G2")
ws3["A2"] = "ग्रुपमधील एकूण ७१६ पैकी ऑर्डर्समध्ये समाविष्ट नसलेले किंवा उप-नोंद असलेले सर्व ६२७ मेसेज"
ws3["A2"].font = font_subtitle
ws3["A2"].fill = PatternFill(start_color=COLOR_MID_GREEN, end_color=COLOR_MID_GREEN, fill_type="solid")
ws3["A2"].alignment = align_center
ws3.row_dimensions[2].height = 20

headers3 = [
    "मेसेज आयडी", "तारीख", "वेळ", "पाठवणारा", "मेसेजचा मजकूर", "वर्गीकरण", "सविस्तर कारण"
]

ws3.row_dimensions[3].height = 26
for col_idx, h in enumerate(headers3, 1):
    cell = ws3.cell(row=3, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = border_cell

for row_idx, r in enumerate(sheet3_rows, 4):
    ws3.row_dimensions[row_idx].height = 20
    is_merged = "उप-नोंद" in r['category']
    is_zebra = (row_idx % 2 == 0)
    
    ws3.cell(row=row_idx, column=1, value=f"IDX {r['msg_idx']}").alignment = align_center
    ws3.cell(row=row_idx, column=2, value=r['date']).alignment = align_center
    ws3.cell(row=row_idx, column=3, value=r['time']).alignment = align_center
    ws3.cell(row=row_idx, column=4, value=r['sender']).alignment = align_left
    ws3.cell(row=row_idx, column=5, value=r['text']).alignment = align_left
    ws3.cell(row=row_idx, column=6, value=r['category']).alignment = align_left
    ws3.cell(row=row_idx, column=7, value=r['reason']).alignment = align_left
    
    for c in range(1, 8):
        cell = ws3.cell(row=row_idx, column=c)
        cell.font = font_regular
        cell.border = border_cell
        if is_merged:
            cell.fill = fill_zebra
        elif is_zebra:
            cell.fill = fill_gray_zebra

# ==========================================
# SHEET 4: तपासणी नोंदी (Audit Flags)
# ==========================================
ws4 = wb.create_sheet(title="तपासणी नोंदी (Audit Flags)")
ws4.views.sheetView[0].showGridLines = True

ws4.merge_cells("A1:G1")
ws4["A1"] = "सुजाता न्यूट्रिलाईव्ह — मे २०२६ डेटा तपासणी व ऑडिट नोंदी (Audit Flags & Verification)"
ws4["A1"].font = font_title
ws4["A1"].fill = fill_title
ws4["A1"].alignment = align_center
ws4.row_dimensions[1].height = 35

ws4.merge_cells("A2:G2")
ws4["A2"] = "ऑर्डर्स जोडणी, सॅम्पल डिस्पॅच, शून्य रक्कम, आणि पुनर्नोद तपासणीची पारदर्शक पडताळणी"
ws4["A2"].font = font_subtitle
ws4["A2"].fill = PatternFill(start_color=COLOR_MID_GREEN, end_color=COLOR_MID_GREEN, fill_type="solid")
ws4["A2"].alignment = align_center
ws4.row_dimensions[2].height = 20

headers4 = [
    "अ.क्र.", "मेसेज आयडी", "ग्राहकाचे नाव", "टेलिकॉलर / चॅनल", "रक्कम (₹)", "तपासणी प्रकार", "सविस्तर स्पष्टीकरण"
]

ws4.row_dimensions[3].height = 26
for col_idx, h in enumerate(headers4, 1):
    cell = ws4.cell(row=3, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = border_cell

audit_cases_may = [
    (1, "IDX 10", "विक्रम (Vikram)", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 450, "मल्टी-पार्ट ऑर्डर", "पत्ता IDX 10 वर, फोन IDX 11 वर आणि प्रॉडक्ट-रक्कम IDX 12 वरून एकत्र केली."),
    (2, "IDX 14", "डॉ. राजकुमार रंगारी", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 450, "प्रीपेड क्लिनिक ऑर्डर", "अकोला येथील क्लिनिक पत्ता, तपशील व पावती फोटोमध्ये, प्रीपेड."),
    (3, "IDX 26", "सोनाली चेतन मगर", "मोनू", 450, "फोन नंबर जोडणी", "पत्ता २ मे रोजी दिला, फोन नंबर IDX 66-67 वरून जोडला. (३० मे रोजी IDX 679 वर दुसरी ऑर्डर)."),
    (4, "IDX 28", "शाहआलम", "मोनू", 350, "दिव्यांग कलाकार ऑर्डर", "सहारनपूर येथील पत्ता IDX 28 वर, प्रॉडक्ट व ३५० COD IDX 29 वरून जोडले."),
    (5, "IDX 34", "ग्राहक (फोटोवरून पत्ता)", "मोनू", 450, "फोटो पत्ता ऑर्डर", "पत्ता फोटोत, फोन ८८९८६९५५५५ व ४५० COD IDX 34-35 वरून."),
    (6, "IDX 38", "डॉ. रंजना", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 400, "इगतपुरी क्लिनिक ऑर्डर", "१ पावडर प्रीपेड ४००, फोन ७४९८६५१८००."),
    (7, "IDX 50", "स्नेहल सावंत", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "एक्स्पो प्रदर्शन ऑर्डर", "नाशिक एक्स्पो प्रदर्शनासाठी १० कॅप्सूल पाठवल्या."),
    (8, "IDX 51", "लक्ष्मण नांद्रेकर", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "डिस्ट्रिब्युटर ऑर्डर १", "५० बाटल्या आरोग्यम ६० टॅबलेट स्पीड पोस्टने पाठवल्या."),
    (9, "IDX 61", "सुनिता भरते", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 900, "मल्टी-पार्ट कॉम्बो", "स्वागत हॉटेल लोणी, १ कोरियन क्रीम + १ फेसवॉश ९०० COD (IDX 63 वरून)."),
    (10, "IDX 103", "सुधीर दिगंबर बहादुले", "मंजुश्री कस्तुरे", 800, "पत्ता दुरुस्ती", "मु. पो. निमसोड भादोले दुरुस्त पत्ता IDX 141 वरून जोडला, २ बाटल्या ८०० COD."),
    (11, "IDX 115", "प्रवीण कुमार", "मोनू", 1050, "पुनर्नोद ट्रॅकिंग", "मोनूने ६ मे रोजी नोंदवली, यश यांनी १२ मे रोजी (IDX 215) डिस्पॅच स्मरणपत्र दिले."),
    (12, "IDX 139", "अक्षयराज अरविंदकुमार श्रीनिवास", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 9000, "मोठी कमर्शियल ऑर्डर", "सुलई नंदन थेरपी सेंटर, एकूण १० प्रॉडक्ट्स कॉम्बो ९००० COD."),
    (13, "IDX 154", "लक्ष्मण नांद्रेकर", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "डिस्ट्रिब्युटर ऑर्डर २", "३० बाटल्या स्पिरुलिना ६० टॅबलेट स्पीड पोस्टने पाठवल्या."),
    (14, "IDX 181", "विनायक रघुनाथ शिंदे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 850, "स्मरणपत्र जोडणी", "कोल्हापूर येथील ऑर्डर, १७ मे रोजी (IDX 357) पुन्हा स्मरणपत्र दिले."),
    (15, "IDX 184", "संतोष कुमार गुप्ता", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 450, "झारखंड ऑर्डर", "१ कॅप्सूल ४५० COD (IDX 185 वरून)."),
    (16, "IDX 187", "अब्दुल सलीम", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 400, "केरळ ऑर्डर", "कालीकट केरळ, अर्धा किलो पावडर ४०० प्रीपेड (IDX 188-189)."),
    (17, "IDX 190", "लक्ष्मण नांद्रेकर", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "डिस्ट्रिब्युटर ऑर्डर ३", "३० बाटल्या आरोग्यम टॅबलेट पाठवल्या."),
    (18, "IDX 200", "डॉ. मिलिंद मोरे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "क्लिनिक पुरवठा", "रेवा आयुर्वेद क्लिनिक जळगाव, सीबकथॉर्न व स्पिरुलिना टॅबलेट पुरवठा (IDX 202)."),
    (19, "IDX 210", "परिंदा छेडा", "मंजुश्री कस्तुरे", 1300, "ट्रायल सोप जोडणी", "५ कॅप्सूल १३०० COD + १ मोफत चाचणी साबण (IDX 211)."),
    (20, "IDX 213", "ग्राहक (फोटोवरून पत्ता)", "मोनू", 350, "फोटो पत्ता ऑर्डर", "पत्ता फोटोत, स्पिरुलिना पावडर १०० ग्रॅम ३५० COD (IDX 214)."),
    (21, "IDX 224", "ग्राहक (फोटोवरून पत्ता)", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "फोटो पत्ता सॅम्पल", "५ कॅप्सूल + १ सॅम्पल स्पिरुलिना साबण (IDX 225)."),
    (22, "IDX 227", "चंद्रकांत लबडे", "मंजुश्री कस्तुरे", 450, "मंजुश्री मूळ ऑर्डर", "मंजुश्री यांनी १२ मे रोजी घेतली, यश यांनी १६ व २३ मे रोजी पाठपुरावा केला."),
    (23, "IDX 228", "बजरंग बळवंत कुंभार", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 2200, "कागल कॉम्बो", "३ स्पिरुलिना टॅब + २ सीबकथॉर्न कॅप्सूल २२०० COD (IDX 229)."),
    (24, "IDX 306", "एकनाथ बापू लोखंडे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 400, "गगनबावडा ऑर्डर", "१ कॅप्सूल ४०० प्रीपेड, २३ मे रोजी (IDX 498) डॉकेट चौकशी."),
    (25, "IDX 349", "श्री दत्तात्रय सर्जेराव गोसावी", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 850, "कोल्हापूर फॉलो-अप", "१ पावडर + १ सीबकथॉर्न ८५० COD, IDX 424 व 576 वर पाठपुरावा."),
    (26, "IDX 353", "ग्राहक (परळ मुंबई)", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 400, "परळ मुंबई ऑर्डर", "लक्ष्मी नारायण सोसायटी, १ पावडर ४०० प्रीपेड + १ सॅम्पल साबण (IDX 354)."),
    (27, "IDX 393", "रवी कुमार / आयुष्मान आयुर्वेदिक", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 3000, "झारखंड आयुर्वेद केंद्र", "५ स्पिरुलिना कॅप्सूल + ५ सीबकथॉर्न कॅप्सूल ३००० प्रीपेड (IDX 394)."),
    (28, "IDX 395", "ग्राहक (उत्तर प्रदेश)", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 1850, "मोठी टॅबलेट ऑर्डर", "फोन ९३६९२६२७२८, १० बाटल्या १२० टॅबलेट १८५० प्रीपेड (IDX 397)."),
    (29, "IDX 430", "केतन ढोलकिया / धेरी ब्युटी पार्लर", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 350, "राजकोट ब्युटी पार्लर", "१ स्पिरुलिना टॅबलेट ३५० COD (IDX 435)."),
    (30, "IDX 436", "लिलाराम चांदवाणी / राजू धिवरे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 800, "उल्हासनगर ऑर्डर", "२ कॅप्सूल ८०० COD (IDX 437)."),
    (31, "IDX 462", "अच्युत दत्तात्रय दौले पाटील", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 2400, "राहुरी कॉम्बो", "३ स्पिरुलिना + २ सीबकथॉर्न + १ साबण २४०० COD."),
    (32, "IDX 531", "लक्ष्मण सोमाण्णा गेजगे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 950, "जथ सांगली ऑर्डर", "स्पिरुलिना ५ पॅक ९५० COD (IDX 532, पिन ४१६४१३ IDX 548 वरून)."),
    (33, "IDX 537", "चंद्रकांत प्रल्हाद ढोरे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 1760, "बुलढाणा कॉम्बो", "५ सीबकथॉर्न + ५ स्पिरुलिना ६० टॅब १७६० COD (IDX 538)."),
    (34, "IDX 575", "राम दास", "मोनू", 1050, "पुनर्नोद पडताळणी", "२५ मे रोजी नोंदवली, ३१ मे रोजी (IDX 709) डिस्पॅच खात्री केली."),
    (35, "IDX 591", "स्मिता सिंग", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 1880, "डोंबिवली ब्रँडेड ऑर्डर", "२० कमला ब्रँड बाटल्या १८८० प्रीपेड (IDX 592, IDX 616 वर पुनर्नोद)."),
    (36, "IDX 604", "तानाजी अशोक शिंदे", "मोनू", 450, "सलग ८ मेसेज जोडणी", "पत्ता, पिन, प्रॉडक्ट, फोन व स्पीड पोस्ट सूचना (IDX 604-612) एकत्र जोडले."),
    (37, "IDX 618", "व्ही. पावना", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 4050, "तेलंगणा मोठी ऑर्डर", "१० सीबकथॉर्न, १ साबण, ३ तेल, ५ स्पिरुलिना, ५ मोरिंगा ४०५० COD (IDX 620)."),
    (38, "IDX 621", "अमित बबन चिंतले / लॅक्मे सलून", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 1150, "पुणे सलून ऑर्डर", "५ स्पिरुलिना पावडर ११५० COD (IDX 622)."),
    (39, "IDX 624", "सुनील पुंडलिक खेडकर", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 5120, "खामगाव मोठी कॉम्बो ऑर्डर", "७ विविध उत्पादने (प्रत्येकी ५ नग) एकूण ५१२० COD (IDX 625)."),
    (40, "IDX 660", "विश्वास बापू पोवार", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 800, "कागल स्पीड पोस्ट", "२ कॅप्सूल स्पीड पोस्टने पाठवले (IDX 661-662)."),
    (41, "IDX 674", "विद्याधर खडकीकर", "मोनू", 0, "मोफत सॅम्पल बाटली", "बीड येथील औषधालयासाठी १ बाटली मोफत सॅम्पल पाठवली."),
    (42, "IDX 696", "राजन वालिया", "मोनू", 450, "अंबाला ऑर्डर", "१ कॅप्सूल ४५० COD (IDX 697 वरून)."),
    (43, "IDX 698", "ग्राहक (फोटोवरून पत्ता)", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 2100, "फोटो पत्ता कॉम्बो", "फोन ९९९२६०४०६७, मोरिंगा पावडर + स्पिरुलिना पावडर २१०० COD (IDX 705).")
]

for row_idx, ac in enumerate(audit_cases_may, 4):
    ws4.row_dimensions[row_idx].height = 22
    is_zebra = (row_idx % 2 == 0)
    
    ws4.cell(row=row_idx, column=1, value=ac[0]).alignment = align_center
    ws4.cell(row=row_idx, column=2, value=ac[1]).alignment = align_center
    ws4.cell(row=row_idx, column=3, value=ac[2]).alignment = align_left
    ws4.cell(row=row_idx, column=4, value=ac[3]).alignment = align_left
    
    c_amt = ws4.cell(row=row_idx, column=5, value=ac[4])
    c_amt.alignment = align_right
    c_amt.number_format = "₹#,##0"
    
    ws4.cell(row=row_idx, column=6, value=ac[5]).alignment = align_left
    ws4.cell(row=row_idx, column=7, value=ac[6]).alignment = align_left
    
    for c in range(1, 8):
        cell = ws4.cell(row=row_idx, column=c)
        cell.font = font_regular
        cell.border = border_cell
        if is_zebra:
            cell.fill = fill_zebra

# Set column widths
ws1.column_dimensions['A'].width = 8
ws1.column_dimensions['B'].width = 13
ws1.column_dimensions['C'].width = 10
ws1.column_dimensions['D'].width = 13
ws1.column_dimensions['E'].width = 24
ws1.column_dimensions['F'].width = 24
ws1.column_dimensions['G'].width = 28
ws1.column_dimensions['H'].width = 16
ws1.column_dimensions['I'].width = 12
ws1.column_dimensions['J'].width = 38
ws1.column_dimensions['K'].width = 14
ws1.column_dimensions['L'].width = 15
ws1.column_dimensions['M'].width = 26
ws1.column_dimensions['N'].width = 38

ws2.column_dimensions['A'].width = 8
ws2.column_dimensions['B'].width = 34
ws2.column_dimensions['C'].width = 16
ws2.column_dimensions['D'].width = 22
ws2.column_dimensions['E'].width = 16
ws2.column_dimensions['F'].width = 16
ws2.column_dimensions['G'].width = 20
ws2.column_dimensions['H'].width = 16

ws3.column_dimensions['A'].width = 13
ws3.column_dimensions['B'].width = 13
ws3.column_dimensions['C'].width = 10
ws3.column_dimensions['D'].width = 24
ws3.column_dimensions['E'].width = 45
ws3.column_dimensions['F'].width = 35
ws3.column_dimensions['G'].width = 45

ws4.column_dimensions['A'].width = 8
ws4.column_dimensions['B'].width = 13
ws4.column_dimensions['C'].width = 26
ws4.column_dimensions['D'].width = 26
ws4.column_dimensions['E'].width = 14
ws4.column_dimensions['F'].width = 28
ws4.column_dimensions['G'].width = 65

# Save files to all 3 paths
paths = [
    r"C:\Users\Admin\Downloads\Sujata_Nutrilive_May_2026_Customers_Updated.xlsx",
    r"C:\Users\Admin\Downloads\Sujata_Nutrilive_May_2026_Customers.xlsx",
    r"f:\RK\Sujata Nutrilive\sujata-nutrilive\data\Sujata_Nutrilive_May_2026_Customers_Updated.xlsx"
]

for p in paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    wb.save(p)
    print(f"Successfully saved to: {p}")

print("ALL MAY FILES GENERATED AND SAVED SUCCESSFULLY!")
