import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Find messages missing phone or amount
# Let's inspect the entire list of August messages and check context around each!
missing_phone_orders = [
    ('देविदास रामदास भोई', '04/08/2026'),
    ('Nandakumar Patil', '16/08/2026'),
    ('Rainbow Nx Pharmacy', '25/08/2026'),
    ('चनबसप्पा विठोबा आलुरे', '31/08/2026'),
    ('Dr. Janardan k pagar', '24/08/2026'),
    ('Rajesh Patode', '25/08/2026'),
    ('आत्मजः नूरा', '10/08/2026'),
    ('Subhadra Abhiman Sathe', '08/08/2026'),
    ('aniket devkule', '26/08/2026'),
    ('Shanti Lal Jangid', '08/08/2026')
]

for name_part, dt in missing_phone_orders:
    for idx, m in enumerate(msgs):
        if name_part.lower() in m['text'].lower():
            print(f"=== FOUND {name_part} at idx {idx} [{m['date']} {m['time']}] ===")
            start = max(0, idx - 2)
            end = min(len(msgs), idx + 4)
            for j in range(start, end):
                print(f"  [{msgs[j]['date']} {msgs[j]['time']}] {msgs[j]['sender']}: {repr(msgs[j]['text'])}")
            print("=" * 60)
