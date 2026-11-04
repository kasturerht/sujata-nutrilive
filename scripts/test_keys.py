import json

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("Keys in msg 0:", msgs[0].keys())
print("msg 16:", msgs[16])
print("msg 17:", msgs[17])
print("msg 18:", msgs[18])
print("msg 19:", msgs[19])
print("msg 20:", msgs[20])
