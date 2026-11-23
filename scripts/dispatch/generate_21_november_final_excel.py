"""
=============================================================================
🌿 SUJATA NUTRILIVE — OFFICIAL INDIA POST & DISPATCH EXCEL (21 NOV 2026)
=============================================================================
Author: Antigravity AI Engineering
Source Data: Daily orders dispatch  (9).zip (WhatsApp Chat: 20 Nov afternoon to 21 Nov morning)
Output Format: Exact India Post BNPL Template:
  - ArticleDetails (48 standard columns for India Post Speed Post)
  - PickupAddress (Untouched original template)
  - AltAddress (Untouched original template)
  - Information (Untouched original template)
  - Amazon_Orders (Separate sheet for Amazon EasyShip tracking)

Destinations:
  1. C:\\Users\\Admin\\Downloads\\SUJATA_21_November_final.xlsx
  2. F:\\RK\\Sujata Nutrilive\\dispatch_excel\\SUJATA_21_November_final.xlsx
  3. F:\\RK\\Sujata Nutrilive\\Daily orders dispatch\\reports\\SUJATA_21_November_final.xlsx
=============================================================================
"""

import os
import sys
import re
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill

sys.stdout.reconfigure(encoding='utf-8')

TEMPLATE_FILE = r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_20_November_final.xlsx'

OUTPUT_DESTINATIONS = [
    r'C:\Users\Admin\Downloads\SUJATA_21_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_21_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\SUJATA_21_November_final.xlsx'
]

for p in OUTPUT_DESTINATIONS:
    os.makedirs(os.path.dirname(p), exist_ok=True)

def guess_state_from_text(addr_text, pincode):
    t = addr_text.lower()
    p = str(pincode)[:2] if pincode else ""
    pin_prefix_map = {
        '40': 'MAHARASHTRA', '41': 'MAHARASHTRA', '42': 'MAHARASHTRA', '43': 'MAHARASHTRA', '44': 'MAHARASHTRA',
        '38': 'GUJARAT', '39': 'GUJARAT', '36': 'GUJARAT', '37': 'GUJARAT',
        '50': 'TELANGANA', '51': 'ANDHRA PRADESH', '52': 'ANDHRA PRADESH', '53': 'ANDHRA PRADESH',
        '56': 'KARNATAKA', '57': 'KARNATAKA', '58': 'KARNATAKA', '59': 'KARNATAKA',
        '60': 'TAMIL NADU', '61': 'TAMIL NADU', '62': 'TAMIL NADU', '63': 'TAMIL NADU', '64': 'TAMIL NADU',
        '11': 'DELHI', '12': 'HARYANA', '13': 'HARYANA',
        '14': 'PUNJAB', '15': 'PUNJAB', '16': 'PUNJAB',
        '20': 'UTTAR PRADESH', '21': 'UTTAR PRADESH', '22': 'UTTAR PRADESH', '24': 'UTTAR PRADESH',
        '25': 'UTTAR PRADESH', '26': 'UTTAR PRADESH', '27': 'UTTAR PRADESH', '28': 'UTTAR PRADESH',
        '45': 'MADHYA PRADESH', '46': 'MADHYA PRADESH', '47': 'MADHYA PRADESH', '48': 'MADHYA PRADESH',
        '49': 'CHHATTISGARH',
        '30': 'RAJASTHAN', '31': 'RAJASTHAN', '32': 'RAJASTHAN', '33': 'RAJASTHAN', '34': 'RAJASTHAN',
        '75': 'ODISHA', '76': 'ODISHA', '77': 'ODISHA',
        '80': 'BIHAR', '81': 'BIHAR', '82': 'BIHAR', '83': 'JHARKHAND', '84': 'BIHAR', '85': 'BIHAR',
        '70': 'WEST BENGAL', '71': 'WEST BENGAL', '72': 'WEST BENGAL', '73': 'WEST BENGAL', '74': 'WEST BENGAL',
    }
    if p in pin_prefix_map: return pin_prefix_map[p]
    if any(k in t for k in ['maharashtra', 'mumbai', 'pune', 'beed', 'nashik']): return 'MAHARASHTRA'
    return 'MAHARASHTRA'

def split_address(full_addr):
    full_addr = full_addr.strip().strip(',').strip()
    if len(full_addr) <= 45:
        return full_addr, ""
    parts = [p.strip() for p in full_addr.split(',') if p.strip()]
    l1, l2 = "", ""
    for part in parts:
        if len(l1) + len(part) + 2 <= 45:
            l1 = f"{l1}, {part}" if l1 else part
        elif len(l2) + len(part) + 2 <= 45:
            l2 = f"{l2}, {part}" if l2 else part
        else:
            if not l1:
                l1 = part[:45]
            elif not l2:
                l2 = part[:45]
            else:
                break
    if not l1:
        l1 = full_addr[:45]
        l2 = full_addr[45:90]
    return l1[:45].strip(', '), l2[:45].strip(', ')

# 2 New Official Speed Post Orders from Daily orders dispatch (9).zip
NEW_ORDERS = [
    {
        "date": "20/11/2026",
        "time": "12:45 PM",
        "sql_date": "2026-11-20",
        "telecaller": "Monu",
        "name": "Datta Nalawade",
        "mobile": 9421344532,
        "alt_mob": None,
        "address": "Gramsevak Colony, Near K K Medical var dene, Nagar Road, Beed, Maharashtra",
        "pincode": "431122",
        "city": "Beed",
        "products": "3 spirulina tablets (120) + 3 sea buckthorn capsules (60)",
        "amount": 2200,
        "payment_mode": "Prepaid",
        "courier": "Speed Post",
        "weight": 750
    },
    {
        "date": "20/11/2026",
        "time": "12:58 PM",
        "sql_date": "2026-11-20",
        "telecaller": "Punam Kasture",
        "name": "Manisha Surashe",
        "mobile": 8698967644,
        "alt_mob": None,
        "address": "Near Mumbai-Pune Highway & Lotus Business School, Opposite Water Tank, Koyte Wasti, Punawale, Pune, Maharashtra",
        "pincode": "411033",
        "city": "Pune",
        "products": "1 month combo: 1 spirulina Capsule 60 + 1 seabukthron Capsule 60 + Free Gift: Bath Soap",
        "amount": 1050,
        "payment_mode": "COD",
        "courier": "Speed Post",
        "weight": 350
    }
]

# 2 Amazon EasyShip Orders from 20-21 Nov
AMAZON_ORDERS_TODAY = [
    {
        "order_id": "404-3199519-5071536",
        "order_date": "2026-11-20",
        "customer": "Amazon Customer",
        "products": "Sujata Nutrilive Pure Organic Spirulina 120 Tablets (1)",
        "amount": 550,
        "payment_mode": "COD",
        "city": "PUNE",
        "state": "MAHARASHTRA",
        "pincode": "411004",
        "status": "Shipped (PendingPickUp)",
        "channel": "Amazon Easy Ship"
    },
    {
        "order_id": "404-7524790-2104302",
        "order_date": "2026-11-21",
        "customer": "Amazon Customer",
        "products": "Sujata Nutrilive SpiruGlow Handmade Organic Bath Soap 100g (1)",
        "amount": 60,
        "payment_mode": "Prepaid",
        "city": "BASUDEBPUR",
        "state": "ODISHA",
        "pincode": "756125",
        "status": "Shipped (PendingPickUp)",
        "channel": "Amazon Easy Ship"
    }
]

print("="*75)
print("🚀 GENERATING OFFICIAL SUJATA_21_November_final.xlsx")
print(f"Total New India Post Dispatch Orders: {len(NEW_ORDERS)}")
print("="*75)

wb = openpyxl.load_workbook(TEMPLATE_FILE)
ws = wb['ArticleDetails']

BORDER_THIN = Border(
    left=Side(style='thin', color='D3D3D3'),
    right=Side(style='thin', color='D3D3D3'),
    top=Side(style='thin', color='D3D3D3'),
    bottom=Side(style='thin', color='D3D3D3')
)
FONT_DATA = Font(name='Calibri', size=11, bold=False, color='000000')
ALIGN_CENTER = Alignment(horizontal='center', vertical='center')
ALIGN_LEFT = Alignment(horizontal='left', vertical='center')
ALIGN_RIGHT = Alignment(horizontal='right', vertical='center')

while ws.max_row > 1:
    ws.delete_rows(2)

for idx, o in enumerate(NEW_ORDERS, 1):
    row_num = idx + 1
    state = guess_state_from_text(o['address'], o['pincode'])
    city = o['city']
    l1, l2 = split_address(o['address'])
    weight = o['weight']
    is_cod = (o['payment_mode'] == 'COD') and (o['amount'] > 0)

    # 48 Standard India Post BNPL Columns
    ws.cell(row=row_num, column=1, value=idx) # SERIAL NUMBER
    ws.cell(row=row_num, column=2, value=None) # BARCODE NO
    ws.cell(row=row_num, column=3, value=weight) # PHYSICAL WEIGHT
    ws.cell(row=row_num, column=4, value='NROL') # SHAPE OF ARTICLE
    ws.cell(row=row_num, column=5, value=15) # LENGTH
    ws.cell(row=row_num, column=6, value=15) # BREADTH
    ws.cell(row=row_num, column=7, value=13) # HEIGHT
    ws.cell(row=row_num, column=8, value=True) # PRIORITY FLAG
    ws.cell(row=row_num, column=9, value='ND') # DELIVERY INSTRUCTION
    ws.cell(row=row_num, column=10, value='RTS') # INSTRUCTION RTS
    ws.cell(row=row_num, column=11, value='SUJATA NUTRILIVE') # SENDER NAME
    ws.cell(row=row_num, column=12, value='SUJATA NUTRILIVE AGROTECH') # SENDER COMPANY
    ws.cell(row=row_num, column=13, value='NASHIK') # SENDER ADD LINE 1
    ws.cell(row=row_num, column=14, value='NASHIK') # SENDER ADD LINE 2
    ws.cell(row=row_num, column=15, value='NASHIK') # SENDER CITY
    ws.cell(row=row_num, column=16, value='MAHARASHTRA') # SENDER STATE
    ws.cell(row=row_num, column=17, value=422007) # SENDER PINCODE
    ws.cell(row=row_num, column=18, value=None)
    ws.cell(row=row_num, column=19, value=None)
    ws.cell(row=row_num, column=20, value=None)
    ws.cell(row=row_num, column=21, value=None)
    ws.cell(row=row_num, column=22, value=o['name']) # RECEIVER NAME
    ws.cell(row=row_num, column=23, value=None) # RECEIVER COMPANY
    ws.cell(row=row_num, column=24, value=l1) # RECEIVER ADD LINE 1
    ws.cell(row=row_num, column=25, value=l2 if l2 else l1) # RECEIVER ADD LINE 2
    ws.cell(row=row_num, column=26, value=city) # RECEIVER CITY
    ws.cell(row=row_num, column=27, value=state) # RECEIVER STATE
    ws.cell(row=row_num, column=28, value=int(o['pincode'])) # RECEIVER PINCODE
    ws.cell(row=row_num, column=29, value=None)
    ws.cell(row=row_num, column=30, value=o['alt_mob'])
    ws.cell(row=row_num, column=31, value=None)
    ws.cell(row=row_num, column=32, value=None)
    ws.cell(row=row_num, column=33, value=False)
    ws.cell(row=row_num, column=34, value=False)
    ws.cell(row=row_num, column=35, value=422007)
    ws.cell(row=row_num, column=36, value=None)
    ws.cell(row=row_num, column=37, value=9834783503) # SENDER MOBILE NO
    ws.cell(row=row_num, column=38, value=o['mobile']) # RECEIVER MOBILE NO
    ws.cell(row=row_num, column=39, value=None)
    ws.cell(row=row_num, column=40, value=None)
    ws.cell(row=row_num, column=41, value='COD' if is_cod else None) # CODR/COD
    ws.cell(row=row_num, column=42, value=o['amount'] if is_cod else None) # VALUE FOR CODR/COD
    ws.cell(row=row_num, column=43, value=None)
    ws.cell(row=row_num, column=44, value=None)
    ws.cell(row=row_num, column=45, value=False) # ACK
    ws.cell(row=row_num, column=46, value=True) # REGISTRATION
    ws.cell(row=row_num, column=47, value=True) # OTP BASED DELIVERY
    ws.cell(row=row_num, column=48, value=None)

    for col in range(1, 49):
        cell = ws.cell(row=row_num, column=col)
        cell.font = FONT_DATA
        cell.border = BORDER_THIN
        if col in [1, 3, 5, 6, 7, 17, 28, 35, 37, 38]:
            cell.alignment = ALIGN_CENTER
        elif col in [42]:
            cell.alignment = ALIGN_RIGHT
            cell.number_format = '0.00'
        else:
            cell.alignment = ALIGN_LEFT

print(f"✅ Populated {len(NEW_ORDERS)} orders in ArticleDetails sheet.")

# Populate Amazon_Orders sheet if it exists
if 'Amazon_Orders' in wb.sheetnames:
    ws_amz = wb['Amazon_Orders']
    # append the 2 new orders to Amazon_Orders
    start_r = ws_amz.max_row + 1
    for i, ao in enumerate(AMAZON_ORDERS_TODAY, 1):
        sr = start_r + i - 1
        row_vals = [
            sr - 1, ao['order_id'], ao['order_date'], ao['customer'],
            ao['products'], ao['amount'], ao['payment_mode'],
            ao['city'], ao['state'], ao['pincode'], ao['status'], ao['channel']
        ]
        for c_idx, val in enumerate(row_vals, 1):
            c = ws_amz.cell(row=sr, column=c_idx, value=val)
            c.font = FONT_DATA
            c.border = BORDER_THIN
            if c_idx in [1, 3, 7, 10]:
                c.alignment = ALIGN_CENTER
            elif c_idx == 6:
                c.alignment = ALIGN_RIGHT
                c.number_format = '₹#,##0.00'
            else:
                c.alignment = ALIGN_LEFT

# Save workbook to all 3 destinations
for p in OUTPUT_DESTINATIONS:
    wb.save(p)
    print(f"💾 Saved: {p}")

print("\n🎉 Done! SUJATA_21_November_final.xlsx is ready for India Post BNPL upload.")
