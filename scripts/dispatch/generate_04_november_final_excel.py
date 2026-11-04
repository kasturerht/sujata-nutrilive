"""
=============================================================================
🌿 SUJATA NUTRILIVE — OFFICIAL INDIA POST EXCEL GENERATOR (04 NOV 2026)
=============================================================================
Author: Antigravity AI Engineering
Source Data: Daily orders dispatch (3).zip (WhatsApp Chat Part 5: 03 Nov to 04 Nov)
Output Format: Exact India Post BNPL 4-Sheet Template:
  - ArticleDetails (48 standard columns)
  - PickupAddress (Untouched original template)
  - AltAddress (Untouched original template)
  - Information (Untouched original template)

Destinations:
  1. C:\\Users\\Admin\\Downloads\\SUJATA_04_November_final.xlsx
  2. F:\\RK\\Sujata Nutrilive\\dispatch_excel\\SUJATA_04_November_final.xlsx
  3. F:\\RK\\Sujata Nutrilive\\Daily orders dispatch\\reports\\SUJATA_04_November_final.xlsx
=============================================================================
"""

import os
import sys
import copy
import json
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill

sys.stdout.reconfigure(encoding='utf-8')

TEMPLATE_FILE = r'C:\Users\Admin\.gemini\antigravity\brain\71a2db4c-5724-4f2e-94d9-9aa036757079\.user_uploaded\media_1793598932274_d37b67a2.xlsx'
if not os.path.exists(TEMPLATE_FILE):
    TEMPLATE_FILE = r'C:\Users\Admin\Downloads\SUJATA 11 Octobar.xlsx'

OUTPUT_DESTINATIONS = [
    r'C:\Users\Admin\Downloads\SUJATA_04_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_04_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\SUJATA_04_November_final.xlsx'
]

# Ensure output directories exist
for path in OUTPUT_DESTINATIONS:
    os.makedirs(os.path.dirname(path), exist_ok=True)

# 8 Verified Dispatch Orders from Part 5 (03 Nov afternoon to 04 Nov morning)
ORDERS_04_NOV = [
    {
        "sr": 1,
        "telecaller": "Karishma Patil",
        "date": "03/11/2026",
        "time": "12:16",
        "barcode": None,
        "weight": 220,
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
        "receiver_name": "Sandeep Kashinath Kakad",
        "receiver_company": None,
        "receiver_line1": "275 subhash road",
        "receiver_line2": "Bhagur, Nashik",
        "receiver_city": "Bhagur",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 422502,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9373269934,
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
        "products_ordered": "Spirulina capsules + Sea Buckthorn capsule Combo 1 Month Pack + Free gift toothpaste",
        "amount": 1050,
        "payment_mode": "COD"
    },
    {
        "sr": 2,
        "telecaller": "Karishma Patil",
        "date": "03/11/2026",
        "time": "16:13",
        "barcode": None,
        "weight": 220,
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
        "receiver_name": "Dilip Gavit",
        "receiver_company": None,
        "receiver_line1": "Vadali Bhoi, Khadak",
        "receiver_line2": "Ozar road, District Nashik",
        "receiver_city": "Vadali Bhoi",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 423117,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9373003942,
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
        "products_ordered": "Spirulina capsules + Sea Buckthorn capsule Combo 1 Month Pack + Free gift toothpaste",
        "amount": 1050,
        "payment_mode": "COD"
    },
    {
        "sr": 3,
        "telecaller": "Vaishnavi Diwate",
        "date": "03/11/2026",
        "time": "16:19",
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
        "receiver_name": "Shriram Patil",
        "receiver_company": None,
        "receiver_line1": "Radha krushna housing society",
        "receiver_line2": "Bhanvaj road, Khopoli, Tal Khalapur, Raigad",
        "receiver_city": "Khopoli",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 410203,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 7507701725,
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
        "products_ordered": "2 month combo Spirulina capsule + Sea buckthorn capsule + 1 Spirulina soap + 1 Tooth paste",
        "amount": 1600,
        "payment_mode": "COD"
    },
    {
        "sr": 4,
        "telecaller": "Manjushree Kasture",
        "date": "03/11/2026",
        "time": "18:56",
        "barcode": None,
        "weight": 320,
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
        "receiver_name": "Ramchandra Dinesh Humane",
        "receiver_company": None,
        "receiver_line1": "Main Road, Near Yashodatt Mangal Karyalaya",
        "receiver_line2": "Bagani, Post Bagani, Taluka Walwa, Dist Sangli",
        "receiver_city": "Bagani",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 416302,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 8390131438,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "999/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Spirulina Capsules + Sea Buckthorn Capsules + Moringa Tablets",
        "amount": 999,
        "payment_mode": "COD"
    },
    {
        "sr": 5,
        "telecaller": "Manjushree Kasture",
        "date": "04/11/2026",
        "time": "00:36",
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
        "receiver_name": "O Shankar",
        "receiver_company": None,
        "receiver_line1": "H No. 21-2-67/1/A, Markendeya Colony",
        "receiver_line2": "Godavarikhani, Ramagundam, Dist Peddapalli",
        "receiver_city": "Godavarikhani",
        "receiver_state": "TELANGANA",
        "receiver_pincode": 505209,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9160577555,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "1550/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "2 Months Combo Pack – Spirulina Capsules (2) + Sea Buckthorn Capsules (2) + Spirulina Toothpaste (1) + Spirulina Soap (2)",
        "amount": 1550,
        "payment_mode": "COD"
    },
    {
        "sr": 6,
        "telecaller": "Manjushree Kasture",
        "date": "04/11/2026",
        "time": "07:26",
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
        "receiver_name": "Rajendra Bajrang Khatal",
        "receiver_company": None,
        "receiver_line1": "125, Bhairu Vasti, Limayewadi",
        "receiver_line2": "Near Sushil Marathi School, Solapur",
        "receiver_city": "Solapur",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 413001,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9975960467,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "1550/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "2 Months Combo Pack – Spirulina Capsules (2) + Sea Buckthorn Capsules (2) + Spirulina Toothpaste (1) + Spirulina Soap (1)",
        "amount": 1550,
        "payment_mode": "COD"
    },
    {
        "sr": 7,
        "telecaller": "Punam Kasture",
        "date": "04/11/2026",
        "time": "10:27",
        "barcode": None,
        "weight": 1800,
        "shape": "NROL",
        "length": 25, "breadth": 20, "height": 15,
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
        "receiver_name": "Vaidya Dattatray Janardhan Chougule",
        "receiver_company": None,
        "receiver_line1": "Shivam Yog Naturopathy Centre",
        "receiver_line2": "Near Asa Bikaner, Mangrulpir, Dist Washim",
        "receiver_city": "Mangrulpir",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 444403,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9881804963,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "4200/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Sea Buckthorn Capsule – 6 + Spirulina Tab – 7 + 1 Toothpaste + 1 Bath Soap (Total 13 bottles)",
        "amount": 4200,
        "payment_mode": "COD"
    },
    {
        "sr": 8,
        "telecaller": "Punam Kasture",
        "date": "04/11/2026",
        "time": "10:42",
        "barcode": None,
        "weight": 180,
        "shape": "NROL",
        "length": 15, "breadth": 15, "height": 10,
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
        "receiver_name": "Rajendra T. Parshuramkar",
        "receiver_company": None,
        "receiver_line1": "At Post Khodsiwani",
        "receiver_line2": "Taluka Sadak Arjuni, District Gondia",
        "receiver_city": "Sadak Arjuni",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 441801,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9765266867,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "450/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Spirulina 120 Tablets",
        "amount": 450,
        "payment_mode": "COD"
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
    print("🚀 SUJATA NUTRILIVE — GENERATING OFFICIAL INDIA POST EXCEL (04 NOV 2026)")
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
    for idx, o in enumerate(ORDERS_04_NOV, 2):
        row_values = build_row_list(o)
        for c_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=idx, column=c_idx, value=val)
            cell.font = copy.copy(proto_font)
            cell.alignment = proto_align
            cell.border = copy.copy(proto_border)

    # Delete any leftover rows beyond the inserted orders
    final_data_row = len(ORDERS_04_NOV) + 1  # Header (1) + 8 Orders = Row 9
    if ws.max_row > final_data_row:
        ws.delete_rows(final_data_row + 1, ws.max_row - final_data_row)

    # Save to all destination locations
    for dest in OUTPUT_DESTINATIONS:
        wb.save(dest)
        print(f"✅ Generated & Saved: {dest}")

    print(f"📑 Sheets Verified: {wb.sheetnames}")
    print(f"📊 Orders Processed: {len(ORDERS_04_NOV)} Orders")
    print(f"💰 Total COD Amount to Collect: ₹{sum(o['amount'] for o in ORDERS_04_NOV):,}")
    print("=" * 75)

    # Update database
    db_path = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_14.json'
    with open(r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_6.json', 'r', encoding='utf-8') as f:
        prev_nov = json.load(f)

    # Add the 8 orders to november
    sr_start = 327
    new_db_orders = []
    for idx, o in enumerate(ORDERS_04_NOV, sr_start):
        new_db_orders.append({
            "sr_no": idx,
            "month": "November 2026",
            "date": o["date"],
            "time": o["time"],
            "telecaller": o["telecaller"],
            "customer_name": o["receiver_name"],
            "mobile_number": str(o["receiver_mobile"]),
            "pincode": str(o["receiver_pincode"]),
            "full_address": f"{o['receiver_line1']}, {o['receiver_line2']}, {o['receiver_city']}, {o['receiver_state']} - {o['receiver_pincode']}",
            "products_ordered": o["products_ordered"],
            "amount": o["amount"],
            "payment_mode": o["payment_mode"],
            "order_type": "Direct Dispatch (India Post)"
        })

    full_nov = prev_nov + new_db_orders
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(full_nov, f, indent=2, ensure_ascii=False)
    print(f"💾 Updated November Database: {db_path} ({len(full_nov)} orders)")

    # Update master orders 334
    master_path = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\master_orders_334.json'
    with open(r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\master_orders_326.json', 'r', encoding='utf-8') as f:
        master_326 = json.load(f)

    master_334 = master_326 + new_db_orders
    with open(master_path, 'w', encoding='utf-8') as f:
        json.dump(master_334, f, indent=2, ensure_ascii=False)
    print(f"💾 Updated Master Database: {master_path} ({len(master_334)} orders)")

if __name__ == '__main__':
    main()
