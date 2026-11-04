import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

media_msgs = [m for m in msgs if '<media omitted>' in m['content'].lower() and m['sender'] in ['Yash R. Suryawanshi', 'Sujata Nutrilive']]

print(f"Total media messages by Yash/Monu: {len(media_msgs)}")

for m in media_msgs:
    idx = m['index']
    # show context from idx-2 to idx+2
    print(f"\n--- MEDIA AT [{idx}] by {m['sender']} ({m['timestamp']}) ---")
    start = max(0, idx - 2)
    end = min(len(msgs) - 1, idx + 2)
    for ctx in msgs[start:end+1]:
        prefix = "===>" if ctx['index'] == idx else "    "
        print(f"{prefix} [{ctx['index']}] {ctx['timestamp']} {ctx['sender']}: {ctx['content']}")
