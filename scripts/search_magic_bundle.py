import urllib.request
import re

url = 'https://checkout.razorpay.com/v1/magic-checkout.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

phrases = ['proceed with cash', 'continue with cod', 'pay online', 'are you sure', 'rto', 'nudge', 'convert_to_prepaid', 'cod_prompt', 'prepaid_nudge', 'confirm_close']
for p in phrases:
    matches = list(re.finditer(re.escape(p), content, re.IGNORECASE))
    print(f'Phrase "{p}": {len(matches)} matches')
    for m in matches[:3]:
        s = max(0, m.start() - 60)
        e = min(len(content), m.end() + 80)
        print('  ->', content[s:e].replace('\n', ' '))
