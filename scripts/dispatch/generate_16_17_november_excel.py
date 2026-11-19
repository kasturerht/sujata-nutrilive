"""
=============================================================================
🌿 SUJATA NUTRILIVE — OFFICIAL INDIA POST EXCEL GENERATOR (16-17 NOV 2026)
=============================================================================
Author: Antigravity AI Engineering
Scope: Strictly 16 November & 17 November (Morning) Orders
Output Format: Exact India Post BNPL 4-Sheet Template:
  - ArticleDetails (48 standard columns)
  - PickupAddress (Untouched original template)
  - AltAddress (Untouched original template)
  - Information (Untouched original template)

Destinations:
  1. C:\\Users\\Admin\\Downloads\\SUJATA_16_17_November_final.xlsx
  2. C:\\Users\\Admin\\Downloads\\SUJATA_17_November_final.xlsx
  3. F:\\RK\\Sujata Nutrilive\\dispatch_excel\\SUJATA_16_17_November_final.xlsx
  4. F:\\RK\\Sujata Nutrilive\\Daily orders dispatch\\reports\\SUJATA_16_17_November_final.xlsx
=============================================================================
"""

import os
import sys
import copy
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill

sys.stdout.reconfigure(encoding='utf-8')

TEMPLATE_FILE = r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_06_November_final.xlsx'

OUTPUT_DESTINATIONS = [
    r'C:\Users\Admin\Downloads\SUJATA_16_17_November_final.xlsx',
    r'C:\Users\Admin\Downloads\SUJATA_17_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_16_17_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\SUJATA_16_17_November_final.xlsx'
]

for p in OUTPUT_DESTINATIONS:
    os.makedirs(os.path.dirname(p), exist_ok=True)

ORDERS_16_17_NOV = [
    {
        "sr": 1,
        "telecaller": "Vaishnavi Diwate",
        "date": "16/11/2026",
        "time": "10:54 AM",
        "barcode": None,
        "weight": 250,
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
        "receiver_name": "Anita Vijay Mahajan",
        "receiver_company": None,
        "receiver_line1": "Plot no.44, Gate no.55, Behind vishal apartment",
        "receiver_line2": "Shiv colony, Jalgaon",
        "receiver_city": "Jalgaon",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 425001,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9172944023,
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
        "products_ordered": "2 Sea buckthorn capsule",
        "amount": 1000,
        "payment_mode": "Prepaid",
        "courier": "Speed Post"
    },
    {
        "sr": 2,
        "telecaller": "Website Direct (Forwarded by Manju)",
        "date": "16/11/2026",
        "time": "05:25 PM",
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
        "receiver_name": "Kapil vohra",
        "receiver_company": None,
        "receiver_line1": "Kapil eye hospital 240 vivek vihar",
        "receiver_line2": "Near police line chowk, Ambala city",
        "receiver_city": "Ambala city",
        "receiver_state": "HARYANA",
        "receiver_pincode": 134003,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9896424351,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "945/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Sujata Pure Organic Spirulina Powder (100g) (100g Pouch) × 3",
        "amount": 945,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "sr": 3,
        "telecaller": "Amazon Seller Central (Yash 17 Nov)",
        "date": "17/11/2026",
        "time": "11:30 AM",
        "barcode": None,
        "weight": 250,
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
        "receiver_name": "NEW SHIFA MEDICAL (Amazon: 171-2649080-2116302)",
        "receiver_company": "NEW SHIFA MEDICAL",
        "receiver_line1": "Amazon Order 171-2649080-2116302",
        "receiver_line2": "Tirupur-7",
        "receiver_city": "Tirupur",
        "receiver_state": "TAMIL NADU",
        "receiver_pincode": 641607,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9834783503,
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
        "products_ordered": "Sujata SpiruGlow Handmade Organic Bath Soap (100g) × 2",
        "amount": 120,
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
    print("🚀 SUJATA NUTRILIVE — GENERATING INDIA POST EXCEL (16-17 NOV 2026)")
    print("=" * 75)

    wb = openpyxl.load_workbook(TEMPLATE_FILE)
    ws = wb['ArticleDetails']

    # Remove any extra sheet if present
    if 'Amazon_Orders' in wb.sheetnames:
        del wb['Amazon_Orders']

    proto_font = copy.copy(ws.cell(row=2, column=1).font)
    proto_align = Alignment(horizontal='center', vertical='center')
    proto_border = copy.copy(ws.cell(row=2, column=1).border)

    for idx, o in enumerate(ORDERS_16_17_NOV, 2):
        row_values = build_row_list(o)
        for c_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=idx, column=c_idx)
            cell.value = val
            cell.font = copy.copy(proto_font)
            cell.alignment = proto_align
            cell.border = copy.copy(proto_border)

    final_data_row = len(ORDERS_16_17_NOV) + 1
    if ws.max_row > final_data_row:
        ws.delete_rows(final_data_row + 1, ws.max_row - final_data_row)

    for dest in OUTPUT_DESTINATIONS:
        wb.save(dest)
        print(f"✅ Generated & Saved: {dest}")

    print(f"📑 Sheets Verified: {wb.sheetnames}")
    print(f"📊 Orders in this Batch: {len(ORDERS_16_17_NOV)}")
    for o in ORDERS_16_17_NOV:
        print(f"  #{o['sr']} | {o['date']} {o['time']} | {o['receiver_name']} | {o['receiver_city']}, {o['receiver_state']} {o['receiver_pincode']} | ₹{o['amount']} ({o['payment_mode']})")

if __name__ == '__main__':
    main()
