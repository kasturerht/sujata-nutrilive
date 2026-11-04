import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    chat_text = f.read()

# Let's search for distributor rates, bride cream, 5 oil, etc.
def search_snippet(keyword):
    print(f"\n--- Snippets for: {keyword} ---")
    matches = [m.start() for m in re.finditer(re.escape(keyword), chat_text, re.IGNORECASE)]
    for pos in matches[:4]:
        start = max(0, pos - 100)
        end = min(len(chat_text), pos + 200)
        print(chat_text[start:end].strip())
        print('-'*30)

search_snippet("bride cream")
search_snippet("5 oil")
search_snippet("dp rate")
search_snippet("sujata pise")
search_snippet("Basant kumar")
search_snippet("Dashrath Baburao")
search_snippet("Kapil Ingle")
search_snippet("10 bride cream")
