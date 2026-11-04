import sys
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')
df = pd.read_excel(r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers.xlsx', sheet_name=0)

print(f"Total Rows: {len(df)}")
for idx, row in df.iterrows():
    p = str(row['Products Ordered'])
    if p.startswith('month') or p.startswith('months') or p.startswith('spirulina') or p.startswith('bottle'):
        print(f"Row {row['Sr No']} [{row['Telecaller']}]: {row['Customer Name']} -> {p}")
