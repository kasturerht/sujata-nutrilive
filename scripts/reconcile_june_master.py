import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Master Orders List for June 2026
JUNE_ORDERS = []

# ==================== 1. MANJUSHREE KASTURE (Sujata Nutrilive Manju) ====================
# Earlier verified 25 orders:
manju_orders_def = [
    (171, [172], {'customer_name': 'रक्षणा वाघमारे', 'phone': '9886123900', 'pincode': '400095', 'amount': 450, 'payment_type': 'Prepaid', 'products': 'Capsules 1 bottle'}),
    (226, [], {'customer_name': 'बिरेन कपूर (Biren Kapoor)', 'phone': '9810003451', 'pincode': '110049', 'amount': 900, 'payment_type': 'COD', 'products': '1 spirulina capsule + 1 seabuckthorn capsule'}),
    (282, [], {'customer_name': 'बद्रीनाथ साहनी (Badrinath Sahani)', 'phone': '9702605448', 'pincode': '394270', 'amount': 849, 'payment_type': 'COD', 'products': '1 bottle spirulina tablets + 1 bottle sea buckthorn'}),
    (291, [], {'customer_name': 'केदार गोडसे (Kedar Godse)', 'phone': '7977114095', 'pincode': '410202', 'amount': 110, 'payment_type': 'COD', 'products': '2 soaps'}),
    (308, [331], {'customer_name': 'किरण निंबा पाटील', 'phone': '7499508420', 'pincode': '425427', 'amount': 450, 'payment_type': 'COD', 'products': 'Spirulina powder 1pack', 'audit_flag': 'फोन नंबर IDX 331 वरून जोडला'}),
    (348, [], {'customer_name': 'राजेश बाष्टे पत्रकार', 'phone': '8975955957', 'pincode': '402209', 'amount': 400, 'payment_type': 'Prepaid', 'products': '1 bottle spirulina capsule'}),
    (361, [], {'customer_name': 'दिवाण जाकीर हुसेन (Dewan Jakir Hussain)', 'phone': '9957892749', 'pincode': '781311', 'amount': 849, 'payment_type': 'COD', 'products': '1 spirulina tablets + 1 sea buckthorn capsules'}),
    (365, [366], {'customer_name': 'डॉ. प्रसाद हजारे', 'phone': '9881374994', 'pincode': '421308', 'amount': 900, 'payment_type': 'COD', 'products': 'Spirulina seabuckthorn combo'}),
    (383, [], {'customer_name': 'पंकज चावडा (Pankaj Chavada)', 'phone': '9722232130', 'pincode': '392015', 'amount': 599, 'payment_type': 'COD', 'products': 'Spirulina tablets 120 (2 bottles)'}),
    (411, [], {'customer_name': 'जान्हवी पाटील (Jhanvi Patil)', 'phone': '9152855408', 'pincode': '421306', 'amount': 750, 'payment_type': 'COD', 'products': '2 bottles spirulina capsules'}),
    (438, [], {'customer_name': 'प्रेमभूषण रवी (Prembhushan Ravi)', 'phone': '9540332683', 'pincode': '412207', 'amount': 1500, 'payment_type': 'COD', 'products': 'Spirulina capsule 2 + Sea buckthorn 2'}),
    (458, [], {'customer_name': 'प्रवीण वाळे (Pravin Wale)', 'phone': '9975517487', 'pincode': '411062', 'amount': 849, 'payment_type': 'COD', 'products': 'Combo pack: 1 spirulina tablets + 1 sea buckthorn'}),
    (459, [], {'customer_name': 'के. पुरी (K Puri)', 'phone': '8630960243', 'pincode': '248003', 'amount': 490, 'payment_type': 'COD', 'products': '2 pack of Cookies'}),
    (468, [], {'customer_name': 'परिंदा छेडा (Parinda Chheda)', 'phone': '9004519968', 'pincode': '421201', 'amount': 800, 'payment_type': 'COD', 'products': '2 bottle of sea buckthorn'}),
    (486, [], {'customer_name': 'नीलिमा अगवणे (Neelima Agavne)', 'phone': '9673317311', 'pincode': '400079', 'amount': 849, 'payment_type': 'Prepaid', 'products': 'Combo offer: 1 spirulina tablet + 1 sea buckthorn'}),
    (522, [], {'customer_name': 'शोभा विलास काकडे', 'phone': '8082308982', 'pincode': '416410', 'amount': 900, 'payment_type': 'Prepaid', 'products': '120 tablets spirulina + 120 capsules sea buckthorn'}),
    (523, [], {'customer_name': 'किरणकुमार बोल्लू (Kirankumar Bollu)', 'phone': '9819365324', 'pincode': '400022', 'amount': 849, 'payment_type': 'Prepaid', 'products': '120 tablets spirulina + 60 capsules sea buckthorn'}),
    (559, [560], {'customer_name': 'मोहिनी पुरुषोत्तम पाठक', 'phone': '9860593011', 'pincode': '415110', 'amount': 900, 'payment_type': 'COD', 'products': '120 tablets spirulina + 60 capsules sea buckthorn'}),
    (647, [], {'customer_name': 'हरिश्चंद्र लक्ष्मण पताडे', 'phone': '9130345563', 'pincode': '401305', 'amount': 1000, 'payment_type': 'COD', 'products': '2+1 spirulina and sea buckthorn'}),
    (677, [], {'customer_name': 'हेमंत अनिल ताकते', 'phone': '8208428506', 'pincode': '412208', 'amount': 850, 'payment_type': 'COD', 'products': '2 pack Spirulina powder'}),
    (685, [], {'customer_name': 'आदित्य पटेल (Aditya Patel)', 'phone': '8765960887', 'pincode': '262701', 'amount': 2400, 'payment_type': 'COD', 'products': '3 months pack offer: 3 spirulina tab + 2 sea buckthorn cap'}),
    (783, [], {'customer_name': 'अण्णासाहेब तुकाराम गावंडे', 'phone': '9689222373', 'pincode': '431011', 'amount': 2450, 'payment_type': 'COD', 'products': '3 months combo pack'}),
    (794, [795], {'customer_name': 'पद्मश्री प्रशांत बर्डे', 'phone': '', 'pincode': '416013', 'amount': 999, 'payment_type': 'Prepaid', 'products': 'Combo pack 60-60-60', 'audit_flag': 'फोन नंबर मेसेजमध्ये उपलब्ध नाही'}),
    (853, [861], {'customer_name': 'यशवंत शेळके (Yeshwant Shelke)', 'phone': '9890615059', 'pincode': '440022', 'amount': 850, 'payment_type': 'COD', 'products': 'Combo pack 60-60 Spirulina & sea buckthorn', 'audit_flag': 'फोन नंबर IDX 861 वरून जोडला'}),
    (908, [], {'customer_name': 'डॉ. हकीम रियाझ अहमद (Dr. Hakeem Riyaz Ahmad)', 'phone': '9018289698', 'pincode': '192124', 'amount': 2010, 'payment_type': 'COD', 'products': 'Spirulina cap 3 + Spirulina tab 3 + Sea buckthorn 3'}),
]

for main_idx, merged, custom in manju_orders_def:
    JUNE_ORDERS.append({
        'main_idx': main_idx,
        'merged_idxs': merged,
        'telecaller': 'मंजुश्री कस्तुरे',
        'channel_key': 'manju',
        'is_telecaller': True,
        'custom': custom
    })

print(f"Total Manju Orders: {len(manju_orders_def)}")
