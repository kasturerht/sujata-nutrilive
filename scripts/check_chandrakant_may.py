import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

def show_context(target_idx, before=2, after=3):
    print(f"==================== CONTEXT FOR IDX {target_idx} ====================")
    for i in range(max(0, target_idx - before), min(len(msgs), target_idx + after + 1)):
        m = msgs[i]
        print(f"[{i}] Line {m['start_line']} | {m['sender']} | {m['date']} {m['time']}:")
        print(f"  {m['text']}")
        print("-" * 40)

# Check line 6972 (IDX 227), line 7101 (IDX 323), line 7383 (IDX 508)
for i, m in enumerate(msgs):
    if '72190' in m.get('text', ''):
        show_context(i)
