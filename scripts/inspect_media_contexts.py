import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for r in [(227, 235), (324, 336), (352, 360), (369, 375)]:
    print(f"\n=== RANGE {r[0]} to {r[1]} ===")
    for m in msgs[r[0]:r[1]+1]:
        print(f"[{m['index']}] {m['timestamp']} {m['sender']}: {m['content']}")
