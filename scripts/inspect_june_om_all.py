import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

om_msgs = [m for m in msgs if m['sender'] == 'Om Amazon Dispatch']
for m in om_msgs:
    t = m['text'].strip()
    first_line = t.split('\n')[0] if t else "[Empty/Media]"
    print(f"IDX {m['idx']:3d} | {m['date']} {m['time']} | {repr(first_line[:60])}")
