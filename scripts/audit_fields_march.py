import sys
sys.stdout.reconfigure(encoding='utf-8')

from calculate_march_totals import master_orders

audit_flags = []

for o in master_orders:
    flags = []
    notes = []
    
    # 1. Zero amount
    if o['amount'] == 0:
        flags.append("शून्य मूल्य (Zero Amount / Free)")
        notes.append("प्रॉडक्टचे मूल्य ₹० (कोलॅबोरेशन किंवा डॉक्टर सॅम्पल किट).")
        
    # 2. Missing phone
    if not o['phone'] or o['phone'].strip() == "":
        flags.append("मोबाईल नंबर अनुपलब्ध (Missing Phone)")
        notes.append("संदेशात ग्राहकाचा फोन नंबर नमूद नाही (स्लिप फोटो किंवा थेट पत्ता).")
        
    # 3. Missing pincode
    if not o['pincode'] or o['pincode'].strip() == "":
        flags.append("पिनकोड अनुपलब्ध (Missing Pincode)")
        notes.append("संदेशात पिनकोड नमूद नाही.")
        
    # 4. Wholesale / B2B
    if any(k in o['customer'].lower() for k in ['ayurtech', 'arogyam', 'sulai nandan', 'kamala', 'medical', 'distributor']):
        flags.append("घाऊक / व्यावसायिक ऑर्डर (B2B Wholesale / Private Label)")
        notes.append("डॉक्टर, मेडिकल, क्लिनिक किंवा थर्ड पार्टी लेबल व्यावसायिक घाऊक ऑर्डर.")
        
    # 5. Repeat customer / Multi-part
    if 'repeat' in o['customer'].lower() or '2nd' in o['customer'].lower():
        flags.append("पुनरावृत्ती ग्राहक ऑर्डर (Repeat Customer Order)")
        notes.append("ग्राहकाने महिन्यात पुन्हा दिलेली दुसरी अधिकृत ऑर्डर.")
        
    # 6. Collab / Sample
    if 'collab' in o['note'].lower() or 'sample' in o['note'].lower():
        if "शून्य मूल्य (Zero Amount / Free)" not in flags:
            flags.append("सॅम्पल / कोलॅबोरेशन (Sample / Collab)")
            notes.append("प्रचार किंवा चाचणीसाठी पाठवलेली सॅम्पल ऑर्डर.")
            
    if flags:
        audit_flags.append({
            "sr_no": o['sr_no'],
            "customer": o['customer'],
            "telecaller": o['telecaller'],
            "amount": o['amount'],
            "mode": o['mode'],
            "flags": " | ".join(flags),
            "note": " ".join(notes) + " " + o['note']
        })

print(f"Total audit flagged orders: {len(audit_flags)}")
