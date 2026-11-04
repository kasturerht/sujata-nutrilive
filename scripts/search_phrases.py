import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

chat_path = "scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt"
with open(chat_path, 'r', encoding='utf-8') as f:
    full_chat = f.read()

def find_context(phrase):
    print(f"\n=== SEARCHING FOR: '{phrase}' ===")
    matches = [m.start() for m in re.finditer(re.escape(phrase), full_chat, re.IGNORECASE)]
    for pos in matches:
        snippet = full_chat[max(0, pos-200):min(len(full_chat), pos+250)].replace('\n', ' -- ')
        print(f"[{pos}]: {snippet}\n")

find_context("Ashwagandha tab :-2")
find_context("10 Seabuckthorn capsule")
find_context("Speed post 5 tab")
find_context("2 120 tab -- 2 bath soap")
find_context("bath soap -- Prepaid order")
find_context("120 tab 2 bottel")
find_context("kmala spieulina sticker")
find_context("Dr.Satish Suryawanshi")
