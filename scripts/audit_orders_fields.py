import sys
sys.stdout.reconfigure(encoding='utf-8')

from compute_july_summary import orders_data

print("Auditing orders fields...")
issues = []
for i, o in enumerate(orders_data, 1):
    main_idx = o['main_idx']
    name = o['customer_name']
    phone = o['phone']
    pin = o['pincode']
    amt = o['amount']
    tc = o['telecaller']
    
    flag = []
    if not name or name == 'ग्राहक':
        flag.append("Name missing")
    if not phone:
        flag.append("Phone missing")
    if not pin:
        flag.append("Pincode missing")
    if amt == 0 and 'सॅम्पल' not in o['audit_flag'] and 'Sample' not in o['audit_flag'] and 'Linked' not in o['audit_flag']:
        flag.append("Amount 0")
        
    if flag:
        issues.append((i, main_idx, tc, name, phone, pin, amt, ", ".join(flag)))

print(f"Total orders with flags: {len(issues)}")
for item in issues:
    print(item)
