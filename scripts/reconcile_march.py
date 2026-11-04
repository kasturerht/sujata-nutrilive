import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total messages in March: {len(msgs)}")
print("Message index range:", msgs[0]['index'], "to", msgs[-1]['index'])
