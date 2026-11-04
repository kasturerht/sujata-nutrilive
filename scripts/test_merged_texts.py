import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', encoding='utf-8') as f:
    msgs = json.load(f)

from test_merger_rules import KNOWN_PAIRS

for main_idx, (sub_idx, note) in KNOWN_PAIRS.items():
    m1 = msgs[main_idx]
    m2 = msgs[sub_idx]
    merged_text = m1['text'] + "\n" + m2['text']
    print(f"=== MERGED PAIR {main_idx} + {sub_idx} ({m1['sender']}) ===")
    print(repr(merged_text))
    print("-" * 50)
