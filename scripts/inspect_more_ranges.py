import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

def inspect(start, end):
    print(f"=== INSPECTING {start} to {end} ===")
    for i in range(start, end + 1):
        m = msgs[i]
        print(f"IDX {i:3d} | {m['sender']} | {m['date']} {m['time']}")
        print(repr(m['text']))
        print("-" * 30)

inspect(303, 315)
inspect(325, 336)
inspect(372, 385)
inspect(505, 515)
inspect(570, 585)
inspect(630, 640)
inspect(662, 673)
inspect(682, 692)
inspect(745, 758)
