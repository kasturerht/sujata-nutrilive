import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Let's inspect IDX 115 to 130
print("=== INSPECTING IDX 115 - 130 ===")
for i in range(115, 131):
    m = msgs[i]
    print(f"IDX {i} | {m['sender']} | {m['date']} {m['time']}")
    print(repr(clean(m['text'])))
    print("-" * 30)

print("\n=== INSPECTING IDX 229 - 235 ===")
for i in range(229, 236):
    m = msgs[i]
    print(f"IDX {i} | {m['sender']} | {m['date']} {m['time']}")
    print(repr(clean(m['text'])))
    print("-" * 30)

print("\n=== INSPECTING IDX 280 - 286 ===")
for i in range(280, 287):
    m = msgs[i]
    print(f"IDX {i} | {m['sender']} | {m['date']} {m['time']}")
    print(repr(clean(m['text'])))
    print("-" * 30)

print("\n=== INSPECTING IDX 344 - 350 ===")
for i in range(344, 351):
    m = msgs[i]
    print(f"IDX {i} | {m['sender']} | {m['date']} {m['time']}")
    print(repr(clean(m['text'])))
    print("-" * 30)

print("\n=== INSPECTING IDX 602 - 608 ===")
for i in range(602, 609):
    m = msgs[i]
    print(f"IDX {i} | {m['sender']} | {m['date']} {m['time']}")
    print(repr(clean(m['text'])))
    print("-" * 30)
