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

# Inspect 220 to 226
inspect(220, 226)

# Inspect 248 to 255
inspect(248, 255)

# Inspect 265 to 270
inspect(265, 270)

# Inspect 275 to 285
inspect(275, 285)

# Inspect 295 to 300
inspect(295, 300)
