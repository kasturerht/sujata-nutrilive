import sys
import pandas as pd
import re

sys.stdout.reconfigure(encoding='utf-8')
df = pd.read_excel(r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx', sheet_name=0)

print("=== CHECKING ALL CUSTOMER NAMES ===")
suspicious_names = []
for idx, r in df.iterrows():
    name = str(r['Customer Name'])
    if len(name) > 30 or len(name) < 3 or re.search(r'\d{4}|order|spirulina|capsule|tablet|combo|road|nagar|plot|midc|gali|lane', name, re.I):
        suspicious_names.append((r['Sr No'], r['Telecaller'], name))

print(f"Total suspicious names: {len(suspicious_names)}")
for sn in suspicious_names:
    print(f"Row {sn[0]} [{sn[1]}]: '{sn[2]}'")
