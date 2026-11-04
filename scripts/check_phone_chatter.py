import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

def show(s, e):
    print(f"=== CHECK RANGE {s} to {e} ===")
    for i in range(s, e + 1):
        m = msgs[i]
        print(f"[{i}] {m['sender']} | {m['time']}: {m['text']}")
    print()

show(348, 352) # 350
show(423, 427) # 425
show(472, 477) # 474
