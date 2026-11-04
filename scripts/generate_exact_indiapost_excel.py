import openpyxl
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

template_path = r'C:\Users\Admin\.gemini\antigravity\brain\71a2db4c-5724-4f2e-94d9-9aa036757079\.user_uploaded\media_1793598932274_d37b67a2.xlsx'

# Output paths
out_paths = [
    r'C:\Users\Admin\Downloads\SUJATA_02_November_final.xlsx',
    r'C:\Users\Admin\Downloads\SUJATA 02 November.xlsx',
    r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_02_November_final.xlsx'
]

os.makedirs(r'F:\RK\Sujata Nutrilive\dispatch_excel', exist_ok=True)

# Load the authentic template
wb = openpyxl.load_workbook(template_path)
ws = wb['ArticleDetails']

# Check existing rows and delete sample rows (keep header row 1)
max_r = ws.max_row
if max_r > 1:
    ws.delete_rows(2, max_r - 1)

# List of orders to dispatch
orders = [
    # 1. Aloke Bhakat
    {
        "name": "Aloke Bhakat",
        "add1": "Gouribati, Near bdo office",
        "add2": "Tarakeswar, WB",
        "city": "Tarakeswar",
        "state": "WEST BENGAL",
        "pin": 712410,
        "mob": 9932867909,
        "cod": None,
        "cod_val": None,
        "weight": 220,
        "height": 10
    },
    # 2. Dilip pawar
    {
        "name": "Dilip pawar",
        "add1": "At po chikurde, Taluka Walawa",
        "add2": "District sangli, Walawa",
        "city": "Walawa",
        "state": "MAHARASHTRA",
        "pin": 415412,
        "mob": 9730766205,
        "cod": "COD",
        "cod_val": "400/-",
        "weight": 180,
        "height": 10
    },
    # 3. Vijay Ramdas salunke
    {
        "name": "Vijay Ramdas salunke",
        "add1": "Washimbe, Sharad Chandraji Pawar vidyalaya, washimbe",
        "add2": "Tal - karmala, Dist - Solapur",
        "city": "Karmala",
        "state": "MAHARASHTRA",
        "pin": 413206,
        "mob": 9850110429,
        "cod": None,
        "cod_val": None,
        "weight": 210,
        "height": 13
    },
    # 4. Sheikh Salim Khalil
    {
        "name": "Sheikh Salim Khalil",
        "add1": "Bypass Road, Behind Pandurang Furniture,",
        "add2": "Near Yakub Masjid, 1 Row House, Majalgaon",
        "city": "Majalgaon",
        "state": "MAHARASHTRA",
        "pin": 431131,
        "mob": 9881391691,
        "cod": "COD",
        "cod_val": "1550/-",
        "weight": 350,
        "height": 13
    },
    # 5. Khajakhan Khan
    {
        "name": "Khajakhan Khan",
        "add1": "House No. 4-37, Kandi Kabeer Residency,",
        "add2": "Kandi, District Sangareddy",
        "city": "Sangareddy",
        "state": "TELANGANA",
        "pin": 502285,
        "mob": 9948860604,
        "cod": "COD",
        "cod_val": "1050/-",
        "weight": 220,
        "height": 13
    },
    # 6. Viraj Bhagat (Yash confirmed: Abhishek one month combo pathav)
    {
        "name": "VIRAJ BHAGAT",
        "add1": "Urban Space, Phase 1, Block A, flat # 1001",
        "add2": "Mohmmadwadi, next to Royal Heritage Mall",
        "city": "Pune",
        "state": "MAHARASHTRA",
        "pin": 411060,
        "mob": 9168601478,
        "cod": None,
        "cod_val": None,
        "weight": 220,
        "height": 10
    },
    # 7. Rajendra sukadeo Nikam
    {
        "name": "Rajendra sukadeo Nikam",
        "add1": "Flat no 07 4th floor Saipooja apartement",
        "add2": "mahalaxmi nagar dasak nashik",
        "city": "Nashik",
        "state": "MAHARASHTRA",
        "pin": 422101,
        "mob": 8956051949,
        "cod": None,
        "cod_val": None,
        "weight": 250,
        "height": 13
    }
]

for idx, o in enumerate(orders):
    row_num = idx + 2
    row_data = [
        idx + 1,            # 1: SERIAL NUMBER
        None,               # 2: BARCODE NO
        o["weight"],        # 3: PHYSICAL WEIGHT
        "NROL",             # 4: SHAPE OF ARTICLE
        15,                 # 5: LENGTH
        15,                 # 6: BREADTH/DIAMETER
        o["height"],        # 7: HEIGHT
        True,               # 8: PRIORITY FLAG
        "ND",               # 9: DELIVERY INSTRUCTION
        "RTS",              # 10: INSTRUCTION RTS
        "SUJATA NUTRILIVE", # 11: SENDER NAME
        "SUJATA NUTRILIVE AGROTECH", # 12: SENDER COMPANY
        "NASHIK",           # 13: SENDER ADD LINE 1
        "NASHIK",           # 14: SENDER ADD LINE 2
        "NASHIK",           # 15: SENDER CITY
        "MAHARASHTRA",      # 16: SENDER STATE
        422007,             # 17: SENDER PINCODE
        None,               # 18: SENDER EMAILID
        None,               # 19: SENDER ALT CONTACT
        None,               # 20: SENDER KYC
        None,               # 21: SENDER TAX REFERENCE
        o["name"],          # 22: RECEIVER NAME
        None,               # 23: RECEIVER COMPANY
        o["add1"],          # 24: RECEIVER ADD LINE 1
        o["add2"],          # 25: RECEIVER ADD LINE 2
        o["city"],          # 26: RECEIVER CITY
        o["state"],         # 27: RECEIVER STATE
        o["pin"],           # 28: RECEIVER PINCODE
        None,               # 29: RECEIVER EMAILID
        None,               # 30: RECEIVER ALT CONTACT
        None,               # 31: RECEIVER KYC
        None,               # 32: RECEIVER TAX REFERENCE
        False,              # 33: ALT ADDRESS FLAG
        False,              # 34: PICKUP ADDRESS FLAG
        422007,             # 35: DROP OFF PINCODE
        None,               # 36: DROPOFF/PICKUP OFFICE ID
        9834783503,         # 37: SENDER MOBILE NO
        o["mob"],           # 38: RECEIVER MOBILE NO
        None,               # 39: PREPAYMENT CODE
        None,               # 40: VALUE OF PREPAYMENT
        o["cod"],           # 41: CODR/COD
        o["cod_val"],       # 42: VALUE FOR CODR/COD
        None,               # 43: INSURANCE TYPE
        None,               # 44: VALUE OF INSURANCE
        False,              # 45: ACK
        True,               # 46: REGISTRATION
        True,               # 47: OTP BASED DELIVERY
        None                # 48: BULK REFERENCE
    ]
    ws.append(row_data)

# Save to all target paths
for path in out_paths:
    wb.save(path)
    print(f"✅ Saved exact India Post Excel to: {path}")
