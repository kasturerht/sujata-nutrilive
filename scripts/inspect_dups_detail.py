import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

targets = ['Nikunj Doshi', 'Lokesh Patil', 'Pallavi', 'Jyashree', 'Barapatre', 'Lavaskar', 'Thorbale']

for t in targets:
    print(f"==================== {t} ====================")
    for idx, m in enumerate(msgs):
        if t.lower() in m['text'].lower():
            print(f"[{m['date']} {m['time']}] {m['sender']}:")
            print(repr(m['text']))
            print("-" * 30)
