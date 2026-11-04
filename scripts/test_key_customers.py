import json
import sys
from test_extractor import extract_order_fields

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/october_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

test_names = [
    'Shriram Yeola', 'Imran Patel', 'Nilesh Kharade', 'Zahid Khan',
    'Vijay Desai', 'Ujwala Hule', 'Saurabh Kukreja', 'Asha nandgaonkar', 'Babu Dhotre'
]

for name in test_names:
    found = [m for m in msgs if name.lower() in m['text'].lower()]
    if found:
        m = found[0]
        caller = m['sender'].replace('Sujata Nutrilve ', '').replace('Sujata Nutrilive ', '').replace('Agrotech ', '')
        rec = extract_order_fields(m, caller)
        print(f"\n==================== {name} ====================")
        for k, v in rec.items():
            print(f"  {k}: {repr(v)}")
    else:
        print(f"ERROR: {name} not found!")
