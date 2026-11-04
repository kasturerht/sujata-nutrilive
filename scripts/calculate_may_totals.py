import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

from reconcile_may_master import manju_orders_def, monu_orders_def, yash_orders_def

# Update Manju 103 merged list with 146
for i, item in enumerate(manju_orders_def):
    if item[0] == 103:
        manju_orders_def[i] = (103, [102, 141, 146], item[2])

# Add photo order to Monu: IDX 213 (merged 214)
monu_orders_def.append((213, [214], {
    'customer_name': 'ग्राहक (फोटोवरून पत्ता)',
    'phone': '',
    'pincode': '',
    'amount': 350,
    'payment_type': 'COD',
    'products': 'spirulina powder 100 gram :- 1',
    'audit_flag': 'पत्ता फोटोमध्ये, प्रॉडक्ट व रक्कम IDX 214 वरून'
}))

# Add Dattatray Sarjerao Gosavi to Yash: IDX 349 (merged 350, 351, 352, 424, 425, 426, 427, 576, 577, 579, 580, 583, 584)
yash_orders_def.append((349, [350, 351, 352, 424, 425, 426, 427, 576, 577, 579, 580, 583, 584], {
    'customer_name': 'श्री दत्तात्रय सर्जेराव गोसावी',
    'phone': '8055514944',
    'pincode': '416205',
    'amount': 850,
    'payment_type': 'COD',
    'products': 'Spirulina powder 1 + Seabuckthorn capsule 1',
    'audit_flag': 'पन्हाळा कोल्हापूर, IDX 424 व 576 वर पाठपुरावा'
}))

# Add photo order to Yash: IDX 224 (merged 225, 226)
yash_orders_def.append((224, [225, 226], {
    'customer_name': 'ग्राहक (फोटोवरून पत्ता)',
    'phone': '',
    'pincode': '',
    'amount': 0,
    'payment_type': 'Prepaid',
    'products': '5 capsule 1 sample spirulina soap',
    'audit_flag': 'पत्ता फोटोमध्ये, तपशील IDX 225 वरून'
}))

# Update Yash 472 (merged 474)
for i, item in enumerate(yash_orders_def):
    if item[0] == 472:
        yash_orders_def[i] = (472, [474], item[2])
    elif item[0] == 531:
        yash_orders_def[i] = (531, [532, 536, 548], item[2])
        # update amount to 950 COD
        item[2]['amount'] = 950
        item[2]['payment_type'] = 'COD'
        item[2]['products'] = 'Spirulina tab 5 pack in 950/- cod'
        item[2]['audit_flag'] = 'तपशील IDX 532, पिनकोड IDX 548 वरून'

# Check totals
ALL_ORDERS = []
for idx, merged, custom in manju_orders_def:
    ALL_ORDERS.append({
        'main_idx': idx,
        'merged_idxs': merged,
        'customer_name': custom['customer_name'],
        'phone': custom['phone'],
        'pincode': custom['pincode'],
        'amount': custom['amount'],
        'payment_type': custom['payment_type'],
        'products': custom['products'],
        'audit_flag': custom['audit_flag'],
        'telecaller': 'मंजुश्री कस्तुरे',
        'is_telecaller': True,
        'sender': msgs[idx]['sender'],
        'date': msgs[idx]['date'],
        'time': msgs[idx]['time']
    })

for idx, merged, custom in monu_orders_def:
    ALL_ORDERS.append({
        'main_idx': idx,
        'merged_idxs': merged,
        'customer_name': custom['customer_name'],
        'phone': custom['phone'],
        'pincode': custom['pincode'],
        'amount': custom['amount'],
        'payment_type': custom['payment_type'],
        'products': custom['products'],
        'audit_flag': custom['audit_flag'],
        'telecaller': 'मोनू',
        'is_telecaller': True,
        'sender': msgs[idx]['sender'],
        'date': msgs[idx]['date'],
        'time': msgs[idx]['time']
    })

for idx, merged, custom in yash_orders_def:
    ALL_ORDERS.append({
        'main_idx': idx,
        'merged_idxs': merged,
        'customer_name': custom['customer_name'],
        'phone': custom['phone'],
        'pincode': custom['pincode'],
        'amount': custom['amount'],
        'payment_type': custom['payment_type'],
        'products': custom['products'],
        'audit_flag': custom['audit_flag'],
        'telecaller': 'यश सूर्यवंशी (फाउंडर डायरेक्ट)',
        'is_telecaller': False,
        'sender': msgs[idx]['sender'],
        'date': msgs[idx]['date'],
        'time': msgs[idx]['time']
    })

ALL_ORDERS.sort(key=lambda x: x['main_idx'])

print(f"Total Master Orders: {len(ALL_ORDERS)}")

# Check duplicate main_idxs or merged_idxs
main_map = {}
merged_map = {}

for o in ALL_ORDERS:
    m = o['main_idx']
    if m in main_map:
        print(f"ERROR: Duplicate main_idx {m}")
    main_map[m] = o
    for sub in o['merged_idxs']:
        if sub in merged_map:
            print(f"ERROR: Sub-idx {sub} already merged into {merged_map[sub]}")
        merged_map[sub] = m

overlap = set(main_map.keys()).intersection(set(merged_map.keys()))
if overlap:
    print(f"ERROR: Overlap between main and merged: {overlap}")
else:
    print("SUCCESS: 0 Overlap between main orders and merged sub-messages!")

print(f"Main Orders count: {len(main_map)}")
print(f"Merged Sub-messages count: {len(merged_map)}")

remaining = []
for i in range(len(msgs)):
    if i not in main_map and i not in merged_map:
        remaining.append(i)

print(f"Remaining excluded messages: {len(remaining)}")
print(f"Total check: {len(main_map)} + {len(merged_map)} + {len(remaining)} = {len(main_map) + len(merged_map) + len(remaining)} (Expected: {len(msgs)})")

print("\n--- Summary by Telecaller ---")
tele_summary = {}
for o in ALL_ORDERS:
    t = o['telecaller']
    if t not in tele_summary:
        tele_summary[t] = {'count': 0, 'amount': 0, 'prepaid': 0, 'cod': 0}
    tele_summary[t]['count'] += 1
    tele_summary[t]['amount'] += o['amount']
    if o['payment_type'] == 'Prepaid':
        tele_summary[t]['prepaid'] += 1
    else:
        tele_summary[t]['cod'] += 1

for t, s in tele_summary.items():
    print(f"{t}: {s['count']} orders | Total: Rs {s['amount']:,} (Prepaid: {s['prepaid']}, COD: {s['cod']})")
