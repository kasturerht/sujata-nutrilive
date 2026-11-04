import json
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== MESSAGES WITH DELIVERY CHARGES ===")
for i, m in enumerate(msgs):
    if re.search(r'delivery\s*charges|courier\s*charges|delivery\s*charge', m['text'], re.I):
        print(f"[{i+1}] {m['sender']} ({m['dateStr']}):")
        print(m['text'].replace('\r', ''))
        print("="*60)
