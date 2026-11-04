import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Master list of orders for July 2026:
# Each order will have:
# - order_id: 1, 2, ...
# - sender_channel: marathi name
# - sender_group: 'telecaller' or 'other'
# - main_idx: int
# - merged_idxs: list of int
# - date: str
# - time: str
# - customer_name: str
# - mobile: str
# - address: str
# - pincode: str
# - products: str
# - payment_type: 'COD' / 'Prepaid'
# - amount: int
# - audit_flag: str
# - raw_text: str
