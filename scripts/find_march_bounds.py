import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print('Total lines in raw file:', len(lines))

mar_lines = []
for i, line in enumerate(lines):
    if '/03/2026' in line or '/03/26' in line or '/3/2026' in line:
        mar_lines.append((i+1, line.strip()))

print('Found March 2026 lines count:', len(mar_lines))
if mar_lines:
    print('First March line:', mar_lines[0])
    print('Last March line:', mar_lines[-1])
