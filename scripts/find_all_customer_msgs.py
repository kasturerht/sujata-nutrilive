import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')

def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect every message that has a phone number or 6-digit pin code
phone_re = re.compile(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b[6-9]\d{9}\b')
pin_re = re.compile(r'\b[1-9]\d{5}\b')

customer_msgs = []
for i, m in enumerate(msgs):
    t = clean(m['text'])
    has_p = bool(phone_re.search(t))
    has_pin = bool(pin_re.search(t))
    # Exclude system or short query
    if (has_p or has_pin) and 'added' not in t and 'This message was deleted' not in t:
        customer_msgs.append(i)

print(f"Total messages with phone or pin: {len(customer_msgs)}")
print("Indices:", customer_msgs)
