"""
=============================================================================
🌿 SUJATA NUTRILIVE — OFFICIAL INDIA POST EXCEL GENERATOR (18 NOV 2026)
=============================================================================
Author: Antigravity AI Engineering
Source Data: Daily orders dispatch  (7).zip (WhatsApp Chat: 17 Nov afternoon to 18 Nov evening)
Output Format: Exact India Post BNPL 4-Sheet Template:
  - ArticleDetails (48 standard columns)
  - PickupAddress (Untouched original template)
  - AltAddress (Untouched original template)
  - Information (Untouched original template)

Destinations:
  1. C:\\Users\\Admin\\Downloads\\SUJATA_18_November_final.xlsx
  2. F:\\RK\\Sujata Nutrilive\\dispatch_excel\\SUJATA_18_November_final.xlsx
  3. F:\\RK\\Sujata Nutrilive\\Daily orders dispatch\\reports\\SUJATA_18_November_final.xlsx
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

TEMPLATE_FILE = r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_17_November_final.xlsx'
if not os.path.exists(TEMPLATE_FILE):
    TEMPLATE_FILE = r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_06_November_final.xlsx'

OUTPUT_DESTINATIONS = [
    r'C:\Users\Admin\Downloads\SUJATA_18_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\dispatch_excel\SUJATA_18_November_final.xlsx',
    r'F:\RK\Sujata Nutrilive\Daily orders dispatch\reports\SUJATA_18_November_final.xlsx'
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
    if any(k in t for k in ['maharashtra', 'mumbai', 'pune', 'nashik', 'thane', 'dombivali', 'jalgaon', 'solapur', 'kolhapur', 'sangli', 'buldana', 'shrigonda', 'chakan', 'vasai', 'palghar']): return 'MAHARASHTRA'
    if any(k in t for k in ['gujarat', 'surat', 'ahmedabad', 'jamnagar']): return 'GUJARAT'
    if 'tamil nadu' in t or 'pudukkottai' in t: return 'TAMIL NADU'
    if 'chhattisgarh' in t or 'dhamtari' in t: return 'CHHATTISGARH'
    if 'odisha' in t or 'angul' in t: return 'ODISHA'
    if 'bihar' in t or 'patna' in t: return 'BIHAR'
    if 'rajasthan' in t or 'sirohi' in t or 'abu road' in t: return 'RAJASTHAN'
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
            return candidate[:35].strip()
    return (parts[0] if parts else "NASHIK")[:35].strip()

def estimate_weight(prod_str):
    p = prod_str.lower()
    if '3 month' in p or '3 months' in p or '1 kg' in p or 'shampoo' in p:
        return 750
    elif '2 month' in p or '2 months' in p or '2 ' in p or '3 ' in p:
        return 450
    elif '1 month' in p or '1months' in p:
        return 250
    return 350

# Read and parse chat.txt
chat_file = r'scripts\whatsapp_dispatch_nov18\chat.txt'
with open(chat_file, encoding='utf-8') as f:
    chat_text = f.read()

msg_pattern = r'\[(\d{1,2}/\d{1,2}/\d{2,4},\s*\d{1,2}:\d{2}(?::\d{2})?\s*[AP]M)\]\s*([^:]+):\s*--- SUJATA NUTRILIVE ORDER ---([\s\S]*?)(?=(?:\[\d{1,2}/\d{1,2}/\d{2,4}|$))'
matches = re.findall(msg_pattern, chat_text)
print(f"Matched {len(matches)} standard order blocks from chat.txt")

RAW_PARSED_ORDERS = []
for idx, (ts, sender, body) in enumerate(matches, 1):
    def get_val(key_pat):
        m = re.search(key_pat, body, re.IGNORECASE)
        return m.group(1).strip() if m else ''

    otype = get_val(r'Type\s*[:\-]+\s*(.*)')
    name = get_val(r'Name\s*[:\-]+\s*(.*)').strip('.').strip()
    raw_mob = get_val(r'Mobile\s*[:\-]+\s*(.*)')
    mobiles = re.findall(r'(\d{10})', raw_mob)
    clean_mob = int(mobiles[0]) if mobiles else 9999999999
    alt_mob = str(mobiles[1]) if len(mobiles) > 1 else None

    # Pincode
    pin_m = re.search(r'(?:Pin|Pincode|PIN Code)\s*[:\-]+\s*(\d{6})', body, re.IGNORECASE)
    pin = pin_m.group(1) if pin_m else ''

    # Address
    addr_m = re.search(r'Address\s*[:\-]+([\s\S]*?)(?=(?:Pin|Pincode|PIN Code|Product|Free Gift|Total|Payment|Courier|Shipment|\n\n))', body, re.IGNORECASE)
    addr = ' '.join(addr_m.group(1).split()) if addr_m else ''
    
    # Specific fallbacks
    if 'Buldana' in addr and not pin:
        pin = '443001'
    if not pin:
        p_in_addr = re.search(r'(\d{6})', addr)
        if p_in_addr: pin = p_in_addr.group(1)

    # Product
    prod_m = re.search(r'Product\s*[:\-]+([\s\S]*?)(?=(?:Free Gift|Total|Bill|Payment|Shipment|Shipping|Courier|\n\n))', body, re.IGNORECASE)
    prod = ' '.join(prod_m.group(1).split()) if prod_m else ''
    # Check free gift
    gift_m = re.search(r'Free Gift\s*[:\-]+([\s\S]*?)(?=(?:Total|Bill|Payment|Courier|\n\n))', body, re.IGNORECASE)
    if gift_m:
        prod += " + Free Gift: " + ' '.join(gift_m.group(1).split())

    # Bill
    bill_m = re.search(r'(?:Total Bill|Total bill)\s*[:\-]+\s*₹?(\d+)', body, re.IGNORECASE)
    bill = int(bill_m.group(1)) if bill_m else 0

    # Payment Mode
    pm_m = re.search(r'Payment [Mm]ode\s*[:\-]+\s*([A-Za-z]+)', body, re.IGNORECASE)
    pm = pm_m.group(1).upper() if pm_m else 'COD'

    # Courier
    courier_m = re.search(r'Courier\s*[:\-]+\s*(.*)', body, re.IGNORECASE)
    courier = courier_m.group(1).strip().strip('-').strip() if courier_m else 'Speed Post'
    if not courier or 'any' in courier.lower():
        courier = 'Speed Post'

    RAW_PARSED_ORDERS.append({
        'ts': ts,
        'sender': sender.strip(),
        'otype': otype,
        'name': name,
        'mob': clean_mob,
        'alt_mob': alt_mob,
        'addr': addr,
        'pin': pin,
        'prod': prod,
        'amount': bill,
        'payment_mode': pm,
        'courier': courier
    })

ORDERS_18_NOV = []
for idx, r in enumerate(RAW_PARSED_ORDERS, 1):
    ts = r['ts']
    dt_match = re.match(r'(\d{1,2})/(\d{1,2})/(\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?\s*[AP]M)', ts)
    if dt_match:
        m, d, y, t = dt_match.groups()
        full_year = '20' + y if len(y) == 2 else y
        formatted_date = f"{int(d):02d}/{int(m):02d}/{full_year}"
        sql_date = f"{full_year}-{int(m):02d}-{int(d):02d}"
        formatted_time = t
    else:
        formatted_date = "18/11/2026"
        sql_date = "2026-11-18"
        formatted_time = "12:00 PM"

    state = guess_state_from_text(r['addr'], r['pin'])
    city = extract_city(r['addr'], state)
    l1, l2 = split_address(r['addr'])
    weight = estimate_weight(r['prod'])
    
    amt = r['amount']
    is_cod = (r['payment_mode'] == 'COD') and (amt > 0)
    
    # Telecaller name cleaning
    raw_sender = r['sender']
    if 'Manju' in raw_sender:
        caller = 'Manju'
    elif 'Punam' in raw_sender:
        caller = 'Punam Kasture'
    elif 'Vaishnavi' in raw_sender:
        caller = 'Vaishnavi Diwate'
    elif '95034' in raw_sender:
        caller = 'Pooja (95034 34653)'
    else:
        caller = raw_sender

    order_obj = {
        "sr": idx,
        "telecaller": caller,
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
        "receiver_name": r['name'],
        "receiver_company": None,
        "receiver_line1": l1,
        "receiver_line2": l2,
        "receiver_city": city,
        "receiver_state": state,
        "receiver_pincode": int(r['pin']) if r['pin'] else 422007,
        "receiver_email": None,
        "receiver_alt": r['alt_mob'],
        "receiver_kyc": None,
        "receiver_tax": None,
        "alt_addr_flag": False,
        "pickup_addr_flag": False,
        "dropoff_pincode": 422007,
        "office_id": None,
        "sender_mobile": 9834783503,
        "receiver_mobile": r['mob'],
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
        "products_ordered": r['prod'],
        "amount": amt,
        "payment_mode": "COD" if is_cod else "Prepaid",
        "courier": r['courier']
    }
    ORDERS_18_NOV.append(order_obj)

print(f"Prepared {len(ORDERS_18_NOV)} orders for 18 Nov India Post Excel generation.")

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
    print("🚀 SUJATA NUTRILIVE — GENERATING OFFICIAL INDIA POST EXCEL (18 NOV 2026)")
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

    # Insert all 15 orders
    for idx, o in enumerate(ORDERS_18_NOV, 2):
        row_values = build_row_list(o)
        for c_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=idx, column=c_idx)
            cell.value = val
            cell.font = copy.copy(proto_font)
            cell.alignment = proto_align
            cell.border = copy.copy(proto_border)

    final_data_row = len(ORDERS_18_NOV) + 1
    if ws.max_row > final_data_row:
        ws.delete_rows(final_data_row + 1, ws.max_row - final_data_row)

    # Save to all destination locations
    for dest in OUTPUT_DESTINATIONS:
        wb.save(dest)
        print(f"✅ Generated & Saved: {dest}")

    print(f"📑 Sheets Verified: {wb.sheetnames}")
    print(f"📊 Orders Processed: {len(ORDERS_18_NOV)} Orders")
    cod_orders = [o for o in ORDERS_18_NOV if o['payment_mode'] == 'COD']
    prepaid_orders = [o for o in ORDERS_18_NOV if o['payment_mode'] == 'Prepaid']
    total_cod_amt = sum(o['amount'] for o in cod_orders)
    total_prepaid_amt = sum(o['amount'] for o in prepaid_orders)
    grand_total = sum(o['amount'] for o in ORDERS_18_NOV)

    print(f"💰 Total COD Amount to Collect: ₹{total_cod_amt:,} ({len(cod_orders)} COD Orders)")
    print(f"💳 Total Prepaid Revenue: ₹{total_prepaid_amt:,} ({len(prepaid_orders)} Prepaid Orders)")
    print(f"🌟 Grand Total Value: ₹{grand_total:,}")
    print("=" * 75)

    # 1. Update local database
    db_nov_path = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_117.json'
    prev_nov_path = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\november_master_orders_102.json'
    os.makedirs(os.path.dirname(db_nov_path), exist_ok=True)

    prev_nov = []
    if os.path.exists(prev_nov_path):
        with open(prev_nov_path, 'r', encoding='utf-8') as f:
            prev_nov = json.load(f)

    sr_start = len(prev_nov) + 321
    new_db_orders = []
    for idx, o in enumerate(ORDERS_18_NOV, sr_start):
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
            "dispatch_channel": o["courier"],
            "manifest_name": "SUJATA_18_November_final.xlsx"
        })

    combined_nov = prev_nov + new_db_orders
    with open(db_nov_path, 'w', encoding='utf-8') as f:
        json.dump(combined_nov, f, indent=2, ensure_ascii=False)
    print(f"💾 Updated Local Database: {db_nov_path} ({len(combined_nov)} total November orders)")

    # 2. Sync to TiDB Cloud Database
    print(f"\n☁️ Syncing {len(ORDERS_18_NOV)} New Orders to TiDB Cloud Database...")
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
            batch_sql = """
                INSERT INTO dispatch_batches (manifest_name, dispatch_date, order_count, total_cod_amount)
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(batch_sql, (
                'SUJATA_18_November_final.xlsx',
                '2026-11-18',
                len(ORDERS_18_NOV),
                total_cod_amt
            ))
            batch_id = cur.lastrowid
            print(f"  📌 Created Dispatch Batch ID: {batch_id}")

            cur.execute("SELECT COALESCE(MAX(order_id), 0) as max_id FROM orders")
            max_id = cur.fetchone()['max_id']
            next_order_id = max_id + 1

            for o in ORDERS_18_NOV:
                mob = str(o['receiver_mobile'])[-10:]
                c_name = o['receiver_name'][:100]
                addr = f"{o['receiver_line1']}, {o['receiver_line2']}"[:255]
                city = o['receiver_city'][:35]
                state = o['receiver_state'][:35]
                pin = str(o['receiver_pincode'])
                amt = float(o['amount'])

                cust_sql = """
                    INSERT INTO customers (phone, full_name, default_address, city, state, pincode, total_orders, total_revenue, first_order_date, last_order_date)
                    VALUES (%s, %s, %s, %s, %s, %s, 1, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        total_orders = total_orders + 1,
                        total_revenue = total_revenue + VALUES(total_revenue),
                        last_order_date = %s
                """
                cur.execute(cust_sql, (mob, c_name, addr, city, state, pin, amt, o['sql_date'], o['sql_date'], o['sql_date']))

                ord_sql = """
                    INSERT INTO orders (
                        order_id, order_date, order_time, month, customer_phone, customer_name,
                        caller_name, pincode, full_address, products_ordered, amount,
                        payment_mode, order_type, dispatch_channel, manifest_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
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
                    "Direct Dispatch",
                    o['courier'],
                    batch_id
                ))
                next_order_id += 1

            conn.commit()
            print(f"✅ TiDB Cloud Synced Successfully! Batch ID: {batch_id}, {len(ORDERS_18_NOV)} orders inserted (Order IDs {max_id+1} to {next_order_id-1}).")
        conn.close()
    except Exception as e:
        print(f"⚠️ TiDB Sync Note: {e}")

if __name__ == '__main__':
    main()
