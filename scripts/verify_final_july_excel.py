import openpyxl
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r"C:\Users\Admin\Downloads\Sujata_Nutrilive_July_2026_Customers_Updated.xlsx"
wb = openpyxl.load_workbook(file_path, data_only=True)

print("Workbook sheet names:", wb.sheetnames)

# Check Sheet 1
ws1 = wb["सर्व ग्राहक (All Customers)"]
print(f"Sheet 1 Max Rows: {ws1.max_row} | Max Cols: {ws1.max_column}")
print("Sheet 1 Header:", [ws1.cell(3, c).value for c in range(1, 14)])
print("Sheet 1 Sample Row 4:", [ws1.cell(4, c).value for c in range(1, 14)])

# Check Sheet 2
ws2 = wb["कामगिरी सारांश (Summary)"]
print(f"\nSheet 2 Max Rows: {ws2.max_row}")
for r in range(3, ws2.max_row + 1):
    vals = [ws2.cell(r, c).value for c in range(1, 8)]
    if any(vals):
        print(f"Row {r:2d}: {vals}")

# Check Sheet 3
ws3 = wb["वगळलेले मेसेज (Non-Orders)"]
print(f"\nSheet 3 Max Rows: {ws3.max_row} (Total non-orders: {ws3.max_row - 3})")

# Check Sheet 4
ws4 = wb["तपासणी नोंदी (Audit Flags)"]
print(f"\nSheet 4 Max Rows: {ws4.max_row} (Total audit entries: {ws4.max_row - 3})")
