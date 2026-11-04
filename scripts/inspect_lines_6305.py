import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(6305, 6345):
    print(f"Line {i+1}: {lines[i].strip()}")
