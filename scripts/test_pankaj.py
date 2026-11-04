import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total June messages loaded: {len(msgs)}")

# Master order definitions for June:
# We have:
# 1. Manjushree orders (25 orders, but let's check Pankaj Namdeo 890 which Manju clarified prepaid)
# 2. Monu orders
# 3. Yash orders

# Let's inspect Pankaj Namdeo (IDX 890):
# Yash posted: IDX 890 Pankaj Namdeo (Dewas 455001, 8889077717), 891: Capsule 1.
# Manju at 894 said: "Prepaid aahe hey... online payment jhal aahe yanch..."
# Is Pankaj Namdeo Manjushree's order or Yash's order?
# In other months (like August/July), when a telecaller says "Prepaid aahe hey... online payment jhal aahe yanch...", it means the telecaller took the order and the customer paid online to the founder/account, so the founder booked it or posted it.
# Let's check whether Manju or Yash is the telecaller for Pankaj Namdeo, or if we assign to Manju or Yash.
# Let's check if there are other messages from Manju about Pankaj Namdeo.
