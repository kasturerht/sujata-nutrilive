import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

def show_range(start, end, label):
    print(f"\n==================== {label} ({start}..{end}) ====================")
    for m in msgs[start:end+1]:
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")

show_range(0, 20, "1 to 20")
show_range(55, 75, "55 to 75")
show_range(150, 170, "150 to 170")
show_range(240, 260, "240 to 260")
