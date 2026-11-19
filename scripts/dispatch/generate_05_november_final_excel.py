"""
=============================================================================
🌿 SUJATA NUTRILIVE — OFFICIAL INDIA POST EXCEL GENERATOR (05 NOV 2026)
=============================================================================
Author: Antigravity AI Engineering
Source Data: Daily orders dispatch (4).zip (WhatsApp Chat Part 6: 04 Nov afternoon to 05 Nov morning)
Output Format: Exact India Post BNPL 4-Sheet Template:
  - ArticleDetails (48 standard columns)
  - PickupAddress (Untouched original template)
  - AltAddress (Untouched original template)
  - Information (Untouched original template)

Destinations:
  1. C:\\Users\\Admin\\Downloads\\SUJATA_05_November_final.xlsx
  2. F:\\RK\\Sujata Nutrilive\\dispatch_excel\\SUJATA_05_November_final.xlsx
  3. F:\\RK\\Sujata Nutrilive\\Daily orders dispatch\\reports\\SUJATA_05_November_final.xlsx
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
    r'C:\Users\Admin\Downloads\SUJATA_05_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_05_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\SUJATA_05_November_final.xlsx'
]

# Ensure output directories exist
for path in OUTPUT_DESTINATIONS:
    os.makedirs(os.path.dirname(path), exist_ok=True)

# 13 Verified Dispatch Orders from Part 6 (04 Nov afternoon to 05 Nov 11:15 AM)
ORDERS_05_NOV = [
    {
        "sr": 1,
        "telecaller": "Monu",
        "date": "04/11/2026",
        "time": "11:58",
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
        "receiver_name": "B Chandu",
        "receiver_company": None,
        "receiver_line1": "shiva takis, Karimnagar",
        "receiver_line2": "Jagtiyal District, Jagtial",
        "receiver_city": "Jagtial",
        "receiver_state": "TELANGANA",
        "receiver_pincode": 505501,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9700559666,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "1400/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "B12 + sea buckthorn + shilajit",
        "amount": 1400,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "sr": 2,
        "telecaller": "Vaishnavi Diwate",
        "date": "04/11/2026",
        "time": "14:27",
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
        "receiver_name": "Anil ghule",
        "receiver_company": None,
        "receiver_line1": "Hindustan awsa sacter3/s/2/1",
        "receiver_line2": "Nakshatra wadi, Chatrapati Sambhaji Nagar",
        "receiver_city": "Chhatrapati Sambhaji Nagar",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 431001,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9890656217,
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
        "products_ordered": "3 month combo (3 spirulina capsule + 3 sea buckthorn capsule) + Free gift Chikki",
        "amount": 2200,
        "payment_mode": "Prepaid",
        "courier": "Blue Dart / Speed Post"
    },
    {
        "sr": 3,
        "telecaller": "Monu",
        "date": "04/11/2026",
        "time": "14:44",
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
        "receiver_name": "Ashok Nagnath Kumthekar",
        "receiver_company": None,
        "receiver_line1": "BLDG NO. 1 C/701, Shankeshwar Palms",
        "receiver_line2": "Kumbharkhan Pada, Khandoba Mandir, Dombivli West, Kalyan, Thane",
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
        "receiver_mobile": 8976388434,
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
        "products_ordered": "3 months combo Spirulina capsules (Prepaid Replacement/Reorder)",
        "amount": 0,
        "payment_mode": "Prepaid",
        "courier": "Speed Post"
    },
    {
        "sr": 4,
        "telecaller": "Yash Suryawanshi (Founder Direct)",
        "date": "04/11/2026",
        "time": "17:00",
        "barcode": None,
        "weight": 2500,
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
        "receiver_name": "sulai nadan therapy center",
        "receiver_company": "Sulai Nandan Therapy Sentar",
        "receiver_line1": "Sulai nandan Therapy sentar, Parshioni",
        "receiver_line2": "Chatrapati Shiwaji Maharaj Chauk - 492",
        "receiver_city": "Parshioni",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 441105,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 8007341215,
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
        "products_ordered": "Seabuckthorn Cap 15 + Spirulina 120 Tab 15 (Distributor 30 Bottles)",
        "amount": 7560,
        "payment_mode": "Prepaid",
        "courier": "Shadowfox / Speed Post"
    },
    {
        "sr": 5,
        "telecaller": "Punam Kasture",
        "date": "04/11/2026",
        "time": "17:11",
        "barcode": None,
        "weight": 1200,
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
        "receiver_name": "Ganesh Shelar",
        "receiver_company": None,
        "receiver_line1": "Koyna Society, Khed Phata",
        "receiver_line2": "Near Satara Textile Market, Satara",
        "receiver_city": "Satara",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 415002,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 8626033710,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "2080/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Spirulina Tab 120 – 6 + Spirulina Capsules 60 - 4 (10 bottles)",
        "amount": 2080,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "sr": 6,
        "telecaller": "Monu",
        "date": "04/11/2026",
        "time": "17:18",
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
        "receiver_name": "K Babu Basha",
        "receiver_company": None,
        "receiver_line1": "Kaleemulla 15-1534, Sowcarpet",
        "receiver_line2": "C B Road, Chittoor",
        "receiver_city": "Chittoor",
        "receiver_state": "ANDHRA PRADESH",
        "receiver_pincode": 517001,
        "receiver_email": None,
        "receiver_alt": "7386210786",
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9440210786,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "1080/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "One month pack Spirulina Capsule 1 + Sea Buckthorn Capsule 1",
        "amount": 1080,
        "payment_mode": "COD",
        "courier": "DTDC / Speed Post"
    },
    {
        "sr": 7,
        "telecaller": "Punam Kasture",
        "date": "04/11/2026",
        "time": "17:29",
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
        "receiver_name": "Anil Uddhav Bhambishte",
        "receiver_company": None,
        "receiver_line1": "12/269, Bunglow Road, Near HDFC Bank",
        "receiver_line2": "National Mandap, Ichalkaranji",
        "receiver_city": "Ichalkaranji",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 416115,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9922832191,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "2200/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "3 Month Combo (Spirulina Capsules 60 – 3 + Sea Buckthorn Capsules 60 – 3) + Free Gift Chikki",
        "amount": 2200,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "sr": 8,
        "telecaller": "Monu",
        "date": "04/11/2026",
        "time": "17:42",
        "barcode": None,
        "weight": 600,
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
        "receiver_name": "Rajdev Singh Jat",
        "receiver_company": None,
        "receiver_line1": "Shop no 1, Ratua Ratanpur",
        "receiver_line2": "Berasiya Road, Bhopal",
        "receiver_city": "Bhopal",
        "receiver_state": "MADHYA PRADESH",
        "receiver_pincode": 462101,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 8827062595,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "2200/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "3 Months Combo (Spirulina 60 - 3 + Sea Buckthorn 60 - 3) + Free gifts: Kesuda Soap 2 + Spiruglow Soap 1 + Spirulina Chikki 1",
        "amount": 2200,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "sr": 9,
        "telecaller": "Manjushree Kasture",
        "date": "04/11/2026",
        "time": "18:41",
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
        "receiver_name": "Digambar S. Ghogale",
        "receiver_company": None,
        "receiver_line1": "A/203, 2nd Floor, New Foram Co-operative Society",
        "receiver_line2": "Jaihind Colony, Ghanshyam Gupte Road, Dombivli West",
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
        "receiver_mobile": 7021536092,
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
        "products_ordered": "2 Month Combo – Spirulina Capsules 2 + Sea Buckthorn Capsules 2 + Spirulina Soap 1 + Toothpaste 1",
        "amount": 1550,
        "payment_mode": "COD",
        "courier": "Indian Post"
    },
    {
        "sr": 10,
        "telecaller": "Manjushree Kasture (Website Order #1040)",
        "date": "05/11/2026",
        "time": "09:39",
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
        "receiver_name": "Eisha Goel",
        "receiver_company": None,
        "receiver_line1": "J 107, south extension part 1",
        "receiver_line2": "New Delhi",
        "receiver_city": "New Delhi",
        "receiver_state": "DELHI",
        "receiver_pincode": 110049,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9911399995,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "350/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Sujata Pure Organic Spirulina Powder (100g) (100g Pouch) × 1 (Shopify #1040)",
        "amount": 350,
        "payment_mode": "COD",
        "courier": "Indian Post"
    },
    {
        "sr": 11,
        "telecaller": "Vaishnavi Diwate",
        "date": "05/11/2026",
        "time": "09:51",
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
        "receiver_name": "Madan Janardan Gite",
        "receiver_company": None,
        "receiver_line1": "Bramhanwade, Tal - Sinner",
        "receiver_line2": "District - Nashik",
        "receiver_city": "Sinnar",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 422102,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9158670262,
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
        "products_ordered": "9 Month Combo (9 Spirulina cap + 9 Sea buckthorn cap) + 1 D3 + 1 B12 + Free gift: 3 tooth paste + 3 soap",
        "amount": 7600,
        "payment_mode": "Prepaid",
        "courier": "Speed Post"
    },
    {
        "sr": 12,
        "telecaller": "Punam Kasture",
        "date": "05/11/2026",
        "time": "10:58",
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
        "receiver_name": "Bhimrao Saudagar Pakhare",
        "receiver_company": None,
        "receiver_line1": "A-23, Jawan Nagar",
        "receiver_line2": "Vijapur Road, Solapur",
        "receiver_city": "Solapur",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 413004,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9960581946,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "1180/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "Spirulina Tablet 120 - 1 + Vitamin B12 - 1 + Toothpaste + Bath Soap + Spirulina Facepack",
        "amount": 1180,
        "payment_mode": "COD",
        "courier": "Speed Post"
    },
    {
        "sr": 13,
        "telecaller": "Punam Kasture",
        "date": "05/11/2026",
        "time": "11:11",
        "barcode": None,
        "weight": 500,
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
        "receiver_name": "Vishnu Kisanrao Gore",
        "receiver_company": None,
        "receiver_line1": "Swami Bangla, Agasti Sugar Factory Road",
        "receiver_line2": "Nishigandha Colony, At Post Akole, Taluka Akole, Dist Ahilyanagar",
        "receiver_city": "Akole",
        "receiver_state": "MAHARASHTRA",
        "receiver_pincode": 422601,
        "receiver_email": None,
        "receiver_alt": None,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": 9890813943,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD",
        "cod_val": "2400/-",
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": "3 Spirulina Tab 120 + 3 Seabukthron Capsule 60 + Free Gift: Toothpaste + Bath Soap",
        "amount": 2400,
        "payment_mode": "COD",
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
    print("🚀 SUJATA NUTRILIVE — GENERATING OFFICIAL INDIA POST EXCEL (05 NOV 2026)")
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

    # Insert 13 new verified dispatch orders
    for idx, o in enumerate(ORDERS_05_NOV, 2):
        row_values = build_row_list(o)
        for c_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=idx, column=c_idx)
            cell.value = val  # Explicitly sets None if val is None
            cell.font = copy.copy(proto_font)
            cell.alignment = proto_align
            cell.border = copy.copy(proto_border)

    # Delete any leftover rows beyond the inserted orders
    final_data_row = len(ORDERS_05_NOV) + 1  # Header (1) + 13 Orders = Row 14
    if ws.max_row > final_data_row:
        ws.delete_rows(final_data_row + 1, ws.max_row - final_data_row)

    # Save to all destination locations
    for dest in OUTPUT_DESTINATIONS:
        wb.save(dest)
        print(f"✅ Generated & Saved: {dest}")

    print(f"📑 Sheets Verified: {wb.sheetnames}")
    print(f"📊 Orders Processed: {len(ORDERS_05_NOV)} Orders")
    cod_orders = [o for o in ORDERS_05_NOV if o['payment_mode'] == 'COD']
    prepaid_orders = [o for o in ORDERS_05_NOV if o['payment_mode'] == 'Prepaid']
    print(f"💰 Total COD Amount to Collect: ₹{sum(o['amount'] for o in cod_orders):,} ({len(cod_orders)} COD Orders)")
    print(f"💳 Total Prepaid Revenue: ₹{sum(o['amount'] for o in prepaid_orders):,} ({len(prepaid_orders)} Prepaid Orders)")
    print(f"🌟 Grand Total Value: ₹{sum(o['amount'] for o in ORDERS_05_NOV):,}")
    print("=" * 75)

    # 1. Update local database file
    db_nov_path = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_27.json'
    prev_nov_path = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_14.json'
    
    prev_nov = []
    if os.path.exists(prev_nov_path):
        with open(prev_nov_path, 'r', encoding='utf-8') as f:
            prev_nov = json.load(f)

    sr_start = len(prev_nov) + 321  # 320 in Oct + previous nov
    new_db_orders = []
    for idx, o in enumerate(ORDERS_05_NOV, sr_start):
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
            "manifest_name": "SUJATA_05_November_final.xlsx"
        })

    combined_nov = prev_nov + new_db_orders
    with open(db_nov_path, 'w', encoding='utf-8') as f:
        json.dump(combined_nov, f, indent=2, ensure_ascii=False)
    print(f"💾 Updated Local Database: {db_nov_path} ({len(combined_nov)} November orders)")

    # 2. Sync to TiDB Serverless Cloud
    print("\n☁️ Syncing 13 New Orders to TiDB Cloud Database...")
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
                'SUJATA_05_November_final.xlsx',
                '2026-11-05',
                len(ORDERS_05_NOV),
                sum(o['amount'] for o in cod_orders)
            ))
            batch_id = cur.lastrowid

            # Fetch current max order_id
            cur.execute("SELECT COALESCE(MAX(order_id), 0) as max_id FROM orders")
            max_id = cur.fetchone()['max_id']
            next_order_id = max_id + 1

            # 2b. Upsert customers and insert orders
            for o in ORDERS_05_NOV:
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
                    VALUES (%s, %s, %s, %s, %s, %s, 1, %s, '2026-11-05', '2026-11-05')
                    ON DUPLICATE KEY UPDATE
                        total_orders = total_orders + 1,
                        total_revenue = total_revenue + VALUES(total_revenue),
                        last_order_date = '2026-11-05'
                """
                cur.execute(cust_sql, (mob, c_name, addr, city, state, pin, amt))

                # Order insert
                d_parts = o['date'].split('/')
                sql_date = f"{d_parts[2]}-{d_parts[1]}-{d_parts[0]}" if len(d_parts) == 3 else '2026-11-05'

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
            print(f"✅ TiDB Cloud Synced Successfully! Batch ID: {batch_id}, 13 orders inserted.")
        conn.close()
    except Exception as e:
        print(f"⚠️ TiDB Sync Note: {e}")

if __name__ == '__main__':
    main()
