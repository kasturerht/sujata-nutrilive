import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

monu_msgs = [m for m in msgs if m['sender'] == 'Sujata Nutrilive']
print(f"Total messages by Monu: {len(monu_msgs)}")

# Print all Monu messages
for m in monu_msgs:
    c = m['content'].strip().replace('\n', ' -- ')
    print(f"[{m['index']}] {m['timestamp']}: {c[:120]}")
