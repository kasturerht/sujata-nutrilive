import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = {m['index']: m for m in json.load(f)}

# Let's inspect media messages at 109, 178, 180, 230, 326, 354, 370, 619
indices = [109, 178, 180, 230, 326, 354, 370, 619]

for idx in indices:
    print(f"\n==================== INSPECTING IDX {idx} ====================")
    for i in range(max(1, idx - 4), min(743, idx + 6)):
        m = msgs[i]
        print(f"[{m['index']}] {m['timestamp']} {m['sender']}: {m['content']}")
