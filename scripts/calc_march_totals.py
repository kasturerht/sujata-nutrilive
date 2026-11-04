import sys, json

sys.stdout.reconfigure(encoding='utf-8')

from test_march_classification import monu_orders
from map_yash_candidates import yash_order_groups

monu_count = len(monu_orders)
monu_val = sum(o['amount'] for o in monu_orders)

yash_count = len(yash_order_groups)
yash_val = sum(o['amount'] for o in yash_order_groups)

total_count = monu_count + yash_count
total_val = monu_val + yash_val

print(f"Monu: {monu_count} orders, ₹{monu_val:,}")
print(f"Yash: {yash_count} orders, ₹{yash_val:,}")
print(f"Grand Total: {total_count} orders, ₹{total_val:,}")
