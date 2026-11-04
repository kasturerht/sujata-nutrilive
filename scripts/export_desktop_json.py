import openpyxl
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

src_excel = r'C:\Users\Admin\Downloads\Sujata_Nutrilive_October_2026_Updated_31_10_2026.xlsx'
wb = openpyxl.load_workbook(src_excel)
ws = wb['सर्व ग्राहक (All Customers)']

orders = []
headers = [cell.value for cell in ws[1]]

for r in range(2, ws.max_row + 1):
    vals = [ws.cell(row=r, column=c).value for c in range(1, ws.max_column + 1)]
    orders.append({
        'sr_no': vals[0],
        'date': str(vals[1] or ''),
        'time': str(vals[2] or ''),
        'telecaller': str(vals[3] or ''),
        'customer_name': str(vals[4] or ''),
        'mobile_number': str(vals[5] or ''),
        'pincode': str(vals[6] or ''),
        'full_address': str(vals[7] or ''),
        'products_ordered': str(vals[8] or ''),
        'amount': float(vals[9] or 0),
        'payment_mode': str(vals[10] or ''),
        'order_type': str(vals[11] or '')
    })

desktop_dir = os.path.join(os.environ['USERPROFILE'], 'Desktop', 'Sujata_October_2026_Audit_Scripts')
out_json = os.path.join(desktop_dir, 'october_master_orders_313.json')

with open(out_json, 'w', encoding='utf-8') as f:
    json.dump(orders, f, ensure_ascii=False, indent=2)

print(f"Exported {len(orders)} verified orders to: {out_json}")
