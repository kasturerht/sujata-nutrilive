import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect each of the 46 cases with its previous and next message
from find_missed_in_chatter import potential_missed_orders

for idx, m, caller, reason, score in potential_missed_orders:
    print(f"==================== IDX {idx} [{m['date']} {m['time']}] {m['sender']} ====================")
    start = max(0, idx - 1)
    end = min(len(msgs), idx + 2)
    for j in range(start, end):
        prefix = "===> " if j == idx else "     "
        print(f"{prefix}[{msgs[j]['date']} {msgs[j]['time']}] {msgs[j]['sender']}: {repr(msgs[j]['text'])}")
