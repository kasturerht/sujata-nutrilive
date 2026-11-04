import os
import sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import pymysql
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

TIDB_HOST = 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'
TIDB_PORT = 4000
TIDB_USER = '3FeKz4HehHXuLCf.root'
TIDB_PASSWORD = 'SujataNutriLive2026!Db'
DB_NAME = 'sujata_nutrilive'

DOWNLOADS_DIR = r'C:\Users\Admin\Downloads'
REPORTS_DIR = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\calling_sheets_by_caller'

os.makedirs(DOWNLOADS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

def main():
    print("=" * 75)
    print("🚀 GENERATING SEPARATE CALLING EXCEL FILES FOR EACH TELECALLER")
    print("=" * 75)

    conn = pymysql.connect(
        host=TIDB_HOST,
        port=TIDB_PORT,
        user=TIDB_USER,
        password=TIDB_PASSWORD,
        database=DB_NAME,
        ssl={'ssl': {}},
        autocommit=True
    )

    with conn.cursor() as cur:
        cur.execute("""
        SELECT 
            o.order_id, o.order_date, o.customer_name, o.customer_phone, 
            o.caller_name, o.products_ordered, o.amount, o.pincode, o.full_address,
            DATEDIFF(CURDATE(), o.order_date) as days_ago,
            c.total_orders, c.last_order_date
        FROM orders o
        JOIN customers c ON o.customer_phone = c.phone
        WHERE o.order_date BETWEEN '2026-10-01' AND '2026-10-15'
          AND o.customer_phone NOT LIKE 'SURR_%'
        ORDER BY o.order_date ASC, o.caller_name ASC;
        """)
        raw_rows = cur.fetchall()

    conn.close()

    # De-duplicate by phone
    seen_phones = {}
    all_clients = []

    for r in raw_rows:
        phone = r[3]
        if phone in seen_phones:
            continue
        seen_phones[phone] = True

        last_date_str = str(r[11])
        orig_date_str = str(r[1])
        days_ago = r[9]

        status = "🔴 कॉल करा (बाटली संपली - आजच कॉल करा)"
        if last_date_str > '2026-10-15':
            status = f"🟢 आधीच री-ऑर्डर झाली आहे ({last_date_str})"
        elif orig_date_str > '2026-10-12':
            status = "🟡 पुढील ३-४ दिवसांत संपणार (Advance Call)"

        all_clients.append({
            'order_id': r[0],
            'order_date': orig_date_str,
            'name': r[2],
            'phone': r[3],
            'caller': r[4],
            'product': r[5],
            'amount': float(r[6]),
            'pincode': r[7],
            'address': r[8],
            'days_ago': days_ago,
            'total_orders': r[10],
            'last_order_date': last_date_str,
            'call_status': status
        })

    by_caller = defaultdict(list)
    for c in all_clients:
        by_caller[c['caller']].append(c)

    # Caller configs: (Key in DB, Display Name Marathi, Clean Filename Slug)
    callers_config = [
        ("Manjushree Kasture", "मंजुश्री कस्तुरे", "Manjushree"),
        ("Vaishnavi Diwate", "वैष्णवी दिवटे", "Vaishnavi"),
        ("Monu", "मोनू", "Monu"),
        ("Punam Kasture", "पूनम कस्तुरे", "Punam"),
        ("Yash Suryawanshi (Founder Direct)", "यश सूर्यवंशी (फाउंडर)", "Yash")
    ]

    f_family = "Segoe UI"
    HEADER_FILL = PatternFill(start_color="166534", end_color="166534", fill_type='solid') # Emerald Green
    ZEBRA_FILL = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type='solid')
    WHITE_FILL = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type='solid')
    ALERT_FILL = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type='solid') # Soft red
    WARN_FILL = PatternFill(start_color="FEF9C3", end_color="FEF9C3", fill_type='solid')   # Soft yellow
    SUCCESS_FILL = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type='solid') # Soft green

    BORDER_SIDE = Side(style='thin', color='CBD5E1')
    THIN_BORDER = Border(left=BORDER_SIDE, right=BORDER_SIDE, top=BORDER_SIDE, bottom=BORDER_SIDE)

    font_title = Font(name=f_family, size=14, bold=True, color="FFFFFF")
    font_subtitle = Font(name=f_family, size=10, italic=True, color="E2E8F0")
    font_header = Font(name=f_family, size=10, bold=True, color="FFFFFF")
    font_data = Font(name=f_family, size=10, color="1F2937")
    font_bold = Font(name=f_family, size=10, bold=True, color="111827")
    font_phone = Font(name=f_family, size=11, bold=True, color="0D9488")
    font_days = Font(name=f_family, size=10, bold=True, color="DC2626")

    headers = [
        "अ.क्र.", "ग्राहकाचे नाव", "मोबाईल नंबर (Call)", "ऑर्डर तारीख", "गेलेले दिवस",
        "आधी काय घेतले होते?", "मागील रक्कम ₹", "गाव / शहर व पत्ता", 
        "सिस्टीम स्टेटस (Re-order Status)", "कॉलर फीडबॅक (Feedback)", "नवीन बुकिंग नोंद"
    ]

    col_widths = {
        1: 8,   # अ.क्र.
        2: 24,  # नाव
        3: 16,  # फोन
        4: 13,  # तारीख
        5: 14,  # दिवस
        6: 34,  # प्रॉडक्ट
        7: 15,  # रक्कम
        8: 36,  # पत्ता
        9: 38,  # स्टेटस
        10: 25, # फीडबॅक
        11: 25  # नवीन बुकिंग
    }

    generated_files = []

    for caller_key, marathi_name, slug in callers_config:
        rows = by_caller.get(caller_key, [])
        if not rows:
            print(f"Skipping {caller_key} - no clients found.")
            continue

        due_count = len([x for x in rows if 'बाटली संपली' in x['call_status']])
        adv_count = len([x for x in rows if 'Advance Call' in x['call_status']])
        reordered_count = len([x for x in rows if 'आधीच री-ऑर्डर' in x['call_status']])

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = marathi_name
        ws.views.sheetView[0].showGridLines = True

        # Header Banner
        ws.merge_cells("A1:K1")
        ws["A1"] = f"🌿 सुजाता न्यूट्रिलाईव्ह — ३०-दिवस री-ऑर्डर कॉलिंग शीट ({marathi_name.upper()})"
        ws["A1"].font = font_title
        ws["A1"].fill = HEADER_FILL
        ws["A1"].alignment = Alignment(horizontal='center', vertical='center')
        ws.row_dimensions[1].height = 32

        ws.merge_cells("A2:K2")
        ws["A2"] = f"एकूण {len(rows)} ग्राहक | 🔴 {due_count} बाटली संपली (आजच कॉल करा) | 🟡 {adv_count} ३-४ दिवसांत संपणार (Advance) | 🟢 {reordered_count} आधीच री-ऑर्डर केली (थँक यू बोला)"
        ws["A2"].font = font_subtitle
        ws["A2"].fill = HEADER_FILL
        ws["A2"].alignment = Alignment(horizontal='center', vertical='center')
        ws.row_dimensions[2].height = 20

        # Row 3 blank
        ws.append([])
        ws.row_dimensions[3].height = 6

        # Row 4: Column Headers
        ws.append(headers)
        ws.row_dimensions[4].height = 26
        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=4, column=col_idx)
            cell.font = font_header
            cell.fill = HEADER_FILL
            cell.alignment = Alignment(horizontal='center', vertical='center')
            cell.border = THIN_BORDER

        # Data Rows
        for idx, r in enumerate(rows, 1):
            row_num = idx + 4
            city_hint = r['address'][:60] if r['address'] else f"Pincode: {r['pincode']}"

            row_vals = [
                idx,
                r['name'],
                r['phone'],
                r['order_date'],
                f"{r['days_ago']} दिवस",
                r['product'],
                r['amount'],
                city_hint,
                r['call_status'],
                "", # Blank for caller feedback
                ""  # Blank for new booking
            ]
            ws.append(row_vals)
            ws.row_dimensions[row_num].height = 24

            is_already = 'आधीच री-ऑर्डर' in r['call_status']
            is_due = 'बाटली संपली' in r['call_status']
            is_adv = 'Advance Call' in r['call_status']

            if is_already:
                fill = SUCCESS_FILL
            elif is_due:
                fill = ALERT_FILL
            elif is_adv:
                fill = WARN_FILL
            else:
                fill = ZEBRA_FILL if idx % 2 == 0 else WHITE_FILL

            for c_idx in range(1, len(row_vals) + 1):
                c = ws.cell(row=row_num, column=c_idx)
                c.fill = fill
                c.border = THIN_BORDER
                if c_idx == 1:
                    c.font = font_bold
                    c.alignment = Alignment(horizontal='center', vertical='center')
                elif c_idx == 2:
                    c.font = font_bold
                    c.alignment = Alignment(horizontal='left', vertical='center')
                elif c_idx == 3:
                    c.font = font_phone
                    c.alignment = Alignment(horizontal='center', vertical='center')
                elif c_idx in [4, 5]:
                    c.font = font_days if c_idx == 5 else font_data
                    c.alignment = Alignment(horizontal='center', vertical='center')
                elif c_idx == 7:
                    c.font = font_bold
                    c.alignment = Alignment(horizontal='right', vertical='center')
                    c.number_format = '₹#,##0'
                elif c_idx == 9:
                    c.font = font_bold if (is_due or is_already) else font_data
                    c.alignment = Alignment(horizontal='left', vertical='center')
                else:
                    c.font = font_data
                    c.alignment = Alignment(horizontal='left', vertical='center')

        # Set Column Widths
        for col_idx, width in col_widths.items():
            ws.column_dimensions[get_column_letter(col_idx)].width = width

        # Filenames
        filename = f"Sujata_Calling_Sheet_{slug}.xlsx"
        path_downloads = os.path.join(DOWNLOADS_DIR, filename)
        path_reports = os.path.join(REPORTS_DIR, filename)

        wb.save(path_downloads)
        wb.save(path_reports)
        generated_files.append((marathi_name, len(rows), due_count, adv_count, reordered_count, path_downloads))
        print(f"✅ Generated: {filename} ({len(rows)} clients)")

    print("=" * 75)
    print("🎉 ALL 5 SEPARATE WORKBOOKS SUCCESSFULLY CREATED!")
    print("=" * 75)
    for g in generated_files:
        print(f"  • {g[0]:<20}: {g[1]:>2} ग्राहक (🔴 {g[2]} Due, 🟡 {g[3]} Adv, 🟢 {g[4]} Reordered) -> {g[5]}")

if __name__ == '__main__':
    main()
