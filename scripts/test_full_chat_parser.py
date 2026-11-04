import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'^(\d{2}/\d{2}/\d{4}),\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s*-\s*([^:]+):\s*(.*?)(?=(?:^\d{2}/\d{2}/\d{4},\s*\d{1,2}:\d{2})|\Z)', re.MULTILINE | re.DOTALL)
matches = list(pattern.finditer(text))
print('Total messages parsed in python:', len(matches))
oct_matches = [m for m in matches if m.group(1).endswith('/10/2026')]
print('Total October messages in python:', len(oct_matches))
print('Last 5 October messages:')
for m in oct_matches[-5:]:
    first_line = m.group(4).strip().split('\n')[0]
    print(f"  {m.group(1)} {m.group(2)} [{m.group(3)}]: {first_line}")
