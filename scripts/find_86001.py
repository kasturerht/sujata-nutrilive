import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if '86001 40344' in l or '8600140344' in l:
        print(f"Line {i+1}: {l.strip()}")
        # print context
        for j in range(max(0, i-2), min(len(lines), i+3)):
            if j != i:
                print(f"   {j+1}: {lines[j].strip()}")
        print('='*50)
