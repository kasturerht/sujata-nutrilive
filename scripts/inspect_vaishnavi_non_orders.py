import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

v_msgs = [m for m in msgs if 'Vaishnavi' in m['sender']]

from verify_all_orders_true import orders
order_indices = {idx for idx, m in orders}

print(f"=== VAISHNAVI NON-ORDER MESSAGES ({len(v_msgs) - len(order_indices)} total) ===")
for idx, m in enumerate(v_msgs, 1):
    if idx not in order_indices:
        print(f"Msg #{idx:02d} [{m['date']} {m['time']}]: {repr(m['text'])}")
