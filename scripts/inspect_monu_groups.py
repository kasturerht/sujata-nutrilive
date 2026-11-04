import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect Monu candidates in detail
# The candidates found earlier:
# IDX 10: kshama Borate
# IDX 17-20: Rajn walia
# IDX 30: monoj Rai
# IDX 32: Prajkta kakade
# IDX 40: किशनाराम
# IDX 56, 57: Swapnil Vishwanath Gore (IDX 57 is 1 spirulina capsule 1 seabackthorn)
# IDX 85: chandra Nidhaan Pandey
# IDX 87: Amarjeet singh
# IDX 97: B k Pandey
# IDX 125, 126, 127: Flat No 312, B wing... 1 capsule 1 seabuckthorn prepaid 800
# IDX 183: swami Somanath
# IDX 190: Prashant patil
# IDX 191: Ganesh shankar Fulpati
# IDX 204, 205: Nem Dhiraj / capsule 1 cod 450
# IDX 206, 209, 210, 211: Ramvriksh / 221005 / 9616233399 / 120 tab 450 cod
# IDX 229: Neeraj kapta
# IDX 272, 273: 141401 ? what is this?
# IDX 274: Shamal chandrsen pawar
# IDX 278, 279: patrkar Mujammil kamaliwale / spirulina bride cram facewash shampoo 1150 cod
# IDX 307: Akshar Patel
# IDX 309: शीला गौतम कानडे
# IDX 349: sopan Ganpat Ubhade
# IDX 524: Vikas jadhav
# IDX 537: Daljit Singh
# IDX 566, 567, 569: Mulund East... Satish pawaskar / cod 1050
# IDX 572: Swami Anand Bhartiya
# IDX 574: Ram Kapoor
# IDX 636: Dilip balkrishna pawar
# IDX 640: patrkar Mujammil kamaliwale
# IDX 666: Akram Enterprises
# IDX 711: tracking link?
# IDX 735: sk saber ali
# IDX 736: Kalpana dattatraya thombre
# IDX 743: BHARATBHAI MAKHECHA
# IDX 801: Dewan Jakir Hussain
# IDX 803: Vicky M Surti
# IDX 864, 865: Nitin Zemse

# Let's inspect each candidate and its surrounding messages!
candidate_indices = [
    10, 17, 30, 32, 40, 56, 85, 87, 97, 125, 183, 190, 191, 204, 206, 229,
    272, 274, 278, 307, 309, 349, 524, 537, 566, 572, 574, 636, 640, 666,
    711, 735, 736, 743, 801, 803, 864
]

for c in candidate_indices:
    print(f"=== CANDIDATE IDX {c} ===")
    for offset in range(-1, 4):
        target = c + offset
        if 0 <= target < len(msgs):
            m = msgs[target]
            print(f"  [{target}] {m.get('sender')} | {m.get('date')} {m.get('time')} | {repr(m.get('text', ''))[:80]}")
    print()
