import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Let's inspect photo orders from Yash:
# Let's see all media messages from Yash:
yash_media = [m for m in messages if m['sender'] == 'Yash R. Suryawanshi' and '<media omitted>' in m['content'].lower()]
print(f"Yash media messages in March: {len(yash_media)}")
for m in yash_media:
    print(f"IDX {m['index']} ({m['timestamp']})")
