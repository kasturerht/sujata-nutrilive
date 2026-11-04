import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

for i, m in enumerate(msgs):
    if m['sender'] == 'Om Amazon Dispatch':
        t = m['text'].strip()
        if t and t != '<Media omitted>' and 'This message was deleted' not in t:
            # print first 60 chars
            first_line = t.split('\n')[0]
            print(f"IDX {i} | {m['date']} {m['time']} | {first_line[:70]}")
