import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total July 2026 messages: {len(msgs)}")

DEV_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')

STAFF_PHONES = {
    '9922534443', '9272471529', '9922500344', '9922577344',
    '9503434653', '9096759653', '8600140344', '9518505481',
    '9607259661', '8805168275'
}

def clean_phone(p):
    p = str(p).translate(DEV_DIGITS)
    p = re.sub(r'[\s\-\(\)\+]', '', p)
    if p.startswith('91') and len(p) == 12:
        p = p[2:]
    elif len(p) == 11 and p.startswith(('9', '8', '7')):
        p = p[:10]
    return p

# Dump all messages to a readable format with preliminary tag
with open('scripts/july_all_messages_dump.txt', 'w', encoding='utf-8') as out:
    for idx, m in enumerate(msgs):
        out.write(f"[{idx}] {m['date']} {m['time']} | {m['sender']}\n")
        out.write(f"{m['text']}\n")
        out.write("-" * 60 + "\n")

print("Dumped all 759 messages to scripts/july_all_messages_dump.txt")
