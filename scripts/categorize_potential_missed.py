import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', encoding='utf-8') as f:
    msgs = json.load(f)

from find_missed_in_chatter import potential_missed_orders

print(f"Total to examine: {len(potential_missed_orders)}\n")

for i, (idx, m, caller, reason, score) in enumerate(potential_missed_orders):
    t_prev = msgs[idx-1]['text'] if idx > 0 else ''
    t_curr = m['text']
    t_next = msgs[idx+1]['text'] if idx < len(msgs)-1 else ''
    
    sender_prev = msgs[idx-1]['sender'] if idx > 0 else ''
    sender_next = msgs[idx+1]['sender'] if idx < len(msgs)-1 else ''
    
    print(f"[{i+1}/{len(potential_missed_orders)}] IDX {idx} | {caller} | {m['sender']} | {m['date']} {m['time']}")
    print(f"  CURR: {repr(t_curr[:150])}")
    if sender_prev == m['sender'] and len(t_prev) > 0:
        print(f"  PREV (same sender): {repr(t_prev[:120])}")
    if sender_next == m['sender'] and len(t_next) > 0:
        print(f"  NEXT (same sender): {repr(t_next[:120])}")
    print("-" * 60)
