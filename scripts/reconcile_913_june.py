import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

from calculate_june_totals import manju_orders, monu_candidates, all_yash

all_orders = []

for item in manju_orders:
    all_orders.append({
        'main_idx': item[0],
        'merged_idxs': item[1],
        'customer_name': item[2],
        'phone': item[3],
        'pincode': item[4],
        'amount': item[5],
        'payment_type': item[6],
        'products': item[7],
        'audit_flag': item[8],
        'telecaller': 'मंजुश्री कस्तुरे',
        'is_telecaller': True,
        'sender': msgs[item[0]].get('sender'),
        'date': msgs[item[0]].get('date'),
        'time': msgs[item[0]].get('time')
    })

for item in monu_candidates:
    all_orders.append({
        'main_idx': item[0],
        'merged_idxs': item[1],
        'customer_name': item[2],
        'phone': item[3],
        'pincode': item[4],
        'amount': item[5],
        'payment_type': item[6],
        'products': item[7],
        'audit_flag': item[8],
        'telecaller': 'मोनू',
        'is_telecaller': True,
        'sender': msgs[item[0]].get('sender'),
        'date': msgs[item[0]].get('date'),
        'time': msgs[item[0]].get('time')
    })

for item in all_yash:
    all_orders.append({
        'main_idx': item[0],
        'merged_idxs': item[1],
        'customer_name': item[2],
        'phone': item[3],
        'pincode': item[4],
        'amount': item[5],
        'payment_type': item[6],
        'products': item[7],
        'audit_flag': item[8],
        'telecaller': 'यश सूर्यवंशी (फाउंडर डायरेक्ट)',
        'is_telecaller': False,
        'sender': msgs[item[0]].get('sender'),
        'date': msgs[item[0]].get('date'),
        'time': msgs[item[0]].get('time')
    })

# Sort orders by main_idx
all_orders.sort(key=lambda x: x['main_idx'])

print(f"Total Master Orders: {len(all_orders)}")

main_order_map = {}
merged_map = {}

for o in all_orders:
    m_idx = o['main_idx']
    if m_idx in main_order_map:
        print(f"ERROR: Duplicate main_idx {m_idx}")
    main_order_map[m_idx] = o
    for sub in o['merged_idxs']:
        if sub in merged_map:
            print(f"ERROR: Sub-idx {sub} already merged into {merged_map[sub]}")
        merged_map[sub] = m_idx

overlap = set(main_order_map.keys()).intersection(set(merged_map.keys()))
if overlap:
    print(f"ERROR: Overlap between main and merged: {overlap}")
else:
    print("SUCCESS: 0 Overlap between main orders and merged sub-messages!")

print(f"Main orders count: {len(main_order_map)}")
print(f"Merged sub-messages count: {len(merged_map)}")

# Check remaining messages
remaining_count = 0
for i in range(len(msgs)):
    if i not in main_order_map and i not in merged_map:
        remaining_count += 1

print(f"Remaining excluded messages: {remaining_count}")
print(f"Total check: {len(main_order_map)} + {len(merged_map)} + {remaining_count} = {len(main_order_map) + len(merged_map) + remaining_count} (Expected: {len(msgs)})")
