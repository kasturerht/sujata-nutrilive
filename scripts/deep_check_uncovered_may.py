import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

from reconcile_may_master import main_map, merged_map

# Add the newly discovered order 349 and its merged parts
main_map[349] = True
for sub in [350, 351, 352, 424, 425, 426, 427]:
    merged_map[sub] = 349

# Add 474 to 472
merged_map[474] = 472

# Add 548 to 531
merged_map[548] = 531

remaining_uncovered = [i for i in range(len(msgs)) if i not in main_map and i not in merged_map]
print(f"Total remaining uncovered: {len(remaining_uncovered)}")

# Check any message with text length > 30
long_uncovered = []
for i in remaining_uncovered:
    m = msgs[i]
    t = m['text'].strip()
    if len(t) > 30 and not t.startswith('<Media'):
        long_uncovered.append((i, m['sender'], t))

print(f"Long uncovered messages: {len(long_uncovered)}")
for i, s, t in long_uncovered:
    print(f"[{i}] {s}: {t[:100]}")
    print("-" * 40)
