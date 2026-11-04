import json
import re
import sys
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

from reconcile_913_june import all_orders, main_order_map, merged_map

print(f"Loaded {len(msgs)} total messages.")
print(f"Loaded {len(all_orders)} master orders.")
print(f"Loaded {len(merged_map)} merged sub-messages.")

# Build Sheet 3 rows (800 rows: 134 merged + 666 excluded)
sheet3_rows = []

# Map of merged messages details
merged_info = {}
for o in all_orders:
    p_id = o['main_idx']
    p_name = o['customer_name']
    p_tele = o['telecaller']
    for sub in o['merged_idxs']:
        merged_info[sub] = (p_id, p_name, p_tele)

for i, m in enumerate(msgs):
    if i in main_order_map:
        continue # Sheet 1
    
    sender = m.get('sender', '')
    dt_date = m.get('date', '')
    dt_time = m.get('time', '')
    text = m.get('text', '').strip()
    
    if i in merged_map:
        p_id, p_name, p_tele = merged_info[i]
        cat = "ऑर्डर्स जोडलेली उप-नोंद (Merged Sub-message)"
        reason = f"ऑर्डर IDX {p_id} ({p_name} - {p_tele}) शी जोडलेली उप-नोंद (पत्ता/फोन/प्रॉडक्ट/रक्कम)"
    else:
        # Excluded category classification
        if text == "This message was deleted":
            cat = "रद्द / हटवलेला मेसेज (Deleted Message)"
            reason = "युझरने पाठवल्यानंतर डिलीट केलेला मेसेज"
        elif sender == "SYSTEM":
            cat = "सिस्टम मेसेज (System Notification)"
            reason = "व्हॉट्सॲप ग्रुप सिस्टम सूचना"
        elif sender == "Om Amazon Dispatch":
            if text.startswith("<Media"):
                cat = "पार्सल ट्रॅकिंग / पावती (Tracking Slips & Receipts)"
                reason = "वेअरहाऊस डिस्पॅच / कुरिअर पावतीचा फोटो"
            elif any(k in text.lower() for k in ['dispatched', 'ok', 'jaiel', 'nahi', 'mam', 'phone', 'pincode', 'name']):
                cat = "वेअरहाऊस चौकशी / संभाषण (Warehouse Chatter)"
                reason = "पॅकिंग व डिस्पॅच संदर्भातील अंतर्गत संवाद"
            else:
                cat = "वेअरहाऊस अपडेट (Warehouse Update)"
                reason = "वेअरहाऊस डिस्पॅच माहिती"
        elif text.startswith("<Media"):
            cat = "पॅकिंग व डिझाईन फोटो (Product & Packing Photos)"
            reason = "उत्पादन / पॅकिंग / पेमेंट स्क्रीनशॉट"
        elif any(k in text.lower() for k in ['icarry', 'track', 'awb', 'delhivery', 'dtdc', 'speed post', 'ekart']):
            cat = "पार्सल ट्रॅकिंग / पावती (Tracking Slips & Receipts)"
            reason = "कुरिअर ट्रॅकिंग लिंक किंवा पावती क्रमांक"
        elif any(k in text.lower() for k in ['status', 'return', 'cancel', 'kashinath', 'bhusari', 'parsel', 'order 1', 'order 2', 'order 3', 'order 4', 'pending']):
            cat = "डिलिव्हरी चौकशी (Delivery / Status Query)"
            reason = "ऑर्डर स्थिती किंवा डिस्पॅच फॉलो-अप"
        elif text in ['Ok', 'Okay', 'Okk', 'Ho', 'Thik hai', 'Thikey', '..', '.', 'Yes']:
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
assert len(all_orders) + len(sheet3_rows) == len(msgs), "Reconciliation mismatch!"
print("100% RECONCILIATION VERIFIED: 113 + 800 == 913!")

# Create Workbook
wb = openpyxl.Workbook()
# Remove default sheet
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
font_small = Font(name="Segoe UI", size=9, color="555555")

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
align_wrap_left = Alignment(horizontal="left", vertical="center", wrap_text=True)

# ==========================================
# SHEET 1: सर्व ग्राहक (All Customers)
# ==========================================
ws1 = wb.create_sheet(title="सर्व ग्राहक (All Customers)")
ws1.views.sheetView[0].showGridLines = True

# Title Banner
ws1.merge_cells("A1:N1")
ws1["A1"] = "सुजाता न्यूट्रिलाईव्ह — जून २०२६ ग्राहकांच्या सर्व ऑर्डर्स (Master Customer Orders)"
ws1["A1"].font = font_title
ws1["A1"].fill = fill_title
ws1["A1"].alignment = align_center
ws1.row_dimensions[1].height = 35

ws1.merge_cells("A2:N2")
ws1["A2"] = "व्हॉट्सॲप डिस्पॅच ग्रुप (Daily orders dispatch) मधील जून २०२६ च्या सर्व पडताळणी केलेल्या ऑर्डर्स"
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

for row_idx, o in enumerate(all_orders, 4):
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
total_row_1 = len(all_orders) + 4
ws1.row_dimensions[total_row_1].height = 25
ws1.merge_cells(f"A{total_row_1}:K{total_row_1}")
tot_cell = ws1.cell(row=total_row_1, column=1, value="एकूण संपूर्ण जून २०२६ विक्री (Grand Total June 2026)")
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
ws2["A1"] = "सुजाता न्यूट्रिलाईव्ह — जून २०२६ टेलिकॉलर कामगिरी सारांश (Performance Summary)"
ws2["A1"].font = font_title
ws2["A1"].fill = fill_title
ws2["A1"].alignment = align_center
ws2.row_dimensions[1].height = 35

ws2.merge_cells("A2:H2")
ws2["A2"] = "June 2026 — Telecaller Orders and Total Value"
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

# Calculate Stats
manju_orders_list = [o for o in all_orders if o['telecaller'] == 'मंजुश्री कस्तुरे']
monu_orders_list = [o for o in all_orders if o['telecaller'] == 'मोनू']
yash_orders_list = [o for o in all_orders if o['telecaller'] == 'यश सूर्यवंशी (फाउंडर डायरेक्ट)']

grand_total_amount = sum(o['amount'] for o in all_orders)

summary_rows_def = [
    ("१", "मंजुश्री कस्तुरे", len(manju_orders_list), sum(o['amount'] for o in manju_orders_list),
     sum(1 for o in manju_orders_list if o['payment_type'] == 'Prepaid'),
     sum(1 for o in manju_orders_list if o['payment_type'] == 'COD'), False),
    ("२", "मोनू", len(monu_orders_list), sum(o['amount'] for o in monu_orders_list),
     sum(1 for o in monu_orders_list if o['payment_type'] == 'Prepaid'),
     sum(1 for o in monu_orders_list if o['payment_type'] == 'COD'), False),
]

current_r = 5
for sr, tele, cnt, amt, prep, cod, _ in summary_rows_def:
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
tele_cnt = len(manju_orders_list) + len(monu_orders_list)
tele_amt = sum(o['amount'] for o in manju_orders_list) + sum(o['amount'] for o in monu_orders_list)
tele_prep = sum(1 for o in manju_orders_list if o['payment_type'] == 'Prepaid') + sum(1 for o in monu_orders_list if o['payment_type'] == 'Prepaid')
tele_cod = sum(1 for o in manju_orders_list if o['payment_type'] == 'COD') + sum(1 for o in monu_orders_list if o['payment_type'] == 'COD')
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
y_cnt = len(yash_orders_list)
y_amt = sum(o['amount'] for o in yash_orders_list)
y_prep = sum(1 for o in yash_orders_list if o['payment_type'] == 'Prepaid')
y_cod = sum(1 for o in yash_orders_list if o['payment_type'] == 'COD')
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
g_cnt = len(all_orders)
g_amt = grand_total_amount
g_prep = sum(1 for o in all_orders if o['payment_type'] == 'Prepaid')
g_cod = sum(1 for o in all_orders if o['payment_type'] == 'COD')
g_aov = g_amt / g_cnt if g_cnt > 0 else 0
g_share = 1.0

ws2.row_dimensions[current_r].height = 25
ws2.cell(row=current_r, column=1, value="").alignment = align_center
ws2.cell(row=current_r, column=2, value="एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total June)").alignment = align_left
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
ws3["A1"] = "सुजाता न्यूट्रिलाईव्ह — जून २०२६ वगळलेले सर्व मेसेज व उप-नोंदी (Non-Orders & Merged Log)"
ws3["A1"].font = font_title
ws3["A1"].fill = fill_title
ws3["A1"].alignment = align_center
ws3.row_dimensions[1].height = 35

ws3.merge_cells("A2:G2")
ws3["A2"] = "ग्रुपमधील एकूण ९१३ पैकी ऑर्डर्समध्ये समाविष्ट नसलेले किंवा उप-नोंद असलेले सर्व ८०० मेसेज"
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
ws4["A1"] = "सुजाता न्यूट्रिलाईव्ह — जून २०२६ डेटा तपासणी व ऑडिट नोंदी (Audit Flags & Verification)"
ws4["A1"].font = font_title
ws4["A1"].fill = fill_title
ws4["A1"].alignment = align_center
ws4.row_dimensions[1].height = 35

ws4.merge_cells("A2:G2")
ws4["A2"] = "ऑर्डर्स जोडणी, सॅम्पल डिस्पॅच, शून्य रक्कम, आणि कुरिअर री-बुकिंगची पारदर्शक पडताळणी"
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

audit_cases = [
    (1, "IDX 12", "चंद्रकांत लबडे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 450, "पेंडिंग डिस्पॅच स्मरणपत्र", "१ जूनला नोंदवली व ८ जूनला (IDX 160) 'Speed post' स्मरणपत्राद्वारे डिस्पॅच निश्चित केली."),
    (2, "IDX 17", "राजन वालिया", "मोनू", 0, "फोटोवरून ऑर्डर", "मोनूने पत्ता व फोन टेक्स्टमध्ये दिला, उत्पादनाचा व पेमेंटचा फोटो सोबत जोडला होता."),
    (3, "IDX 32", "प्राजक्ता काकडे", "मोनू", 850, "फोन नंबर अनुपलब्ध", "मेसेजमध्ये फोन नंबर नव्हता; पत्ता, उत्पादने व रक्कम (८५० COD) स्पष्ट नमूद आहे."),
    (4, "IDX 50", "आनंद कुमार", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 1600, "मल्टी-पार्ट ऑर्डर", "पत्ता IDX 50 वर, बाटल्या भरल्याची सूचना IDX 51 वर, आणि रक्कम COD 1600 IDX 55 वरून जोडली."),
    (5, "IDX 56", "स्वप्निल गोर", "मोनू", 0, "रक्कम मेसेजमध्ये नाही", "प्रीपेड कॉम्बो (1 spirulina + 1 seabuckthorn), मेसेजमध्ये रक्कम नमूद नसल्याने मूळ संदर्भाप्रमाणे शून्य नोंदवली."),
    (6, "IDX 66", "रघुनंदन ऑरगॅनिक फीड्स", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "डिस्ट्रिब्युटर सॅम्पल", "गोल्डन कॅप स्पिरुलिना बाटल्यांचा प्रीपेड डिस्ट्रिब्युटर सॅम्पल पाठवला (IDX 310 वर वजन तपासले)."),
    (7, "IDX 71", "महावीर मेडिकल", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "सॅम्पल किट व १०० बॉटल", "सॅम्पल किट व १०० स्पिरुलिना बॉटल्स स्पीड पोस्टने पाठवले (IDX 152 वर सविस्तर फोन व पत्ता जोडला)."),
    (8, "IDX 148", "रेखा मोहन भोळे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 1100, "तपशीलवार यादी", "प्रॉडक्ट्सचे दर व बेरीज (₹1100) IDX 147 वर, पत्ता IDX 148 वर आणि नाव-फोन IDX 149 वर एकत्र करून नोंदवली."),
    (9, "IDX 156", "संतोष कुमार गुप्ता", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "पेंडिंग स्पीड पोस्ट", "१० कॅप्सूल, ५ टॅबलेट, ५ पावडर व १ फेसवॉशची पेंडिंग ऑर्डर स्पीड पोस्टने पाठवली."),
    (10, "IDX 275", "प्रशांत विनायक वायदंडे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 500, "कुरिअर री-बुकिंग", "१० जूनला दिल्लीव्हरीने बुकिंग केले, परंतु डिलिव्हरी न झाल्याने १८ जूनला (IDX 502) ई-कार्टने पुन्हा बुक केले."),
    (11, "IDX 308", "किरण निंबा पाटील", "मंजुश्री कस्तुरे", 450, "फोन व फेसवॉश जोडणी", "फोन नंबर IDX 331 वरून जोडला, आणि १५ जूनला (IDX 385) १ फेसवॉश जोडून स्पीड पोस्टने पाठवले."),
    (12, "IDX 324", "तेजल मेडिकल", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "कमर्शियल डिस्पॅच", "२० तेल व २० शॅम्पूचा व्यावसायिक पुरवठा."),
    (13, "IDX 327", "कल्याणी निलेश कुंभार", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 250, "पहिली ऑर्डर (तेल)", "१२ जूनला २५० COD वर १ तेल मागवले."),
    (14, "IDX 350", "ग्राहक (फोटोवरून पत्ता)", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 500, "फोटो पत्ता ऑर्डर", "पत्ता फोटोत, ६ मोरिंगा पावडर प्रीपेड ५०० रुपये (IDX 351)."),
    (15, "IDX 363", "गिरीश क्लिनिक", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "डॉक्टर क्लिनिक पुरवठा", "१० कॅप्सूल व २ सीबकथॉर्न क्लिनिकसाठी पाठवले."),
    (16, "IDX 367", "अक्षर पटेल", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 1000, "दुसरी ऑर्डर", "११ जूनला (IDX 307) ८४९ रुपयांची ऑर्डर दिली होती; १४ जूनला (IDX 367) ३ कॅप्सूलची १००० रुपयांची दुसरी ऑर्डर दिली."),
    (17, "IDX 379", "पी. पी. भुसारी", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 800, "रिटर्न नोंद", "१४ जूनची ८०० COD ची ऑर्डर नंतर रिटर्न आली, २८ जूनला (IDX 870) स्टेटस चौकशी केली."),
    (18, "IDX 395", "ग्राहक (फोटोवरून पत्ता)", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "स्पीड पोस्ट सॅम्पल", "१ स्पिरुलिना टॅब + १ अश्वगंधा टॅब + १ साबण स्पीड पोस्टने पाठवले."),
    (19, "IDX 488", "संतोष मेडिकल / ग्राहक", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 1750, "फोटो पत्ता कॉम्बो", "१ किलो पावडर + १ सीबकथॉर्न + १ स्पिरुलिना + साबण, १७५० COD."),
    (20, "IDX 490", "कल्याणी निलेश कुंभार", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 200, "दुसरी ऑर्डर (शॅम्पू)", "१७ जूनला १ शॅम्पू प्रीपेड मागवला."),
    (21, "IDX 526", "काशिनाथ कोंडाजी अहिरे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 450, "ऑर्डर १", "१९ जूनला १२० टॅब स्पिरुलिना प्रीपेड ४५० वर पाठवले."),
    (22, "IDX 551", "काशिनाथ कोंडाजी अहिरे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 450, "ऑर्डर २", "२० जूनला दुसरी ऑर्डर (Order 2) १२० टॅब स्पीड पोस्टने प्रीपेड पाठवली."),
    (23, "IDX 572", "स्वामी आनंद भारतीय", "मोनू", 0, "नियमित भागीदार", "५ मोरिंगा, ३ सीबकथॉर्न, ३ स्पिरुलिना टॅबलेटचा नियमित पुरवठा."),
    (24, "IDX 649", "श्रीकांत दास", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 950, "मंजुश्री कस्टमर री-बुक", "मंजुश्री यांच्या कस्टमरची ऑर्डर पुन्हा बुक केली (९५० COD)."),
    (25, "IDX 794", "पद्मश्री प्रशांत बर्डे", "मंजुश्री कस्तुरे", 999, "फोन नंबर यश मेसेजवरून", "मंजुश्री यांनी २५ जूनला नोंदवली (फोन नव्हता), यश यांनी २८ जूनला (IDX 883) फोन नंबर जोडून स्पीड पोस्टने पाठवली."),
    (26, "IDX 824", "पत्रकार मुजम्मील कमालीवाले", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 1380, "दुसरी ऑर्डर (पावडर व कॉम्बो)", "१३ जूनला (IDX 278) क्रीम-शॅम्पू मागवले होते; २६ जूनला (IDX 824) पावडर-कॉम्बो १३८० COD वर मागवले."),
    (27, "IDX 842", "लक्ष्मण नांद्रेकर", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "कस्टम टॅबलेट डिस्पॅच", "३५ गोळ्यांचे सॅम्पल स्पीड पोस्टने पाठवले."),
    (28, "IDX 848", "संतोष कुमार गुप्ता", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 5180, "दुसरी मोठी ऑर्डर", "२७ जूनला ५१८० COD वर २० कॅप्सूल, १० टॅबलेट, १ तेल, १ फेसवॉश, १ साबण पाठवले."),
    (29, "IDX 890", "पंकज नामदेव", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 450, "ऑनलाइन पेमेंट पुष्टी", "मंजुश्री यांनी ऑनलाइन पेमेंट जमा झाल्याचे स्पष्ट केले (IDX 894)."),
    (30, "IDX 897", "मंजुश्री रोहित कस्तुरे", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "टेलिकॉलर अंतर्गत स्टॉक", "टेलिकॉलर मंजुश्री यांना कोल्हापूर येथे २ स्पिरुलिना टॅब व १ सीबकथॉर्न अंतर्गत वापरासाठी पाठवले."),
    (31, "IDX 899", "परिंदा छेडा", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "मोफत सॅम्पल किट", "५ ग्रॅम ब्राइड क्रीम सॅम्पल, तेल, फेसवॉश व शॅम्पू मोफत पाठवले."),
    (32, "IDX 910", "लक्ष्मण नांद्रेकर", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", 0, "बल्क डिस्ट्रिब्युटर पुरवठा", "२० आरोग्यम टॅब, ५ पावडर, ५ मोरिंगा टॅबलेट स्पीड पोस्टने पाठवले.")
]

for row_idx, ac in enumerate(audit_cases, 4):
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

# Set Auto Column Widths for all sheets
for ws in [ws1, ws2, ws3, ws4]:
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            # ignore merged banner row 1 and 2
            if cell.row in [1, 2]:
                continue
            val_str = str(cell.value or '')
            if cell.number_format and "₹" in cell.number_format:
                val_str += "   "
            max_len = max(max_len, len(val_str))
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

# Specific overrides for readability
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
ws1.column_dimensions['M'].width = 24
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

# Save files
paths = [
    r"C:\Users\Admin\Downloads\Sujata_Nutrilive_June_2026_Customers_Updated.xlsx",
    r"C:\Users\Admin\Downloads\Sujata_Nutrilive_June_2026_Customers.xlsx",
    r"f:\RK\Sujata Nutrilive\sujata-nutrilive\data\Sujata_Nutrilive_June_2026_Customers_Updated.xlsx"
]

for p in paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    wb.save(p)
    print(f"Successfully saved to: {p}")

print("ALL FILES SAVED SUCCESSFULLY!")
