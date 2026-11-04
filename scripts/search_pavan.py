import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    text = f.read()

matches = [m.start() for m in re.finditer(r'8341764069', text)]
print('Matches for 8341764069:', len(matches))
for m in matches:
    print(repr(text[max(0, m-100):min(len(text), m+200)]))
