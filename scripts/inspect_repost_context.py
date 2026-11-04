import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for idx, m in enumerate(msgs):
    t = m['text']
    if ('Nikunj Doshi' in t and m['sender'] == 'Yash R. Suryawanshi') or \
       ('Lokesh Patil' in t and m['sender'] == 'Yash R. Suryawanshi') or \
       ('Pallavi Danger' in t):
        print(f"=== SENDER: {m['sender']} at [{m['date']} {m['time']}] ===")
        start = max(0, idx - 2)
        end = min(len(msgs), idx + 4)
        for j in range(start, end):
            print(f"  [{msgs[j]['date']} {msgs[j]['time']}] {msgs[j]['sender']}: {repr(msgs[j]['text'][:100])}")
        print("=" * 60)
