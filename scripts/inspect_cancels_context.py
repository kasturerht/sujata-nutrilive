import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

def print_range(start, end, label):
    print(f"\n==================== {label} ({start} to {end}) ====================")
    for m in msgs[start:end+1]:
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")

print_range(270, 285, "Cancel 1 - around 278")
print_range(285, 298, "Cancel 2 - around 289")
print_range(410, 418, "Cancel 3 - around 416")
print_range(435, 460, "Cancel 4 - around 442-454")
print_range(520, 528, "Cancel 5 - around 525-527")
print_range(640, 660, "Cancel 6 - Krishna Kadam around 647")
