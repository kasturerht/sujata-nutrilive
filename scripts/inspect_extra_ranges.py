import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

checks = [
    (394, 399),
    (410, 416),
    (454, 460),
    (487, 492),
    (542, 548),
    (874, 879)
]

for s, e in checks:
    print(f"=== CHECK RANGE {s} to {e} ===")
    for i in range(s, e + 1):
        m = msgs[i]
        print(f"[{i}] {m.get('sender')} | {m.get('date')} {m.get('time')}: {m.get('text')}")
    print()
