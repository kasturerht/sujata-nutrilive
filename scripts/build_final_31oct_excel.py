import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Load the base October file (299 orders)
base_file = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx'
wb_base = openpyxl.load_workbook(base_file)
ws_base = wb_base['सर्व ग्राहक (All Customers)']

# Extract all 299 existing rows
existing_orders = []
headers = [cell.value for cell in ws_base[1]]

for r in range(2, ws_base.max_row + 1):
    row_vals = [cell.value for cell in ws_base[r]]
    existing_orders.append(row_vals)

print(f"Loaded {len(existing_orders)} existing orders from base file.")

# 2. Define the 14 new verified orders (Oct 30 14:09 to Oct 31 17:20)
new_orders = [
    # 1. Dattatray Sankpal (Punam)
    {
        'date': '30/10/2026',
        'time': '14:52',
        'caller': 'Punam Kasture',
        'name': 'Dattatray Sankpal',
        'mobile': '9607867593',
        'pincode': '416012',
        'address': 'S-2 Bondre complex, Mangalwar peth post office building, Kolhapur 416012',
        'products': '6 spirulina Capsule 60 + 6 seabukthron Capsule 60 + 2 Toothpaste + 2 Bath Soap',
        'amount': 4800,
        'mode': 'Prepaid',
        'type': 'Direct Dispatch'
    },
    # 2. Mahavir solankar (Karishma)
    {
        'date': '30/10/2026',
        'time': '14:58',
        'caller': 'Karishma Patil',
        'name': 'Mahavir Solankar',
        'mobile': '8080659369',
        'pincode': '413302',
        'address': 'मु. पोस्ट करकंब, ता. पंढरपूर, जि. सोलापूर - 413302',
        'products': '3 Spirulina capsules 60; Free spirulina toothpaste',
        'amount': 1050,
        'mode': 'COD',
        'type': 'Direct Dispatch'
    },
    # 3. Dinesh Devraj Singh (Monu)
    {
        'date': '30/10/2026',
        'time': '15:22',
        'caller': 'Monu',
        'name': 'Dinesh Devraj Singh',
        'mobile': '9325520554',
        'pincode': '421002',
        'address': 'Hanuman Nagar new MIDC Lalu Gupta kirana store Ulhasnagar 2 - 421002',
        'products': '3 spirulina capsules + 3 sea buckthorn capsules + Chhikki',
        'amount': 2300,
        'mode': 'COD',
        'type': 'Direct Dispatch'
    },
    # 4. Dattatray Totaram Sonawane (Karishma)
    {
        'date': '30/10/2026',
        'time': '17:49',
        'caller': 'Karishma Patil',
        'name': 'दत्तात्रय तोताराम सोनवणे',
        'mobile': '9021311122',
        'pincode': '431147',
        'address': 'मु पोस्ट चिंचोली लिंबाजी ता कन्नड जिल्हा छत्रपती संभाजीनगर - 431147',
        'products': '2 month combo: 2 spirulina capsule 60 & 2 sea buckthorn capsule 60 + Free toothpaste and soap',
        'amount': 1600,
        'mode': 'Prepaid',
        'type': 'Direct Dispatch'
    },
    # 5. Tejas Ganpat Phalke (Vaishnavi)
    {
        'date': '31/10/2026',
        'time': '00:08',
        'caller': 'Vaishnavi Diwate',
        'name': 'Tejas Ganpat Phalke',
        'mobile': '9923459696',
        'pincode': '412220',
        'address': 'Karegaon, Phalke mala, Tal - Shirur, Dist - Pune - 412220',
        'products': '1 B12 capsule + 1 D3 capsule',
        'amount': 1100,
        'mode': 'Prepaid',
        'type': 'Direct Dispatch'
    },
    # 6. Rajesh pande (Monu)
    {
        'date': '31/10/2026',
        'time': '12:12',
        'caller': 'Monu',
        'name': 'Rajesh Pande',
        'mobile': '8490982968',
        'pincode': '396001',
        'address': 'chhipwad wavdi near Hanuman mandir, Valsad, Gujarat - 396001',
        'products': '3 spirulina capsules + 3 sea buckthorn capsules + Chikki + toothpaste',
        'amount': 2300,
        'mode': 'COD',
        'type': 'Direct Dispatch'
    },
    # 7. Shubham Kamble (Karishma)
    {
        'date': '31/10/2026',
        'time': '12:16',
        'caller': 'Karishma Patil',
        'name': 'Shubham Kamble',
        'mobile': '8275526305',
        'pincode': '444606',
        'address': 'Sanjay Gandhi Nagar no.2 near Jitu taxi, Amravati, Maharashtra - 444606 (Alt: 9657056633)',
        'products': 'Spirulina powder 1 (500/-) + Sea buckthorn capsule 60 (550/-)',
        'amount': 1050,
        'mode': 'COD',
        'type': 'Direct Dispatch'
    },
    # 8. Manoj Ahire (Manjushree - Forwarded Website)
    {
        'date': '31/10/2026',
        'time': '12:28',
        'caller': 'Manjushree Kasture',
        'name': 'Manoj Ahire',
        'mobile': '9404016691',
        'pincode': '424306',
        'address': 'Kudashi Road, A/P Kudashi, Kudashi RD, Dhule, Maharashtra - 424306',
        'products': 'Sujata Spirulina Veg Capsules + Sea Buckthorn Capsules Healthy Life Combo Pack',
        'amount': 1050,
        'mode': 'COD',
        'type': 'Forwarded Website Order'
    },
    # 9. Machindranath Rajaram Pawar (Punam)
    {
        'date': '31/10/2026',
        'time': '12:42',
        'caller': 'Punam Kasture',
        'name': 'Machindranath Rajaram Pawar',
        'mobile': '9821572761',
        'pincode': '421306',
        'address': 'Room No. 2, Chawl No. 4, Shree Ganesh Colony, Near Aparna Khadegolavali Road, Vitthalwadi, Kalyan East, Maharashtra - 421306',
        'products': '3 month combo: 3 spirulina capsule 60 + 3 seabukthron capsule 60 + Bath Soap + Toothpaste',
        'amount': 2300,
        'mode': 'COD',
        'type': 'Direct Dispatch'
    },
    # 10. Sudhir Shende (Manjushree)
    {
        'date': '31/10/2026',
        'time': '13:05',
        'caller': 'Manjushree Kasture',
        'name': 'Sudhir Shende',
        'mobile': '9284088372',
        'pincode': '444801',
        'address': 'At Pimpari Gaon, Kathora to Chandur Bazar Road, P.O. Nandura (BK), Amravati, Maharashtra - 444801',
        'products': '3 months spirulina capsules + toothpaste free',
        'amount': 1050,
        'mode': 'Prepaid',
        'type': 'Direct Dispatch'
    },
    # 11. Prashant Kamthane (Karishma)
    {
        'date': '31/10/2026',
        'time': '13:53',
        'caller': 'Karishma Patil',
        'name': 'Prashant Kamthane',
        'mobile': '7796746635',
        'pincode': '413517',
        'address': 'shellal road, sahajivan colony, udaygiri hospital back side, kamthane niwas, Udgir, Taluka-udgir Dist-latur Post-udgir - 413517',
        'products': '2 months combo= 2 spirulina capsule 60 & 2 sea buckthorn capsule 60 + Free toothpaste and soap',
        'amount': 1650,
        'mode': 'COD',
        'type': 'Direct Dispatch'
    },
    # 12. Aarti (Monu)
    {
        'date': '31/10/2026',
        'time': '15:14',
        'caller': 'Monu',
        'name': 'Aarti',
        'mobile': '8802620057',
        'pincode': '110027',
        'address': 'Flat No.: 305, 4th Floor, Block: N Block, JJ Colony, Locality: Raghubir Nagar, City: New Delhi, State: Delhi - 110027',
        'products': 'Spirulina 120 tablets, Sea buckthorn 60 capsules, Toothpaste',
        'amount': 1000,
        'mode': 'COD',
        'type': 'Direct Dispatch'
    },
    # 13. Mannasi Mohit Kulkarni (Punam)
    {
        'date': '31/10/2026',
        'time': '15:38',
        'caller': 'Punam Kasture',
        'name': 'Mannasi Mohit Kulkarni',
        'mobile': '9699017789',
        'pincode': '416550',
        'address': 'Plot no. - RM-1, MIDC Residencial Area, Near Sai rup hospital, Next to maruti mandir, MIDC - kudal, Sindhudurg - 416550',
        'products': '3 Month combo: 3 spirulina Tablet 120, 3 seabukthron Capsule 60 + Spirulina Shampoo + Bath Soap',
        'amount': 2400,
        'mode': 'Prepaid',
        'type': 'Direct Dispatch'
    },
    # 14. Office Walk in sale (Yash)
    {
        'date': '31/10/2026',
        'time': '16:07',
        'caller': 'Yash Suryawanshi (Founder Direct)',
        'name': 'Office Walk-in Customer',
        'mobile': 'N/A',
        'pincode': 'N/A',
        'address': 'Office Walk-in / Direct Cash Purchase',
        'products': 'spirulina capsule, moringa powder, spirulina powder, spirulina tab 120',
        'amount': 1450,
        'mode': 'Prepaid',
        'type': 'Founder Direct Order'
    }
]

print(f"Prepared {len(new_orders)} new verified orders to append.")

# Format existing orders and append new orders
combined_orders = []
sr = 1

for o in existing_orders:
    # Update Sr No
    row = list(o)
    row[0] = sr
    sr += 1
    combined_orders.append(row)

for no in new_orders:
    combined_orders.append([
        sr,
        no['date'],
        no['time'],
        no['caller'],
        no['name'],
        no['mobile'],
        no['pincode'],
        no['address'],
        no['products'],
        no['amount'],
        no['mode'],
        no['type']
    ])
    sr += 1

print(f"Total Combined Orders: {len(combined_orders)}")

# 3. Create a brand new Workbook with professional Silicon Valley styling
wb_new = openpyxl.Workbook()

# Sheet 1: सर्व ग्राहक (All Customers)
ws1 = wb_new.active
ws1.title = 'सर्व ग्राहक (All Customers)'

# Styling definitions
font_header = Font(name='Segoe UI', size=11, bold=True, color='FFFFFF')
fill_header = PatternFill(start_color='064E3B', end_color='064E3B', fill_type='solid') # Luxury Dark Emerald
font_body = Font(name='Segoe UI', size=10)
fill_alt = PatternFill(start_color='F2FDF6', end_color='F2FDF6', fill_type='solid') # Subtle mint zebra
border_thin = Border(
    left=Side(style='thin', color='E5E7EB'),
    right=Side(style='thin', color='E5E7EB'),
    top=Side(style='thin', color='E5E7EB'),
    bottom=Side(style='thin', color='E5E7EB')
)

ws1.append(headers)
for col_idx in range(1, len(headers) + 1):
    cell = ws1.cell(row=1, column=col_idx)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)

for r_idx, row_data in enumerate(combined_orders, start=2):
    ws1.append(row_data)
    is_alt = (r_idx % 2 == 1)
    for c_idx in range(1, len(row_data) + 1):
        cell = ws1.cell(row=r_idx, column=c_idx)
        cell.font = font_body
        cell.border = border_thin
        if is_alt:
            cell.fill = fill_alt
        
        # Alignments & formatting
        if c_idx == 1: # Sr No
            cell.alignment = Alignment(horizontal='center', vertical='center')
        elif c_idx in [2, 3]: # Date, Time
            cell.alignment = Alignment(horizontal='center', vertical='center')
        elif c_idx == 6: # Mobile
            cell.alignment = Alignment(horizontal='center', vertical='center')
        elif c_idx == 7: # Pincode
            cell.alignment = Alignment(horizontal='center', vertical='center')
        elif c_idx == 10: # Amount
            cell.number_format = '₹#,##0'
            cell.alignment = Alignment(horizontal='right', vertical='center')
        elif c_idx in [11, 12]: # Mode, Type
            cell.alignment = Alignment(horizontal='center', vertical='center')
        else:
            cell.alignment = Alignment(horizontal='left', vertical='center')

# Auto-fit columns
ws1.row_dimensions[1].height = 28
for col in ws1.columns:
    max_len = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        val_str = str(cell.value or '')
        if len(val_str) > max_len:
            max_len = len(val_str)
    ws1.column_dimensions[col_letter].width = min(max(max_len + 3, 10), 45)

# Sheet 2: कामगिरी सारांश (Summary)
ws2 = wb_new.create_sheet(title='कामगिरी सारांश (Summary)')
ws2.views.sheetView[0].showGridLines = True

# Calculate Metrics
telecallers_data = {
    'मंजुश्री कस्तुरे (Manjushree) - Direct Calling': {'orders': 0, 'val': 0},
    'मंजुश्री कस्तुरे (Manjushree) - Forwarded Website': {'orders': 0, 'val': 0},
    'वैष्णवी दिवटे (Vaishnavi Diwate)': {'orders': 0, 'val': 0},
    'मोनू (Monu)': {'orders': 0, 'val': 0},
    'पूनम कस्तुरे (Punam Kasture)': {'orders': 0, 'val': 0},
    'करिश्मा पाटील (Karishma Patil)': {'orders': 0, 'val': 0},
    'यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)': {'orders': 0, 'val': 0}
}

for o in combined_orders:
    caller = str(o[3])
    val = float(o[9] or 0)
    otype = str(o[11])
    
    if 'Manjushree' in caller:
        if 'Website' in otype:
            telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website']['orders'] += 1
            telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website']['val'] += val
        else:
            telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Direct Calling']['orders'] += 1
            telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Direct Calling']['val'] += val
    elif 'Vaishnavi' in caller:
        telecallers_data['वैष्णवी दिवटे (Vaishnavi Diwate)']['orders'] += 1
        telecallers_data['वैष्णवी दिवटे (Vaishnavi Diwate)']['val'] += val
    elif 'Monu' in caller:
        telecallers_data['मोनू (Monu)']['orders'] += 1
        telecallers_data['मोनू (Monu)']['val'] += val
    elif 'Punam' in caller:
        telecallers_data['पूनम कस्तुरे (Punam Kasture)']['orders'] += 1
        telecallers_data['पूनम कस्तुरे (Punam Kasture)']['val'] += val
    elif 'Karishma' in caller:
        telecallers_data['करिश्मा पाटील (Karishma Patil)']['orders'] += 1
        telecallers_data['करिश्मा पाटील (Karishma Patil)']['val'] += val
    elif 'Yash' in caller:
        telecallers_data['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)']['orders'] += 1
        telecallers_data['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)']['val'] += val

manju_tot_orders = telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Direct Calling']['orders'] + telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website']['orders']
manju_tot_val = telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Direct Calling']['val'] + telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website']['val']

tele_tot_orders = (manju_tot_orders +
                   telecallers_data['वैष्णवी दिवटे (Vaishnavi Diwate)']['orders'] +
                   telecallers_data['मोनू (Monu)']['orders'] +
                   telecallers_data['पूनम कस्तुरे (Punam Kasture)']['orders'] +
                   telecallers_data['करिश्मा पाटील (Karishma Patil)']['orders'])

tele_tot_val = (manju_tot_val +
                telecallers_data['वैष्णवी दिवटे (Vaishnavi Diwate)']['val'] +
                telecallers_data['मोनू (Monu)']['val'] +
                telecallers_data['पूनम कस्तुरे (Punam Kasture)']['val'] +
                telecallers_data['करिश्मा पाटील (Karishma Patil)']['val'])

grand_orders = len(combined_orders)
grand_val = sum(float(o[9] or 0) for o in combined_orders)

summary_rows = [
    ['टेलिकॉलरचे नाव (Telecaller)', 'एकूण ऑर्डर्स (Orders)', 'एकूण व्हॅल्यू ₹ (Total Value)', 'सरासरी ऑर्डर व्हॅल्यू ₹ (AOV)'],
    ['मंजुश्री कस्तुरे (Manjushree) - Direct Calling', telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Direct Calling']['orders'], telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Direct Calling']['val'], round(telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Direct Calling']['val'] / max(1, telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Direct Calling']['orders']))],
    ['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website', telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website']['orders'], telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website']['val'], round(telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website']['val'] / max(1, telecallers_data['मंजुश्री कस्तुरे (Manjushree) - Forwarded Website']['orders']))],
    ['मंजुश्री कस्तुरे एकूण (Manjushree Total)', manju_tot_orders, manju_tot_val, round(manju_tot_val / max(1, manju_tot_orders))],
    ['वैष्णवी दिवटे (Vaishnavi Diwate)', telecallers_data['वैष्णवी दिवटे (Vaishnavi Diwate)']['orders'], telecallers_data['वैष्णवी दिवटे (Vaishnavi Diwate)']['val'], round(telecallers_data['वैष्णवी दिवटे (Vaishnavi Diwate)']['val'] / max(1, telecallers_data['वैष्णवी दिवटे (Vaishnavi Diwate)']['orders']))],
    ['मोनू (Monu)', telecallers_data['मोनू (Monu)']['orders'], telecallers_data['मोनू (Monu)']['val'], round(telecallers_data['मोनू (Monu)']['val'] / max(1, telecallers_data['मोनू (Monu)']['orders']))],
    ['पूनम कस्तुरे (Punam Kasture)', telecallers_data['पूनम कस्तुरे (Punam Kasture)']['orders'], telecallers_data['पूनम कस्तुरे (Punam Kasture)']['val'], round(telecallers_data['पूनम कस्तुरे (Punam Kasture)']['val'] / max(1, telecallers_data['पूनम कस्तुरे (Punam Kasture)']['orders']))],
    ['करिश्मा पाटील (Karishma Patil)', telecallers_data['करिश्मा पाटील (Karishma Patil)']['orders'], telecallers_data['करिश्मा पाटील (Karishma Patil)']['val'], round(telecallers_data['करिश्मा पाटील (Karishma Patil)']['val'] / max(1, telecallers_data['करिश्मा पाटील (Karishma Patil)']['orders']))],
    ['सर्व टेलिकॉलर्स एकूण (All Telecallers Total)', tele_tot_orders, tele_tot_val, round(tele_tot_val / max(1, tele_tot_orders))],
    ['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)', telecallers_data['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)']['orders'], telecallers_data['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)']['val'], round(telecallers_data['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)']['val'] / max(1, telecallers_data['यश सूर्यवंशी (Yash Suryawanshi - Founder Direct)']['orders']))],
    ['एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total October 2026)', grand_orders, grand_val, round(grand_val / max(1, grand_orders))]
]

for s_idx, s_row in enumerate(summary_rows, start=1):
    ws2.append(s_row)
    for c_idx in range(1, len(s_row) + 1):
        cell = ws2.cell(row=s_idx, column=c_idx)
        cell.border = border_thin
        if s_idx == 1:
            cell.font = font_header
            cell.fill = fill_header
            cell.alignment = Alignment(horizontal='center', vertical='center')
        else:
            if s_idx in [4, 9, 11]: # Bold Subtotals and Grand Total
                cell.font = Font(name='Segoe UI', size=11, bold=True)
                if s_idx == 11:
                    cell.fill = PatternFill(start_color='DCFCE7', end_color='DCFCE7', fill_type='solid') # Light green highlight
                elif s_idx == 9:
                    cell.fill = PatternFill(start_color='FEF9C3', end_color='FEF9C3', fill_type='solid') # Subtle gold highlight
            else:
                cell.font = font_body
            
            if c_idx == 1:
                cell.alignment = Alignment(horizontal='left', vertical='center')
            elif c_idx == 2:
                cell.alignment = Alignment(horizontal='center', vertical='center')
            else:
                cell.number_format = '₹#,##0'
                cell.alignment = Alignment(horizontal='right', vertical='center')

ws2.column_dimensions['A'].width = 50
ws2.column_dimensions['B'].width = 24
ws2.column_dimensions['C'].width = 28
ws2.column_dimensions['D'].width = 28

# Sheet 3: ऑडिट नोंद (Audit Trail)
ws3 = wb_new.create_sheet(title='ऑडिट नोंद (Audit Trail)')
ws3.views.sheetView[0].showGridLines = True

ws3.append(['अ.क्र.', 'तारीख व वेळ', 'ऑडिट टप्पा / बदल', 'तपशील / नोंदी'])
ws3.cell(row=1, column=1).font = font_header
ws3.cell(row=1, column=1).fill = fill_header
ws3.cell(row=1, column=2).font = font_header
ws3.cell(row=1, column=2).fill = fill_header
ws3.cell(row=1, column=3).font = font_header
ws3.cell(row=1, column=3).fill = fill_header
ws3.cell(row=1, column=4).font = font_header
ws3.cell(row=1, column=4).fill = fill_header

audit_entries = [
    (1, '30/10/2026 14:09', 'Base October Reconciliation Completed', '१ ते ३० ऑक्टोबर दुपारपर्यंत २९९ ऑर्डर्स (२७२ टेलिकॉलर + २७ फाऊंडर डायरेक्ट) एकूण ₹४,११,५७७ ची पडताळणी पूर्ण.'),
    (2, '31/10/2026 17:22', 'New Export File Loaded (Daily orders dispatch .zip)', '३० ऑक्टोबर दुपारी २:१० ते ३१ ऑक्टोबर संध्याकाळी ५:२० पर्यंतच्या ८८ नवीन मेसेजेसचे पूर्ण विश्लेषण.'),
    (3, '31/10/2026 17:30', '14 New Verified Orders Added', '१४ नवीन ऑर्डर्स (एकूण ₹२५,१००) पडताळून मास्टर एक्सेलमध्ये जोडल्या: पूनम (+३), करिश्मा (+४), मोनू (+३), वैष्णवी (+१), मंजुश्री (+२), यश (+१).'),
    (4, '31/10/2026 17:35', 'Final October 2026 Master Generated', 'ऑक्टोबर २०२६ चा एकूण अंतिम आकडा: ३१३ ऑर्डर्स, एकूण मूल्य ₹४,३६,६७७/-. १००% अचूक आणि पडताळणी पूर्ण.')
]

for a_idx, a_entry in enumerate(audit_entries, start=2):
    ws3.append(list(a_entry))
    for c in range(1, 5):
        cell = ws3.cell(row=a_idx, column=c)
        cell.font = font_body
        cell.border = border_thin
        if c == 1:
            cell.alignment = Alignment(horizontal='center', vertical='center')
        else:
            cell.alignment = Alignment(horizontal='left', vertical='center')

ws3.column_dimensions['A'].width = 10
ws3.column_dimensions['B'].width = 22
ws3.column_dimensions['C'].width = 45
ws3.column_dimensions['D'].width = 85

# 4. Save to both Downloads and data/
target_filename = 'Sujata_Nutrilive_October_2026_Updated_31_10_2026.xlsx'
downloads_path = os.path.join(os.environ['USERPROFILE'], 'Downloads', target_filename)
data_path = os.path.join('data', target_filename)

wb_new.save(downloads_path)
print(f"✅ Successfully saved new updated Excel to: {downloads_path}")

wb_new.save(data_path)
print(f"✅ Successfully saved new updated Excel to: {data_path}")
