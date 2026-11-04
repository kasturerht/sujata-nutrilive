import openpyxl
import pandas as pd
import sys

sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook(r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Customers_Updated.xlsx')
ws1 = wb['सर्व ग्राहक (All Customers)']
headers = [c.value for c in ws1[1]]

rows = []
for r in range(2, ws1.max_row + 1):
    vals = [ws1.cell(r, c).value for c in range(1, len(headers) + 1)]
    rows.append(dict(zip(headers, vals)))

df = pd.DataFrame(rows)

for caller in ['Manjushree Kasture', 'Vaishnavi Diwate', 'Monu', 'Punam Kasture', 'Karishma Patil']:
    c_df = df[df['Telecaller'] == caller]
    total_orders = len(c_df)
    total_amt = c_df['Amount (₹)'].sum()
    aov = round(total_amt / total_orders) if total_orders else 0
    
    types = c_df['Order Type'].value_counts().to_dict()
    office_cnt = len(c_df[c_df['Full Address'].str.contains('Office', case=False, na=False) | c_df['Pincode'].str.contains('Office', case=False, na=False)])
    web_cnt = types.get('Website Order (Forwarded)', 0)
    direct_cnt = total_orders - web_cnt
    
    dir_amt = c_df[c_df['Order Type'] != 'Website Order (Forwarded)']['Amount (₹)'].sum()
    web_amt = c_df[c_df['Order Type'] == 'Website Order (Forwarded)']['Amount (₹)'].sum()
    
    print(f"{caller}:")
    print(f"  Total Orders: {total_orders} (Direct: {direct_cnt}, Web: {web_cnt}, Office: {office_cnt})")
    print(f"  Total Amount: ₹{total_amt:,} (Direct: ₹{dir_amt:,}, Web: ₹{web_amt:,})")
    print(f"  AOV: ₹{aov:,}")

tele_df = df[df['Telecaller'] != 'Yash Suryawanshi (Founder Direct)']
t_tot = tele_df['Amount (₹)'].sum()
t_cnt = len(tele_df)
print("\nALL TELECALLERS TOTAL:")
print(f"  Orders: {t_cnt}")
print(f"  Amount: ₹{t_tot:,}")
print(f"  AOV: ₹{round(t_tot / t_cnt):,}")

yash_df = df[df['Telecaller'] == 'Yash Suryawanshi (Founder Direct)']
y_tot = yash_df['Amount (₹)'].sum()
y_cnt = len(yash_df)
print("\nYASH FOUNDER DIRECT:")
print(f"  Orders: {y_cnt}")
print(f"  Amount: ₹{y_tot:,}")
print(f"  AOV: ₹{round(y_tot / y_cnt):,}")

g_tot = df['Amount (₹)'].sum()
g_cnt = len(df)
print("\nGRAND TOTAL OCTOBER:")
print(f"  Orders: {g_cnt}")
print(f"  Amount: ₹{g_tot:,}")
print(f"  AOV: ₹{round(g_tot / g_cnt):,}")
