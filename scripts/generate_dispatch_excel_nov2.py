# scripts/generate_dispatch_excel_nov2.py
import os
import sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')

def build_dispatch_excel():
    output_path = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_Daily_Orders_Dispatch_02_Nov_2026.xlsx'
    wb = openpyxl.Workbook()
    
    # ----------------------------------------------------
    # STYLES DEFINITION
    # ----------------------------------------------------
    font_family = "Calibri"
    
    # Colors
    c_brand_green = "166534"     # Sujata Emerald Green
    c_brand_light = "ECFDF5"     # Soft green tint
    c_header_text = "FFFFFF"
    c_cod_bg = "FEF3C7"          # Amber tint for COD
    c_cod_text = "92400E"
    c_prepaid_bg = "DCFCE7"      # Green tint for Prepaid
    c_prepaid_text = "166534"
    c_border = "D1D5DB"
    c_zebra = "F9FAFB"
    
    # Fonts
    f_title = Font(name=font_family, size=15, bold=True, color=c_header_text)
    f_subtitle = Font(name=font_family, size=10, italic=True, color="E2E8F0")
    f_header = Font(name=font_family, size=11, bold=True, color=c_header_text)
    f_data = Font(name=font_family, size=10, bold=False, color="1F2937")
    f_data_bold = Font(name=font_family, size=10, bold=True, color="111827")
    f_prepaid = Font(name=font_family, size=10, bold=True, color=c_prepaid_text)
    f_cod = Font(name=font_family, size=10, bold=True, color=c_cod_text)
    f_total = Font(name=font_family, size=11, bold=True, color="111827")
    
    # Fills
    fill_brand = PatternFill(start_color=c_brand_green, end_color=c_brand_green, fill_type="solid")
    fill_zebra = PatternFill(start_color=c_zebra, end_color=c_zebra, fill_type="solid")
    fill_white = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    fill_prepaid = PatternFill(start_color=c_prepaid_bg, end_color=c_prepaid_bg, fill_type="solid")
    fill_cod = PatternFill(start_color=c_cod_bg, end_color=c_cod_bg, fill_type="solid")
    fill_total = PatternFill(start_color="F3F4F6", end_color="F3F4F6", fill_type="solid")
    fill_post_header = PatternFill(start_color="B91C1C", end_color="B91C1C", fill_type="solid") # Post Red
    
    # Borders
    thin_border = Side(style='thin', color=c_border)
    border_all = Border(left=thin_border, right=thin_border, top=thin_border, bottom=thin_border)
    border_total = Border(
        left=thin_border, right=thin_border, 
        top=Side(style='thin', color="9CA3AF"), 
        bottom=Side(style='double', color="111827")
    )
    
    # Alignments
    align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
    align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)
    align_right = Alignment(horizontal="right", vertical="center")
    
    # ====================================================
    # SHEET 1: दैनिक डिस्पॅच (Daily Dispatch - 02 Nov 2026)
    # ====================================================
    ws1 = wb.active
    ws1.title = "दैनिक डिस्पॅच (Daily Dispatch)"
    ws1.views.sheetView[0].showGridLines = True
    
    # Title Banner
    ws1.merge_cells("A1:N1")
    ws1["A1"] = "🌿 SUJATA NUTRILIVE AGROTECH — DAILY ORDERS DISPATCH SHEET"
    ws1["A1"].font = f_title
    ws1["A1"].fill = fill_brand
    ws1["A1"].alignment = align_center
    ws1.row_dimensions[1].height = 34
    
    ws1.merge_cells("A2:N2")
    ws1["A2"] = "तारीख: ०२ नोव्हेंबर २०२६ (Daily orders dispatch 2) | अधिकृत डिस्पॅच मास्टर रेकॉर्ड (नाशिक वेअरहाऊस)"
    ws1["A2"].font = f_subtitle
    ws1["A2"].fill = fill_brand
    ws1["A2"].alignment = align_center
    ws1.row_dimensions[2].height = 20
    
    headers_ws1 = [
        "अ.क्र. (Sr)", "तारीख (Date)", "वेळ (Time)", "बुकिंग कॉलर (Telecaller)", 
        "ग्राहकाचे नाव (Customer Name)", "मोबाईल नंबर (Mobile)", "पिनकोड (Pincode)", 
        "जिल्हा / राज्य (Location)", "संपूर्ण पत्ता (Full Address)", "मागवलेले प्रॉडक्ट्स (Products Ordered)", 
        "रक्कम ₹ (Amount)", "पेमेंट मोड (Payment)", "डिलिव्हरी पार्टनर (Courier / Service)", "ऑर्डर प्रकार (Order Type)"
    ]
    
    ws1.append([]) # row 3 blank
    ws1.row_dimensions[3].height = 8
    
    # Row 4: Headers
    ws1.append(headers_ws1)
    ws1.row_dimensions[4].height = 28
    for col_idx in range(1, len(headers_ws1) + 1):
        cell = ws1.cell(row=4, column=col_idx)
        cell.font = f_header
        cell.fill = fill_brand
        cell.alignment = align_center
        cell.border = border_all
        
    # The 7 Orders
    orders_data = [
        {
            "sr": 1,
            "date": "02/11/2026",
            "time": "10:54 AM",
            "caller": "Manjushree Kasture (Website)",
            "name": "Aloke Bhakat",
            "mobile": "9932867909",
            "pincode": "712410",
            "location": "Tarakeswar, Hooghly (WB)",
            "address": "Gouribati, Near BDO Office, Tarakeswar, West Bengal - 712410",
            "products": "Sujata Spirulina Veg Capsules + Sea Buckthorn Capsules Healthy Life Combo Pack (1-Month Pack) × 1",
            "amount": 945,
            "mode": "Prepaid",
            "courier": "Speed Post / Express Courier",
            "type": "Website Order (Forwarded #1036)"
        },
        {
            "sr": 2,
            "date": "02/11/2026",
            "time": "12:51 PM",
            "caller": "Monu",
            "name": "Dilip Pawar",
            "mobile": "9730766205",
            "pincode": "415412",
            "location": "Walawa, Sangli (MH)",
            "address": "At Post Chikurde, Taluka Walawa, District Sangli, Maharashtra - 415412",
            "products": "Sujata Pure Organic Spirulina Powder (100g) × 1",
            "amount": 400,
            "mode": "COD",
            "courier": "Speed Post",
            "type": "Direct Dispatch"
        },
        {
            "sr": 3,
            "date": "02/11/2026",
            "time": "01:18 PM",
            "caller": "Vaishnavi Diwate",
            "name": "Vijay Ramdas Salunke",
            "mobile": "9850110429",
            "pincode": "413206",
            "location": "Karmala, Solapur (MH)",
            "address": "Washimbe, Sharad Chandraji Pawar Vidyalaya, Washimbe, Taluka Karmala, District Solapur, Maharashtra - 413206",
            "products": "1 Vitamin D3+K2 Capsule (90) + 1 Vitamin B12 Capsule (90)",
            "amount": 1200,
            "mode": "Prepaid",
            "courier": "Speed Post",
            "type": "Direct Dispatch"
        },
        {
            "sr": 4,
            "date": "02/11/2026",
            "time": "01:46 PM",
            "caller": "Manjushree Kasture",
            "name": "Sheikh Salim Khalil",
            "mobile": "9881391691",
            "pincode": "431131",
            "location": "Majalgaon, Beed (MH)",
            "address": "Bypass Road, Behind Pandurang Furniture, Near Yakub Masjid, 1 Row House, Majalgaon, Taluka Majalgaon, District Beed, Maharashtra – 431131",
            "products": "2 Months Combo (Spirulina Capsules 60 × 2 + Sea Buckthorn Capsules 60 × 2 + Moringa Capsules 60 + Free Toothpaste)",
            "amount": 1550,
            "mode": "COD",
            "courier": "Speed Post / India Post",
            "type": "Direct Dispatch"
        },
        {
            "sr": 5,
            "date": "02/11/2026",
            "time": "02:01 PM",
            "caller": "Manjushree Kasture",
            "name": "Khajakhan Khan",
            "mobile": "9948860604",
            "pincode": "502285",
            "location": "Sangareddy (Telangana)",
            "address": "House No. 4-37, Kandi Kabeer Residency, Kandi, District Sangareddy, Telangana – 502285",
            "products": "Sujata Spirulina Veg Capsules (60) + Sea Buckthorn Capsules (60) Healthy Life Combo Pack × 1",
            "amount": 1050,
            "mode": "COD",
            "courier": "Speed Post / Delhivery",
            "type": "Direct Dispatch"
        },
        {
            "sr": 6,
            "date": "02/11/2026",
            "time": "02:34 PM",
            "caller": "Yash R. Suryawanshi (Admin)",
            "name": "Rajendra Sukadeo Nikam",
            "mobile": "8956051949",
            "pincode": "422101",
            "location": "Nashik (MH)",
            "address": "Flat no 07, 4th Floor, Saipooja Apartment, Mahalaxmi Nagar, Dasak, Nashik, Maharashtra – 422101",
            "products": "Sujata Spirulina Veg Capsules (60) × 3 Bottles",
            "amount": 720,
            "mode": "Prepaid",
            "courier": "Shadowfax (Direct Courier)",
            "type": "Direct Dispatch"
        },
        {
            "sr": 7,
            "date": "02/11/2026",
            "time": "02:55 PM",
            "caller": "Karishma Patil",
            "name": "Rajendra Kadu Sawant",
            "mobile": "8459146212",
            "pincode": "424001",
            "location": "Dhule / Nashik Office",
            "address": "Visited Sujata Nutrilive Corporate Office from Dhule, Maharashtra (Self-Pickup)",
            "products": "2 Spirulina Capsules (60) + 2 Sea Buckthorn Capsules (60) + Free Facepack",
            "amount": 1500,
            "mode": "Cash (Prepaid)",
            "courier": "Office Handover (Do Not Pack / Tick Only)",
            "type": "Office Order (Self-Pickup)"
        }
    ]
    
    start_row = 5
    for idx, o in enumerate(orders_data):
        current_row = start_row + idx
        row_vals = [
            o["sr"], o["date"], o["time"], o["caller"],
            o["name"], o["mobile"], o["pincode"],
            o["location"], o["address"], o["products"],
            o["amount"], o["mode"], o["courier"], o["type"]
        ]
        ws1.append(row_vals)
        ws1.row_dimensions[current_row].height = 26
        
        # Format cells
        fill_row = fill_zebra if idx % 2 == 1 else fill_white
        for c_idx in range(1, len(row_vals) + 1):
            cell = ws1.cell(row=current_row, column=c_idx)
            cell.border = border_all
            cell.fill = fill_row
            
            # Alignments & custom fonts
            if c_idx in [1, 2, 3, 6, 7]: # Sr, Date, Time, Mobile, Pin
                cell.alignment = align_center
                cell.font = f_data
            elif c_idx in [4, 5, 8, 9, 10, 13, 14]:
                cell.alignment = align_left
                cell.font = f_data_bold if c_idx == 5 else f_data
            elif c_idx == 11: # Amount
                cell.alignment = align_right
                cell.font = f_data_bold
                cell.number_format = '₹#,##0'
            elif c_idx == 12: # Mode
                cell.alignment = align_center
                if "Prepaid" in o["mode"] or "Cash" in o["mode"]:
                    cell.fill = fill_prepaid
                    cell.font = f_prepaid
                else:
                    cell.fill = fill_cod
                    cell.font = f_cod
                    
    # Total Row
    tot_row = start_row + len(orders_data)
    ws1.cell(row=tot_row, column=1, value="")
    ws1.cell(row=tot_row, column=2, value="")
    ws1.cell(row=tot_row, column=3, value="")
    ws1.cell(row=tot_row, column=4, value="")
    ws1.cell(row=tot_row, column=5, value="एकूण (TOTAL): 7 ऑर्डर्स")
    ws1.cell(row=tot_row, column=6, value="")
    ws1.cell(row=tot_row, column=7, value="")
    ws1.cell(row=tot_row, column=8, value="")
    ws1.cell(row=tot_row, column=9, value="")
    ws1.cell(row=tot_row, column=10, value="")
    ws1.cell(row=tot_row, column=11, value=f"=SUM(K{start_row}:K{tot_row-1})")
    ws1.cell(row=tot_row, column=12, value="")
    ws1.cell(row=tot_row, column=13, value="")
    ws1.cell(row=tot_row, column=14, value="")
    
    ws1.row_dimensions[tot_row].height = 28
    for c_idx in range(1, 15):
        cell = ws1.cell(row=tot_row, column=c_idx)
        cell.font = f_total
        cell.fill = fill_total
        cell.border = border_total
        if c_idx == 5:
            cell.alignment = align_left
        elif c_idx == 11:
            cell.alignment = align_right
            cell.number_format = '₹#,##0'
            
    # Set Column Widths for Sheet 1
    col_widths_ws1 = {
        'A': 8,   # Sr No
        'B': 13,  # Date
        'C': 12,  # Time
        'D': 25,  # Telecaller
        'E': 26,  # Customer Name
        'F': 16,  # Mobile
        'G': 12,  # Pincode
        'H': 24,  # Location
        'I': 48,  # Full Address
        'J': 45,  # Products
        'K': 15,  # Amount
        'L': 14,  # Payment Mode
        'H': 24,  # Location
        'M': 26,  # Courier
        'N': 26   # Order Type
    }
    for col, width in col_widths_ws1.items():
        ws1.column_dimensions[col].width = width

    # ====================================================
    # SHEET 2: INDIA POST SPEED POST BULK UPLOAD (पोस्टल फॉरमॅट)
    # ====================================================
    ws2 = wb.create_sheet(title="India Post Bulk Upload")
    ws2.views.sheetView[0].showGridLines = True
    
    post_headers = [
        "SERIAL NUMBER", "BARCODE NO", "PHYSICAL WEIGHT", "SHAPE OF ARTICLE", 
        "LENGTH", "BREADTH/DIAMETER", "HEIGHT", "PRIORITY FLAG", "DELIVERY INSTRUCTION", 
        "INSTRUCTION RTS", "SENDER NAME", "SENDER COMPANY", "SENDER ADD LINE 1", 
        "SENDER ADD LINE 2", "SENDER CITY", "SENDER STATE", "SENDER PINCODE", 
        "RECEIVER NAME", "RECEIVER COMPANY", "RECEIVER ADD LINE 1", "RECEIVER ADD LINE 2", 
        "RECEIVER CITY", "RECEIVER STATE", "RECEIVER PINCODE", "RECEIVER MOBILE NO", 
        "CODR/COD", "VALUE FOR CODR/COD", "DROP OFF PINCODE", "SENDER MOBILE NO"
    ]
    
    ws2.append(post_headers)
    ws2.row_dimensions[1].height = 26
    for c_idx in range(1, len(post_headers) + 1):
        cell = ws2.cell(row=1, column=c_idx)
        cell.font = Font(name=font_family, size=9, bold=True, color="FFFFFF")
        cell.fill = fill_post_header
        cell.alignment = align_center
        cell.border = border_all
        
    # Filter for postal orders (Exclude Office Order which is self-pickup and Shadowfax which is private courier)
    post_orders = [
        # 1. Aloke Bhakat
        {
            "name": "Aloke Bhakat", "add1": "Gouribati, Near bdo office", "add2": "Tarakeswar, Hooghly", 
            "city": "Tarakeswar", "state": "WEST BENGAL", "pin": 712410, "mob": "9932867909", "cod": None, "val": None, "weight": 220
        },
        # 2. Dilip Pawar
        {
            "name": "Dilip Pawar", "add1": "At po chikurde, Taluka Walawa", "add2": "District sangli", 
            "city": "Walawa", "state": "MAHARASHTRA", "pin": 415412, "mob": "9730766205", "cod": "COD", "val": 400, "weight": 180
        },
        # 3. Vijay Ramdas Salunke
        {
            "name": "Vijay Ramdas Salunke", "add1": "Washimbe, Sharad Chandraji Pawar vidyalaya", "add2": "Tal - karmala, Dist - Solapur", 
            "city": "Karmala", "state": "MAHARASHTRA", "pin": 413206, "mob": "9850110429", "cod": None, "val": None, "weight": 210
        },
        # 4. Sheikh Salim Khalil
        {
            "name": "Sheikh Salim Khalil", "add1": "Bypass Road, Behind Pandurang Furniture,", "add2": "Near Yakub Masjid, 1 Row House, Majalgaon", 
            "city": "Majalgaon", "state": "MAHARASHTRA", "pin": 431131, "mob": "9881391691", "cod": "COD", "val": 1550, "weight": 350
        },
        # 5. Khajakhan Khan
        {
            "name": "Khajakhan Khan", "add1": "House No. 4-37, Kandi Kabeer Residency,", "add2": "Kandi, District Sangareddy", 
            "city": "Sangareddy", "state": "TELANGANA", "pin": 502285, "mob": "9948860604", "cod": "COD", "val": 1050, "weight": 220
        }
    ]
    
    for idx, p in enumerate(post_orders):
        p_row = [
            idx + 1, "", p["weight"], "NROL", 15, 15, 12, True, "ND", "RTS",
            "SUJATA NUTRILIVE", "SUJATA NUTRILIVE AGROTECH", "NASHIK", "NASHIK", "NASHIK", "MAHARASHTRA", 422007,
            p["name"], "", p["add1"], p["add2"], p["city"], p["state"], p["pin"], p["mob"],
            p["cod"] if p["cod"] else "", p["val"] if p["val"] else "", 422007, 9834783503
        ]
        ws2.append(p_row)
        ws2.row_dimensions[idx + 2].height = 22
        for c_idx in range(1, len(p_row) + 1):
            cell = ws2.cell(row=idx + 2, column=c_idx)
            cell.font = Font(name=font_family, size=9)
            cell.border = border_all
            cell.alignment = align_center if c_idx in [1, 3, 4, 8, 9, 10, 17, 24, 25, 26, 28, 29] else align_left
            if c_idx == 27 and p["val"]:
                cell.number_format = '₹#,##0'
                cell.alignment = align_right
                
    for col_letter in [get_column_letter(i) for i in range(1, len(post_headers) + 1)]:
        ws2.column_dimensions[col_letter].width = 16
    ws2.column_dimensions['R'].width = 24 # Receiver Name
    ws2.column_dimensions['T'].width = 30 # Add line 1
    ws2.column_dimensions['U'].width = 30 # Add line 2

    # ====================================================
    # SHEET 3: कामगिरी सारांश व तपशील (Summary & Reconciliation)
    # ====================================================
    ws3 = wb.create_sheet(title="कामगिरी सारांश (Summary)")
    ws3.views.sheetView[0].showGridLines = True
    
    ws3.merge_cells("A1:E1")
    ws3["A1"] = "📊 SUJATA NUTRILIVE — ०२ नोव्हेंबर २०२६ डिस्पॅच ऑडिट व कामगिरी सारांश"
    ws3["A1"].font = f_title
    ws3["A1"].fill = fill_brand
    ws3["A1"].alignment = align_center
    ws3.row_dimensions[1].height = 32
    
    # Table 1: Caller Summary
    ws3.cell(row=3, column=1, value="१. कॉलरनुसार ऑर्डर्स व व्हॅल्यू (Caller Performance)").font = Font(name=font_family, size=11, bold=True, color=c_brand_green)
    headers_callers = ["कॉलरचे नाव (Caller)", "एकूण ऑर्डर्स (Orders)", "प्रीपेड रक्कम ₹ (Prepaid)", "सीओडी रक्कम ₹ (COD)", "एकूण रक्कम ₹ (Total Amount)"]
    ws3.append([]) # row 4 blank
    ws3.append(headers_callers)
    ws3.row_dimensions[5].height = 24
    for c_idx in range(1, 6):
        cell = ws3.cell(row=5, column=c_idx)
        cell.font = f_header
        cell.fill = fill_brand
        cell.alignment = align_center
        cell.border = border_all
        
    caller_stats = [
        ["Manjushree Kasture (२ Direct + १ Website)", 3, 945, 2600, 3545],
        ["Vaishnavi Diwate", 1, 1200, 0, 1200],
        ["Karishma Patil (Office Direct Order)", 1, 1500, 0, 1500],
        ["Yash R. Suryawanshi (Admin Direct)", 1, 720, 0, 720],
        ["Monu", 1, 0, 400, 400]
    ]
    
    for r_idx, cstat in enumerate(caller_stats):
        row_num = 6 + r_idx
        ws3.append(cstat)
        ws3.row_dimensions[row_num].height = 22
        for c_idx in range(1, 6):
            cell = ws3.cell(row=row_num, column=c_idx)
            cell.border = border_all
            cell.font = f_data
            if c_idx == 1:
                cell.alignment = align_left
            elif c_idx == 2:
                cell.alignment = align_center
            else:
                cell.alignment = align_right
                cell.number_format = '₹#,##0'
                
    # Total row for callers
    tot_caller_row = 6 + len(caller_stats)
    ws3.cell(row=tot_caller_row, column=1, value="एकूण (TOTAL)").font = f_total
    ws3.cell(row=tot_caller_row, column=2, value="=SUM(B6:B10)").font = f_total
    ws3.cell(row=tot_caller_row, column=3, value="=SUM(C6:C10)").font = f_total
    ws3.cell(row=tot_caller_row, column=4, value="=SUM(D6:D10)").font = f_total
    ws3.cell(row=tot_caller_row, column=5, value="=SUM(E6:E10)").font = f_total
    ws3.row_dimensions[tot_caller_row].height = 26
    for c_idx in range(1, 6):
        cell = ws3.cell(row=tot_caller_row, column=c_idx)
        cell.fill = fill_total
        cell.border = border_total
        if c_idx == 1:
            cell.alignment = align_left
        elif c_idx == 2:
            cell.alignment = align_center
        else:
            cell.alignment = align_right
            cell.number_format = '₹#,##0'
            
    # Table 2: Payment Mode Breakdown
    ws3.cell(row=13, column=1, value="२. पेमेंट मोड विश्लेषण (Payment Mode Breakdown)").font = Font(name=font_family, size=11, bold=True, color=c_brand_green)
    headers_pay = ["पेमेंट प्रकार (Payment Mode)", "ऑर्डर्स संख्या (Orders)", "एकूण महसूल ₹ (Revenue)", "टक्केवारी (Share %)"]
    ws3.cell(row=14, column=1, value="")
    ws3.append(headers_pay)
    ws3.row_dimensions[15].height = 24
    for c_idx in range(1, 5):
        cell = ws3.cell(row=15, column=c_idx)
        cell.font = f_header
        cell.fill = fill_brand
        cell.alignment = align_center
        cell.border = border_all
        
    pay_data = [
        ["Prepaid / Online (Website + WhatsApp)", 3, 2865, "38.9%"],
        ["Cash Paid (Office Handover)", 1, 1500, "20.4%"],
        ["Cash on Delivery (COD)", 3, 3000, "40.7%"]
    ]
    
    for r_idx, pstat in enumerate(pay_data):
        row_num = 16 + r_idx
        ws3.append(pstat)
        ws3.row_dimensions[row_num].height = 22
        for c_idx in range(1, 5):
            cell = ws3.cell(row=row_num, column=c_idx)
            cell.border = border_all
            cell.font = f_data
            if c_idx == 1:
                cell.alignment = align_left
            elif c_idx in [2, 4]:
                cell.alignment = align_center
            else:
                cell.alignment = align_right
                cell.number_format = '₹#,##0'
                
    tot_pay_row = 16 + len(pay_data)
    ws3.cell(row=tot_pay_row, column=1, value="एकूण (TOTAL)").font = f_total
    ws3.cell(row=tot_pay_row, column=2, value="=SUM(B16:B18)").font = f_total
    ws3.cell(row=tot_pay_row, column=3, value="=SUM(C16:C18)").font = f_total
    ws3.cell(row=tot_pay_row, column=4, value="100.0%").font = f_total
    ws3.row_dimensions[tot_pay_row].height = 26
    for c_idx in range(1, 5):
        cell = ws3.cell(row=tot_pay_row, column=c_idx)
        cell.fill = fill_total
        cell.border = border_total
        if c_idx == 1:
            cell.alignment = align_left
        elif c_idx in [2, 4]:
            cell.alignment = align_center
        else:
            cell.alignment = align_right
            cell.number_format = '₹#,##0'
            
    # Set widths for ws3
    ws3.column_dimensions['A'].width = 38
    ws3.column_dimensions['B'].width = 24
    ws3.column_dimensions['C'].width = 24
    ws3.column_dimensions['D'].width = 24
    ws3.column_dimensions['E'].width = 26
    
    # Save Workbook
    wb.save(output_path)
    print(f"✅ Excel generated successfully at: {output_path}")

if __name__ == "__main__":
    build_dispatch_excel()
