import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== MINOR SENDERS IN JUNE 2026 ===")
for m in msgs:
    if m['sender'] in ['SYSTEM', '+91 86001 40344', '+91 99700 02285', '+91 98900 70524']:
        print(f"IDX {m['idx']:3d} | {m['sender']} | {m['date']} {m['time']}")
        print(repr(m['text']))
        print("-" * 50)
