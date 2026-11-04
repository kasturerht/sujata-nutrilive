import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect every single message sent by Yash that could be an order or part of an order
print("=== YASH MESSAGES WITH ORDER-LIKE CONTENT ===")
for m in msgs:
    if m['sender'] == 'Yash R. Suryawanshi':
        c = m['content'].strip()
        lines = c.split('\n')
        if any(w in c.lower() for w in ['tab', 'capsule', 'powder', 'soap', 'oil', 'shampoo', 'cream', 'facewash', 'cookies', 'moringa', 'ashwagandha', 'seabuckthorn', 'sea buckthorn', 'seabackthorn', 'bottel', 'bottle', 'sample', 'prepaid', 'cod', 'order', 'pin', 'pincode', 'mob', 'mobile', 'dist', 'tal']):
            print(f"[{m['index']}] {m['timestamp']}: {lines[0][:60]} (len={len(lines)})")
