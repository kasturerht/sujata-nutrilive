import sys
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')
df = pd.read_excel(r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx', sheet_name=0)

check_names = ['nilesh kharade', 'imran patel', 'dhiraj pawar', 'vikram jojare', 'chetankumari', 'ravi patil', 'mohan solankar', 'gopal nanasaheb']
for cn in check_names:
    row = df[df['Customer Name'].str.contains(cn, case=False, na=False)]
    print(f"=== {cn.upper()} ===")
    for idx, r in row.iterrows():
        print(f"  Name: {r['Customer Name']}")
        print(f"  Phone: {r['Mobile Number']}")
        print(f"  Pin: {r['Pincode']}")
        print(f"  Addr: {r['Full Address']}")
        print(f"  Prod: {r['Products Ordered']}")
        print(f"  Amt: ₹{r['Amount (₹)']}")
        print("-" * 40)
