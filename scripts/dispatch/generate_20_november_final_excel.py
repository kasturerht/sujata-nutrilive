"""
=============================================================================
🌿 SUJATA NUTRILIVE — OFFICIAL INDIA POST EXCEL GENERATOR (20 NOV 2026)
=============================================================================
Author: Antigravity AI Engineering
Source Data: Daily orders dispatch  (8).zip (WhatsApp Chat: 19 Nov & 20 Nov morning)
Output Format: Exact India Post BNPL 4-Sheet Template:
  - ArticleDetails (48 standard columns)
  - PickupAddress (Untouched original template)
  - AltAddress (Untouched original template)
  - Information (Untouched original template)

Destinations:
  1. C:\\Users\\Admin\\Downloads\\SUJATA_20_November_final.xlsx
  2. F:\\RK\\Sujata Nutrilive\\dispatch_excel\\SUJATA_20_November_final.xlsx
  3. F:\\RK\\Sujata Nutrilive\\Daily orders dispatch\\reports\\SUJATA_20_November_final.xlsx
=============================================================================
"""

import os
import sys
import json
import re
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
import pymysql

sys.stdout.reconfigure(encoding='utf-8')

TEMPLATE_FILE = r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_18_November_final.xlsx'
if not os.path.exists(TEMPLATE_FILE):
    TEMPLATE_FILE = r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_17_November_final.xlsx'

OUTPUT_DESTINATIONS = [
    r'C:\Users\Admin\Downloads\SUJATA_20_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_20_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\SUJATA_20_November_final.xlsx'
]

for p in OUTPUT_DESTINATIONS:
    os.makedirs(os.path.dirname(p), exist_ok=True)

# Helper functions
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
    if any(k in t for k in ['karnataka', 'belgaum', 'belagavi', 'bangalore', 'mysore']): return 'KARNATAKA'
    if any(k in t for k in ['maharashtra', 'mumbai', 'pune', 'nashik', 'thane', 'dombivali', 'jalgaon', 'solapur', 'kolhapur', 'sangli', 'buldana', 'shrigonda', 'chakan', 'vasai', 'palghar', 'wardha', 'chandrapur', 'ratnagiri', 'vita', 'malkapur', 'jamner']): return 'MAHARASHTRA'
    if any(k in t for k in ['gujarat', 'surat', 'ahmedabad', 'jamnagar']): return 'GUJARAT'
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

def extract_city(full_addr, state):
    parts = [p.strip() for p in full_addr.split(',') if p.strip()]
    if len(parts) >= 2:
        candidate = parts[-1]
        if state.lower() in candidate.lower() or re.search(r'\d{6}', candidate):
            if len(parts) >= 3:
                candidate = parts[-2]
            else:
                candidate = parts[0]
        candidate = re.sub(r'(Dist|District|Tal|Taluka|Tal\.|Dist\.)\s*[:\-]?', '', candidate, flags=re.I).strip()
        candidate = re.sub(r'\d{6}', '', candidate).strip()
        if candidate and len(candidate) > 2:
            return candidate[:35].strip()
    return (parts[0] if parts else "NASHIK")[:35].strip()

# Explicit Clean City Mapping
CITY_MAP = {
    9673362596: "Jamner",
    9404992762: "Ratnagiri",
    8698983604: "Mehkar",
    7058670364: "Nashik",
    9579644900: "Malkapur",
    9960734613: "Vita",
    9371735955: "Ghugus",
    9834051613: "Wardha",
    7846806727: "Belgaum",
    9011237820: "Raver"
}

WEIGHT_MAP = {
    9673362596: 1500, # Bulk 12 Spirulina + 10 Moringa + Oil + Shampoo
    9404992762: 750,  # 3 Months Combo
    8698983604: 350,  # 1 Month Combo
    7058670364: 500,  # 2 bottles + cosmetics
    9579644900: 450,  # 2 bottles + gifts
    9960734613: 500,  # 2 bottles + gifts
    9371735955: 750,  # 6 bottles (3+3)
    9834051613: 350,  # 1 Month Combo (2 bottles)
    7846806727: 750,  # 3 Months Combo
    9011237820: 350   # 1 Month Combo (2 bottles)
}

# 10 Official Orders for 19 Nov & 20 Nov Morning
NEW_ORDERS = [
    {
        "date": "19/11/2026",
        "time": "10:51 AM",
        "sql_date": "2026-11-19",
        "telecaller": "Manju",
        "name": "Rajesh Hiroji Patil",
        "mobile": 9673362596,
        "alt_mob": None,
        "address": "House No. 2, Plot No. 25, Madhuban Colony, In Front of MSEB Office, Jalgaon Road, Jamner, Maharashtra",
        "pincode": "424206",
        "products": "Spirulina (12) + Moringa Powder (10) + Oil (1) + Spirulina Toothpaste (2) + Spirulina Soap (2) + Spirulina Shampoo (50 ml) + Spirulina Powder",
        "amount": 2500,
        "payment_mode": "Prepaid",
        "courier": "Speed Post"
    },
    {
        "date": "19/11/2026",
        "time": "12:38 PM",
        "sql_date": "2026-11-19",
        "telecaller": "Manju",
        "name": "Sanjay Sadanand Nalawade",
        "mobile": 9404992762,
        "alt_mob": "9185181344",
        "address": "D-22, Shankheshwar Park, Mal Naka, Near Maratha Bhavan, Near Zilla Parishad, Ratnagiri, Maharashtra",
        "pincode": "415612",
        "products": "3 Months Combo – Spirulina Capsules (3) + Sea Buckthorn Capsules (3) + Moringa Capsules (1) + Spirulina Toothpaste (1)",
        "amount": 2200,
        "payment_mode": "Prepaid",
        "courier": "Speed Post"
    },
    {
        "date": "19/11/2026",
        "time": "1:45 PM",
        "sql_date": "2026-11-19",
        "telecaller": "Karishma",
        "name": "Ravindra Raival",
        "mobile": 8698983604,
        "alt_mob": "7559113501",
        "address": "Mahatma Baliraja Sheti Kendra, Near Mothhe Ram Mandir, Pawar Complex, Mehkar, District Buldhana, Maharashtra, India",
        "pincode": "443301",
        "products": "Diwali offer one month combo... Spirulina tablet - 1",
        "amount": 0,
        "payment_mode": "Prepaid",
        "courier": "Speed Post"
    },
    {
        "date": "19/11/2026",
        "time": "4:39 PM",
        "sql_date": "2026-11-19",
        "telecaller": "Karishma",
        "name": "Roshan Akela",
        "mobile": 7058670364,
        "alt_mob": None,
        "address": "baghwan galli satpur bhaji market, Nashik",
        "pincode": "422008",
        "products": "Spirulina tablet 1 + b12 - 1 + Facepack + soap + toothpaste",
        "amount": 1050,
        "payment_mode": "COD",
        "courier": "Self / Speed Post"
    },
    {
        "date": "19/11/2026",
        "time": "4:49 PM",
        "sql_date": "2026-11-19",
        "telecaller": "Vaishnavi",
        "name": "Nilesh Kharade",
        "mobile": 9579644900,
        "alt_mob": None,
        "address": "Jadhav Vaadi, Nandura Road, Malkapur, Dist. Buldhana",
        "pincode": "443101",
        "products": "Spirulina capsules - 1 + Sea Buckthorn capsules - 1 + Gift: Soap + Face Pack + tootpast",
        "amount": 1050,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "date": "19/11/2026",
        "time": "4:53 PM",
        "sql_date": "2026-11-19",
        "telecaller": "Manju",
        "name": "Hanmant Aba Karande",
        "mobile": 9960734613,
        "alt_mob": None,
        "address": "Near Indirabai Bhide Kanya School, Beside Nirankari Hospital, Vita, Post Vita, Taluka Khanapur, District Sangli, Maharashtra",
        "pincode": "415311",
        "products": "Spirulina tablets 120 + Vitamin B12 Capsules + Spirulina toothpaste + soap + facepack",
        "amount": 1100,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "date": "19/11/2026",
        "time": "7:58 PM",
        "sql_date": "2026-11-19",
        "telecaller": "Punam Kasture",
        "name": "Ashish Aade",
        "mobile": 9371735955,
        "alt_mob": None,
        "address": "Sai Nagar, Ward No. 6, Near Hanuman Temple, Ravidas Tajne House, Ghugus, Taluka Chandrapur, District Chandrapur, Maharashtra",
        "pincode": "442505",
        "products": "3 Spirulina Capsule 60 + 3 seabukthron Capsule 60 + Free Gift: Toothpaste + Bath Soap",
        "amount": 2400,
        "payment_mode": "Prepaid",
        "courier": "Speed Post"
    },
    {
        "date": "19/11/2026",
        "time": "8:59 PM",
        "sql_date": "2026-11-19",
        "telecaller": "Punam Kasture",
        "name": "Sujata Sunil Balvir",
        "mobile": 9834051613,
        "alt_mob": None,
        "address": "Near Om Polytechnic College, Near Dofe Akhada, Master Colony, Wardha, Maharashtra",
        "pincode": "442001",
        "products": "1 month combo: 1 Spirulina Tablet 120 + 1 seabukthron Capsule 60",
        "amount": 900,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "date": "20/11/2026",
        "time": "10:40 AM",
        "sql_date": "2026-11-20",
        "telecaller": "Manju",
        "name": "Basavant Pujeri H.",
        "mobile": 7846806727,
        "alt_mob": None,
        "address": "House No. 267/B, Tanaji Galli, Near Milhar Temple, Kalkhamb, Post Muchandi, District Belgaum, Karnataka",
        "pincode": "590016",
        "products": "3 Months Combo Pack – Spirulina Capsules (3) + Sea Buckthorn Capsules (3) + Moringa Capsules (1) FREE",
        "amount": 2200,
        "payment_mode": "Prepaid",
        "courier": "Speed Post"
    },
    {
        "date": "20/11/2026",
        "time": "10:45 AM",
        "sql_date": "2026-11-20",
        "telecaller": "Manju",
        "name": "Sunil Popat Pawar",
        "mobile": 9011237820,
        "alt_mob": None,
        "address": "At Gulabwadi, Post Pal, Taluka Raver, District Jalgaon, Maharashtra",
        "pincode": "425504",
        "products": "1 Month Combo Pack – Spirulina Capsules (1) + Sea Buckthorn Capsules (1)",
        "amount": 1050,
        "payment_mode": "COD",
        "courier": "Speed Post"
    }
]

print("="*75)
print("🚀 GENERATING OFFICIAL SUJATA_20_November_final.xlsx")
print(f"Total Dispatch Orders (19 Nov & 20 Nov): {len(NEW_ORDERS)}")
print("="*75)

# Load template workbook
wb = openpyxl.load_workbook(TEMPLATE_FILE)
ws = wb['ArticleDetails']

# Style constants from template
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

# Clear existing data rows (keep header row 1)
while ws.max_row > 1:
    ws.delete_rows(2)

# Insert the 10 orders into ArticleDetails
for idx, o in enumerate(NEW_ORDERS, 1):
    row_num = idx + 1
    state = guess_state_from_text(o['address'], o['pincode'])
    city = CITY_MAP.get(o['mobile'], extract_city(o['address'], state))
    l1, l2 = split_address(o['address'])
    weight = WEIGHT_MAP.get(o['mobile'], 350)
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

    # Format row styling
    for col in range(1, 49):
        cell = ws.cell(row=row_num, column=col)
        cell.font = FONT_DATA
        cell.border = BORDER_THIN
        if col in [1, 3, 5, 6, 7, 17, 28, 35, 37, 38]:
            cell.alignment = ALIGN_CENTER
        elif col in [42]:
            cell.alignment = ALIGN_RIGHT
        else:
            cell.alignment = ALIGN_LEFT

# Save to all 3 destinations
for p in OUTPUT_DESTINATIONS:
    wb.save(p)
    print(f"✅ Saved Excel to: {p}")

print("\n" + "="*75)
print("📊 EXCEL GENERATION SUMMARY (SUJATA_20_November_final.xlsx)")
print("="*75)
cod_cnt = sum(1 for o in NEW_ORDERS if o['payment_mode'] == 'COD')
prepaid_cnt = sum(1 for o in NEW_ORDERS if o['payment_mode'] != 'COD')
cod_val = sum(o['amount'] for o in NEW_ORDERS if o['payment_mode'] == 'COD')
prepaid_val = sum(o['amount'] for o in NEW_ORDERS if o['payment_mode'] != 'COD')

print(f"Total Orders Dispatched: {len(NEW_ORDERS)}")
print(f"Prepaid Orders: {prepaid_cnt} (₹{prepaid_val:,.2f})")
print(f"COD Orders: {cod_cnt} (₹{cod_val:,.2f})")
print(f"Total Pipeline Revenue: ₹{cod_val + prepaid_val:,.2f}")
print("="*75)
