import sys, json

sys.stdout.reconfigure(encoding='utf-8')

from calculate_april_totals import master_orders

audit_flags = []

for o in master_orders:
    flags = []
    # Check phone
    if not o['phone'] or len(o['phone'].replace(' ', '').replace('-', '').replace('+91', '')) < 10:
        flags.append('मोबाईल नंबर गहाळ / फोटोवर उपलब्ध')
    # Check pincode
    if not o['pincode'] or len(o['pincode'].replace(' ', '')) < 6:
        flags.append('पिनकोड गहाळ / स्लिपवर उपलब्ध')
    # Check address
    if not o['address'] or len(o['address']) < 10:
        flags.append('अपूर्ण पत्ता')
    # Check zero amount
    if o['amount'] == 0:
        flags.append('शून्य मूल्य (मोफत नमुना / बार्टर कोलॅब)')
    
    if flags:
        audit_flags.append({
            'sr_no': o['sr_no'],
            'customer': o['customer'],
            'telecaller': o['telecaller'],
            'amount': o['amount'],
            'mode': o['mode'],
            'flags': ', '.join(flags),
            'note': o['note']
        })

print(f"Total audit flags in April: {len(audit_flags)}")
for af in audit_flags:
    print(f"[{af['sr_no']}] {af['customer']} ({af['telecaller']}) -> {af['flags']}")
