import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

from test_july_reconciliation_exact import ALL_ORDERS
from build_july_perfect import extract_customer_name, extract_phone, extract_pincode, extract_products, extract_amount_and_payment

print("--- Computing Summary for July 2026 ---")

orders_data = []
for order in ALL_ORDERS:
    main_idx = order['main_idx']
    merged = order['merged_idxs']
    custom = order['custom']
    
    # Combined raw text
    all_idxs = [main_idx] + merged
    combined_raw = "\n".join([msgs[i]['text'] for i in all_idxs])
    combined_clean = clean(combined_raw)
    
    m_main = msgs[main_idx]
    date = m_main['date']
    time = m_main['time']
    
    # Determine fields
    cust_name = custom.get('customer_name') or extract_customer_name(combined_clean)
    phone = custom.get('phone') or extract_phone(combined_clean)
    pincode = custom.get('pincode') or extract_pincode(combined_clean)
    products = custom.get('products') or extract_products(combined_clean)
    
    auto_amt, auto_pay = extract_amount_and_payment(combined_clean)
    amount = custom.get('amount') if 'amount' in custom else auto_amt
    pay_type = custom.get('payment_type') if 'payment_type' in custom else auto_pay
    audit_flag = custom.get('audit_flag', '')
    
    orders_data.append({
        'main_idx': main_idx,
        'merged_idxs': merged,
        'date': date,
        'time': time,
        'telecaller': order['telecaller'],
        'channel_key': order['channel_key'],
        'is_telecaller': order['is_telecaller'],
        'customer_name': cust_name,
        'phone': phone,
        'pincode': pincode,
        'products': products,
        'payment_type': pay_type,
        'amount': amount,
        'audit_flag': audit_flag
    })

# Summary aggregation
summary = {}
channel_order = ['manju', 'punam', 'darshan', 'monu', 'founder', 'warehouse']
channel_names = {
    'manju': '१. मंजुश्री कस्तुरे',
    'punam': '२. पूनम कस्तुरे',
    'darshan': '३. टेलिकॉलर (+91 88051 68275)',
    'monu': '४. मोनू',
    'founder': '५. यश सूर्यवंशी (फाउंडर डायरेक्ट)',
    'warehouse': '६. वेअरहाऊस डिस्पॅच'
}

for k in channel_order:
    summary[k] = {'name': channel_names[k], 'orders': 0, 'total': 0, 'cod': 0, 'prepaid': 0}

for o in orders_data:
    k = o['channel_key']
    summary[k]['orders'] += 1
    summary[k]['total'] += o['amount']
    if o['payment_type'] == 'COD':
        summary[k]['cod'] += 1
    else:
        summary[k]['prepaid'] += 1

print("\n" + "="*80)
print(f"{'चॅनेल / टेलिकॉलर':<35} | {'ऑर्डर्स':<8} | {'एकूण रक्कम (₹)':<15} | {'AOV (₹)':<10} | {'COD':<5} | {'Prepaid':<7}")
print("="*80)

# Telecallers
tc_orders = 0
tc_total = 0
tc_cod = 0
tc_prepaid = 0

for k in ['manju', 'punam', 'darshan', 'monu']:
    s = summary[k]
    aov = round(s['total'] / s['orders']) if s['orders'] > 0 else 0
    print(f"{s['name']:<35} | {s['orders']:<8} | ₹{s['total']:>13,d} | ₹{aov:>8,d} | {s['cod']:<5} | {s['prepaid']:<7}")
    tc_orders += s['orders']
    tc_total += s['total']
    tc_cod += s['cod']
    tc_prepaid += s['prepaid']

tc_aov = round(tc_total / tc_orders) if tc_orders > 0 else 0
print("-" * 80)
print(f"{'सर्व टेलिकॉलर्स एकूण':<35} | {tc_orders:<8} | ₹{tc_total:>13,d} | ₹{tc_aov:>8,d} | {tc_cod:<5} | {tc_prepaid:<7}")
print("=" * 80)

# Other channels
other_orders = 0
other_total = 0
other_cod = 0
other_prepaid = 0

for k in ['founder', 'warehouse']:
    s = summary[k]
    aov = round(s['total'] / s['orders']) if s['orders'] > 0 else 0
    print(f"{s['name']:<35} | {s['orders']:<8} | ₹{s['total']:>13,d} | ₹{aov:>8,d} | {s['cod']:<5} | {s['prepaid']:<7}")
    other_orders += s['orders']
    other_total += s['total']
    other_cod += s['cod']
    other_prepaid += s['prepaid']

grand_orders = tc_orders + other_orders
grand_total = tc_total + other_total
grand_cod = tc_cod + other_cod
grand_prepaid = tc_prepaid + other_prepaid
grand_aov = round(grand_total / grand_orders) if grand_orders > 0 else 0

print("=" * 80)
print(f"{'एकूण संपूर्ण डिस्पॅच ग्रुप (Grand Total)':<35} | {grand_orders:<8} | ₹{grand_total:>13,d} | ₹{grand_aov:>8,d} | {grand_cod:<5} | {grand_prepaid:<7}")
print("=" * 80)
