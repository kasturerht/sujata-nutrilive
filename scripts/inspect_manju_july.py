import json, sys
sys.stdout.reconfigure(encoding='utf-8')

msgs = json.load(open('scripts/july_whatsapp_messages_TRUE.json', encoding='utf-8'))

print("=== MANJUSHREE KASTURE MESSAGES IN JULY 2026 ===")
manju_msgs = [m for m in msgs if 'Manju' in m['sender']]
print(f"Total Manju messages: {len(manju_msgs)}")
for idx, m in enumerate(msgs):
    if 'Manju' in m['sender']:
        print(f"[{idx}] {m['date']} {m['time']}: {repr(m['text'][:100])}")
