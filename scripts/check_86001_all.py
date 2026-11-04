import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if '86001' in l:
        print(f"Line {i+1}: {l.strip()}")
