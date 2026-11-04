import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'r', encoding='utf-8') as f:
    chat_text = f.read()

def search_chat(query, max_matches=5):
    print(f"\n================ SEARCH: '{query}' ================")
    matches = [m.start() for m in re.finditer(re.escape(query), chat_text, re.IGNORECASE)]
    print(f"Total occurrences: {len(matches)}")
    for pos in matches[:max_matches]:
        start = max(0, pos - 150)
        end = min(len(chat_text), pos + 250)
        print('-'*30)
        print(chat_text[start:end].strip())

search_chat("Renuka Rodi")
search_chat("Sarnaik")
search_chat("Savarkar")
search_chat("Roshan Vrinda")
search_chat("Somnath piku shinde")
search_chat("Sameep Waghmare")
search_chat("Dashrath Baburao Chavan")
search_chat("sujata pise")
search_chat("Basant kumar ogar")
search_chat("विश्वास बापू पोवार")
search_chat("New mauli distributor")
search_chat("Dr Ranjana")
search_chat("Rajkumar Laxman Rangari")
search_chat("RagNidan")
