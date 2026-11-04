import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for idx in [33, 217, 277]:
    print(f"=== IDX {idx} ===")
    for i in range(max(0, idx - 2), min(len(msgs), idx + 3)):
        m = msgs[i]
        print(f"IDX {i} | {m['sender']} | {m['date']} {m['time']}")
        print(repr(m['text']))
        print("-" * 25)
