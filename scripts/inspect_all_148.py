import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')

def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

indices = [0, 2, 10, 14, 15, 18, 33, 71, 73, 76, 77, 78, 90, 91, 95, 96, 121, 127, 177, 182, 183, 184, 216, 217, 221, 222, 228, 231, 248, 249, 251, 266, 267, 276, 277, 280, 282, 284, 298, 303, 304, 306, 308, 309, 319, 325, 328, 335, 343, 347, 349, 359, 373, 374, 376, 379, 380, 381, 429, 442, 443, 446, 449, 452, 456, 457, 459, 465, 468, 492, 504, 505, 506, 507, 510, 511, 513, 525, 526, 527, 529, 533, 536, 538, 540, 541, 543, 550, 551, 552, 553, 556, 557, 558, 559, 572, 576, 577, 578, 582, 590, 592, 595, 597, 600, 604, 605, 616, 620, 622, 631, 633, 637, 639, 640, 660, 661, 663, 665, 666, 668, 670, 672, 674, 675, 676, 677, 678, 682, 683, 687, 688, 689, 702, 703, 708, 709, 711, 741, 742, 743, 744, 747, 748, 752, 755, 757, 758]

with open('scripts/customer_candidates_detailed.txt', 'w', encoding='utf-8') as out:
    for idx in indices:
        m = msgs[idx]
        out.write(f"=== CANDIDATE IDX {idx} | {m['sender']} | {m['date']} {m['time']} ===\n")
        out.write(clean(m['text']) + "\n")
        # Check surrounding
        if idx > 0:
            prev_m = msgs[idx-1]
            out.write(f"  [PREV {idx-1} | {prev_m['sender']}]: {repr(clean(prev_m['text'])[:80])}\n")
        if idx < len(msgs) - 1:
            next_m = msgs[idx+1]
            out.write(f"  [NEXT {idx+1} | {next_m['sender']}]: {repr(clean(next_m['text'])[:80])}\n")
        out.write("-" * 60 + "\n\n")

print(f"Written detailed analysis of {len(indices)} candidate messages to scripts/customer_candidates_detailed.txt")
