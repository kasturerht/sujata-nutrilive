import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Let's inspect Monu's orders in detail
print("=== DETAILED MONU CANDIDATES ===")
monu_indices = [
    23,   # Vaishali Yogesh Shirsath
    51,   # Somnath pote
    71,   # Chandana basu
    103,  # Housaji Gangaram Gaikwad
    115,  # Manbahadur kashatriya
    133,  # Tejal Shankar Walunj
    137,  # Dhanshree shirole (draft at 137, final at 140)
    140,  # Dhanshree shirole
    141,  # Rajesh Sarnaik
    147,  # Sopan Ganpat Uphade
    184,  # Annasaheb chandrakant yadav
    211,  # Usha laxman salunkhe
    213,  # Dr. Satish Savarkar
    215,  # Sanjay hasmukhalal Parmar
    216,  # Roshan Vrinda Vishnu Raut (draft by Monu at 216-220, posted by admin at 225)
    221,  # Somnath piku shinde
    238,  # Vikram Shivaji Nikam
    248,  # Vinita Vikram Kavate
    249,  # Bhausaheb Gopinath ahire
    252,  # Vashu sindhani
    271,  # Rahul Bhusari
    272,  # Krishna wakale
    278,  # Bhausaheb Gopinath ahire
    285,  # Surender kumar
    289,  # Bala Ghodake
    298,  # Vinod kumar
    327,  # Shahin Bano
    341,  # Sujata pise
    349,  # Bharat Arora
    412,  # Rajendra Janardan Patil
    413,  # Ganesh Babasaheb Daule
    417,  # Amar paithane
    427,  # Sopan Ganpat Ubhade
    436,  # Dr Ravikiran Bulbule
    442,  # Pankaj kr Nirala
    444,  # Rujuta Mandsorwale
    446,  # Suhas Basaraj mehtre
    448,  # Somanath pote
    463,  # Tanaji chavan
    465,  # Anil Hari Adagale
    479,  # Manoj avchar
    481,  # Suresh gore
    484,  # Ganesh Babasaheb Daule
    488,  # Shivaji Janardan Kadam
    509   # Amol Ashok awati
]

for idx in monu_indices:
    m = next(m for m in messages if m['index'] == idx)
    print(f"[{idx}] {m['sender']} ({m['timestamp']}):")
    for l in m['content'].split('\n'):
        print(f"   {l}")
    print('-'*50)
