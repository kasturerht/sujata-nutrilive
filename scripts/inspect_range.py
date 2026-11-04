import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

def show_range(start_idx, end_idx):
    for m in messages:
        if start_idx <= m['index'] <= end_idx:
            print(f"IDX {m['index']} | {m['timestamp']} | {m['sender']}:")
            lines = m['content'].split('\n')
            for l in lines[:10]:
                print(f"  {l}")
            if len(lines) > 10:
                print(f"  ... ({len(lines)-10} more lines)")
            print('-'*50)

print("=== MESSAGES 1 to 50 ===")
show_range(1, 50)
