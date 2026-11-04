import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/august_whatsapp_messages_TRUE.json', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's write the complete logic to test
DEV_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
STAFF_PHONES = {
    '9922534443', '9272471529', '9922500344', '9922577344',
    '9503434653', '9096759653', '8600140344', '9518505481',
    '9607259661', '8805168275'
}

def clean_phone(p):
    p = p.translate(DEV_DIGITS)
    p = re.sub(r'[\s\-\(\)\+]', '', p)
    if p.startswith('91') and len(p) == 12:
        p = p[2:]
    return p

# Check known pairs to merge:
# Index pairs: (idx_main, idx_sub, note)
KNOWN_PAIRS = {
    0: (1, 'Merged facewash qty'),
    43: (44, 'Merged tablets 30 bottle qty'),
    58: (60, 'Merged ashwagandha/wheatgrass tablets'),
    141: (142, 'Merged product list'),
    224: (225, 'Merged 7-product list and cod 6300'),
    427: (428, 'Merged product list and cod 1300'),
    433: (434, 'Merged Independence day offer 999 rs COD'),
    437: (438, 'Merged 50 bottle product list'),
    440: (441, 'Merged 30 spirulina capsule cod 5200'),
    567: (568, 'Merged spirulina 5, seabuckthorn 10, cod 3500'),
    573: (574, 'Merged spirulina 120 tab 1, moringa 1, seabuckthorn 1, cod 1000'),
    671: (673, 'Merged cod 1380'),
    698: (699, 'Merged spirulina tab 2 cod 850'),
    742: (743, 'Merged spirulina capsule 2 cod 800'),
    744: (745, 'Merged 2 seabuckthorn cod 900'),
    756: (757, 'Merged products and cod 2500'),
    901: (902, 'Merged oil 5 prepaid 750'),
    906: (907, 'Merged spirulina 10, b12 5, cod 2350'),
    944: (945, 'Merged products'),
    1103: (1104, 'Merged spirulina tab 1')
}

SUB_INDICES = {sub: (main, note) for main, (sub, note) in KNOWN_PAIRS.items()}

# Known inquiries / duplicates to exclude from orders sheet with specific reason:
KNOWN_EXCLUSIONS = {
    120: 'Incomplete Address (Re-posted next day 05/08 with phone 8668769890)',
    195: 'Offer Verification / Inquiry (Duplicate forward of Pallavi order from 05/08)',
    541: 'Delivery Follow-up / Status Inquiry (Mohan B Chatake)',
    545: 'Missing Item Inquiry (Balasaheb Dhokale)',
    701: 'Whose Order Inquiry (Pramod Barapatre)',
    721: 'Payment Mode Update / Inquiry (Dr Baban Ghuge)',
    722: 'Payment Mode Update / Inquiry (Dr Baban Ghuge)',
    723: 'Dispatch Status Inquiry (Dr Baban Ghuge)',
    842: 'Delivery Follow-up / Status Inquiry (Nikunj Doshi)',
    843: 'Delivery Follow-up / Status Inquiry (Rainbow Nx Pharmacy)',
    844: 'B2B Packing Request / Founder Internal (No Address)',
    857: 'Founder Status Inquiry (Nikunj Doshi)',
    859: 'Re-dispatch Coordination via Speed Post (Lokesh Patil)',
    861: 'Re-dispatch Coordination via Speed Post (Lokesh Patil)',
    1030: 'Status Inquiry (Arun Lavaskar)'
}

print(f"Total merged pairs: {len(KNOWN_PAIRS)}")
print(f"Total sub-indices to link: {len(SUB_INDICES)}")
print(f"Total known exclusions: {len(KNOWN_EXCLUSIONS)}")
