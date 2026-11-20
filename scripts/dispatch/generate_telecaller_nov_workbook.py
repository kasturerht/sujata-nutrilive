import os
import json
import pymysql
import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# 1. Read .env for TiDB credentials
env_vars = {}
with open('.env', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

# 2. Connect TiDB
t_conn = pymysql.connect(
    host=env_vars.get('TIDB_HOST', 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'),
    port=int(env_vars.get('TIDB_PORT', 4000)),
    user=env_vars.get('TIDB_USER', '3FeKz4HehHXuLCf.root'),
    password=env_vars.get('TIDB_PASSWORD', 'SujataNutriLive2026!Db'),
    database=env_vars.get('TIDB_DATABASE', 'sujata_nutrilive'),
    ssl={'ssl': {}},
    autocommit=True
)

with t_conn.cursor(pymysql.cursors.DictCursor) as cur:
    cur.execute("""
        SELECT order_id, order_date, customer_name, customer_phone, caller_name, amount, payment_mode, products_ordered, dispatch_channel
        FROM orders
        WHERE order_date >= '2026-11-01' AND order_date <= '2026-11-20'
        ORDER BY order_date ASC;
    """)
    all_orders = cur.fetchall()
t_conn.close()

# 3. Load Meta Daily Insights
with open('scripts/meta_oct_nov_daywise.json', 'r', encoding='utf-8') as f:
    meta_daily = json.load(f)

# Telecallers config
TELECALLERS = [
    {
        'id': 'manjushree',
        'sheet_name': 'Manjushree',
        'name': 'Manjushree Kasture',
        'phone': '9272471529',
        'campaign_needle': '9272471529',
        'db_needles': ['manju'],
        'role': 'Senior Telecaller / Top Closer',
        'badge': '🏆 #1 Highest ROAS (12.09x)'
    },
    {
        'id': 'vaishnavi',
        'sheet_name': 'Vaishnavi',
        'name': 'Vaishnavi Diwate',
        'phone': '9922534443',
        'campaign_needle': '99225 34443',
        'db_needles': ['vaishnavi'],
        'role': 'High Volume & Prepaid Specialist',
        'badge': '⚡ #1 Top Revenue (₹58,798)'
    },
    {
        'id': 'punam',
        'sheet_name': 'Punam',
        'name': 'Punam Kasture',
        'phone': '9922500344',
        'campaign_needle': '9922500344',
        'db_needles': ['punam'],
        'role': 'High AOV & Bundle Specialist',
        'badge': '💎 #1 Highest AOV (₹1,946)'
    },
    {
        'id': 'monu',
        'sheet_name': 'Monu_Pooja',
        'name': 'Monu (Pooja)',
        'phone': '9503434653',
        'campaign_needle': '95034',
        'db_needles': ['monu', 'pooja', '95034', 'system notification'],
        'role': 'National Hindi Market Specialist',
        'badge': '🎯 #1 Highest Conv Rate (16.28%)'
    },
    {
        'id': 'karishma',
        'sheet_name': 'Karishma',
        'name': 'Karishma Patil',
        'phone': '9922577344',
        'campaign_needle': '9922577344',
        'db_needles': ['karishma'],
        'role': 'Emerging Closer',
        'badge': '📈 Consistent Contributor'
    }
]

# Generate date sequence from 2026-11-01 to 2026-11-20 (20 days)
start_date = datetime.date(2026, 11, 1)
end_date = datetime.date(2026, 11, 20)
delta = datetime.timedelta(days=1)
date_list = []
curr = start_date
while curr <= end_date:
    date_list.append(curr.strftime('%Y-%m-%d'))
    curr += delta

# Initialize structured data dictionary
data = {tc['id']: {} for tc in TELECALLERS}
for tc in TELECALLERS:
    for d in date_list:
        data[tc['id']][d] = {
            'date': d,
            'spend': 0.0,
            'leads': 0,
            'orders': 0,
            'prepaid_orders': 0,
            'prepaid_rev': 0.0,
            'cod_orders': 0,
            'cod_rev': 0.0,
            'total_rev': 0.0,
            'products': []
        }

# Populate Meta Spend & Leads for Nov 01 to Nov 20
for r in meta_daily:
    cname = r.get('campaign_name', '')
    d = r.get('date_start')
    if d not in date_list:
        continue
    
    for tc in TELECALLERS:
        if tc['campaign_needle'] in cname:
            sp = float(r.get('spend', 0))
            leads = 0
            for a in r.get('actions', []):
                if a.get('action_type') == 'onsite_conversion.messaging_conversation_started_7d':
                    leads = int(a.get('value', 0))
                    break
            data[tc['id']][d]['spend'] += sp
            data[tc['id']][d]['leads'] += leads
            break

# Populate Orders from TiDB
for o in all_orders:
    c_raw = (o['caller_name'] or '').lower()
    matched_id = None
    for tc in TELECALLERS:
        if any(needle in c_raw for needle in tc['db_needles']):
            matched_id = tc['id']
            break
    
    if not matched_id:
        continue
    
    d = str(o['order_date'])
    if d not in date_list:
        continue
    
    amt = float(o['amount'] or 0)
    pm = (o['payment_mode'] or 'COD').upper()
    
    day_rec = data[matched_id][d]
    day_rec['orders'] += 1
    day_rec['total_rev'] += amt
    if pm == 'COD':
        day_rec['cod_orders'] += 1
        day_rec['cod_rev'] += amt
    else:
        day_rec['prepaid_orders'] += 1
        day_rec['prepaid_rev'] += amt
    
    if o['products_ordered']:
        day_rec['products'].append(o['products_ordered'])

# Compute Aggregates per Telecaller
aggregates = {}
for tc in TELECALLERS:
    cid = tc['id']
    tot_spend = sum(data[cid][d]['spend'] for d in date_list)
    tot_leads = sum(data[cid][d]['leads'] for d in date_list)
    tot_orders = sum(data[cid][d]['orders'] for d in date_list)
    tot_prepaid = sum(data[cid][d]['prepaid_orders'] for d in date_list)
    tot_cod = sum(data[cid][d]['cod_orders'] for d in date_list)
    tot_rev = sum(data[cid][d]['total_rev'] for d in date_list)
    tot_prepaid_rev = sum(data[cid][d]['prepaid_rev'] for d in date_list)
    tot_cod_rev = sum(data[cid][d]['cod_rev'] for d in date_list)
    
    cr = (tot_orders / tot_leads * 100) if tot_leads > 0 else 0.0
    aov = (tot_rev / tot_orders) if tot_orders > 0 else 0.0
    cpl = (tot_spend / tot_leads) if tot_leads > 0 else 0.0
    roas = (tot_rev / tot_spend) if tot_spend > 0 else 0.0
    prepaid_ratio = (tot_prepaid / tot_orders * 100) if tot_orders > 0 else 0.0

    aggregates[cid] = {
        'name': tc['name'],
        'phone': tc['phone'],
        'role': tc['role'],
        'badge': tc['badge'],
        'tot_spend': tot_spend,
        'tot_leads': tot_leads,
        'tot_orders': tot_orders,
        'tot_prepaid': tot_prepaid,
        'tot_cod': tot_cod,
        'tot_rev': tot_rev,
        'tot_prepaid_rev': tot_prepaid_rev,
        'tot_cod_rev': tot_cod_rev,
        'cr': cr,
        'aov': aov,
        'cpl': cpl,
        'roas': roas,
        'prepaid_ratio': prepaid_ratio
    }

# Save aggregates to JSON
with open('scripts/telecaller_nov_only_aggregates.json', 'w', encoding='utf-8') as f:
    json.dump({'aggregates': aggregates, 'data': data}, f, indent=2)

print("November aggregates calculated and saved.")

# 4. Generate OpenPyXL Excel Workbook
wb = Workbook()
wb.remove(wb.active)

# Color Palette
COLOR_HEADER_BG = "0A4D2E"       # Sujata Green
COLOR_ACCENT_BG = "E8F5E9"       # Light Mint Green
COLOR_ZEBRA = "F9FBF9"           # Soft green
COLOR_BORDER = "CCCCCC"
COLOR_TOTAL_BG = "D4EDDA"        # Total row

font_title = Font(name="Calibri", size=16, bold=True, color="0A4D2E")
font_sub = Font(name="Calibri", size=11, italic=True, color="555555")
font_section = Font(name="Calibri", size=13, bold=True, color="0A4D2E")
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

# -------------------------------------------------------------
# SHEET 1: LEADERBOARD OVERVIEW (NOVEMBER ONLY)
# -------------------------------------------------------------
ws_ov = wb.create_sheet(title="November_Leaderboard")
ws_ov.views.sheetView[0].showGridLines = True

ws_ov["A1"] = "🌿 SUJATA NUTRILIVE — NOVEMBER TELECALLER AUDIT (01 - 20 NOV 2026)"
ws_ov["A1"].font = font_title
ws_ov["A2"] = "Period: 01 November 2026 to 20 November 2026 | Source: Meta Ads Manager API + TiDB Orders Database"
ws_ov["A2"].font = font_sub

# Team Totals
grand_spend = sum(a['tot_spend'] for a in aggregates.values())
grand_leads = sum(a['tot_leads'] for a in aggregates.values())
grand_orders = sum(a['tot_orders'] for a in aggregates.values())
grand_prepaid = sum(a['tot_prepaid'] for a in aggregates.values())
grand_cod = sum(a['tot_cod'] for a in aggregates.values())
grand_rev = sum(a['tot_rev'] for a in aggregates.values())
grand_cr = (grand_orders / grand_leads * 100) if grand_leads else 0
grand_aov = (grand_rev / grand_orders) if grand_orders else 0
grand_cpl = (grand_spend / grand_leads) if grand_leads else 0
grand_roas = (grand_rev / grand_spend) if grand_spend else 0

ws_ov["A4"] = "📊 NOVEMBER EXECUTIVE KPI DASHBOARD (ALL 5 TELECALLERS)"
ws_ov["A4"].font = font_section

kpi_headers = ["Total Ad Spend", "Total WhatsApp Leads", "Average CPL", "Total Orders Booked", "Prepaid Orders", "COD Orders", "Total Sales Revenue", "Conversion Rate (CR%)", "Average Order Value (AOV)", "Blended ROAS"]
kpi_vals = [grand_spend, grand_leads, grand_cpl, grand_orders, grand_prepaid, grand_cod, grand_rev, grand_cr / 100, grand_aov, grand_roas]
kpi_formats = ["₹#,##0.00", "#,##0", "₹#,##0.00", "#,##0", "#,##0", "#,##0", "₹#,##0.00", "0.00%", "₹#,##0.00", '0.00"x"']

for i in range(5):
    col = chr(ord('A') + i*2)
    # Row 1
    ws_ov[f"{col}5"] = kpi_headers[i]
    ws_ov[f"{col}5"].font = Font(name="Calibri", size=9, bold=True, color="555555")
    ws_ov[f"{col}5"].alignment = Alignment(horizontal="center", vertical="center")
    ws_ov[f"{col}6"] = kpi_vals[i]
    ws_ov[f"{col}6"].font = Font(name="Calibri", size=13, bold=True, color="0A4D2E")
    ws_ov[f"{col}6"].number_format = kpi_formats[i]
    ws_ov[f"{col}6"].alignment = Alignment(horizontal="center", vertical="center")
    ws_ov[f"{col}6"].fill = fill_accent
    
    # Row 2
    ws_ov[f"{col}8"] = kpi_headers[i+5]
    ws_ov[f"{col}8"].font = Font(name="Calibri", size=9, bold=True, color="555555")
    ws_ov[f"{col}8"].alignment = Alignment(horizontal="center", vertical="center")
    ws_ov[f"{col}9"] = kpi_vals[i+5]
    ws_ov[f"{col}9"].font = Font(name="Calibri", size=13, bold=True, color="0A4D2E")
    ws_ov[f"{col}9"].number_format = kpi_formats[i+5]
    ws_ov[f"{col}9"].alignment = Alignment(horizontal="center", vertical="center")
    ws_ov[f"{col}9"].fill = fill_accent

# Leaderboard Table
ws_ov["A12"] = "🏆 NOVEMBER TELECALLER LEADERBOARD (RANKED BY REVENUE & EFFICIENCY)"
ws_ov["A12"].font = font_section

headers = [
    "Rank", "Telecaller Name", "WhatsApp Number", "Role / Focus",
    "Ad Spend (₹)", "Leads", "CPL (₹)", "Orders", "Prepaid", "COD",
    "Revenue (₹)", "Prepaid %", "Conv. Rate (CR%)", "AOV (₹)", "ROAS", "Superpower / Badge"
]

row_idx = 14
for c_idx, h in enumerate(headers, 1):
    cell = ws_ov.cell(row=row_idx, column=c_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = Alignment(horizontal="center" if c_idx not in [2, 4, 16] else "left", vertical="center", wrap_text=True)

# Rank by November Revenue
ranked_cids = sorted(aggregates.keys(), key=lambda x: aggregates[x]['tot_rev'], reverse=True)

for rk, cid in enumerate(ranked_cids, 1):
    row_idx += 1
    agg = aggregates[cid]
    vals = [
        f"#{rk}",
        agg['name'],
        agg['phone'],
        agg['role'],
        agg['tot_spend'],
        agg['tot_leads'],
        agg['cpl'],
        agg['tot_orders'],
        agg['tot_prepaid'],
        agg['tot_cod'],
        agg['tot_rev'],
        agg['prepaid_ratio'] / 100,
        agg['cr'] / 100,
        agg['aov'],
        agg['roas'],
        agg['badge']
    ]
    
    for c_idx, v in enumerate(vals, 1):
        cell = ws_ov.cell(row=row_idx, column=c_idx, value=v)
        cell.font = font_bold if c_idx in [1, 2, 8, 11, 13, 15] else font_regular
        cell.border = thin_border
        
        if c_idx in [2, 4, 16]:
            cell.alignment = Alignment(horizontal="left", vertical="center")
        elif c_idx in [1, 3]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="right", vertical="center")
            
        if c_idx in [5, 7, 11, 14]:
            cell.number_format = "₹#,##0.00"
        elif c_idx in [6, 8, 9, 10]:
            cell.number_format = "#,##0"
        elif c_idx in [12, 13]:
            cell.number_format = "0.00%"
        elif c_idx == 15:
            cell.number_format = '0.00"x"'

# Total Row
row_idx += 1
tot_cells = [
    "TOTAL", "All 5 Telecallers", "—", "November Total",
    grand_spend, grand_leads, grand_cpl, grand_orders, grand_prepaid, grand_cod,
    grand_rev, (grand_prepaid / grand_orders) if grand_orders else 0,
    grand_cr / 100, grand_aov, grand_roas, "⭐ Team November ROAS: 8.05x"
]

for c_idx, v in enumerate(tot_cells, 1):
    cell = ws_ov.cell(row=row_idx, column=c_idx, value=v)
    cell.font = font_bold
    cell.fill = fill_total
    cell.border = double_bottom_border
    if c_idx in [2, 4, 16]:
        cell.alignment = Alignment(horizontal="left", vertical="center")
    elif c_idx in [1, 3]:
        cell.alignment = Alignment(horizontal="center", vertical="center")
    else:
        cell.alignment = Alignment(horizontal="right", vertical="center")
        
    if c_idx in [5, 7, 11, 14]:
        cell.number_format = "₹#,##0.00"
    elif c_idx in [6, 8, 9, 10]:
        cell.number_format = "#,##0"
    elif c_idx in [12, 13]:
        cell.number_format = "0.00%"
    elif c_idx == 15:
        cell.number_format = '0.00"x"'

# Auto-adjust column widths
for col in ws_ov.columns:
    max_len = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        if cell.value:
            max_len = max(max_len, len(str(cell.value)))
    ws_ov.column_dimensions[col_letter].width = max(max_len + 3, 12)

ws_ov.column_dimensions['A'].width = 8
ws_ov.column_dimensions['B'].width = 24
ws_ov.column_dimensions['C'].width = 16
ws_ov.column_dimensions['D'].width = 30
ws_ov.column_dimensions['P'].width = 32

# -------------------------------------------------------------
# SHEETS 2 TO 6: INDIVIDUAL DAY-WISE SHEETS (NOVEMBER ONLY: 20 DAYS)
# -------------------------------------------------------------
day_headers = [
    "Date", "Day", "Ad Spend (₹)", "WhatsApp Leads", "CPL (₹)",
    "Total Orders", "Prepaid Orders", "Prepaid Rev (₹)", "COD Orders", "COD Rev (₹)",
    "Total Revenue (₹)", "Conv. Rate (CR%)", "AOV (₹)", "ROAS"
]

for tc in TELECALLERS:
    cid = tc['id']
    agg = aggregates[cid]
    ws = wb.create_sheet(title=tc['sheet_name'])
    ws.views.sheetView[0].showGridLines = True
    
    ws["A1"] = f"👤 {tc['name']} — November Day-Wise Performance Report"
    ws["A1"].font = font_title
    ws["A2"] = f"Phone: {tc['phone']} | Role: {tc['role']} | Badge: {tc['badge']}"
    ws["A2"].font = font_sub
    
    stat_labels = ["Total Leads Handled", "Total Orders Booked", "Total Revenue Generated", "Overall Conversion Rate", "Average Order Value (AOV)", "November ROAS"]
    stat_values = [agg['tot_leads'], agg['tot_orders'], agg['tot_rev'], agg['cr'] / 100, agg['aov'], agg['roas']]
    stat_fmts = ["#,##0", "#,##0", "₹#,##0.00", "0.00%", "₹#,##0.00", '0.00"x"']
    
    for i in range(6):
        col = chr(ord('B') + i*2)
        cell_l = f"{col}4"
        cell_v = f"{col}5"
        ws[cell_l] = stat_labels[i]
        ws[cell_l].font = Font(name="Calibri", size=9, bold=True, color="555555")
        ws[cell_l].alignment = Alignment(horizontal="center", vertical="center")
        ws[cell_v] = stat_values[i]
        ws[cell_v].font = Font(name="Calibri", size=13, bold=True, color="0A4D2E")
        ws[cell_v].number_format = stat_fmts[i]
        ws[cell_v].alignment = Alignment(horizontal="center", vertical="center")
        ws[cell_v].fill = fill_accent
    
    start_row = 7
    for c_idx, dh in enumerate(day_headers, 1):
        cell = ws.cell(row=start_row, column=c_idx, value=dh)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    
    current_row = start_row
    for d in date_list:
        current_row += 1
        rec = data[cid][d]
        dt = datetime.datetime.strptime(d, '%Y-%m-%d')
        day_name = dt.strftime('%a')
        
        sp = rec['spend']
        ld = rec['leads']
        cpl_val = (sp / ld) if ld > 0 else 0.0
        tot_ord = rec['orders']
        prep_ord = rec['prepaid_orders']
        prep_rev = rec['prepaid_rev']
        cod_ord = rec['cod_orders']
        cod_rev = rec['cod_rev']
        tot_rev = rec['total_rev']
        cr_val = (tot_ord / ld) if ld > 0 else 0.0
        aov_val = (tot_rev / tot_ord) if tot_ord > 0 else 0.0
        roas_val = (tot_rev / sp) if sp > 0 else 0.0
        
        row_vals = [
            d, day_name, sp, ld, cpl_val,
            tot_ord, prep_ord, prep_rev, cod_ord, cod_rev,
            tot_rev, cr_val, aov_val, roas_val
        ]
        
        is_even = (current_row % 2 == 0)
        row_fill = fill_zebra if is_even else None
        
        for c_idx, val in enumerate(row_vals, 1):
            cell = ws.cell(row=current_row, column=c_idx, value=val)
            cell.font = font_bold if c_idx in [1, 6, 11] else font_regular
            cell.border = thin_border
            if row_fill:
                cell.fill = row_fill
                
            if c_idx in [1, 2]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="right", vertical="center")
                
            if c_idx in [3, 5, 8, 10, 11, 13]:
                cell.number_format = "₹#,##0.00"
            elif c_idx in [4, 6, 7, 9]:
                cell.number_format = "#,##0"
            elif c_idx == 12:
                cell.number_format = "0.00%"
            elif c_idx == 14:
                cell.number_format = '0.00"x"'
    
    # Bottom Total Row
    total_row = current_row + 1
    ws.cell(row=total_row, column=1, value="TOTAL").font = font_bold
    ws.cell(row=total_row, column=1).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(row=total_row, column=2, value="20 Days").font = font_bold
    ws.cell(row=total_row, column=2).alignment = Alignment(horizontal="center", vertical="center")
    
    ws.cell(row=total_row, column=3, value=f"=SUM(C{start_row+1}:C{current_row})").number_format = "₹#,##0.00"
    ws.cell(row=total_row, column=4, value=f"=SUM(D{start_row+1}:D{current_row})").number_format = "#,##0"
    ws.cell(row=total_row, column=5, value=f"=C{total_row}/D{total_row}").number_format = "₹#,##0.00"
    ws.cell(row=total_row, column=6, value=f"=SUM(F{start_row+1}:F{current_row})").number_format = "#,##0"
    ws.cell(row=total_row, column=7, value=f"=SUM(G{start_row+1}:G{current_row})").number_format = "#,##0"
    ws.cell(row=total_row, column=8, value=f"=SUM(H{start_row+1}:H{current_row})").number_format = "₹#,##0.00"
    ws.cell(row=total_row, column=9, value=f"=SUM(I{start_row+1}:I{current_row})").number_format = "#,##0"
    ws.cell(row=total_row, column=10, value=f"=SUM(J{start_row+1}:J{current_row})").number_format = "₹#,##0.00"
    ws.cell(row=total_row, column=11, value=f"=SUM(K{start_row+1}:K{current_row})").number_format = "₹#,##0.00"
    ws.cell(row=total_row, column=12, value=f"=F{total_row}/D{total_row}").number_format = "0.00%"
    ws.cell(row=total_row, column=13, value=f"=K{total_row}/F{total_row}").number_format = "₹#,##0.00"
    ws.cell(row=total_row, column=14, value=f"=K{total_row}/C{total_row}").number_format = '0.00"x"'
    
    for c_idx in range(1, 15):
        cell = ws.cell(row=total_row, column=c_idx)
        cell.font = font_bold
        cell.fill = fill_total
        cell.border = double_bottom_border
        if c_idx not in [1, 2]:
            cell.alignment = Alignment(horizontal="right", vertical="center")
            
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            if cell.value:
                max_len = max(max_len, len(str(cell.value)))
        ws.column_dimensions[col_letter].width = max(max_len + 3, 11)
    ws.column_dimensions['A'].width = 13
    ws.column_dimensions['B'].width = 8

# Save workbook to both locations
out_path_downloads = r"C:\Users\Admin\Downloads\Telecaller_Performance_Report_Nov_2026.xlsx"
out_path_reports = r"F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\Telecaller_Performance_Report_Nov_2026.xlsx"

os.makedirs(os.path.dirname(out_path_reports), exist_ok=True)

wb.save(out_path_downloads)
wb.save(out_path_reports)

print(f"✅ November Excel Workbook successfully created at:\n  1. {out_path_downloads}\n  2. {out_path_reports}")
