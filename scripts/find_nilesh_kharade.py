import json
import sys
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')

# Search in chat
with open('scripts/october_whatsapp_messages.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print("=== RAW CHAT SEARCH FOR NILESH KHARADE ===")
for m in msgs:
    if 'kharade' in m['text'].lower() or 'nilesh' in m['text'].lower():
        print(f"Sender: {m['sender']} | Date: {m['dateStr']} {m['timeStr']}")
        print(m['text'])
        print("="*60)

# Search in Excel
df = pd.read_excel(r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx', sheet_name=0)
matches = df[df.apply(lambda row: 'kharade' in str(row).lower() or 'nilesh' in str(row).lower(), axis=1)]
print("\n=== IN EXCEL ===")
for idx, r in matches.iterrows():
    print(dict(r))
