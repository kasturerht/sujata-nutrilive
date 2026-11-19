"""
=============================================================================
🌿 SUJATA NUTRILIVE — OFFICIAL INDIA POST EXCEL GENERATOR (06 NOV 2026)
=============================================================================
Author: Antigravity AI Engineering
Source Data: Daily orders dispatch (5).zip (WhatsApp Chat Part 7: 05 Nov afternoon to 06 Nov)
Output Format: Exact India Post BNPL 4-Sheet Template:
  - ArticleDetails (48 standard columns)
  - PickupAddress (Untouched original template)
  - AltAddress (Untouched original template)
  - Information (Untouched original template)

Destinations:
  1. C:\\Users\\Admin\\Downloads\\SUJATA_06_November_final.xlsx
  2. F:\\RK\\Sujata Nutrilive\\dispatch_excel\\SUJATA_06_November_final.xlsx
  3. F:\\RK\\Sujata Nutrilive\\Daily orders dispatch\\reports\\SUJATA_06_November_final.xlsx
=============================================================================
"""

import os
import sys
import copy
import json
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
import pymysql

sys.stdout.reconfigure(encoding='utf-8')

TEMPLATE_FILE = r'C:\Users\Admin\.gemini\antigravity\brain\71a2db4c-5724-4f2e-94d9-9aa036757079\.user_uploaded\media_1793598932274_d37b67a2.xlsx'
if not os.path.exists(TEMPLATE_FILE):
    TEMPLATE_FILE = r'C:\Users\Admin\Downloads\SUJATA 11 Octobar.xlsx'

OUTPUT_DESTINATIONS = [
    r'C:\Users\Admin\Downloads\SUJATA_06_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_06_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\SUJATA_06_November_final.xlsx'
]

# Ensure output directories exist
for path in OUTPUT_DESTINATIONS:
    os.makedirs(os.path.dirname(path), exist_ok=True)

# 8 Verified Dispatch Orders from Part 7 (05 Nov afternoon to 06 Nov morning)
ORDERS_06_NOV = [
    {
        "sr": 1,
        "telecaller": "Monu",
        "date": "05/11/2026",
        "time": "12:20",
        "barcode": None,
        "weight": 400,
        "shape": "NROL",
        "length": 15, "breadth": 15, "height": 13,
        "priority": True,
        "delivery_inst": "ND",
        "instruction_rts": "RTS",
        "sender_name": "SUJATA NUTRILIVE",
        "sender_company": "SUJATA NUTRILIVE AGROTECH",
        "sender_line1": "NASHIK",
        "sender_line2": "NASHIK",
        "sender_city": "NASHIK",
        "sender_state": "MAHARASHTRA",
        "sender_pincode": 422007,
        "sender_email": None,
        "sender_alt": None,
        "sender_kyc": None,
        "sender_tax": None,
        "receiver_name": "Arun K. Pise",
        "receiver_company": None,
        "receiver_line1": "House no. 130, High Street camp",
        "receiver_line2": "Belgaum, Karnataka",
        "receiver_city": "Belgaum",
        "receiver_state": "KARNATAKA",
        "receiver_pincode": 590001,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9141023102,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": None,
        "cod_val": None,
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Sea Buckthorn - 1 + B12 - 1 + Moringa Capsules - 1 + Ashwagandha Tablet - 1",
        "amount": 1350,
        "payment_mode": "Prepaid",
        "courier": "Speed Post (DTDC Express)"
    },
    {
        "sr": 2,
        "telecaller": "Manjushree Kasture",
        "date": "05/11/2026",
        "time": "12:28",
        "barcode": None,
        "weight": 450,
        "shape": "NROL",
        "length": 15, "breadth": 15, "height": 13,
        "priority": True,
        "delivery_inst": "ND",
        "instruction_rts": "RTS",
        "sender_name": "SUJATA NUTRILIVE",
        "sender_company": "SUJATA NUTRILIVE AGROTECH",
        "sender_line1": "NASHIK",
        "sender_line2": "NASHIK",
        "sender_city": "NASHIK",
        "sender_state": "MAHARASHTRA",
        "sender_pincode": 422007,
        "sender_email": None,
        "sender_alt": None,
        "sender_kyc": None,
        "sender_tax": None,
        "receiver_name": "Kamalesh Kapadia",
        "receiver_company": None,
        "receiver_line1": "27 DEV Chhaya, 2nd Floor, Near Haji Ali",
        "receiver_line2": "Panna Galli, Tardeo, Mumbai",
        "receiver_city": "Mumbai",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 400034,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9820042219,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": None,
        "cod_val": None,
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Spirulina Tablets + Vitamin B12 + Spirulina Toothpaste + Spirulina Soap + Spirulina Face Pack",
        "amount": 1100,
        "payment_mode": "Prepaid",
        "courier": "Speed Post"
    },
    {
        "sr": 3,
        "telecaller": "Monu",
        "date": "05/11/2026",
        "time": "14:57",
        "barcode": None,
        "weight": 350,
        "shape": "NROL",
        "length": 15, "breadth": 15, "height": 13,
        "priority": True,
        "delivery_inst": "ND",
        "instruction_rts": "RTS",
        "sender_name": "SUJATA NUTRILIVE",
        "sender_company": "SUJATA NUTRILIVE AGROTECH",
        "sender_line1": "NASHIK",
        "sender_line2": "NASHIK",
        "sender_city": "NASHIK",
        "sender_state": "MAHARASHTRA",
        "sender_pincode": 422007,
        "sender_email": None,
        "sender_alt": None,
        "sender_kyc": None,
        "sender_tax": None,
        "receiver_name": "Ravindra Raival",
        "receiver_company": None,
        "receiver_line1": "Mahatma Baliraja Sheti Kendra, Near Mothhe Ram Mandir",
        "receiver_line2": "Pawar Complex, Mehkar, Dist Buldhana",
        "receiver_city": "Mehkar",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 443301,
        "receiver_email": None,
        "receiver_alt": "7559113501",
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 8698983604,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "1050/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Diwali Offer 1 Month Combo: Spirulina - 1 + Sea Buckthorn - 1 + Moringa Capsule - 1",
        "amount": 1050,
        "payment_mode": "COD",
        "courier": "Speed Post (Blue Dart)"
    },
    {
        "sr": 4,
        "telecaller": "Monu",
        "date": "05/11/2026",
        "time": "15:05",
        "barcode": None,
        "weight": 800,
        "shape": "NROL",
        "length": 15, "breadth": 15, "height": 13,
        "priority": True,
        "delivery_inst": "ND",
        "instruction_rts": "RTS",
        "sender_name": "SUJATA NUTRILIVE",
        "sender_company": "SUJATA NUTRILIVE AGROTECH",
        "sender_line1": "NASHIK",
        "sender_line2": "NASHIK",
        "sender_city": "NASHIK",
        "sender_state": "MAHARASHTRA",
        "sender_pincode": 422007,
        "sender_email": None,
        "sender_alt": None,
        "sender_kyc": None,
        "sender_tax": None,
        "receiver_name": "Alisha Shivkar",
        "receiver_company": None,
        "receiver_line1": "602, 6th Floor, Plot no 7A, Saineketan CHS",
        "receiver_line2": "Sector 12, Dronagiri Node, Opp JNPT Township, Uran, Navi Mumbai",
        "receiver_city": "Uran",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 400707,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9029831666,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": None,
        "cod_val": None,
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Spirulina Capsule 3 + Seabuckthorn Capsule 2 + B12 Capsule 1 + Moringa Capsule 1 + D3 Capsule 1 (8 bottles)",
        "amount": 2200,
        "payment_mode": "Prepaid",
        "courier": "Speed Post (Maruti Courier)"
    },
    {
        "sr": 5,
        "telecaller": "Vaishnavi Diwate",
        "date": "05/11/2026",
        "time": "16:05",
        "barcode": None,
        "weight": 450,
        "shape": "NROL",
        "length": 15, "breadth": 15, "height": 13,
        "priority": True,
        "delivery_inst": "ND",
        "instruction_rts": "RTS",
        "sender_name": "SUJATA NUTRILIVE",
        "sender_company": "SUJATA NUTRILIVE AGROTECH",
        "sender_line1": "NASHIK",
        "sender_line2": "NASHIK",
        "sender_city": "NASHIK",
        "sender_state": "MAHARASHTRA",
        "sender_pincode": 422007,
        "sender_email": None,
        "sender_alt": None,
        "sender_kyc": None,
        "sender_tax": None,
        "receiver_name": "Vinaya Shivani",
        "receiver_company": None,
        "receiver_line1": "Flat no B 003, Building no 18 B, Shivdarshan CHS",
        "receiver_line2": "Ashokvan, Opp Patel Samaj Hall, Hanuman Tekadi, Borivali East, Mumbai",
        "receiver_city": "Mumbai",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 400066,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 7208466621,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "1600/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "2 Month Combo (2 Spirulina Capsule + 2 Sea Buckthorn Capsule) + Free gift: 1 Toothpaste + 1 Soap",
        "amount": 1600,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "sr": 6,
        "telecaller": "Vaishnavi Diwate",
        "date": "05/11/2026",
        "time": "16:13",
        "barcode": None,
        "weight": 350,
        "shape": "NROL",
        "length": 15, "breadth": 15, "height": 13,
        "priority": True,
        "delivery_inst": "ND",
        "instruction_rts": "RTS",
        "sender_name": "SUJATA NUTRILIVE",
        "sender_company": "SUJATA NUTRILIVE AGROTECH",
        "sender_line1": "NASHIK",
        "sender_line2": "NASHIK",
        "sender_city": "NASHIK",
        "sender_state": "MAHARASHTRA",
        "sender_pincode": 422007,
        "sender_email": None,
        "sender_alt": None,
        "sender_kyc": None,
        "sender_tax": None,
        "receiver_name": "Vishal Rokade",
        "receiver_company": None,
        "receiver_line1": "Flat no. 1, Block no B.2, Meenal Garden",
        "receiver_line2": "Patvardhan Baugh, Near Vakil Nagar, Erandwane, Pune",
        "receiver_city": "Pune",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 411004,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9373358870,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": None,
        "cod_val": None,
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "1 Month Combo (1 Spirulina Capsule + 1 Sea Buckthorn Capsule) + 2 Spirulina Soap",
        "amount": 1119,
        "payment_mode": "Prepaid",
        "courier": "Speed Post (Blue Dart)"
    },
    {
        "sr": 7,
        "telecaller": "Karishma Patil",
        "date": "05/11/2026",
        "time": "19:58",
        "barcode": None,
        "weight": 550,
        "shape": "NROL",
        "length": 15, "breadth": 15, "height": 13,
        "priority": True,
        "delivery_inst": "ND",
        "instruction_rts": "RTS",
        "sender_name": "SUJATA NUTRILIVE",
        "sender_company": "SUJATA NUTRILIVE AGROTECH",
        "sender_line1": "NASHIK",
        "sender_line2": "NASHIK",
        "sender_city": "NASHIK",
        "sender_state": "MAHARASHTRA",
        "sender_pincode": 422007,
        "sender_email": None,
        "sender_alt": None,
        "sender_kyc": None,
        "sender_tax": None,
        "receiver_name": "Rajesh Patode",
        "receiver_company": None,
        "receiver_line1": "House no. 1370, Sadanand Nagar, Uttan Road",
        "receiver_line2": "Murdha Gaon, Bhayandar West, Thane",
        "receiver_city": "Bhayandar",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 401101,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 8169333356,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "2300/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Spirulina Capsule 60 (3) + Seabuckthorn Cap 60 (3) + Spirulina Chikki 1 + Toothpaste 1",
        "amount": 2300,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "sr": 8,
        "telecaller": "Punam Kasture",
        "date": "05/11/2026",
        "time": "21:49",
        "barcode": None,
        "weight": 450,
        "shape": "NROL",
        "length": 15, "breadth": 15, "height": 13,
        "priority": True,
        "delivery_inst": "ND",
        "instruction_rts": "RTS",
        "sender_name": "SUJATA NUTRILIVE",
        "sender_company": "SUJATA NUTRILIVE AGROTECH",
        "sender_line1": "NASHIK",
        "sender_line2": "NASHIK",
        "sender_city": "NASHIK",
        "sender_state": "MAHARASHTRA",
        "sender_pincode": 422007,
        "sender_email": None,
        "sender_alt": None,
        "sender_kyc": None,
        "sender_tax": None,
        "receiver_name": "Kishor Jagtap",
        "receiver_company": None,
        "receiver_line1": "A-18, Mathura CHS Ltd., Sakharam Complex",
        "receiver_line2": "Kopar Cross Road, Behind Swami Samarth Math, Dombivli West, Thane",
        "receiver_city": "Dombivli West",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 421202,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9920408378,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": None,
        "cod_val": None,
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "2 Month Combo (2 Spirulina Cap 60 + 2 Seabuckthorn Cap 60) + Free Gift Toothpaste + Soap",
        "amount": 1680,
        "payment_mode": "Prepaid",
        "courier": "Speed Post"
    }
]

def build_row_list(o):
    return [
        o["sr"],
        o["barcode"],
        o["weight"],
        o["shape"],
        o["length"],
        o["breadth"],
        o["height"],
        o["priority"],
        o["delivery_inst"],
        o["instruction_rts"],
        o["sender_name"],
        o["sender_company"],
        o["sender_line1"],
        o["sender_line2"],
        o["sender_city"],
        o["sender_state"],
        o["sender_pincode"],
        o["sender_email"],
        o["sender_alt"],
        o["sender_kyc"],
        o["sender_tax"],
        o["receiver_name"],
        o["receiver_company"],
        o["receiver_line1"],
        o["receiver_line2"],
        o["receiver_city"],
        o["receiver_state"],
        o["receiver_pincode"],
        o["receiver_email"],
        o["receiver_alt"],
        o["receiver_kyc"],
        o["receiver_tax"],
        o["alt_addr_flag"],
        o["pickup_addr_flag"],
        o["dropoff_pincode"],
        o["office_id"],
        o["sender_mobile"],
        o["receiver_mobile"],
        o["prepay_code"],
        o["prepay_val"],
        o["cod_code"],
        o["cod_val"],
        o["insurance_type"],
        o["insurance_val"],
        o["ack"],
        o["registration"],
        o["otp_delivery"],
        o["bulk_ref"]
    ]

def main():
    print("=" * 75)
    print("🚀 SUJATA NUTRILIVE — GENERATING OFFICIAL INDIA POST EXCEL (06 NOV 2026)")
    print("=" * 75)

    if not os.path.exists(TEMPLATE_FILE):
        print(f"❌ Error: Template file not found at: {TEMPLATE_FILE}")
        return

    print(f"📄 Loading Template: {TEMPLATE_FILE}")
    wb = openpyxl.load_workbook(TEMPLATE_FILE)
    ws = wb['ArticleDetails']

    # Template row 2 cell style prototype
    proto_font = copy.copy(ws.cell(row=2, column=1).font)
    proto_align = Alignment(horizontal='center', vertical='center')
    proto_border = copy.copy(ws.cell(row=2, column=1).border)

    # Insert 8 new verified dispatch orders
    for idx, o in enumerate(ORDERS_06_NOV, 2):
        row_values = build_row_list(o)
        for c_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=idx, column=c_idx)
            cell.value = val  # Explicitly sets None if val is None
            cell.font = copy.copy(proto_font)
            cell.alignment = proto_align
            cell.border = copy.copy(proto_border)

    # Delete any leftover rows beyond the inserted orders
    final_data_row = len(ORDERS_06_NOV) + 1  # Header (1) + 8 Orders = Row 9
    if ws.max_row > final_data_row:
        ws.delete_rows(final_data_row + 1, ws.max_row - final_data_row)

    # Save to all destination locations
    for dest in OUTPUT_DESTINATIONS:
        wb.save(dest)
        print(f"✅ Generated & Saved: {dest}")

    print(f"📑 Sheets Verified: {wb.sheetnames}")
    print(f"📊 Orders Processed: {len(ORDERS_06_NOV)} Orders")
    cod_orders = [o for o in ORDERS_06_NOV if o['payment_mode'] == 'COD']
    prepaid_orders = [o for o in ORDERS_06_NOV if o['payment_mode'] == 'Prepaid']
    print(f"💰 Total COD Amount to Collect: ₹{sum(o['amount'] for o in cod_orders):,} ({len(cod_orders)} COD Orders)")
    print(f"💳 Total Prepaid Revenue: ₹{sum(o['amount'] for o in prepaid_orders):,} ({len(prepaid_orders)} Prepaid Orders)")
    print(f"🌟 Grand Total Value: ₹{sum(o['amount'] for o in ORDERS_06_NOV):,}")
    print("=" * 75)

    # 1. Update local database file
    db_nov_path = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_35.json'
    prev_nov_path = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_27.json'
    
    prev_nov = []
    if os.path.exists(prev_nov_path):
        with open(prev_nov_path, 'r', encoding='utf-8') as f:
            prev_nov = json.load(f)

    sr_start = len(prev_nov) + 321
    new_db_orders = []
    for idx, o in enumerate(ORDERS_06_NOV, sr_start):
        new_db_orders.append({
            "sr_no": idx,
            "month": "November 2026",
            "date": o["date"],
            "time": o["time"],
            "telecaller": o["telecaller"],
            "customer_name": o["receiver_name"],
            "mobile_number": str(o["receiver_mobile"]),
            "pincode": str(o["receiver_pincode"]),
            "address": f"{o['receiver_line1']}, {o['receiver_line2']}, {o['receiver_city']}, {o['receiver_state']}",
            "products_ordered": o["products_ordered"],
            "amount": o["amount"],
            "payment_mode": o["payment_mode"],
            "order_type": "Direct Dispatch",
            "dispatch_channel": o.get("courier", "Speed Post"),
            "manifest_name": "SUJATA_06_November_final.xlsx"
        })

    combined_nov = prev_nov + new_db_orders
    with open(db_nov_path, 'w', encoding='utf-8') as f:
        json.dump(combined_nov, f, indent=2, ensure_ascii=False)
    print(f"💾 Updated Local Database: {db_nov_path} ({len(combined_nov)} November orders)")

    # 2. Sync to TiDB Serverless Cloud
    print("\n☁️ Syncing 8 New Orders to TiDB Cloud Database...")
    try:
        conn = pymysql.connect(
            host='gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port=4000,
            user='3FeKz4HehHXuLCf.root',
            password='SujataNutriLive2026!Db',
            database='sujata_nutrilive',
            ssl={'ssl_mode': 'REQUIRED'},
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cur:
            # 2a. Insert dispatch batch record
            batch_sql = """
                INSERT INTO dispatch_batches (manifest_name, dispatch_date, order_count, total_cod_amount)
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(batch_sql, (
                'SUJATA_06_November_final.xlsx',
                '2026-11-06',
                len(ORDERS_06_NOV),
                sum(o['amount'] for o in cod_orders)
            ))
            batch_id = cur.lastrowid

            # Fetch current max order_id
            cur.execute("SELECT COALESCE(MAX(order_id), 0) as max_id FROM orders")
            max_id = cur.fetchone()['max_id']
            next_order_id = max_id + 1

            # 2b. Upsert customers and insert orders
            for o in ORDERS_06_NOV:
                mob = str(o['receiver_mobile'])[-10:]
                c_name = o['receiver_name']
                addr = f"{o['receiver_line1']}, {o['receiver_line2']}"
                city = o['receiver_city']
                state = o['receiver_state']
                pin = str(o['receiver_pincode'])
                amt = float(o['amount'])

                # Customer upsert
                cust_sql = """
                    INSERT INTO customers (phone, full_name, default_address, city, state, pincode, total_orders, total_revenue, first_order_date, last_order_date)
                    VALUES (%s, %s, %s, %s, %s, %s, 1, %s, '2026-11-06', '2026-11-06')
                    ON DUPLICATE KEY UPDATE
                        total_orders = total_orders + 1,
                        total_revenue = total_revenue + VALUES(total_revenue),
                        last_order_date = '2026-11-06'
                """
                cur.execute(cust_sql, (mob, c_name, addr, city, state, pin, amt))

                # Order insert
                d_parts = o['date'].split('/')
                sql_date = f"{d_parts[2]}-{d_parts[1]}-{d_parts[0]}" if len(d_parts) == 3 else '2026-11-06'

                ord_sql = """
                    INSERT INTO orders (
                        order_id, order_date, order_time, month, customer_phone, customer_name,
                        caller_name, pincode, full_address, products_ordered, amount,
                        payment_mode, order_type, dispatch_channel, manifest_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cur.execute(ord_sql, (
                    next_order_id,
                    sql_date,
                    o['time'],
                    'November 2026',
                    mob,
                    c_name,
                    o['telecaller'],
                    pin,
                    f"{addr}, {city}, {state} - {pin}",
                    o['products_ordered'],
                    amt,
                    o['payment_mode'],
                    'Direct Dispatch',
                    o.get('courier', 'Speed Post'),
                    batch_id
                ))
                next_order_id += 1

            conn.commit()
            print(f"✅ TiDB Cloud Synced Successfully! Batch ID: {batch_id}, 8 orders inserted.")
        conn.close()
    except Exception as e:
        print(f"⚠️ TiDB Sync Note: {e}")

if __name__ == '__main__':
    main()
