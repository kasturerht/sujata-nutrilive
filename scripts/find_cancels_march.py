import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for m in msgs:
    c = m['content'].lower()
    if 'cancel' in c or 'कॅन्सल' in c or 'रद्द' in c or 'jamner' in c:
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")
