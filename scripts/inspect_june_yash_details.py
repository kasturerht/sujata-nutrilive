import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

from analyze_june_yash_candidates import candidate_indices

print(f"Total candidate indices: {len(candidate_indices)}")

with open('scripts/yash_candidates_context.txt', 'w', encoding='utf-8') as out:
    for idx in candidate_indices:
        m = msgs[idx]
        out.write(f"=== CANDIDATE IDX {idx:3d} | {m['date']} {m['time']} ===\n")
        out.write(clean(m['text']).strip() + "\n")
        # Check next 3 messages
        for offset in [1, 2]:
            next_idx = idx + offset
            if next_idx < len(msgs):
                nm = msgs[next_idx]
                out.write(f"  [NEXT +{offset} | IDX {next_idx} | {nm['sender']}]: {repr(clean(nm['text']).strip()[:80])}\n")
        out.write("-" * 60 + "\n\n")

print("Generated scripts/yash_candidates_context.txt")
