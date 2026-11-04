import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

yash_indices = [
    17,   # ARUNKUMAR SUDAMRAO KHILLARE
    26,   # Umesh waghmare
    32,   # Jaya Dhondge
    46,   # Renuka Rodi
    76,   # ARUNKUMAR SUDAMRAO KHILLARE (correction)
    85,   # Nilesh zambre
    157,  # Dr.suman
    158,  # Poonamyadav
    187,  # Rajesh Sarnaik
    193,  # Aishwarya Damugade
    233,  # Avinash Sumant Salvi
    235,  # Sameep Waghmare
    250,  # Vivek warade
    262,  # Rajesh Pancholi
    267,  # Dr. Pratiksha Sanjay (PT)
    275,  # Suhas vasant nikam
    287,  # Dashrath Baburao Chavan
    307,  # Rajesh Sarnaik (seabuckthorn)
    308,  # Dr.suman (check)
    321,  # Dr.Satish Kr.Agarwal
    323,  # Kusum apartment Gangapur road
    332,  # Gokul Timkare
    350,  # Dr. Pratiksha Sanjay (PT)
    353,  # Prafulla S. Shevale
    373,  # Nandkumar Panpatte
    382,  # Basant kumar ogar
    394,  # Vishwas Bapu Powar
    410,  # Neeta prashant chhatre
    454,  # New mauli distributor (Kapil Ingle)
    483,  # Dr Ranjana
    491,  # Media order (500 prepaid)
    501,  # Smart Look Beauty Clinic Nashik
    503,  # P P Bhusari
    506,  # Dr. Rajkumar Laxman Rangari
    510,  # Vinod H.Wankhede
    513   # Mahantesh Karle
]

print("=== DETAILED YASH CANDIDATES ===")
for idx in yash_indices:
    m = next(m for m in messages if m['index'] == idx)
    print(f"[{idx}] {m['sender']} ({m['timestamp']}):")
    for l in m['content'].split('\n'):
        print(f"   {l}")
    print('-'*50)
