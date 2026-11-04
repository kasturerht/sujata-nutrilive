import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

print(f"Total messages in April 2026: {len(messages)}")

# Let's inspect messages by sender
senders = {}
for m in messages:
    s = m['sender']
    senders[s] = senders.get(s, 0) + 1

print("\n--- Senders Breakdown ---")
for s, c in sorted(senders.items(), key=lambda x: x[1], reverse=True):
    print(f"{s}: {c}")

# Let's check for order-like patterns:
# name, address, pin, mobile, phone, cod, prepaid, bottle, capsule, powder, tablet
order_keywords = ['name', 'नाव', 'address', 'पत्ता', 'pin', 'मो.', 'mob', 'phone', 'cod', 'prepaid', 'capsule', 'powder', 'tab', 'bottle', 'किंमत', 'rs', '/-']

potential_orders = []
for m in messages:
    text = m['content'].lower()
    score = sum(1 for kw in order_keywords if kw in text)
    has_phone = bool(re.search(r'\b[6-9]\d{9}\b', text) or re.search(r'\b[6-9]\d{4}\s*\d{5}\b', text))
    if has_phone or score >= 3:
        potential_orders.append((m['index'], m['sender'], m['timestamp'], score, has_phone, m['content']))

print(f"\nPotential order messages found: {len(potential_orders)}")
