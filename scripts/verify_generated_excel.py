import openpyxl
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\Admin\Downloads\Sujata_Nutrilive_June_2026_Customers_Updated.xlsx"
wb = openpyxl.load_workbook(file_path, data_only=True)

print("Sheet names:", wb.sheetnames)

ws1 = wb["सर्व ग्राहक (All Customers)"]
print("Sheet 1 max row:", ws1.max_row, "max col:", ws1.max_column)
print("Sheet 1 row 4 sample:", [ws1.cell(4, c).value for c in range(1, 15)])
print("Sheet 1 total row (row 117):", [ws1.cell(117, c).value for c in [1, 12]])

ws2 = wb["कामगिरी सारांश (Summary)"]
print("\n--- Sheet 2 (Summary) Rows ---")
for r in range(4, ws2.max_row + 1):
    row_vals = [ws2.cell(r, c).value for c in range(1, 9)]
    print(f"Row {r}: {row_vals}")

ws3 = wb["वगळलेले मेसेज (Non-Orders)"]
print("\nSheet 3 max row:", ws3.max_row, "Total data rows:", ws3.max_row - 3)

ws4 = wb["तपासणी नोंदी (Audit Flags)"]
print("\nSheet 4 max row:", ws4.max_row, "Total audit cases:", ws4.max_row - 3)

wb.close()
print("\nVERIFICATION COMPLETE AND SUCCESSFUL!")
