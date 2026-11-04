import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

# Let's search the entire WhatsApp Chat file for phone numbers like 8080490423, or 3360, etc.
chat_path = "scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt"

with open(chat_path, 'r', encoding='utf-8') as f:
    full_chat = f.read()

queries = [
    "8080490423", "80804 90423",
    "3360",
    "speed post",
    "alok mishra",
    "alokmishra",
    "pradeep nirmal",
    "vikaspayal", "vikas payal", "simram", "9137805402",
    "mantesh",
    "dhyal ghegat", "jamner",
    "kavita chikane",
    "gorakhnath",
    "sonali amol pawar",
    "amir merchant",
    "varsha nikam",
    "tanaji chavan",
    "smita singh",
    "laxman nandrekar",
    "kapil ingle",
    "chiana mondol",
    "mayuri", "baviskar",
    "rajnikant",
    "himanshu gosai",
    "madan mohan",
    "dr a p ilme",
    "hemant arvind"
]

for q in queries:
    matches = [m.start() for m in re.finditer(re.escape(q), full_chat, re.IGNORECASE)]
    print(f"Query '{q}': found {len(matches)} matches in full chat")
    for pos in matches[:3]:
        snippet = full_chat[max(0, pos-100):min(len(full_chat), pos+150)].replace('\n', ' ')
        print(f"   ...{snippet}...")
