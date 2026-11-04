import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total May messages: {len(msgs)}")

# Let's inspect all candidate orders from Monu and Yash
# Let's write an inspection script to print each candidate order with full details
# Monu candidate indices
monu_order_candidates = [
    0, 26, 28, 34, 92, 115, 117, 118, 177, 201, 205, 209, 309, 343, 384,
    391, 461, 468, 494, 508, 512, 528, 530, 533, 575, 604, 647, 648, 665,
    666, 674, 675, 679, 685, 687, 695, 696, 709
]

# Yash candidate indices
yash_order_candidates = [
    10, 14, 38, 47, 48, 50, 51, 61, 85, 101, 139, 154, 181, 184, 187,
    190, 200, 215, 228, 256, 281, 306, 313, 344, 353, 357, 393, 395,
    399, 430, 436, 462, 472, 498, 504, 531, 537, 564, 591, 616, 618,
    621, 624, 660, 698
]

# Manju candidate indices
manju_order_candidates = [
    90, 91, 103, 210, 227, 318, 319, 388
]

print(f"Candidate counts: Monu: {len(monu_order_candidates)}, Yash: {len(yash_order_candidates)}, Manju: {len(manju_order_candidates)}")
