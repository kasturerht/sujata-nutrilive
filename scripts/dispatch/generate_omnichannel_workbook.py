import os
import json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Load data
with open('scripts/omnichannel_master_summary.json', 'r', encoding='utf-8') as f:
    master_data = json.load(f)

meta_sp = master_data['meta_spend']
orders = master_data['orders']

ENTITIES = [
    {'id': 'manjushree', 'name': 'Manjushree Kasture', 'role': 'Telecaller (Senior Closer)', 'phone': '9272471529'},
    {'id': 'vaishnavi', 'name': 'Vaishnavi Diwate', 'role': 'Telecaller (Volume & Prepaid)', 'phone': '99225 34443'},
    {'id': 'punam', 'name': 'Punam Kasture', 'role': 'Telecaller (Bundle Specialist)', 'phone': '99225 00344'},
    {'id': 'monu', 'name': 'Monu (Pooja)', 'role': 'Telecaller (Pan-India Hindi)', 'phone': '95034 34653'},
    {'id': 'karishma', 'name': 'Karishma Patil', 'role': 'Telecaller (Emerging Closer)', 'phone': '99225 77344'},
    {'id': 'yash', 'name': 'Yash Suryawanshi (Founder Direct)', 'role': 'Founder Direct & B2B Clinic', 'phone': 'Direct / VIP'},
    {'id': 'amazon', 'name': 'Amazon India (Amazon.in)', 'role': 'Marketplace (SP-API MFN)', 'phone': 'Amazon SP-API'},
    {'id': 'website', 'name': 'Website Direct (Shopify)', 'role': 'E-Commerce Website', 'phone': 'sujatanutrilive.com'}
]

wb = Workbook()
wb.remove(wb.active)

# Color Palette
COLOR_HEADER_BG = "0A4D2E"       # Sujata Dark Green
COLOR_ACCENT_BG = "E8F5E9"       # Soft Mint
COLOR_ZEBRA = "F9FBF9"
COLOR_TOTAL_BG = "D4EDDA"
COLOR_BORDER = "D3D3D3"

font_title = Font(name="Calibri", size=15, bold=True, color="0A4D2E")
font_sub = Font(name="Calibri", size=10, italic=True, color="555555")
font_section = Font(name="Calibri", size=12, bold=True, color="0A4D2E")
font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
font_bold = Font(name="Calibri", size=11, bold=True)
font_regular = Font(name="Calibri", size=11)

fill_header = PatternFill(start_color=COLOR_HEADER_BG, end_color=COLOR_HEADER_BG, fill_type="solid")
fill_accent = PatternFill(start_color=COLOR_ACCENT_BG, end_color=COLOR_ACCENT_BG, fill_type="solid")
fill_zebra = PatternFill(start_color=COLOR_ZEBRA, end_color=COLOR_ZEBRA, fill_type="solid")
fill_total = PatternFill(start_color=COLOR_TOTAL_BG, end_color=COLOR_TOTAL_BG, fill_type="solid")

thin_border = Border(
    left=Side(style='thin', color=COLOR_BORDER),
    right=Side(style='thin', color=COLOR_BORDER),
    top=Side(style='thin', color=COLOR_BORDER),
    bottom=Side(style='thin', color=COLOR_BORDER)
)
double_bottom_border = Border(
    left=Side(style='thin', color=COLOR_BORDER),
    right=Side(style='thin', color=COLOR_BORDER),
    top=Side(style='thin', color=COLOR_BORDER),
    bottom=Side(style='double', color="0A4D2E")
)

def add_leaderboard_sheet(ws_title, scope_key, scope_name):
    ws = wb.create_sheet(title=ws_title)
    ws.views.sheetView[0].showGridLines = True
    
    ws["A1"] = f"🌿 SUJATA NUTRILIVE — OMNICHANNEL BUSINESS AUDIT ({scope_name})"
    ws["A1"].font = font_title
    ws["A2"] = "Live Reconciled: Meta Ads API + TiDB Orders + Amazon SP-API + Shopify Admin API"
    ws["A2"].font = font_sub
    
    headers = [
        "Rank", "Channel / Representative", "Channel Type", "Contact / Platform",
        "Ad Spend (₹)", "Leads", "Orders", "Prepaid", "COD",
        "Total Revenue (₹)", "Prepaid %", "AOV (₹)", "ROAS", "Revenue Share %"
    ]
    
    start_row = 4
    for c_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=start_row, column=c_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center" if c_idx not in [2, 3, 4] else "left", vertical="center", wrap_text=True)
        
    # Sort entities by revenue in this scope
    sorted_entities = sorted(ENTITIES, key=lambda e: orders[e['id']][scope_key]['rev'], reverse=True)
    scope_total_rev = sum(orders[e['id']][scope_key]['rev'] for e in ENTITIES)
    
    curr_row = start_row
    tot_sp = 0
    tot_ld = 0
    tot_ord = 0
    tot_prep = 0
    tot_cod = 0
    tot_rev = 0
    
    for rk, e in enumerate(sorted_entities, 1):
        curr_row += 1
        eid = e['id']
        sp = meta_sp[eid][scope_key]
        ld = meta_sp[eid][f"leads_{scope_key}"]
        ord_info = orders[eid][scope_key]
        ord_cnt = ord_info['orders']
        prep = ord_info['prepaid']
        cod = ord_info['cod']
        rev = ord_info['rev']
        aov = (rev / ord_cnt) if ord_cnt else 0
        roas = (rev / sp) if sp else 0
        prep_pct = (prep / ord_cnt) if ord_cnt else 0
        rev_share = (rev / scope_total_rev) if scope_total_rev else 0
        
        tot_sp += sp
        tot_ld += ld
        tot_ord += ord_cnt
        tot_prep += prep
        tot_cod += cod
        tot_rev += rev
        
        row_vals = [
            f"#{rk}", e['name'], e['role'], e['phone'],
            sp, ld if ld else None, ord_cnt, prep, cod,
            rev, prep_pct, aov, roas if sp else None, rev_share
        ]
        
        is_even = (curr_row % 2 == 0)
        row_fill = fill_zebra if is_even else None
        
        for c_idx, val in enumerate(row_vals, 1):
            cell = ws.cell(row=curr_row, column=c_idx, value=val)
            cell.font = font_bold if c_idx in [1, 2, 7, 10] else font_regular
            cell.border = thin_border
            if row_fill: cell.fill = row_fill
            
            if c_idx in [2, 3, 4]:
                cell.alignment = Alignment(horizontal="left", vertical="center")
            elif c_idx == 1:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="right", vertical="center")
                
            if c_idx in [5, 10, 12]:
                cell.number_format = "₹#,##0.00"
            elif c_idx in [6, 7, 8, 9]:
                cell.number_format = "#,##0"
            elif c_idx in [11, 14]:
                cell.number_format = "0.00%"
            elif c_idx == 13:
                cell.number_format = '0.00"x"'
                
    # Total Row
    curr_row += 1
    grand_prep_pct = (tot_prep / tot_ord) if tot_ord else 0
    grand_aov = (tot_rev / tot_ord) if tot_ord else 0
    grand_roas = (tot_rev / tot_sp) if tot_sp else 0
    
    tot_vals = [
        "TOTAL", "Omnichannel Grand Total", "All Sales Channels", "Entire Business",
        tot_sp, tot_ld, tot_ord, tot_prep, tot_cod,
        tot_rev, grand_prep_pct, grand_aov, grand_roas, 1.0
    ]
    
    for c_idx, val in enumerate(tot_vals, 1):
        cell = ws.cell(row=curr_row, column=c_idx, value=val)
        cell.font = font_bold
        cell.fill = fill_total
        cell.border = double_bottom_border
        
        if c_idx in [2, 3, 4]:
            cell.alignment = Alignment(horizontal="left", vertical="center")
        elif c_idx == 1:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="right", vertical="center")
            
        if c_idx in [5, 10, 12]:
            cell.number_format = "₹#,##0.00"
        elif c_idx in [6, 7, 8, 9]:
            cell.number_format = "#,##0"
        elif c_idx in [11, 14]:
            cell.number_format = "0.00%"
        elif c_idx == 13:
            cell.number_format = '0.00"x"'
            
    # Auto-adjust column widths
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            if cell.value: max_len = max(max_len, len(str(cell.value)))
        ws.column_dimensions[col_letter].width = max(max_len + 3, 11)
    ws.column_dimensions['A'].width = 8
    ws.column_dimensions['B'].width = 32
    ws.column_dimensions['C'].width = 24
    ws.column_dimensions['D'].width = 20

# 1. Full Period Sheet
add_leaderboard_sheet("Omnichannel_Full_Period", "all", "01 OCT - 21 NOV 2026")

# 2. October Full Sheet
add_leaderboard_sheet("October_2026_Full", "oct", "01 OCT - 31 OCT 2026")

# 3. November To Date Sheet
add_leaderboard_sheet("November_2026_To_Date", "nov", "01 NOV - 21 NOV 2026")

# Save workbook to both locations
out1 = r"C:\Users\Admin\Downloads\Sujata_Nutrilive_Omnichannel_Business_Report_Oct_Nov_2026.xlsx"
out2 = r"F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\Sujata_Nutrilive_Omnichannel_Business_Report_Oct_Nov_2026.xlsx"

wb.save(out1)
wb.save(out2)
print(f"✅ Excel Workbook created at:\n  1. {out1}\n  2. {out2}")
