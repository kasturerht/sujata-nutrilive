import sys, pandas as pd
sys.stdout.reconfigure(encoding='utf-8')

df = pd.read_excel(r'C:\Users\Admin\Downloads\Sujata_Nutrilive_August_2026_Customers_Updated.xlsx', sheet_name='सर्व ग्राहक (All Customers)')

print("=== CHECKING DUPLICATE PHONE NUMBERS ===")
phone_counts = df['Mobile Number'].value_counts()
dup_phones = phone_counts[phone_counts > 1].index.tolist()
for p in dup_phones:
    if pd.isna(p) or p in ['Office Pickup (Nashik)', 'nan']:
        continue
    sub = df[df['Mobile Number'] == p]
    print(f"Phone {p} appears {len(sub)} times:")
    for idx, r in sub.iterrows():
        print(f"  #{r['Sr No']} [{r['Date']} {r['Time']}] {r['Telecaller']} | {r['Customer Name']} | Amt: {r['Amount (₹)']}")

print("\n=== CHECKING SIMILAR CUSTOMER NAMES ===")
name_counts = df['Customer Name'].value_counts()
dup_names = name_counts[name_counts > 1].index.tolist()
for n in dup_names:
    if n in ['Customer', 'Website Customer']:
        continue
    sub = df[df['Customer Name'] == n]
    print(f"Name {n} appears {len(sub)} times:")
    for idx, r in sub.iterrows():
        print(f"  #{r['Sr No']} [{r['Date']} {r['Time']}] {r['Telecaller']} | Phone: {r['Mobile Number']} | Amt: {r['Amount (₹)']}")
