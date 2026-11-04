import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total messages: {len(msgs)}")
print("First message (IDX 0):", msgs[0]['date'], msgs[0]['time'], msgs[0]['sender'], repr(msgs[0]['text'][:60]))
print("Last message (IDX 912):", msgs[-1]['date'], msgs[-1]['time'], msgs[-1]['sender'], repr(msgs[-1]['text'][:60]))

from collections import Counter
senders = Counter(m['sender'] for m in msgs)
print("\n=== SENDER BREAKDOWN (JUNE 2026) ===")
for s, c in senders.most_common():
    print(f"{s:<35}: {c:3d} messages")
