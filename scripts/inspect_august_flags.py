import pandas as pd
import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

excel_path = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_August_2026_Customers_Updated.xlsx'
df_flags = pd.read_excel(excel_path, sheet_name='तपासणी नोंदी (Audit Flags)')
print(f"Total audit flags: {len(df_flags)}")
for idx, r in df_flags.iterrows():
    print(f"#{r['Sr No']} [{r['Date']}] {r['Telecaller']} | Name: {r['Customer Name']} | Phone: {r['Mobile Number']} | Pin: {r['Pincode']} | Amt: {r['Amount (₹)']} | Flag: {r['Audit Flag / Observation']}")
