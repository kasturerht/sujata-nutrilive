import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', encoding='utf-8') as f:
    msgs = json.load(f)

from find_missed_in_chatter import potential_missed_orders

with open('scripts/chatter_candidates_full.txt', 'w', encoding='utf-8') as out:
    for i, (idx, m, caller, reason, score) in enumerate(potential_missed_orders):
        out.write(f"=== [{i+1}/46] IDX {idx} | {caller} | {m['sender']} | {m['date']} {m['time']} ===\n")
        out.write(f"REASON EXCLUDED: {reason}\n")
        out.write(f"TEXT:\n{m['text']}\n")
        # Check next 2 messages
        for j in range(idx+1, min(len(msgs), idx+3)):
            out.write(f"  +NEXT [{msgs[j]['sender']}]: {msgs[j]['text']}\n")
        out.write("\n" + "="*70 + "\n\n")

print("Dumping complete to scripts/chatter_candidates_full.txt")
