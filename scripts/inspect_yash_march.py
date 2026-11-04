import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

from scan_march_orders import yash_candidates

print(f"=== ALL {len(yash_candidates)} YASH CANDIDATES IN MARCH ===")
for m in yash_candidates:
    first_line = m['content'].split('\n')[0]
    print(f"[{m['index']}] {m['timestamp']}: {first_line[:80]}")
