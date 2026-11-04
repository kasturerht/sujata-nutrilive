import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

from scan_march_orders import monu_candidates

print(f"=== ALL {len(monu_candidates)} MONU CANDIDATES IN MARCH ===")
for m in monu_candidates:
    print(f"\n[{m['index']}] {m['timestamp']}:")
    for l in m['content'].split('\n'):
        print(f"   {l}")
