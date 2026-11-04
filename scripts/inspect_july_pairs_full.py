import json, sys
sys.stdout.reconfigure(encoding='utf-8')

msgs = json.load(open('scripts/july_whatsapp_messages_TRUE.json', encoding='utf-8'))

from find_july_pairs import pairs

with open('scripts/july_pairs_inspection.txt', 'w', encoding='utf-8') as out:
    for i, p in enumerate(pairs):
        out.write(f"=== PAIR {i+1}/{len(pairs)}: IDX {p[0]} & {p[1]} | {p[2]} | {p[3]} {p[4]} ===\n")
        out.write(f"M1 [IDX {p[0]}]:\n{msgs[p[0]]['text']}\n")
        out.write(f"M2 [IDX {p[1]}]:\n{msgs[p[1]]['text']}\n")
        # Also print next message if exists
        if p[1] + 1 < len(msgs):
            m3 = msgs[p[1] + 1]
            if m3['sender'] == p[2]:
                out.write(f"M3 [IDX {p[1]+1} - SAME SENDER]:\n{m3['text']}\n")
        out.write("=" * 60 + "\n\n")

print(f"Dumped {len(pairs)} pairs to scripts/july_pairs_inspection.txt")
