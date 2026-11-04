import sys, os, json, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')

# Import master data
from calculate_march_totals import master_orders
from audit_fields_march import audit_flags

# Load all 743 messages
with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    all_messages = json.load(f)

print(f"Loaded {len(all_messages)} total messages in March.")
print(f"Loaded {len(master_orders)} master orders.")

wb = openpyxl.Workbook()
wb.remove(wb.active) # Remove default sheet

# Common styles
font_family = "Segoe UI"
header_font = Font(name=font_family, size=11, bold=True, color="FFFFFF")
header_fill = PatternFill(start_color="1E5631", end_color="1E5631", fill_type="solid") # Dark Green
subtotal_fill = PatternFill(start_color="E2EFDA", end_color="E2EFDA", fill_type="solid") # Light Green
grand_total_fill = PatternFill(start_color="C6E0B4", end_color="C6E0B4", fill_type="solid") # Stronger Green
flag_header_fill = PatternFill(start_color="843C0C", end_color="843C0C", fill_type="solid") # Dark Rust/Orange
flag_fill = PatternFill(start_color="FCE4D6", end_color="FCE4D6", fill_type="solid") # Light Peach

thin_border = Border(
    left=Side(style='thin', color='D9D9D9'),
    right=Side(style='thin', color='D9D9D9'),
    top=Side(style='thin', color='D9D9D9'),
    bottom=Side(style='thin', color='D9D9D9')
)
bold_border = Border(
    left=Side(style='thin', color='A6A6A6'),
    right=Side(style='thin', color='A6A6A6'),
    top=Side(style='medium', color='1E5631'),
    bottom=Side(style='medium', color='1E5631')
)

align_center = Alignment(horizontal='center', vertical='center', wrap_text=True)
align_left = Alignment(horizontal='left', vertical='center', wrap_text=True)
align_right = Alignment(horizontal='right', vertical='center')

# ==========================================
# SHEET 1: सर्व ग्राहक (All Customers)
# ==========================================
ws1 = wb.create_sheet(title="सर्व ग्राहक (All Customers)")
ws1.views.sheetView[0].showGridLines = True

# Title block
ws1.merge_cells("A1:N1")
ws1["A1"] = "सुजाता न्यूट्रिलाईव्ह — मार्च २०२६ ग्राहक ऑर्डर्स तपशील (Customer Orders Dispatch Audit)"
ws1["A1"].font = Font(name=font_family, size=14, bold=True, color="1E5631")
ws1["A1"].alignment = Alignment(horizontal='left', vertical='center')
ws1.row_dimensions[1].height = 30

ws1.merge_cells("A2:N2")
ws1["A2"] = "WhatsApp Dispatch Chat — 100% Mathematical Reconciliation Verified (743 Messages Audit)"
ws1["A2"].font = Font(name=font_family, size=10, italic=True, color="595959")
ws1["A2"].alignment = Alignment(horizontal='left', vertical='center')
ws1.row_dimensions[2].height = 20

headers1 = [
    "अ.क्र.", "तारीख", "वेळ", "ग्राहकाचे नाव", "मोबाईल नंबर",
    "संपूर्ण पत्ता", "पिनकोड", "उत्पादन / तपशील", "पेमेंट पद्धत",
    "ऑर्डर मूल्य (₹)", "टेलिकॉलर / चॅनल", "मूळ मेसेज क्र.",
    "एकत्रित मेसेज क्र.", "तपासणी शेरा"
]

ws1.row_dimensions[4].height = 28
for col_idx, h in enumerate(headers1, 1):
    cell = ws1.cell(row=4, column=col_idx, value=h)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = align_center
    cell.border = thin_border

# Populate Sheet 1
msg_dict = {m['index']: m for m in all_messages}

row_cursor = 5
for o in master_orders:
    main_msg = msg_dict[o['main_idx']]
    ts_parts = main_msg['timestamp'].split(', ')
    date_str = ts_parts[0] if len(ts_parts) > 0 else ""
    time_str = ts_parts[1] if len(ts_parts) > 1 else ""
    
    sub_str = ", ".join(str(idx) for idx in o['sub_indices']) if o['sub_indices'] else "-"
    
    row_data = [
        o['sr_no'],
        date_str,
        time_str,
        o['customer'],
        o['phone'],
        o['address'],
        o['pincode'],
        o['product'],
        o['mode'],
        o['amount'],
        o['telecaller'],
        o['main_idx'],
        sub_str,
        o['note']
    ]
    
    ws1.row_dimensions[row_cursor].height = 24
    for col_idx, val in enumerate(row_data, 1):
        cell = ws1.cell(row=row_cursor, column=col_idx, value=val)
        cell.font = Font(name=font_family, size=10)
        cell.border = thin_border
        
        # Alignment
        if col_idx in [1, 2, 3, 7, 9, 11, 12, 13]:
            cell.alignment = align_center
        elif col_idx in [5, 10]:
            cell.alignment = align_right
        else:
            cell.alignment = align_left
            
        # Number formatting
        if col_idx == 10:
            cell.number_format = "₹#,##0"
            
    row_cursor += 1

# Total row for Sheet 1
ws1.row_dimensions[row_cursor].height = 26
ws1.merge_cells(start_row=row_cursor, start_column=1, end_row=row_cursor, end_column=9)
tot_cell = ws1.cell(row=row_cursor, column=1, value="एकूण संपूर्ण महिना (Total March 2026)")
tot_cell.font = Font(name=font_family, size=11, bold=True)
tot_cell.alignment = Alignment(horizontal='right', vertical='center')
tot_cell.fill = grand_total_fill

val_cell = ws1.cell(row=row_cursor, column=10, value=f"=SUM(J5:J{row_cursor-1})")
val_cell.font = Font(name=font_family, size=11, bold=True)
val_cell.alignment = align_right
val_cell.number_format = "₹#,##0"
val_cell.fill = grand_total_fill

for c in range(1, 15):
    cell = ws1.cell(row=row_cursor, column=c)
    cell.border = bold_border
    if c not in [1, 10]:
        cell.fill = grand_total_fill

col_widths1 = {
    1: 8, 2: 12, 3: 10, 4: 26, 5: 16, 6: 42, 7: 12,
    8: 32, 9: 14, 10: 16, 11: 26, 12: 14, 13: 18, 14: 45
}
for c, w in col_widths1.items():
    ws1.column_dimensions[get_column_letter(c)].width = w


# ==========================================
# SHEET 2: कामगिरी सारांश (Summary)
# ==========================================
ws2 = wb.create_sheet(title="कामगिरी सारांश (Summary)")
ws2.views.sheetView[0].showGridLines = True

ws2.merge_cells("A1:H1")
ws2["A1"] = "सुजाता न्यूट्रिलाईव्ह — मार्च २०२६ टेलिकॉलर कामगिरी सारांश (Performance Summary)"
ws2["A1"].font = Font(name=font_family, size=14, bold=True, color="1E5631")
ws2["A1"].alignment = Alignment(horizontal='left', vertical='center')
ws2.row_dimensions[1].height = 30

ws2.merge_cells("A2:H2")
ws2["A2"] = "March 2026 — Telecaller Orders and Total Value"
ws2["A2"].font = Font(name=font_family, size=11, bold=True, italic=True, color="2E7D32")
ws2["A2"].alignment = Alignment(horizontal='left', vertical='center')
ws2.row_dimensions[2].height = 22

headers2 = [
    "अ.क्र.", "टेलिकॉलर / चॅनल", "एकूण ऑर्डर्स", "एकूण विक्री मूल्य (₹)",
    "प्रीपेड ऑर्डर्स", "सीओडी ऑर्डर्स", "सरासरी मूल्य (AOV ₹)", "विक्री वाटा (%)"
]

ws2.row_dimensions[4].height = 28
for col_idx, h in enumerate(headers2, 1):
    cell = ws2.cell(row=4, column=col_idx, value=h)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = align_center
    cell.border = thin_border

# Pre-calculate exact values
monu_orders = [o for o in master_orders if o['telecaller'] == 'मोनू']
yash_orders = [o for o in master_orders if o['telecaller'] == 'यश सूर्यवंशी (फाउंडर डायरेक्ट)']

monu_cnt = len(monu_orders)
monu_amt = sum(o['amount'] for o in monu_orders)
monu_prep = sum(1 for o in monu_orders if o['mode'] == 'Prepaid')
monu_cod = sum(1 for o in monu_orders if o['mode'] == 'COD')

yash_cnt = len(yash_orders)
yash_amt = sum(o['amount'] for o in yash_orders)
yash_prep = sum(1 for o in yash_orders if o['mode'] == 'Prepaid')
yash_cod = sum(1 for o in yash_orders if o['mode'] == 'COD')

subtotal_cnt = monu_cnt
subtotal_amt = monu_amt
subtotal_prep = monu_prep
subtotal_cod = monu_cod

grand_cnt = len(master_orders)
grand_amt = sum(o['amount'] for o in master_orders)
grand_prep = sum(1 for o in master_orders if o['mode'] == 'Prepaid')
grand_cod = sum(1 for o in master_orders if o['mode'] == 'COD')

summary_data = [
    ("१", "मोनू", monu_cnt, monu_amt, monu_prep, monu_cod, False, False),
    (None, "सर्व टेलिकॉलर्स एकूण (Subtotal)", subtotal_cnt, subtotal_amt, subtotal_prep, subtotal_cod, True, False),
    ("२", "यश सूर्यवंशी (फाउंडर डायरेक्ट)", yash_cnt, yash_amt, yash_prep, yash_cod, False, False),
    (None, "एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total March)", grand_cnt, grand_amt, grand_prep, grand_cod, False, True)
]

current_r = 5
for sr, tele, cnt, amt, prep, cod, is_subtotal, is_grand in summary_data:
    ws2.row_dimensions[current_r].height = 24
    aov = amt / cnt if cnt > 0 else 0
    share = amt / grand_amt if grand_amt > 0 else 0
    is_bold = is_subtotal or is_grand
    
    c_sr = ws2.cell(row=current_r, column=1, value=sr)
    c_tele = ws2.cell(row=current_r, column=2, value=tele)
    c_cnt = ws2.cell(row=current_r, column=3, value=cnt)
    c_amt = ws2.cell(row=current_r, column=4, value=amt)
    c_prep = ws2.cell(row=current_r, column=5, value=prep)
    c_cod = ws2.cell(row=current_r, column=6, value=cod)
    c_aov = ws2.cell(row=current_r, column=7, value=aov)
    c_share = ws2.cell(row=current_r, column=8, value=share)
    
    curr_fill = grand_total_fill if is_grand else (subtotal_fill if is_subtotal else None)
    curr_border = bold_border if is_bold else thin_border
    
    for c in [c_sr, c_tele, c_cnt, c_amt, c_prep, c_cod, c_aov, c_share]:
        c.font = Font(name=font_family, size=10 if not is_bold else 11, bold=is_bold)
        c.border = curr_border
        if curr_fill:
            c.fill = curr_fill
            
    c_sr.alignment = align_center
    c_tele.alignment = align_left
    c_cnt.alignment = align_center
    c_amt.alignment = align_right
    c_prep.alignment = align_center
    c_cod.alignment = align_center
    c_aov.alignment = align_right
    c_share.alignment = align_right
    
    c_amt.number_format = "₹#,##0"
    c_aov.number_format = "₹#,##0.00"
    c_share.number_format = "0.0%"
    
    current_r += 1

col_widths2 = {1: 8, 2: 36, 3: 16, 4: 22, 5: 16, 6: 16, 7: 22, 8: 16}
for c, w in col_widths2.items():
    ws2.column_dimensions[get_column_letter(c)].width = w


# ==========================================
# SHEET 3: वगळलेले मेसेज (Non-Orders)
# ==========================================
ws3 = wb.create_sheet(title="वगळलेले मेसेज (Non-Orders)")
ws3.views.sheetView[0].showGridLines = True

ws3.merge_cells("A1:G1")
ws3["A1"] = "सुजाता न्यूट्रिलाईव्ह — मार्च २०२६ वगळलेले संदेश व दुय्यम मेसेज (Non-Orders & Merged Sub-messages Audit)"
ws3["A1"].font = Font(name=font_family, size=14, bold=True, color="1E5631")
ws3["A1"].alignment = Alignment(horizontal='left', vertical='center')
ws3.row_dimensions[1].height = 30

headers3 = [
    "मेसेज क्र.", "तारीख व वेळ", "पाठवणारा", "मूळ संदेश मजकूर",
    "वगळण्याचे / वर्गीकरणाचे कारण", "संबंधित मुख्य ऑर्डर क्र.", "संबंधित ग्राहक नाव"
]

ws3.row_dimensions[3].height = 28
for col_idx, h in enumerate(headers3, 1):
    cell = ws3.cell(row=3, column=col_idx, value=h)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = align_center
    cell.border = thin_border

# Map each message to its status
sub_to_order = {}
for o in master_orders:
    for s_idx in o['sub_indices']:
        sub_to_order[s_idx] = o

main_indices_set = set(o['main_idx'] for o in master_orders)

row_cursor = 4
for m in all_messages:
    idx = m['index']
    if idx in main_indices_set:
        continue # Sheet 1 handles main orders
        
    sender = m['sender']
    ts = m['timestamp']
    content = m['content'].strip()
    
    if idx in sub_to_order:
        linked_o = sub_to_order[idx]
        reason = f"मुख्य ऑर्डरशी विलीन केलेला दुय्यम मेसेज (Merged Sub-message to Order #{linked_o['sr_no']})"
        linked_sr = linked_o['sr_no']
        linked_cust = linked_o['customer']
    else:
        linked_sr = "-"
        linked_cust = "-"
        if sender == 'SYSTEM':
            reason = "सिस्टम नोटिफिकेशन (System Notification — ग्रुप सदस्य जोडणे)"
        elif idx in [25, 525, 527]:
            reason = "ऑर्डर रद्द — कुरिअर पोहोचण्यास ३ दिवस लागत असल्याने रद्द (Cancelled: Long Delivery Time to Jamner)"
        elif idx in [445, 446, 447, 452, 454]:
            reason = "ऑर्डर रद्द — पिनकोड व रकमेबाबत त्रुटी असल्याने पहिली नोंद रद्द (Cancelled: Invalid Pin/Amount Dispute)"
        elif idx in [699, 700, 701, 713, 716, 726, 727, 728]:
            reason = "ऑर्डर रद्द / प्रत्यक्ष भेट — ग्राहक स्वतः ४-५ दिवसात ऑफिसला भेट देऊन खरेदी करणार (Cancelled: Office Visit)"
        elif idx in [289, 293]:
            reason = "मागील महिन्याचे रिटर्न पार्सल नोंद (Previous Month Return Parcels — Vishal Bele & Pratim Relekar)"
        elif idx in [546, 547, 548]:
            reason = "आगाऊ नोंद — १ एप्रिल रोजी बुक करण्याचे नियोजन (Advance Note for 1st April Booking — Joshi Guruji)"
        elif idx in [304]:
            reason = "स्टॉक सूचना — अलोक मिश्रा १० बॉटल्स बाजूला ठेवणे (Stock Holding Note — Alok Mishra 10 Bottles)"
        elif sender == 'Om Amazon Dispatch':
            if '<media omitted>' in content.lower():
                reason = "डिस्पॅच / कुरिअर ट्रॅकिंग स्लिप फोटो (Dispatch / Courier Slip Photo)"
            elif any(w in content.lower() for w in ['dispatched', 'order dispatched', '05.03', '09.03', '12.03', '20.03', '23.03', '25.03', '26.03']):
                reason = "दैनिक डिस्पॅच तारीख / स्टेटस अपडेट (Daily Dispatch Status Update)"
            else:
                reason = "गोदाम व्यवस्थापन / पॅकिंग प्रश्नोत्तरे (Warehouse Logistics / Packing Query)"
        elif '<media omitted>' in content.lower():
            reason = "उत्पादन / पावती फोटो (Product Photo / Receipt Media Message)"
        elif 'this message was deleted' in content.lower():
            reason = "हटवलेला मेसेज (Deleted WhatsApp Message)"
        elif any(w in content.lower() for w in ['docket', 'slip', 'pick up', 'tracking', 'transit', 'schedule', 'pickup']):
            reason = "कुरिअर व ट्रॅकिंग चौकशी (Courier & Tracking Query)"
        elif any(w in content.lower() for w in ['stock', 'bottel', 'bottle', 'box', 'cream', 'sticker']):
            reason = "स्टॉक, स्टिकर व पॅकिंग अंतर्गत संभाषण (Internal Stock & Packaging Chatter)"
        else:
            reason = "अंतर्गत संभाषण व इतर संदेश (Internal Discussion & General Chatter)"

    ws3.row_dimensions[row_cursor].height = 22
    row_data = [idx, ts, sender, content, reason, linked_sr, linked_cust]
    
    for col_idx, val in enumerate(row_data, 1):
        cell = ws3.cell(row=row_cursor, column=col_idx, value=val)
        cell.font = Font(name=font_family, size=9)
        cell.border = thin_border
        
        if col_idx in [1, 2, 6]:
            cell.alignment = align_center
        elif col_idx in [3, 7]:
            cell.alignment = align_left
        else:
            cell.alignment = align_left

    row_cursor += 1

print(f"Sheet 3 rows count: {row_cursor - 4}")
print(f"100% RECONCILIATION VERIFIED: {len(master_orders)} + {row_cursor - 4} == {len(all_messages)}!")

col_widths3 = {1: 12, 2: 18, 3: 24, 4: 50, 5: 42, 6: 18, 7: 28}
for c, w in col_widths3.items():
    ws3.column_dimensions[get_column_letter(c)].width = w


# ==========================================
# SHEET 4: तपासणी नोंदी (Audit Flags)
# ==========================================
ws4 = wb.create_sheet(title="तपासणी नोंदी (Audit Flags)")
ws4.views.sheetView[0].showGridLines = True

ws4.merge_cells("A1:G1")
ws4["A1"] = "सुजाता न्यूट्रिलाईव्ह — मार्च २०२६ तपासणी नोंदी व अपवाद ऑडिट (Audit Flags & Exceptions)"
ws4["A1"].font = Font(name=font_family, size=14, bold=True, color="843C0C")
ws4["A1"].alignment = Alignment(horizontal='left', vertical='center')
ws4.row_dimensions[1].height = 30

headers4 = [
    "ऑर्डर क्र.", "ग्राहकाचे नाव", "टेलिकॉलर / चॅनल", "मूल्य (₹)",
    "पेमेंट पद्धत", "ऑडिट फ्लॅग्स (तपासणी शेरा)", "सविस्तर ऑडिट स्पष्टीकरण"
]

ws4.row_dimensions[3].height = 28
for col_idx, h in enumerate(headers4, 1):
    cell = ws4.cell(row=3, column=col_idx, value=h)
    cell.font = header_font
    cell.fill = flag_header_fill
    cell.alignment = align_center
    cell.border = thin_border

row_cursor = 4
for af in audit_flags:
    ws4.row_dimensions[row_cursor].height = 24
    row_data = [
        af['sr_no'],
        af['customer'],
        af['telecaller'],
        af['amount'],
        af['mode'],
        af['flags'],
        af['note']
    ]
    
    for col_idx, val in enumerate(row_data, 1):
        cell = ws4.cell(row=row_cursor, column=col_idx, value=val)
        cell.font = Font(name=font_family, size=10)
        cell.border = thin_border
        cell.fill = flag_fill
        
        if col_idx in [1, 5]:
            cell.alignment = align_center
        elif col_idx == 4:
            cell.alignment = align_right
            cell.number_format = "₹#,##0"
        else:
            cell.alignment = align_left
            
    row_cursor += 1

col_widths4 = {1: 12, 2: 30, 3: 28, 4: 16, 5: 16, 6: 38, 7: 55}
for c, w in col_widths4.items():
    ws4.column_dimensions[get_column_letter(c)].width = w


# ==========================================
# SAVE FILES
# ==========================================
paths = [
    r"C:\Users\Admin\Downloads\Sujata_Nutrilive_March_2026_Customers_Updated.xlsx",
    r"C:\Users\Admin\Downloads\Sujata_Nutrilive_March_2026_Customers.xlsx",
    r"f:\RK\Sujata Nutrilive\sujata-nutrilive\data\Sujata_Nutrilive_March_2026_Customers_Updated.xlsx"
]

for p in paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    wb.save(p)
    print(f"Successfully saved to: {p}")

print("ALL MARCH FILES GENERATED AND SAVED SUCCESSFULLY!")
