import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

print(f"Total messages loaded: {len(messages)}")

# Let's inspect all orders one by one to verify their parent indices and sub-message indices
