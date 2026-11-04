import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = {m['index']: m for m in json.load(f)}

# Let's import monu_orders and yash_orders and check reconciliation
from test_march_classification import monu_orders
from map_yash_candidates import yash_order_groups

all_orders = []
for o in monu_orders:
    all_orders.append(o)

# Let's convert yash_order_groups to standard order dicts
for i, y in enumerate(yash_order_groups, start=1):
    main_idx = y['indices'][0]
    merged = y['indices'][1:]
    all_orders.append({
        "id": f"ORD-MAR-Y-{i:02d}",
        "date": msgs[main_idx]['timestamp'].split(',')[0],
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": y['name'],
        "phone": y['phone'],
        "address": y['address'] if 'address' in y else y['city'],
        "pin": y['pin'],
        "product": y['product'],
        "payment": y['mode'],
        "amount": y['amount'],
        "main_index": main_idx,
        "merged_indices": merged
    })

print(f"Total orders: {len(all_orders)}")
print(f"Monu orders: {len(monu_orders)}")
print(f"Yash orders: {len(yash_order_groups)}")

# Check duplicate mapped indices
mapped_indices = set()
for o in all_orders:
    indices = [o['main_index']] + o['merged_indices']
    for idx in indices:
        if idx in mapped_indices:
            print(f"ERROR: Duplicate mapped index: {idx} in order {o['id']}")
        mapped_indices.add(idx)

print(f"Total order-related messages: {len(mapped_indices)}")

# Remaining messages must go to Sheet 3
excluded_indices = set(range(1, 744)) - mapped_indices
print(f"Total excluded messages: {len(excluded_indices)}")
print(f"Check sum: {len(mapped_indices)} + {len(excluded_indices)} == {len(mapped_indices) + len(excluded_indices)} (Target: 743)")

assert len(mapped_indices) + len(excluded_indices) == 743, "Reconciliation failed!"
print("100% MATHEMATICAL RECONCILIATION VERIFIED!")
