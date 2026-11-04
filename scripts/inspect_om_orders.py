import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for idx in [556, 572, 677]:
    m = msgs[idx]
    print(f"=== IDX {idx} | {m['sender']} | {m['date']} {m['time']} ===")
    print(m['text'])
    print("=" * 50)
