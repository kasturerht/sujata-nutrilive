import sys
import pandas as pd
import re

sys.stdout.reconfigure(encoding='utf-8')
df = pd.read_excel(r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx', sheet_name=0)

print("=== CHECKING FOR LINGERING PREFIXES OR ISSUES IN FULL ADDRESS ===")
issues = []
for idx, r in df.iterrows():
    addr = str(r['Full Address'])
    name = str(r['Customer Name'])
    # check if addr starts with Mo. or Mb. or comma
    if re.search(r'^(?:Mo\.|Mb\.|Phone|Mob|Ph|,\s*|नाव|Name)', addr, re.I):
        issues.append((r['Sr No'], r['Telecaller'], name, addr))

print(f"Total address prefix issues: {len(issues)}")
for iss in issues:
    print(f"Row {iss[0]} [{iss[1]}]: {iss[2]} -> '{iss[3]}'")
