import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

from analyze_all_june_orders import monu_candidates

monu_covered_indices = set()
for main_idx, merged, *_ in monu_candidates:
    monu_covered_indices.add(main_idx)
    for m in merged:
        monu_covered_indices.add(m)

print(f"Monu covered indices: {len(monu_covered_indices)}")

# Now let's check all Monu messages NOT in monu_covered_indices
uncovered_monu = []
for idx, m in enumerate(msgs):
    if m.get('sender') == 'Sujata Nutrilive' and idx not in monu_covered_indices:
        uncovered_monu.append((idx, m))

print(f"Uncovered Monu messages: {len(uncovered_monu)}")

# Let's inspect any of these uncovered messages that have more than 15 chars or digits
suspicious = []
for idx, m in uncovered_monu:
    text = m.get('text', '').strip()
    # ignore pure media, empty, deleted, short chatter
    if text in ['<Media omitted>', 'This message was deleted', '', 'Ok', 'Okay', 'Ho', 'Thik ahe']:
        continue
    # ignore courier/porter/labels chatter
    if any(k in text.lower() for k in ['track', 'porter', 'icarry', 'awb', 'delhivery', 'dtdc', 'speed post', 'dispatch', 'packing', 'print', 'bill', 'ready', 'box', 'seal', 'label']):
        continue
    suspicious.append((idx, text))

print(f"Suspicious uncovered Monu messages: {len(suspicious)}")
for idx, text in suspicious:
    print(f"=== IDX {idx} ===")
    print(text)
    print("-" * 40)
