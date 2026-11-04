import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

monu_msgs = [(i, m) for i, m in enumerate(msgs) if m.get('sender') == 'Sujata Nutrilive']
print(f"Total Monu messages: {len(monu_msgs)}")
with open('scripts/monu_all_msgs.txt', 'w', encoding='utf-8') as out:
    for i, m in monu_msgs:
        out.write(f"=== IDX {i} | {m.get('datetime')} ===\n{m.get('text', '')}\n\n")

yash_msgs = [(i, m) for i, m in enumerate(msgs) if m.get('sender') == 'Yash R. Suryawanshi']
print(f"Total Yash messages: {len(yash_msgs)}")
with open('scripts/yash_all_msgs.txt', 'w', encoding='utf-8') as out:
    for i, m in yash_msgs:
        out.write(f"=== IDX {i} | {m.get('datetime')} ===\n{m.get('text', '')}\n\n")
