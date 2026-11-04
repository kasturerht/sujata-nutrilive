import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

from verify_order_sets import all_accounted_ids

# Add the 2 new orders and their merged parts
all_accounted_ids.add(367)
all_accounted_ids.add(649)
all_accounted_ids.add(650)

print(f"Total accounted so far: {len(all_accounted_ids)}")

# Scan all other messages for any text longer than 20 characters
unaccounted = [i for i in range(len(msgs)) if i not in all_accounted_ids]
print(f"Unaccounted messages: {len(unaccounted)}")

long_unaccounted = []
for i in unaccounted:
    t = msgs[i].get('text', '').strip()
    if len(t) > 25 and not t.startswith('<Media omitted>'):
        long_unaccounted.append((i, msgs[i].get('sender'), t))

print(f"Long unaccounted messages: {len(long_unaccounted)}")
with open('scripts/long_unaccounted.txt', 'w', encoding='utf-8') as f:
    for i, s, t in long_unaccounted:
        f.write(f"=== IDX {i} | {s} ===\n{t}\n\n")

print("Saved to scripts/long_unaccounted.txt")
