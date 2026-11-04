import json
import re
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Manju order indices from earlier
manju_indices = [2, 10, 14, 15, 76, 77, 78, 119, 121, 177, 182, 183, 216, 230, 231, 248, 276, 325, 343, 347, 379, 465, 468, 504, 505, 506, 513, 527, 550, 552, 558, 559, 592, 604, 616, 620, 622, 639, 665, 666, 674, 675, 676, 687, 702, 703, 742, 743]

# Check phone numbers
phones = defaultdict(list)
phone_re = re.compile(r'(?:\+?91[\s-]?)?([6-9]\d{9})\b')

for idx in manju_indices:
    t = clean(msgs[idx]['text'])
    # normalize text spaces
    t_no_space = re.sub(r'(\d)\s+(\d)', r'\1\2', t)
    t_no_space = re.sub(r'(\d)\s+(\d)', r'\1\2', t_no_space)
    m_p = phone_re.findall(t_no_space)
    if not m_p:
        # check if phone was in merged msg
        if idx == 119: m_p = ['9881666073']
        if idx == 343: m_p = ['9637193363']
    for p in m_p:
        phones[p].append(idx)

for p, idxs in phones.items():
    if len(idxs) > 1:
        print(f"Duplicate phone {p} in Manju orders: {idxs}")
