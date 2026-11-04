import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    text = f.read()

names = [
    'Nandakumar Patil', 'Rainbow Nx', 'चनबसप्पा', 'Janardan', 'Rajesh Patode', 'पांधी का पार', 'Subhadra', 'Shanti Lal'
]

for n in names:
    matches = [line for line in text.split('\n') if n.lower() in line.lower()]
    print(f"=== Matches for {n} ({len(matches)}) ===")
    for m in matches[:5]:
        print("  ", m[:140])
