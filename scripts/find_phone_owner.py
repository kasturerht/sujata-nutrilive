import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'.{0,100}86001\s*40344.{0,100}', text)
for m in matches[:10]:
    print(m)
    print('-'*50)
