import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total messages in March: {len(msgs)}")

# Let's inspect Pradeep Nirmal between 1 and 70
print("=== Messages around Pradeep Nirmal (0 to 70) ===")
for m in msgs[:70]:
    c = m['content']
    if any(k in c.lower() for k in ['pradeep', 'nirmal', '9223343444', 'bhayandar', 'royal palace', 'tejal', 'shirpur', 'dhangar', 'sulai']):
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")

# Let's check Sanjay Dhangar (155 to 250)
print("\n=== Messages around Sanjay Dhangar (150 to 250) ===")
for m in msgs[150:250]:
    c = m['content']
    if any(k in c.lower() for k in ['sanjay', 'dhangar', 'shirpur', '9975274536']):
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")
