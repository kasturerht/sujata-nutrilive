import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

from scan_march_orders import yash_candidates

print(f"=== ALL {len(yash_candidates)} YASH CANDIDATES IN MARCH ===")
for m in yash_candidates:
    print(f"\n[{m['index']}] {m['timestamp']}:")
    for l in m['content'].split('\n'):
        print(f"   {l}")
