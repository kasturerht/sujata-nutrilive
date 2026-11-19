"""
=============================================================================
🌿 SUJATA NUTRILIVE — OFFICIAL INDIA POST EXCEL GENERATOR (17 NOV 2026)
=============================================================================
Author: Antigravity AI Engineering
Source Data: Daily orders dispatch (6).zip (WhatsApp Chat: 06 Nov afternoon to 17 Nov morning)
Output Format: Exact India Post BNPL 4-Sheet Template:
  - ArticleDetails (48 standard columns)
  - PickupAddress (Untouched original template)
  - AltAddress (Untouched original template)
  - Information (Untouched original template)

Destinations:
  1. C:\\Users\\Admin\\Downloads\\SUJATA_17_November_final.xlsx
  2. F:\\RK\\Sujata Nutrilive\\dispatch_excel\\SUJATA_17_November_final.xlsx
  3. F:\\RK\\Sujata Nutrilive\\Daily orders dispatch\\reports\\SUJATA_17_November_final.xlsx
=============================================================================
"""

import os
import sys
import copy
import json
import re
from datetime import datetime
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
import pymysql

sys.stdout.reconfigure(encoding='utf-8')

TEMPLATE_FILE = r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_06_November_final.xlsx'
if not os.path.exists(TEMPLATE_FILE):
    TEMPLATE_FILE = r'C:\Users\Admin\.gemini\antigravity\brain\71a2db4c-5724-4f2e-94d9-9aa036757079\.user_uploaded\media_1793598932274_d37b67a2.xlsx'

OUTPUT_DESTINATIONS = [
    r'C:\Users\Admin\Downloads\SUJATA_17_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_17_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\SUJATA_17_November_final.xlsx'
]

for p in OUTPUT_DESTINATIONS:
    os.makedirs(os.path.dirname(p), exist_ok=True)

# Helper functions
def guess_state_from_text(addr_text, pincode):
    t = addr_text.lower()
    p = str(pincode)[:2] if pincode else ""
    pin_prefix_map = {
        '40': 'MAHARASHTRA', '41': 'MAHARASHTRA', '42': 'MAHARASHTRA', '43': 'MAHARASHTRA', '44': 'MAHARASHTRA',
        '38': 'GUJARAT', '39': 'GUJARAT',
        '50': 'TELANGANA', '51': 'ANDHRA PRADESH', '52': 'ANDHRA PRADESH', '53': 'ANDHRA PRADESH',
        '56': 'KARNATAKA', '57': 'KARNATAKA', '58': 'KARNATAKA', '59': 'KARNATAKA',
        '11': 'DELHI', '12': 'HARYANA', '13': 'HARYANA',
        '14': 'PUNJAB', '15': 'PUNJAB', '16': 'PUNJAB',
        '24': 'UTTAR PRADESH', '20': 'UTTAR PRADESH', '21': 'UTTAR PRADESH', '22': 'UTTAR PRADESH',
        '25': 'UTTAR PRADESH', '26': 'UTTAR PRADESH', '27': 'UTTAR PRADESH', '28': 'UTTAR PRADESH',
        '45': 'MADHYA PRADESH', '46': 'MADHYA PRADESH', '47': 'MADHYA PRADESH', '48': 'MADHYA PRADESH',
        '30': 'RAJASTHAN', '31': 'RAJASTHAN', '32': 'RAJASTHAN', '33': 'RAJASTHAN', '34': 'RAJASTHAN',
        '70': 'WEST BENGAL', '71': 'WEST BENGAL', '72': 'WEST BENGAL', '73': 'WEST BENGAL', '74': 'WEST BENGAL',
    }
    if p in pin_prefix_map: return pin_prefix_map[p]
    if any(k in t for k in ['maharashtra', 'mumbai', 'pune', 'nashik', 'thane', 'dombivali', 'jalgaon', 'solapur', 'kolhapur']): return 'MAHARASHTRA'
    if any(k in t for k in ['gujarat', 'surat', 'ahmedabad']): return 'GUJARAT'
    if any(k in t for k in ['karnataka', 'belgaum', 'bangalore']): return 'KARNATAKA'
    if any(k in t for k in ['telangana', 'hyderabad']): return 'TELANGANA'
    if 'haryana' in t or 'ambala' in t: return 'HARYANA'
    if 'uttar pradesh' in t: return 'UTTAR PRADESH'
    return 'MAHARASHTRA'

def split_address(full_addr):
    full_addr = full_addr.strip().strip(',').strip()
    if len(full_addr) <= 45:
        return full_addr, ""
    parts = [p.strip() for p in full_addr.split(',') if p.strip()]
    l1, l2 = "", ""
    for p in parts:
        if len(l1) + len(p) + 2 <= 45 and not l2:
            l1 = (l1 + ", " + p).strip(", ")
        else:
            l2 = (l2 + ", " + p).strip(", ")
    if not l1 and l2:
        l1 = l2[:45]
        l2 = l2[45:]
    return l1[:50], l2[:50]

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
            return candidate
    return parts[0] if parts else "NASHIK"

def estimate_weight(prod_str):
    p = prod_str.lower()
    if '3 month' in p or '3 months' in p or '60 (3)' in p:
        return 550
    elif '2 month' in p or '2 months' in p or '4 ' in p or '2 spirulina' in p:
        return 400
    elif '1 month' in p or '1months' in p:
        return 250
    elif '5 ' in p:
        return 500
    return 350

# Load raw parsed orders
with open(r'f:\RK\Sujata Nutrilive\sujata-nutrilive\scratch\all_extracted_orders_final.json', 'r', encoding='utf-8') as f:
    RAW_ORDERS = json.load(f)

# Also load raw text to get original dates and multiple phones
with open(r'f:\RK\Sujata Nutrilive\sujata-nutrilive\scripts\whatsapp_dispatch_nov17\chat.txt', 'r', encoding='utf-8') as f:
    chat_text = f.read()

ORDERS_17_NOV = []

for idx, r in enumerate(RAW_ORDERS, 1):
    ts = r['timestamp'] # e.g. '11/6/26, 1:56:26 PM'
    # Parse date and time
    dt_match = re.match(r'(\d{1,2})/(\d{1,2})/(\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?\s*[AP]M)', ts)
    if dt_match:
        m, d, y, t = dt_match.groups()
        full_year = '20' + y if len(y) == 2 else y
        formatted_date = f"{int(d):02d}/{int(m):02d}/{full_year}"
        sql_date = f"{full_year}-{int(m):02d}-{int(d):02d}"
        formatted_time = t
    else:
        formatted_date = "17/11/2026"
        sql_date = "2026-11-17"
        formatted_time = "12:00 PM"

    # Multi-phone check
    raw_mob = str(r['mobile'])
    mobiles = re.findall(r'(\d{10})', raw_mob)
    clean_mob = int(mobiles[0]) if mobiles else 9999999999
    alt_mob = str(mobiles[1]) if len(mobiles) > 1 else None

    # Handle Office Pickups
    full_addr = r['address']
    pincode = r['pincode']
    if r['is_office']:
        if not pincode: pincode = 422007
        if not full_addr or 'visit office' in full_addr.lower():
            full_addr = "Self Pickup - Sujata Nutrilive Agrotech Office, Nashik"
        state = "MAHARASHTRA"
        city = "Nashik"
    else:
        state = guess_state_from_text(full_addr, pincode)
        city = extract_city(full_addr, state)

    l1, l2 = split_address(full_addr)
    weight = estimate_weight(r['product'])
    
    # Amount & payment
    amt = int(r['amount'])
    pmode = r['payment_mode'].title()
    is_cod = (pmode.upper() == 'COD') and (amt > 0)
    
    order_obj = {
        "sr": idx,
        "telecaller": r['telecaller'],
        "date": formatted_date,
        "sql_date": sql_date,
        "time": formatted_time,
        "barcode": None,
        "weight": weight,
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
        "receiver_name": r['name'].strip('.').strip(),
        "receiver_company": None,
        "receiver_line1": l1,
        "receiver_line2": l2,
        "receiver_city": city,
        "receiver_state": state,
        "receiver_pincode": int(pincode) if pincode else 422007,
        "receiver_email": None,
        "receiver_alt": alt_mob,
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": clean_mob,
        "prepay_code": None,
        "prepay_val": None,
        "cod_code": "COD" if is_cod else None,
        "cod_val": f"{amt}/-" if is_cod else None,
        "insurance_type": None,
        "insurance_val": None,
        "ack": False,
        "registration": True,
        "otp_delivery": True,
        "bulk_ref": None,
        "products_ordered": r['product'],
        "amount": amt,
        "payment_mode": "COD" if is_cod else "Prepaid",
        "courier": r.get('courier', 'Speed Post'),
        "is_office": r['is_office'],
        "is_website": r['is_website']
    }
    ORDERS_17_NOV.append(order_obj)

print(f"Prepared {len(ORDERS_17_NOV)} orders for Excel & DB processing.")

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
    print("🚀 SUJATA NUTRILIVE — GENERATING OFFICIAL INDIA POST EXCEL (17 NOV 2026)")
    print("=" * 75)

    if not os.path.exists(TEMPLATE_FILE):
        print(f"❌ Error: Template file not found: {TEMPLATE_FILE}")
        return

    print(f"📄 Loading Template: {TEMPLATE_FILE}")
    wb = openpyxl.load_workbook(TEMPLATE_FILE)
    ws = wb['ArticleDetails']

    proto_font = copy.copy(ws.cell(row=2, column=1).font)
    proto_align = Alignment(horizontal='center', vertical='center')
    proto_border = copy.copy(ws.cell(row=2, column=1).border)

    # Insert all 67 orders
    for idx, o in enumerate(ORDERS_17_NOV, 2):
        row_values = build_row_list(o)
        for c_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=idx, column=c_idx)
            cell.value = val
            cell.font = copy.copy(proto_font)
            cell.alignment = proto_align
            cell.border = copy.copy(proto_border)

    final_data_row = len(ORDERS_17_NOV) + 1
    if ws.max_row > final_data_row:
        ws.delete_rows(final_data_row + 1, ws.max_row - final_data_row)

    # Save to all destination locations
    for dest in OUTPUT_DESTINATIONS:
        wb.save(dest)
        print(f"✅ Generated & Saved: {dest}")

    print(f"📑 Sheets Verified: {wb.sheetnames}")
    print(f"📊 Orders Processed: {len(ORDERS_17_NOV)} Orders")
    cod_orders = [o for o in ORDERS_17_NOV if o['payment_mode'] == 'COD']
    prepaid_orders = [o for o in ORDERS_17_NOV if o['payment_mode'] == 'Prepaid']
    total_cod_amt = sum(o['amount'] for o in cod_orders)
    total_prepaid_amt = sum(o['amount'] for o in prepaid_orders)
    grand_total = sum(o['amount'] for o in ORDERS_17_NOV)

    print(f"💰 Total COD Amount to Collect: ₹{total_cod_amt:,} ({len(cod_orders)} COD Orders)")
    print(f"💳 Total Prepaid Revenue: ₹{total_prepaid_amt:,} ({len(prepaid_orders)} Prepaid Orders)")
    print(f"🌟 Grand Total Value: ₹{grand_total:,}")
    print("=" * 75)

    # 1. Update local database
    db_nov_path = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_102.json'
    prev_nov_path = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_35.json'
    os.makedirs(os.path.dirname(db_nov_path), exist_ok=True)

    prev_nov = []
    if os.path.exists(prev_nov_path):
        with open(prev_nov_path, 'r', encoding='utf-8') as f:
            prev_nov = json.load(f)

    sr_start = len(prev_nov) + 321
    new_db_orders = []
    for idx, o in enumerate(ORDERS_17_NOV, sr_start):
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
            "order_type": "Office Pickup" if o['is_office'] else ("Website Direct" if o['is_website'] else "Direct Dispatch"),
            "dispatch_channel": o["courier"],
            "manifest_name": "SUJATA_17_November_final.xlsx"
        })

    combined_nov = prev_nov + new_db_orders
    with open(db_nov_path, 'w', encoding='utf-8') as f:
        json.dump(combined_nov, f, indent=2, ensure_ascii=False)
    print(f"💾 Updated Local Database: {db_nov_path} ({len(combined_nov)} total November orders)")

    # 2. Sync to TiDB Cloud Database
    print(f"\n☁️ Syncing {len(ORDERS_17_NOV)} New Orders to TiDB Cloud Database...")
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
            # Insert dispatch batch record
            batch_sql = """
                INSERT INTO dispatch_batches (manifest_name, dispatch_date, order_count, total_cod_amount)
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(batch_sql, (
                'SUJATA_17_November_final.xlsx',
                '2026-11-17',
                len(ORDERS_17_NOV),
                total_cod_amt
            ))
            batch_id = cur.lastrowid
            print(f"  📌 Created Dispatch Batch ID: {batch_id}")

            # Get max order_id
            cur.execute("SELECT COALESCE(MAX(order_id), 0) as max_id FROM orders")
            max_id = cur.fetchone()['max_id']
            next_order_id = max_id + 1

            for o in ORDERS_17_NOV:
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
                    VALUES (%s, %s, %s, %s, %s, %s, 1, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        total_orders = total_orders + 1,
                        total_revenue = total_revenue + VALUES(total_revenue),
                        last_order_date = %s
                """
                cur.execute(cust_sql, (mob, c_name, addr, city, state, pin, amt, o['sql_date'], o['sql_date'], o['sql_date']))

                # Order insert
                ord_sql = """
                    INSERT INTO orders (
                        order_id, order_date, order_time, month, customer_phone, customer_name,
                        caller_name, pincode, full_address, products_ordered, amount,
                        payment_mode, order_type, dispatch_channel, manifest_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                order_type_str = "Office Pickup" if o['is_office'] else ("Website Direct" if o['is_website'] else "Direct Dispatch")
                cur.execute(ord_sql, (
                    next_order_id,
                    o['sql_date'],
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
                    order_type_str,
                    o['courier'],
                    batch_id
                ))
                next_order_id += 1

            conn.commit()
            print(f"✅ TiDB Cloud Synced Successfully! Batch ID: {batch_id}, {len(ORDERS_17_NOV)} orders inserted (Order IDs {max_id+1} to {next_order_id-1}).")
        conn.close()
    except Exception as e:
        print(f"⚠️ TiDB Sync Note: {e}")

if __name__ == '__main__':
    main()
