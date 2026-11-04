import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

def show(start, end):
    for i in range(start, end + 1):
        if 0 <= i < len(msgs):
            m = msgs[i]
            print(f"=== IDX {i} | Line {m.get('start_line')} | {m.get('sender')} | {m.get('date')} {m.get('time')} ===")
            print(m.get('text', ''))
            print("=" * 60)

if __name__ == '__main__':
    start = int(sys.argv[1])
    end = int(sys.argv[2])
    show(start, end)
