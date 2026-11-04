import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

DEV_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')

test_texts = [
    ('Bhavesh Yadav', 'Name: Bhavesh yadav\n\nPin code: 3027602\n\nRajasthan kasarwadi rond chota dungra\n\n\nPhone num: 7852898393\n\nCOD =999 sprulina capsule &seabukthron capsules + spirulina soap'),
    ('Ramesh Solanki', 'Ramesh Bhai Solanki \n 98255 45330\nAddress: 43, Goswami Negara, Bagdana, Bagdana-264146, Tal Mahuva, Dist-Bhevnagar\nOrder combo of 2550 rakshabandan cod'),
    ('Hemant Tatke', 'Hemant Anil Tatke  \n82084 28506\nTalegaon Dhamdhere Near Ganesh Temple Tal-Shiruar Dist-Pune PIN Code 412208\nPune 412208\nMaharashtra IN \n, Talegaon , 412208\nOrder anniversary wellness combo 1200'),
    ('Sanjay Purohit', 'Sanjay purohit,\n98284 12126\nGurukripa,12 naibawri,vidhyashala diet,\nOut side chandpole,jodhpur,342001\nOrder 999 combo offer \nCod'),
    ('Nura', 'आत्मजः नूरा, पांधी का पार, पांधी का पार, बाड़मेर, राजस्थान - 344502\n\nAddress:\n\nS/O: Nura, Pandhi Ka Par, PO: Pandhi Ka\n\nPar, DIST: Barmer,\n\nRajasthan - 344502\n\nIndependence day combo= 999 \npayment method =COD'),
    ('Rajendra Lodha', 'RAJENDRA LODHA 24-C MADHUBAN\n\nSOHAN BHAWAN OPPOSITE BSNL SHOP, DR MAHLOT DENTALE CLINIC ABOVE 2ND FLOOR, UDAIPUR RAJASTHAN \nPIN CODE =313001\n\n MOBAILE NUMBER 9414757649\n \nNEAR SBI BANK MAIN BRANCH NEAR DR LAL PAITH LAB ABOVE RELIABLE DIGNOSTIC LAB UDAIPUR CITY\nIndependence day offer 999 rs COD'),
    ('Shivaji Kadam', 'Shivaji Janardan Kadam, Resident of Katewadi, Post: Sayyad Varvade, Taluka: Mohol, District: Solapur, PIN Code: 413 213, Phone Number: 96 57 665 0101 Order: 2 bottles of Spirulina tablets (120 count) 2 bottles of Seabuckthorn capsules (60 count) Prepaid 1400'),
    ('Kamlesh Jetli', ': Kamlesh jetli \n# H--124, University campus, kurukshetra University, kurukshetra pincode 136119\n7015830106\n1050/- 5 products\nCod'),
    ('Bela Barcey', 'Bela Barcey,\n\nMother Mary compound,\nPokharan Road Number 1, upvan, thane west, Thane, MAHARASHTRA, 400606 Phone Number:\n8779517233/8655134024\n3 spirulina capsule 3 seabuckthorn capsule Free 1 bottel 1 120 tab\n\nCod 2500')
]

def extract_amount_smart(t, valid_phones, pin):
    t_clean = t.translate(DEV_DIGITS)
    for vp in valid_phones:
        t_clean = t_clean.replace(vp, ' [PHONE] ')
    if pin and len(pin) >= 6:
        t_clean = t_clean.replace(pin, ' [PIN] ')
    # Also mask any 5 to 7 digit numbers that match pincodes like 3027602
    t_clean = re.sub(r'(?:pin|pincode|code)\s*[:=-]?\s*\d{5,7}', ' [PIN] ', t_clean, flags=re.I)
    
    # Delivery charges
    del_charges = 0
    m_del = re.search(r'(?:delivery|courier)\s*charges?\s*[:=-]?\s*(?:rs\.?|₹)?\s*(\d{2,4})', t_clean, re.I)
    if m_del:
        del_charges = int(m_del.group(1))

    amount = 0
    # 1. Total COD / Total amount
    m_tot = re.search(r'(?:total\s*cod\s*amount|total\s*amount\s*cod|total\s*amount|total\s*cod|totalcod|rec\s*by\s*cod|total\s*[-:])\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})', t_clean, re.I)
    if m_tot:
        amount = int(m_tot.group(1))
    else:
        # 2. COD = 999, COD 2500, Prepaid 1400
        m_cod = re.search(r'(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|₹)?\s*(\d{3,5})\b', t_clean, re.I)
        if m_cod:
            amount = int(m_cod.group(1))
        else:
            # 3. 999/- COD or 999 COD
            m_rev = re.search(r'(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid|paid)?|\s*\/\s*cod|\s*rs\b|\s*(?:cod|prepaid|paid)\b)', t_clean, re.I)
            if m_rev:
                amount = int(m_rev.group(1))
            else:
                # 4. Combo of 2550, combo 1200, offer 999
                m_combo = re.search(r'(?:combo\s*(?:of)?|offer|pack)\s*[:=-]?\s*(?:rs\.?|₹)?\s*(\d{3,5})\b', t_clean, re.I)
                if m_combo:
                    amount = int(m_combo.group(1))
                else:
                    m_slash = re.search(r'(\d{3,5})\s*\/-', t_clean)
                    if m_slash:
                        amount = int(m_slash.group(1))

    if del_charges > 0 and amount > 0:
        if re.search(r'\+\s*(?:delivery|courier)', t_clean, re.I) or f"delivery charges {del_charges}" in t_clean.lower():
            amount += del_charges

    return amount

for name, txt in test_texts:
    amt = extract_amount_smart(txt, [], '')
    print(f"{name:15}: Extracted ₹{amt}")
