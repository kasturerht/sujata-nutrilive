import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's map orders to raw messages
from audit_august_all import is_valid_aug_order, order_sections

flagged_orders = [8, 9, 28, 40, 44, 57, 60, 63, 82, 96, 123, 124, 126, 130, 137, 142, 144, 160, 162, 167, 180, 191, 193, 196, 198, 199, 200, 201, 202, 204, 209, 211]

sr = 1
for caller_name, filter_fn in order_sections:
    caller_msgs = [m for m in msgs if filter_fn(m)]
    for m in caller_msgs:
        is_order, reason = is_valid_aug_order(m, caller_name)
        if is_order:
            if sr in flagged_orders:
                print(f"=== ORDER #{sr} ({caller_name}) [{m['date']} {m['time']}] ===")
                print(m['text'])
                print("-" * 50)
            sr += 1
