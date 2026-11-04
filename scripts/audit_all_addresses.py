import json
import sys
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')

df = pd.read_excel(r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx', sheet_name=0)

print("=== CHECKING SHORT / SUSPICIOUS ADDRESSES ===")
short_addrs = []
for idx, row in df.iterrows():
    addr = str(row['Full Address'])
    name = str(row['Customer Name'])
    if len(addr) < 20 or addr.lower() == name.lower() or name.lower() in addr.lower() and len(addr) < 30:
        short_addrs.append((row['Sr No'], row['Telecaller'], name, addr))

print(f"Total suspicious addresses: {len(short_addrs)}")
for sa in short_addrs:
    print(f"Row {sa[0]} [{sa[1]}]: Name='{sa[2]}' | Addr='{sa[3]}'")
