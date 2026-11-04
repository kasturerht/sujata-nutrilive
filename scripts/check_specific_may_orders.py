import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

def show(s, e):
    print(f"=== CHECK RANGE {s} to {e} ===")
    for i in range(s, e + 1):
        m = msgs[i]
        print(f"[{i}] {m['sender']} | {m['date']} {m['time']}: {m['text']}")
    print()

show(13, 20) # Dr Rangari
show(428, 435) # Dhery beauty parlour
show(435, 442) # Lilaram chandwani
show(537, 545) # Chandrakant Dhore
show(660, 665) # Vishwas Bapu Powar
