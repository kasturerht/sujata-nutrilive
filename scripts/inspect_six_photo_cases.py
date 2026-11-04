import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect context of:
# 1. IDX 350-351
# 2. IDX 395-396
# 3. IDX 413-414
# 4. IDX 455-456
# 5. IDX 488-489
# 6. IDX 544-545

ranges = [
    (348, 355),
    (393, 403),
    (410, 420),
    (452, 465),
    (485, 492),
    (540, 550)
]

for s, e in ranges:
    print(f"==================== RANGE {s} to {e} ====================")
    for i in range(s, e + 1):
        m = msgs[i]
        print(f"[{i}] {m.get('sender')} | {m.get('date')} {m.get('time')}: {m.get('text')}")
    print()
