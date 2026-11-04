import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

def inspect_range(start, end, label):
    print(f"\n==================== {label} (IDX {start} - {end}) ====================")
    for i in range(start, end + 1):
        m = msgs[i]
        print(f"IDX {i:3d} | {m['sender']} | {m['date']} {m['time']}")
        print(repr(clean(m['text'])))
        print("-" * 30)

inspect_range(279, 286, "Manoj M Thakur repost")
inspect_range(326, 336, "Vidyadhar Khadkikar repost")
inspect_range(509, 516, "MS Rajput repost")
inspect_range(580, 587, "Pavan Vishwakarma repost")
inspect_range(753, 758, "Balasaheb Dhokale repost")
