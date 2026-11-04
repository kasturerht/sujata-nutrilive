import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's compile the complete list of orders for June 2026:

# 1. MANJUSHREE KASTURE (25 orders)
manju_orders = [
    (171, [172], 'रक्षणा वाघमारे', '9886123900', '400095', 450, 'Prepaid', 'Capsules 1 bottle', 'Prepaid'),
    (226, [], 'बिरेन कपूर (Biren Kapoor)', '9810003451', '110049', 900, 'COD', '1 spirulina capsule + 1 seabuckthorn capsule', 'COD'),
    (282, [], 'बद्रीनाथ साहनी (Badrinath Sahani)', '9702605448', '394270', 849, 'COD', '1 bottle spirulina tablets + 1 bottle sea buckthorn', 'COD'),
    (291, [], 'केदार गोडसे (Kedar Godse)', '7977114095', '410202', 110, 'COD', '2 soaps', 'COD'),
    (308, [331, 385, 387, 390], 'किरण निंबा पाटील', '7499508420', '425427', 450, 'COD', 'Spirulina powder 1pack + 1 facewash', 'फोन नंबर IDX 331 वरून, अपडेट IDX 385 वरून'),
    (348, [], 'राजेश बाष्टे पत्रकार', '8975955957', '402209', 400, 'Prepaid', '1 bottle spirulina capsule', 'Prepaid'),
    (361, [], 'दिवाण जाकीर हुसेन (Dewan Jakir Hussain)', '9957892749', '781311', 849, 'COD', '1 spirulina tablets + 1 sea buckthorn capsules', 'COD'),
    (365, [366], 'डॉ. प्रसाद हजारे', '9881374994', '421308', 900, 'COD', 'Spirulina seabuckthorn combo', 'COD'),
    (383, [], 'पंकज चावडा (Pankaj Chavada)', '9722232130', '392015', 599, 'COD', 'Spirulina tablets 120 (2 bottles)', 'COD'),
    (411, [], 'जान्हवी पाटील (Jhanvi Patil)', '9152855408', '421306', 750, 'COD', '2 bottles spirulina capsules', 'COD'),
    (438, [], 'प्रेमभूषण रवी (Prembhushan Ravi)', '9540332683', '412207', 1500, 'COD', 'Spirulina capsule 2 + Sea buckthorn 2', 'COD'),
    (458, [], 'प्रवीण वाळे (Pravin Wale)', '9975517487', '411062', 849, 'COD', 'Combo pack: 1 spirulina tablets + 1 sea buckthorn', 'COD'),
    (459, [], 'के. पुरी (K Puri)', '8630960243', '248003', 490, 'COD', '2 pack of Cookies', 'COD'),
    (468, [], 'परिंदा छेडा (Parinda Chheda)', '9004519968', '421201', 800, 'COD', '2 bottle of sea buckthorn', 'COD'),
    (486, [], 'नीलिमा अगवणे (Neelima Agavne)', '9673317311', '400079', 849, 'Prepaid', 'Combo offer: 1 spirulina tablet + 1 sea buckthorn', 'Prepaid'),
    (522, [], 'शोभा विलास काकडे', '8082308982', '416410', 900, 'Prepaid', '120 tablets spirulina + 120 capsules sea buckthorn', 'Prepaid'),
    (523, [], 'किरणकुमार बोल्लू (Kirankumar Bollu)', '9819365324', '400022', 849, 'Prepaid', '120 tablets spirulina + 60 capsules sea buckthorn', 'Prepaid'),
    (559, [560], 'मोहिनी पुरुषोत्तम पाठक', '9860593011', '415110', 900, 'COD', '120 tablets spirulina + 60 capsules sea buckthorn', 'COD'),
    (647, [], 'हरिश्चंद्र लक्ष्मण पताडे', '9130345563', '401305', 1000, 'COD', '2+1 spirulina and sea buckthorn', 'COD'),
    (677, [], 'हेमंत अनिल ताकते', '8208428506', '412208', 850, 'COD', '2 pack Spirulina powder', 'COD'),
    (685, [], 'आदित्य पटेल (Aditya Patel)', '8765960887', '262701', 2400, 'COD', '3 months pack offer: 3 spirulina tab + 2 sea buckthorn cap', 'COD'),
    (783, [], 'अण्णासाहेब तुकाराम गावंडे', '9689222373', '431011', 2450, 'COD', '3 months combo pack', 'COD'),
    (794, [795, 883, 886], 'पद्मश्री प्रशांत बर्डे', '9890615059', '416013', 999, 'Prepaid', 'Combo pack 60-60-60', 'फोन नंबर व स्पीड पोस्ट सूचना IDX 883 वरून जोडली'),
    (853, [861], 'यशवंत शेळके (Yeshwant Shelke)', '9890615059', '440022', 850, 'COD', 'Combo pack 60-60 Spirulina & sea buckthorn', 'फोन नंबर IDX 861 वरून जोडला'),
    (908, [], 'डॉ. हकीम रियाझ अहमद (Dr. Hakeem Riyaz Ahmad)', '9018289698', '192124', 2010, 'COD', 'Spirulina cap 3 + Spirulina tab 3 + Sea buckthorn 3', 'COD')
]

# 2. MONU (34 orders)
from analyze_all_june_orders import monu_candidates

# 3. YASH (Founder Direct)
from verify_order_sets import yash_orders

# Add the additional Yash orders discovered
extra_yash_orders = [
    (350, [351], 'ग्राहक (फोटोवरून पत्ता)', '', '', 500, 'Prepaid', 'Moringa powder :-6', 'पत्ता फोटोमध्ये, रक्कम व प्रॉडक्ट IDX 351 वरून'),
    (367, [], 'अक्षर पटेल (Akshar Patel)', '9987032015', '400068', 1000, 'Prepaid', 'spirulina capsule:-3', 'दुसरी ऑर्डर (3 स्पिरुलिना कॅप्सूल)'),
    (395, [396, 397, 398, 400, 401], 'ग्राहक (फोटोवरून पत्ता)', '', '', 0, 'Prepaid', '1 spirulina tablets 1 ashwagandha tablets 1 spirulina soap', 'पत्ता फोटोमध्ये, स्पीड पोस्टने पाठवले'),
    (413, [414], 'ग्राहक (फोटोवरून पत्ता)', '', '', 0, 'COD', 'Spirulina capsule 1 bride cream', 'पत्ता फोटोमध्ये'),
    (488, [487, 489], 'संतोष मेडिकल / ग्राहक (फोटोवरून पत्ता)', '', '', 1750, 'COD', '1 kg powder, 120 capsule seabuckthorn 1, Spirulina capsule 1, Bath soap', 'पत्ता फोटोमध्ये, लँडमार्क संतोष मेडिकल, रक्कम COD 1750'),
    (544, [545], 'ग्राहक (फोटोवरून पत्ता)', '', '', 0, 'Prepaid', '120 tablets 1 ani 1 seabuckthorn 120 capsules', 'पत्ता फोटोमध्ये'),
    (649, [650, 651, 652, 653, 654, 655], 'श्रीकांत दास (Srikanta Das)', '8582810093', '712201', 950, 'COD', 'Spirulina capsule and seabuckthorn capsule', 'तपशील व रक्कम IDX 650 वरून')
]

all_yash = yash_orders + extra_yash_orders

print(f"Manju orders count: {len(manju_orders)}, Total: Rs {sum(o[5] for o in manju_orders):,}")
print(f"Monu orders count: {len(monu_candidates)}, Total: Rs {sum(o[5] for o in monu_candidates):,}")
print(f"Yash orders count: {len(all_yash)}, Total: Rs {sum(o[5] for o in all_yash):,}")

grand_total_orders = len(manju_orders) + len(monu_candidates) + len(all_yash)
grand_total_val = sum(o[5] for o in manju_orders) + sum(o[5] for o in monu_candidates) + sum(o[5] for o in all_yash)
print(f"Grand Total Orders: {grand_total_orders}")
print(f"Grand Total Revenue: Rs {grand_total_val:,}")
