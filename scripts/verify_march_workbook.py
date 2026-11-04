import sys, openpyxl

sys.stdout.reconfigure(encoding='utf-8')

wb_path = r"C:\Users\Admin\Downloads\Sujata_Nutrilive_March_2026_Customers_Updated.xlsx"
wb = openpyxl.load_workbook(wb_path)

print("Sheet names:", wb.sheetnames)

# Inspect Sheet 1
ws1 = wb["सर्व ग्राहक (All Customers)"]
print(f"Sheet 1 max row: {ws1.max_row}, max col: {ws1.max_column}")
print("Sheet 1 Sample Rows:")
for r in [4, 5, 6, ws1.max_row - 1, ws1.max_row]:
    vals = [ws1.cell(row=r, column=c).value for c in range(1, 15)]
    print(f"Row {r}: {vals[:5]} ... {vals[9:12]}")

# Inspect Sheet 2
ws2 = wb["कामगिरी सारांश (Summary)"]
print("\nSheet 2 Summary Table:")
for r in range(4, ws2.max_row + 1):
    vals = [ws2.cell(row=r, column=c).value for c in range(1, 9)]
    print(f"Row {r}: {vals}")

# Inspect Sheet 3
ws3 = wb["वगळलेले मेसेज (Non-Orders)"]
print(f"\nSheet 3 total rows: {ws3.max_row} (Header at 3, Data rows = {ws3.max_row - 3})")

# Inspect Sheet 4
ws4 = wb["तपासणी नोंदी (Audit Flags)"]
print(f"\nSheet 4 total rows: {ws4.max_row} (Header at 3, Data rows = {ws4.max_row - 3})")
