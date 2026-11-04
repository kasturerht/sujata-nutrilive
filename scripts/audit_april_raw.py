import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

print(f"Total messages to audit: {len(messages)}")

# Let's inspect each sender's messages thoroughly
for i, m in enumerate(messages):
    c = m['content'].strip()
    idx = m['index']
    sender = m['sender']
    ts = m['timestamp']
    
    # Check if message contains any phone number (10 digits, or with spaces/dashes)
    phones = re.findall(r'(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}', c)
    # Check if message contains pincode (6 digits)
    pincodes = re.findall(r'\b[1-9]\d{5}\b', c)
    # Check if message contains price (₹ or Rs or /- or COD)
    prices = re.findall(r'(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:/-|rs|cod|prepaid)?', c, re.IGNORECASE)
    
    # Check if contains name/address keywords
    has_addr_kw = any(w in c.lower() for w in ['name', 'नाव', 'address', 'पत्ता', 'tal', 'dist', 'pin', 'road', 'at post', 'मु.', 'पो.', 'flat', 'plot', 'room', 'colony', 'nagar'])
    has_prod_kw = any(w in c.lower() for w in ['capsule', 'powder', 'tab', 'bottle', 'facewash', 'facepack', 'cream'])
    
    # Flag message if it might be an order or related to an order
    is_interesting = bool(phones or pincodes or has_addr_kw or has_prod_kw)
    
    # We want to print if it's interesting OR if sender is not Om
    # (Since Om is mostly slips/queries, but let's check interesting Om messages too)
    if is_interesting:
        # Check if it's just Om sending tracking slip
        if sender == 'Om Amazon Dispatch' and ('<media omitted>' in c.lower() or 'docket' in c.lower() or 'slip' in c.lower()):
            continue
        first_line = c.split('\n')[0][:60]
        # print summary
        # print(f"[{idx}] {ts} | {sender} | Phones:{phones} | Pins:{pincodes} | Line1: {first_line}")
