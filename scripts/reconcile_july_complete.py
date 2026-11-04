import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

print(f"Total messages loaded: {len(msgs)}")

# Let's inspect all messages sent by each sender and identify:
# 1. Sujata Nutrilive Agrotech Punam kasture
# 2. +91 88051 68275 (Darshan Bayas)
# 3. Sujata Nutrilive (Monu)
# 4. Sujata Nutrilive Manju
# 5. Yash R. Suryawanshi
# 6. Om Amazon Dispatch
# 7. Other senders (+91 99700 02285, +91 98900 70524, SYSTEM, RK)

# Let's list all orders found so far and their component message indices
