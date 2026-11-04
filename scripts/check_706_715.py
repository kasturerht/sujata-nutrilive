import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for i in range(706, 715):
    m = msgs[i]
    print(f"[{i}] {m['sender']} | {m['time']}: {m['text']}")
