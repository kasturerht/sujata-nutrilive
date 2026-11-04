import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Inspect specific indices context
def check_range(s, e):
    print(f"=== CHECK RANGE {s} to {e} ===")
    for i in range(s, e + 1):
        if 0 <= i < len(msgs):
            m = msgs[i]
            print(f"[{i}] Line {m['start_line']} | {m['sender']} | {m['date']} {m['time']}:")
            print(f"  {repr(m['text'])[:120]}")
    print()

check_range(25, 30) # Shahalam
check_range(34, 40) # Dr Ranjana Igatpuri
check_range(50, 55) # Laxman Nandrekar
check_range(60, 65) # Sunita bharate
check_range(183, 191) # Santosh gupta / Abdul Saleem
check_range(198, 203) # Dr Milind More
check_range(226, 232) # Bajrang Kumbhar
check_range(280, 285) # Hitesh Mehta
check_range(349, 356) # 80802 14722
check_range(391, 398) # Ayushman Ayurvedic / Ravi Kumar / 9369262728
check_range(429, 437) # Vinchhiya Rajkot / Lilaram Chandwani
check_range(460, 466) # Achut Daule Patil
check_range(530, 538) # Laxman Gejage / Chandrakant Dhore
check_range(563, 568) # Vasant Joshi
check_range(590, 595) # Smita Singh
check_range(607, 614) # 416207 / 90228 03013
check_range(615, 620) # Smita Singh repost
check_range(658, 665) # Vishwas Bapu Powar
check_range(694, 706) # Pandit Pramod Sharma / Rajn Walia / 99926 04067
