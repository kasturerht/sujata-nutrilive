import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's import or define all orders
from analyze_all_june_orders import monu_candidates

# Manju orders
manju_orders = [
    (171, [172], 'रक्षणा वाघमारे', '9886123900', '400095', 450, 'Prepaid', 'Capsules 1 bottle', ''),
    (226, [], 'बिरेन कपूर (Biren Kapoor)', '9810003451', '110049', 900, 'COD', '1 spirulina capsule + 1 seabuckthorn capsule', ''),
    (282, [], 'बद्रीनाथ साहनी (Badrinath Sahani)', '9702605448', '394270', 849, 'COD', '1 bottle spirulina tablets + 1 bottle sea buckthorn', ''),
    (291, [], 'केदार गोडसे (Kedar Godse)', '7977114095', '410202', 110, 'COD', '2 soaps', ''),
    (308, [331, 385, 387, 390], 'किरण निंबा पाटील', '7499508420', '425427', 450, 'COD', 'Spirulina powder 1pack + 1 facewash', 'फोन नंबर IDX 331 वरून, अपडेट IDX 385 वरून'),
    (348, [], 'राजेश बाष्टे पत्रकार', '8975955957', '402209', 400, 'Prepaid', '1 bottle spirulina capsule', ''),
    (361, [], 'दिवाण जाकीर हुसेन (Dewan Jakir Hussain)', '9957892749', '781311', 849, 'COD', '1 spirulina tablets + 1 sea buckthorn capsules', ''),
    (365, [366], 'डॉ. प्रसाद हजारे', '9881374994', '421308', 900, 'COD', 'Spirulina seabuckthorn combo', ''),
    (383, [], 'पंकज चावडा (Pankaj Chavada)', '9722232130', '392015', 599, 'COD', 'Spirulina tablets 120 (2 bottles)', ''),
    (411, [], 'जान्हवी पाटील (Jhanvi Patil)', '9152855408', '421306', 750, 'COD', '2 bottles spirulina capsules', ''),
    (438, [], 'प्रेमभूषण रवी (Prembhushan Ravi)', '9540332683', '412207', 1500, 'COD', 'Spirulina capsule 2 + Sea buckthorn 2', ''),
    (458, [], 'प्रवीण वाळे (Pravin Wale)', '9975517487', '411062', 849, 'COD', 'Combo pack: 1 spirulina tablets + 1 sea buckthorn', ''),
    (459, [], 'के. पुरी (K Puri)', '8630960243', '248003', 490, 'COD', '2 pack of Cookies', ''),
    (468, [], 'परिंदा छेडा (Parinda Chheda)', '9004519968', '421201', 800, 'COD', '2 bottle of sea buckthorn', ''),
    (486, [], 'नीलिमा अगवणे (Neelima Agavne)', '9673317311', '400079', 849, 'Prepaid', 'Combo offer: 1 spirulina tablet + 1 sea buckthorn', ''),
    (522, [], 'शोभा विलास काकडे', '8082308982', '416410', 900, 'Prepaid', '120 tablets spirulina + 120 capsules sea buckthorn', ''),
    (523, [], 'किरणकुमार बोल्लू (Kirankumar Bollu)', '9819365324', '400022', 849, 'Prepaid', '120 tablets spirulina + 60 capsules sea buckthorn', ''),
    (559, [560], 'मोहिनी पुरुषोत्तम पाठक', '9860593011', '415110', 900, 'COD', '120 tablets spirulina + 60 capsules sea buckthorn', ''),
    (647, [], 'हरिश्चंद्र लक्ष्मण पताडे', '9130345563', '401305', 1000, 'COD', '2+1 spirulina and sea buckthorn', ''),
    (677, [], 'हेमंत अनिल ताकते', '8208428506', '412208', 850, 'COD', '2 pack Spirulina powder', ''),
    (685, [], 'आदित्य पटेल (Aditya Patel)', '8765960887', '262701', 2400, 'COD', '3 months pack offer: 3 spirulina tab + 2 sea buckthorn cap', ''),
    (783, [], 'अण्णासाहेब तुकाराम गावंडे', '9689222373', '431011', 2450, 'COD', '3 months combo pack', ''),
    (794, [795, 883, 886], 'पद्मश्री प्रशांत बर्डे', '9890615059', '416013', 999, 'Prepaid', 'Combo pack 60-60-60', 'फोन नंबर व स्पीड पोस्ट सूचना IDX 883 वरून जोडली'),
    (853, [861], 'यशवंत शेळके (Yeshwant Shelke)', '9890615059', '440022', 850, 'COD', 'Combo pack 60-60 Spirulina & sea buckthorn', 'फोन नंबर IDX 861 वरून जोडला'),
    (908, [], 'डॉ. हकीम रियाझ अहमद (Dr. Hakeem Riyaz Ahmad)', '9018289698', '192124', 2010, 'COD', 'Spirulina cap 3 + Spirulina tab 3 + Sea buckthorn 3', ''),
]

# Yash orders
yash_orders = [
    (12, [13, 14, 160, 161, 163], 'चंद्रकांत लबडे (Chandrakant Labade)', '7219052749', '413701', 450, 'COD', 'Capsule 1', 'IDX 160 वर डिस्पॅच स्मरणपत्र'),
    (50, [51, 55], 'आनंद कुमार (Anand Kumar)', '8077841442', '282001', 1600, 'COD', '15 capsules bottle white bottle 60 capsules', 'रक्कम COD 1600 IDX 55 वरून'),
    (66, [67, 68, 69, 310, 311, 312, 313], 'रघुनंदन ऑरगॅनिक फीड्स (Raghunandan Organik Feeds)', '9595227331', '431203', 0, 'Prepaid', 'Golden cap bottle spirulina', 'प्रीपेड सॅम्पल/डिस्ट्रिब्युटर पार्सल'),
    (71, [72, 73, 152, 153, 154, 155], 'महावीर मेडिकल (Mahaveer Medical)', '8349401895', '485001', 0, 'Prepaid', 'Sample kit 1 and 100 bottle spirulina', 'सॅम्पल किट व 100 बॉटल स्पिरुलिना'),
    (83, [], 'राजेंद्र मेहरा (Rajendra Mehara)', '8949266062', '302004', 300, 'COD', '60 tab 1', ''),
    (105, [106], 'व्ही. पावना (V. Pavna)', '8341764069', '503224', 4050, 'COD', '10 seabuckthorn, 1 soap, 3 oil, Spirulina tab 120: 5, Moringa tab: 5', 'तपशील व फोन IDX 106 वरून'),
    (113, [114, 115], 'राजदेव सिंग जाट (Rajdev Singh Jat)', '8827062595', '462038', 999, 'COD', '1 spirulina 1 seabuckthorn', 'नाव व फोन IDX 114, प्रॉडक्ट IDX 115 वरून'),
    (116, [117], 'नरेश तुकाराम बांबळ (Naresh Tukaram Bambal)', '7588664235', '444906', 900, 'COD', 'Spirulina seabuckthorn', 'फोन व रक्कम IDX 117 वरून'),
    (121, [122], 'अवधूत राजने (Avdut Rajane)', '7823884489', '445230', 450, 'COD', 'Spirulina tablets 120', 'प्रॉडक्ट व रक्कम IDX 122 वरून'),
    (145, [146], 'दोडमिसे राजेंद्र (Dodmise Rajendra)', '8149807422', '411051', 1050, 'COD', '3 capsule', 'प्रॉडक्ट व रक्कम IDX 146 वरून'),
    (148, [147, 149], 'रेखा मोहन भोळे (Rekha Mohan Bhole)', '9271555179', '411033', 1100, 'COD', 'Spirulina cap, soap, shampoo, facewash, powder, seabuckthorn, moringa tab', 'तपशील व रक्कम IDX 147 वरून, नाव फोन IDX 149 वरून'),
    (156, [157, 158, 159], 'संतोष कुमार गुप्ता (Santosh Kumar Gupta)', '9708185321', '822128', 0, 'COD', '10 capsule 5 120 tab, 5 powder 1 facewash', 'पेंडिंग ऑर्डर स्पीड पोस्टने पाठवली'),
    (166, [165, 167], 'विजयभाई भगवतीभाई पटेल (Vijaybhai Bhagvatibhai Patel)', '9376452299', '394130', 1550, 'COD', '5 spirulina capsule', 'फोन IDX 165, प्रॉडक्ट व रक्कम IDX 167 वरून'),
    (202, [203], 'कल्पेशभाई चंदूभाई पटेल (Kalpeshbhai Chandubhai Patel)', '9173356935', '390020', 3000, 'COD', '5 spirulina capsules 5 seabuckthorn', 'प्रॉडक्ट व रक्कम IDX 203 वरून'),
    (275, [276, 502, 503, 506], 'प्रशांत विनायक वायदंडे (Prashant Vinayak Wayadande)', '9922639596', '415524', 500, 'COD', 'Capsule 1', 'IDX 502 वर एकाउंट री-बुकिंग'),
    (277, [], 'सुरिंदर सिंग (Surinder Singh)', '9464038599', '141401', 849, 'Prepaid', '2 bottle spirulina tablet', 'प्रीपेड स्टँडर्ड दर'),
    (281, [283], 'दीपक प्रभाकर नाईक (Deepak Prabhakar Naik)', '9823713616', '422003', 900, 'COD', '1 bottle capsule', 'COD 50 extra एकूण 900 IDX 283 वरून'),
    (320, [321, 322], 'राजेंद्र सुकदेव निकम (Rajendra Sukadeo Nikam)', '8956051949', '422101', 1200, 'Prepaid', '3 spirulina cap + 2 spirulina powder + 1 seabuckthorn', 'प्रॉडक्ट IDX 321, रक्कम IDX 322 वरून'),
    (324, [323, 325], 'तेजल मेडिकल (Tejal Medical)', '9022991045', '423301', 0, 'COD', '20 oil 20 shampoo', 'नाव IDX 323, प्रॉडक्ट IDX 325 वरून'),
    (327, [328], 'कल्याणी निलेश कुंभार (Kalyani Nilesh Kumbhar)', '8793165621', '411051', 250, 'COD', 'Oil 1', 'पहिली ऑर्डर (तेल)'),
    (363, [364], 'गिरीश क्लिनिक (Girish Clinic)', '7021880353', '421004', 0, 'COD', 'Capsule 10, Seabuckthorn 2', 'फोन व प्रॉडक्ट IDX 364 वरून'),
    (379, [380, 381, 870, 871, 872], 'पी. पी. भुसारी (P P Bhusari)', '8668959150', '431001', 800, 'COD', 'seabuckthorn 120 cap 1', 'रिटर्न आलेली नोंद, IDX 870 वर स्टेटस चौकशी'),
    (421, [422], 'संगीता इंगळे (Sangita Ingle)', '8459177575', '411048', 500, 'COD', 'Spirulina capsule 1', 'प्रॉडक्ट व रक्कम IDX 422 वरून'),
    (433, [434, 435, 436], 'दिपाली नितीन पवार (Deepali Nitin Pawar)', '7820997018', '411037', 1000, 'COD', 'Spirulina capsules 1 + seabuckthorn capsule 60 1', 'पिनकोड 434, नाव 435, प्रॉडक्ट 436 वरून'),
    (450, [], 'जावेद खान (Javed Khan)', '9899751058', '110084', 1650, 'COD', '2 bottle 120 tablets spirulina + 2 bottle 60 capsules sea buckthorn', ''),
    (470, [], 'नीता प्रशांत छत्रे (Neeta Prashant Chhatre)', '9619965932', '410210', 1050, 'COD', 'Spirulina powder 100g + 2 pocket seabuckthorn capsule 120 bottle 1', ''),
    (490, [491], 'कल्याणी निलेश कुंभार (Kalyani Nilesh Kumbhar)', '8793165621', '411051', 200, 'Prepaid', '1 shampoo', 'दुसरी ऑर्डर (शॅम्पू)'),
    (498, [499, 501], 'कृष्णा विजय / ग्राहक (Krishna Vijay / Customer)', '7276999947', '411044', 1050, 'COD', '3 tablets 120', 'प्रॉडक्ट व रक्कम IDX 499, 501 वरून'),
    (526, [527, 528], 'काशिनाथ कोंडाजी अहिरे (Kashinath Kondaji Ahire)', '9145607383', '423204', 450, 'Prepaid', 'Spirulina 120 tab', 'पहिली ऑर्डर (Order 1)'),
    (534, [], 'मनोज मधुकर नागोठकर (Manoj Madhukar Nagotkar)', '9969924025', '410206', 1050, 'COD', 'Spirulina capsule + Spirulina tab 60 + Seabuckthorn 60', ''),
    (535, [536], 'कपिल इंगळे / न्यू माउली डिस्ट्रीब्युटर (Kapil Ingle)', '9359335154', '431005', 0, 'Prepaid', 'Oil 5', 'प्रॉडक्ट IDX 536 वरून'),
    (538, [539, 541], 'सूर्यकंवल अगरवाल (Suryakanwal Aggarwal)', '9312333983', '110087', 0, 'Prepaid', 'half kg powder spirulina + sample soap 1', 'सॅम्पल डिस्पॅच स्पीड पोस्ट'),
    (551, [552, 553], 'काशिनाथ कोंडाजी अहिरे (Kashinath Kondaji Ahire)', '9145607383', '423204', 450, 'Prepaid', 'Spirulina 120 tab', 'दुसरी ऑर्डर (Order 2 speed post)'),
    (563, [564], 'नंदकिशोर सदाशिव जाधव (Nandkishor Sadashiv Jadhav)', '9850590181', '431122', 0, 'Prepaid', '1 seabuckthorn 1 capsule', 'प्रॉडक्ट IDX 564 वरून'),
    (598, [525, 599], 'बालाजी बळीराम सुर्वणकर (Balaji Baliram Survanakar)', '9172276975', '411062', 1050, 'COD', 'Spirulina capsule 1 + Seabuckthorn capsule 1 + Spirulina tab 60 1', 'प्रॉडक्ट व रक्कम IDX 599 वरून, 525 वर मसुदा पत्ता'),
    (635, [], 'विजय गुप्ता (Vijay Gupta)', '6394025383', '232101', 1000, 'Prepaid', '2 seabuckthorn + 1 spirulina tab 60', 'थर्ड पार्टी पेमेंट'),
    (796, [], 'रमेश चंद्र श्रीवास्तव (Ramesh Chandra Srivastava)', '9984057458', '221003', 1000, 'COD', '120 tab 1, Capsule 1, Seabuckthorn 1', ''),
    (799, [800], 'सुनिता भरते (Sunita Bharate)', '8983981909', '413736', 1680, 'COD', '2 bride cream', 'प्रॉडक्ट व रक्कम IDX 800 वरून'),
    (802, [], 'बिंदू कुमार (Bindu Kumar)', '9511783513', '411040', 450, 'COD', 'spirulina tablets 120', ''),
    (824, [825, 834, 835, 836], 'पत्रकार मुजम्मील कमालीवाले (Patrkar Mujammil Kamaliwale)', '7277720606', '413304', 1380, 'COD', 'Spirulina powder + Ashwagandha powder + Spirulina & seabuckthorn cap', 'दुसरी ऑर्डर (पावडर व कॅप्सूल कॉम्बो)'),
    (842, [843, 844], 'लक्ष्मण नांद्रेकर (Laxman Nandrekar)', '9637992915', '416416', 0, 'Prepaid', '35 tablets spirulina', 'कस्टम/सॅम्पल डिस्पॅच स्पीड पोस्ट'),
    (845, [846, 847], 'ओम निसर्गोपचार केंद्र (Om Naturopathy)', '7083575525', '424206', 3550, 'Prepaid', '5 spirulina tab + 5 seabuckthorn cap + 5 moringa tab + 5 ashwagandha tab', 'तपशील व रक्कम IDX 847 वरून'),
    (848, [849], 'संतोष कुमार गुप्ता (Santosh Kumar Gupta)', '9708185321', '822128', 5180, 'COD', 'Capsule 20, Tablets 120: 10, Oil 1, Facewash 1, Soap 1', 'तपशील व रक्कम IDX 849 वरून'),
    (890, [891, 894, 895], 'पंकज नामदेव (Pankaj Namdeo)', '8889077717', '455001', 450, 'Prepaid', 'Capsule 1', 'मंजुश्री यांनी ऑनलाइन पेमेंट कन्फर्म केले (IDX 894)'),
    (897, [898], 'मंजुश्री रोहित कस्तुरे (Manjushree Rohit Kasture)', '9272471529', '416006', 0, 'Prepaid', '2 spirulina tablets + 1 seabuckthorn', 'टेलिकॉलर मंजुश्री यांना अंतर्गत स्टॉक पाठवला'),
    (899, [900, 901], 'परिंदा छेडा (Parinda Chheda)', '9004519968', '421201', 0, 'Prepaid', 'Bride cream sample 5g, oil, facewash without sticker, shampoo', 'मोफत सॅम्पल किट पाठवले'),
    (910, [911, 912], 'लक्ष्मण नांद्रेकर (Laxman Nandrekar)', '9637992915', '416416', 0, 'Prepaid', 'Arogyam tablets 20, Powder 5, Moringa tablets 5', 'डिस्ट्रिब्युटर बल्क डिस्पॅच')
]

print(f"Manju orders: {len(manju_orders)}")
print(f"Monu orders: {len(monu_candidates)}")
print(f"Yash orders: {len(yash_orders)}")
total_orders = len(manju_orders) + len(monu_candidates) + len(yash_orders)
print(f"Total Combined Orders: {total_orders}")

# Check all covered message IDs across all orders
all_order_main_ids = set()
all_merged_ids = set()

for o in manju_orders:
    all_order_main_ids.add(o[0])
    for m in o[1]:
        all_merged_ids.add(m)

for o in monu_candidates:
    all_order_main_ids.add(o[0])
    for m in o[1]:
        all_merged_ids.add(m)

for o in yash_orders:
    all_order_main_ids.add(o[0])
    for m in o[1]:
        all_merged_ids.add(m)

print(f"Main Order IDs count: {len(all_order_main_ids)}")
print(f"Merged Sub-message IDs count: {len(all_merged_ids)}")
intersection = all_order_main_ids.intersection(all_merged_ids)
print(f"Overlap between main and merged: {intersection}")

all_accounted_ids = all_order_main_ids.union(all_merged_ids)
print(f"Total messages accounted for by orders & merged parts: {len(all_accounted_ids)}")
print(f"Remaining messages to categorize as excluded/chatter: {len(msgs) - len(all_accounted_ids)}")
