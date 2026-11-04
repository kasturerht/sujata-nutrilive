import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

indices = [
    418, 419, 420, 421, 422, 423,
    474, 475, 476, 477, 478, 479, 480, 481, 482,
    500, 501, 502, 503, 504,
    574, 575, 576, 577, 578,
    695, 696, 697, 698, 699,
    716, 717, 718, 719, 720, 721,
    730, 731, 732, 733, 734, 735, 736, 737, 738, 739, 740, 741, 742
]

for idx in indices:
    if 0 <= idx < len(msgs):
        m = msgs[idx]
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}:")
        for line in m['content'].split('\n'):
            print(f"    {line}")
        print()
