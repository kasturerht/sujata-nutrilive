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

show(145, 150) # 146
show(154, 158) # 156
show(213, 218) # 214
show(224, 227) # 225
show(530, 535) # 532
