import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect each candidate order of Yash in detail
from build_yash_order_table import yash_orders

print("Verifying Yash orders...")
for main_idx, merged_idxs, name in yash_orders:
    all_idxs = [main_idx] + merged_idxs
    combined_text = "\n".join([clean(msgs[i]['text']) for i in all_idxs])
    date = msgs[main_idx]['date']
    time = msgs[main_idx]['time']
    print(f"ORDER: {name:<30} | Idxs: {all_idxs} | Date: {date} {time}")
    # print snippet
    for l in combined_text.split('\n')[:3]:
        if l.strip(): print(f"   {l.strip()[:60]}")
    print("-" * 50)
