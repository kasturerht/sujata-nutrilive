import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# ==========================================
# 1. MANJUSHREE KASTURE (8 orders)
# ==========================================
manju_orders_def = [
    (90, [], {'customer_name': 'हृषिकेश शंकर पांडे (Hrishikesh Pande)', 'phone': '7666512138', 'pincode': '411046', 'amount': 600, 'payment_type': 'COD', 'products': '2 pack Spirulina Powder', 'audit_flag': ''}),
    (91, [], {'customer_name': 'सुनील वाकडे (Sunil Wakde)', 'phone': '9764884169', 'pincode': '431702', 'amount': 400, 'payment_type': 'COD', 'products': '1 bottle of Tablets', 'audit_flag': ''}),
    (103, [102, 141], {'customer_name': 'सुधीर दिगंबर बहादुले', 'phone': '9921297767', 'pincode': '415538', 'amount': 800, 'payment_type': 'COD', 'products': '2 bottle of Tablets - 90 tablets', 'audit_flag': 'पत्ता दुरुस्ती IDX 141 वरून'}),
    (210, [211], {'customer_name': 'परिंदा छेडा (Parinda Chheda)', 'phone': '9004519968', 'pincode': '421201', 'amount': 1300, 'payment_type': 'COD', 'products': '5 bottle of Capsules + 1 trial soap', 'audit_flag': 'ट्रायल सोप IDX 211 वरून'}),
    (227, [323, 510], {'customer_name': 'चंद्रकांत लबडे (Chandrakant Labade)', 'phone': '7219052749', 'pincode': '413701', 'amount': 450, 'payment_type': 'COD', 'products': 'Capsule 1', 'audit_flag': 'यश यांनी IDX 323 व 510 वर डिस्पॅच स्मरणपत्र पाठवले'}),
    (318, [], {'customer_name': 'श्रेयस शशिकांत देसाई (Shreyash Desai)', 'phone': '9595978877', 'pincode': '400615', 'amount': 400, 'payment_type': 'Prepaid', 'products': 'Spirulina powder 1 pack', 'audit_flag': ''}),
    (319, [], {'customer_name': 'हनुमंतराव वनाळेकर', 'phone': '9326144762', 'pincode': '431602', 'amount': 480, 'payment_type': 'COD', 'products': 'capsules 1 bottle', 'audit_flag': ''}),
    (388, [], {'customer_name': 'अजय कुमार (Ajay Kumar)', 'phone': '9621968888', 'pincode': '221002', 'amount': 500, 'payment_type': 'Prepaid', 'products': 'Spirulina powder', 'audit_flag': ''})
]

# ==========================================
# 2. MONU (Sujata Nutrilive - 37 orders)
# ==========================================
monu_orders_def = [
    (0, [], {'customer_name': 'अशोक कांबळे (Ashok Kamble)', 'phone': '9325808280', 'pincode': '411001', 'amount': 1000, 'payment_type': 'COD', 'products': '1 spirulina capsule + 1 seabackthorn', 'audit_flag': ''}),
    (26, [66, 67], {'customer_name': 'सोनाली चेतन मगर (Sonali Chetan Magar)', 'phone': '8080646189', 'pincode': '413106', 'amount': 450, 'payment_type': 'COD', 'products': '1 spirulina capsule', 'audit_flag': 'फोन नंबर IDX 66-67 वरून जोडला'}),
    (28, [29], {'customer_name': 'शाहआलम (Shahalam handicapped artist)', 'phone': '9870681956', 'pincode': '247001', 'amount': 350, 'payment_type': 'COD', 'products': 'tab 60 bottel', 'audit_flag': 'तपशील IDX 29 वरून'}),
    (34, [32, 33, 35, 36], {'customer_name': 'ग्राहक (फोटोवरून पत्ता)', 'phone': '8898695555', 'pincode': '', 'amount': 450, 'payment_type': 'COD', 'products': '1 tab bottel', 'audit_flag': 'पत्ता फोटोमध्ये, फोन व प्रॉडक्ट IDX 34-35 वरून'}),
    (92, [], {'customer_name': 'अनिल हरी अडागळे (Anil Hari Adagale)', 'phone': '8767844563', 'pincode': '431010', 'amount': 950, 'payment_type': 'COD', 'products': '1 seabackthorn + 1 spirulina capsule', 'audit_flag': 'पहिली ऑर्डर (COD 950)'}),
    (115, [215], {'customer_name': 'प्रवीण कुमार (Parveen Kumar)', 'phone': '7231810915', 'pincode': '335704', 'amount': 1050, 'payment_type': 'COD', 'products': '3 capsule', 'audit_flag': 'यश यांनी IDX 215 वर डिस्पॅच स्मरणपत्र पाठवले'}),
    (117, [], {'customer_name': 'वाशू सिंधानी (Vashu Sindhani)', 'phone': '9921343397', 'pincode': '421005', 'amount': 1400, 'payment_type': 'Prepaid', 'products': 'spirulina capsule 3 bottle + 1 facewash + 1 oil', 'audit_flag': ''}),
    (118, [], {'customer_name': 'सुहास जगदाळे (Suhas Jagdale)', 'phone': '9890941919', 'pincode': '416001', 'amount': 1050, 'payment_type': 'COD', 'products': 'spirulina 3 capsule', 'audit_flag': ''}),
    (177, [], {'customer_name': 'राहुल यल्लप्पा कुत्रे (Rahul Yallappa Kutre)', 'phone': '9920190147', 'pincode': '400013', 'amount': 500, 'payment_type': 'COD', 'products': '1 bottle tab (90)', 'audit_flag': ''}),
    (201, [], {'customer_name': 'सुनील कटारे (Sunil Katare)', 'phone': '8591992529', 'pincode': '421201', 'amount': 450, 'payment_type': 'Prepaid', 'products': '1 spirulina capsule', 'audit_flag': 'प्रीपेड स्टँडर्ड दर'}),
    (205, [], {'customer_name': 'विवेक कुलकर्णी (Vivek Kulkarni)', 'phone': '9284540304', 'pincode': '416112', 'amount': 630, 'payment_type': 'COD', 'products': '1 spirulina capsule + 1 facewash', 'audit_flag': ''}),
    (209, [], {'customer_name': 'ओम कश्यप (Om Kashyap)', 'phone': '9266387415', 'pincode': '110077', 'amount': 450, 'payment_type': 'COD', 'products': '1 spirulina capsule', 'audit_flag': ''}),
    (309, [310], {'customer_name': 'सचिन वेंडोले (Sachin Wendole)', 'phone': '9975724815', 'pincode': '431132', 'amount': 950, 'payment_type': 'Prepaid', 'products': '1 moringa powder + 1 seabuckthorn + 1 spirulina 120 tab', 'audit_flag': 'तपशील IDX 310 वरून'}),
    (343, [], {'customer_name': 'काकासाहेब कौतिकराव जाधव', 'phone': '9970567939', 'pincode': '431111', 'amount': 750, 'payment_type': 'COD', 'products': '1 spirulina capsule + 1 spirulina powder', 'audit_flag': ''}),
    (384, [], {'customer_name': 'नैनेश जोशी (Nainesh Joshi)', 'phone': '9820716736', 'pincode': '400022', 'amount': 1050, 'payment_type': 'COD', 'products': '3 spirulina capsule', 'audit_flag': ''}),
    (391, [], {'customer_name': 'संतोष कोकणे (Santosh Kokane)', 'phone': '9594600073', 'pincode': '401105', 'amount': 500, 'payment_type': 'COD', 'products': 'spirulina Tablet (120)', 'audit_flag': ''}),
    (461, [], {'customer_name': 'संगीता एस. टाकळकर (Sangita S. Takalkar)', 'phone': '8999830214', 'pincode': '416007', 'amount': 450, 'payment_type': 'Prepaid', 'products': 'spirulina 1 Capsule (60)', 'audit_flag': 'प्रीपेड स्टँडर्ड दर'}),
    (468, [], {'customer_name': 'महेंद्र साळुंखे (Mahendra Salunkhe)', 'phone': '9221085750', 'pincode': '421503', 'amount': 1000, 'payment_type': 'COD', 'products': '1 spirulina capsule + 1 seabackthorn capsule', 'audit_flag': ''}),
    (494, [], {'customer_name': 'मुन्ना शर्मा (Munna Sharma)', 'phone': '9860143601', 'pincode': '425107', 'amount': 450, 'payment_type': 'Prepaid', 'products': '1 bottle seabackthorn', 'audit_flag': 'प्रीपेड दर'}),
    (508, [509], {'customer_name': 'यशवंत शेळके (Yeshwant Shelke)', 'phone': '7588692023', 'pincode': '440022', 'amount': 450, 'payment_type': 'COD', 'products': '2 bottle spirulina (60) / 120 tab 1 bottle', 'audit_flag': 'अपडेट IDX 509 वरून'}),
    (512, [], {'customer_name': 'कैलास दवणे (Kailas Davane)', 'phone': '7249895237', 'pincode': '401506', 'amount': 600, 'payment_type': 'Prepaid', 'products': '1 spirulina Capsule + 1 moringa powder', 'audit_flag': 'प्रीपेड कॉम्बो दर'}),
    (528, [529], {'customer_name': 'सिद्धेश्वर जगन्नाथ येडवे', 'phone': '9923944944', 'pincode': '411061', 'amount': 2200, 'payment_type': 'Prepaid', 'products': '3 स्पिरुलिना टॅब्लेट (120) + 2 seabackthorn', 'audit_flag': 'रक्कम व पुष्टी IDX 529 वरून'}),
    (530, [], {'customer_name': 'गोपाल कृष्ण परिहार (Gopal Krishn Parihar)', 'phone': '9825007456', 'pincode': '381415', 'amount': 450, 'payment_type': 'COD', 'products': '1 spirulina capsule', 'audit_flag': ''}),
    (533, [], {'customer_name': 'अनिल हरी अडागळे (Anil Hari Adagale)', 'phone': '8767844563', 'pincode': '431010', 'amount': 1000, 'payment_type': 'COD', 'products': '1 seabackthorn + 1 spirulina capsule', 'audit_flag': 'दुसरी ऑर्डर (COD 1000)'}),
    (575, [709, 710, 711, 712, 713], {'customer_name': 'राम दास (Ram Das)', 'phone': '7355560450', 'pincode': '226030', 'amount': 1050, 'payment_type': 'COD', 'products': '3 बॉटल स्पिरुलिना कॅप्सुल', 'audit_flag': 'IDX 709 वर डिस्पॅच खात्री केली'}),
    (604, [605, 606, 607, 608, 609, 610, 612], {'customer_name': 'तानाजी अशोक शिंदे (Tanaji Shinde)', 'phone': '9022803013', 'pincode': '416207', 'amount': 450, 'payment_type': 'Prepaid', 'products': 'capsule 1 (speed post)', 'audit_flag': 'सलग ८ मेसेज एकत्र केले'}),
    (647, [], {'customer_name': 'हिमांशु गोसाई (Himanshu Gosai)', 'phone': '9723166293', 'pincode': '385001', 'amount': 850, 'payment_type': 'COD', 'products': '1 spirulina Capsule + 1 seabackthorn', 'audit_flag': ''}),
    (648, [], {'customer_name': 'शिव प्रसाद सैकिया (Siva Prasad Saikia)', 'phone': '8761938999', 'pincode': '784176', 'amount': 650, 'payment_type': 'COD', 'products': '2 bottle spirulina tablet (120)', 'audit_flag': ''}),
    (665, [], {'customer_name': 'डॉ. नारायण वाघोले (Dr. Narayan Waghole)', 'phone': '9623491919', 'pincode': '410501', 'amount': 650, 'payment_type': 'COD', 'products': '3 bottle spirulina tablet (60)', 'audit_flag': ''}),
    (666, [], {'customer_name': 'अमित सोधी (Amit Sodhi)', 'phone': '8168861816', 'pincode': '124001', 'amount': 800, 'payment_type': 'COD', 'products': '2 bottle spirulina capsule', 'audit_flag': ''}),
    (674, [], {'customer_name': 'विद्याधर खडकीकर (Vidyadhar Khadkikar)', 'phone': '8275521651', 'pincode': '431122', 'amount': 0, 'payment_type': 'Prepaid', 'products': '1 बॉटल कॅप्सुल sample', 'audit_flag': 'मोफत सॅम्पल बाटली'}),
    (675, [], {'customer_name': 'नवनीत सुतार (Navneet Sutar)', 'phone': '9825026228', 'pincode': '382715', 'amount': 800, 'payment_type': 'COD', 'products': '2 bottle spirulina capsule', 'audit_flag': ''}),
    (679, [], {'customer_name': 'सोनाली चेतन मगर (Sonali Chetan Magar)', 'phone': '8080646189', 'pincode': '413106', 'amount': 500, 'payment_type': 'COD', 'products': '1 spirulina capsule', 'audit_flag': 'दुसरी ऑर्डर (30/05)'}),
    (685, [686], {'customer_name': 'राजेंद्र सुकदेव निकम (Rajendra Sukadeo Nikam)', 'phone': '8956051949', 'pincode': '422101', 'amount': 450, 'payment_type': 'Prepaid', 'products': '1 capsule prepaid', 'audit_flag': 'तपशील IDX 686 वरून'}),
    (687, [], {'customer_name': 'मोहन विष्णुपंत काळे (Mohan Vishnupant Kale)', 'phone': '8830904205', 'pincode': '442401', 'amount': 1000, 'payment_type': 'Prepaid', 'products': '1 बॉटल स्पिरुलिना कॅप्सुल + 1 बॉटल seabackthorn', 'audit_flag': 'स्पीड पोस्टने पाठवले'}),
    (695, [], {'customer_name': 'पंडित प्रमोद शर्मा (Pandit Pramod Sharma)', 'phone': '9719495976', 'pincode': '251001', 'amount': 450, 'payment_type': 'COD', 'products': 'capsule 1', 'audit_flag': ''}),
    (696, [697], {'customer_name': 'राजन वालिया (Rajn Walia)', 'phone': '8053153271', 'pincode': '133203', 'amount': 450, 'payment_type': 'COD', 'products': 'capsule 1', 'audit_flag': 'तपशील IDX 697 वरून'})
]

# ==========================================
# 3. YASH R. SURYAWANSHI (Founder Direct - 38 orders)
# ==========================================
yash_orders_def = [
    (10, [11, 12], {'customer_name': 'विक्रम (Vikram)', 'phone': '9422112621', 'pincode': '411047', 'amount': 450, 'payment_type': 'Prepaid', 'products': 'spirulina 90 tab 1 bottel', 'audit_flag': 'फोन IDX 11, प्रॉडक्ट व रक्कम IDX 12 वरून'}),
    (14, [13, 15, 16], {'customer_name': 'डॉ. राजकुमार लक्ष्मण रंगारी (Dr. Rajkumar Rangari)', 'phone': '9921186248', 'pincode': '444003', 'amount': 450, 'payment_type': 'Prepaid', 'products': 'Spirulina products (Prepaid)', 'audit_flag': 'तपशील फोटोमध्ये, प्रीपेड'}),
    (38, [39, 40], {'customer_name': 'डॉ. रंजना (Dr. Ranjana)', 'phone': '7498651800', 'pincode': '', 'amount': 400, 'payment_type': 'Prepaid', 'products': '1 powder prepaid', 'audit_flag': 'इगतपुरी क्लिनिक ऑर्डर'}),
    (47, [], {'customer_name': 'सनफॅब इंडिया (Sunfab India)', 'phone': '7976521638', 'pincode': '311001', 'amount': 650, 'payment_type': 'COD', 'products': '1 capsule 1 oil 1 shampoo', 'audit_flag': ''}),
    (48, [], {'customer_name': 'महेश गोसाई (Mahesh Gusai)', 'phone': '9624396169', 'pincode': '370240', 'amount': 450, 'payment_type': 'COD', 'products': 'tab 90 pack :- 1', 'audit_flag': ''}),
    (50, [], {'customer_name': 'स्नेहल सावंत (Snehal Sawant)', 'phone': '', 'pincode': '', 'amount': 0, 'payment_type': 'Prepaid', 'products': '10 capsule snehal sawant nashik expo order', 'audit_flag': 'नाशिक एक्स्पो ऑर्डर'}),
    (51, [52], {'customer_name': 'लक्ष्मण नांद्रेकर (Laxman Nandrekar)', 'phone': '9637992915', 'pincode': '416416', 'amount': 0, 'payment_type': 'Prepaid', 'products': '50 Bottel arogyam 60 tablets packing with arogyam labels', 'audit_flag': 'स्पीड पोस्टने पाठवले (पहिली ऑर्डर)'}),
    (61, [62, 63, 65], {'customer_name': 'सुनिता भरते (Sunita Bharate)', 'phone': '8983981909', 'pincode': '413736', 'amount': 900, 'payment_type': 'COD', 'products': '1 korean cream 1 facewash', 'audit_flag': 'तपशील IDX 63 वरून, स्वागत हॉटेल प्रवरा लोणी'}),
    (85, [], {'customer_name': 'अमर पैठणे (Amar Paithane)', 'phone': '7767883288', 'pincode': '431144', 'amount': 350, 'payment_type': 'COD', 'products': 'spirulina tab', 'audit_flag': ''}),
    (101, [], {'customer_name': 'विनायक (Vinayak)', 'phone': '9619707465', 'pincode': '413102', 'amount': 400, 'payment_type': 'Prepaid', 'products': 'Spiru tab 90 1 Bottel', 'audit_flag': 'बारामती ऑर्डर'}),
    (139, [], {'customer_name': 'अक्षयराज अरविंदकुमार श्रीनिवास (Akshay Gajbhiye)', 'phone': '', 'pincode': '441105', 'amount': 9000, 'payment_type': 'COD', 'products': 'Capsule 10, Moringa pow 10, Cookies 10, Soap 10, Amla pow 5, Ashwagandha pow 5, Beet pow 5, Seabuck 5, Moringa tab 5, Ashwa tab 5', 'audit_flag': 'मोठी बल्क थेरपी सेंटर ऑर्डर'}),
    (154, [], {'customer_name': 'लक्ष्मण नांद्रेकर (Laxman Nandrekar)', 'phone': '9637992915', 'pincode': '416416', 'amount': 0, 'payment_type': 'Prepaid', 'products': '30 bottel spirulina 60 tab 750 mg che', 'audit_flag': 'दुसरी ऑर्डर (30 बाटल्या)'}),
    (181, [357], {'customer_name': 'विनायक रघुनाथ शिंदे (Vinayak Shinde)', 'phone': '9960587676', 'pincode': '416109', 'amount': 850, 'payment_type': 'COD', 'products': '1 spirulina tablets 1 seabuckthorn capsule', 'audit_flag': 'IDX 357 वर स्मरणपत्र'}),
    (184, [185, 186], {'customer_name': 'संतोष कुमार गुप्ता (Santosh Kumar Gupta)', 'phone': '9708185321', 'pincode': '822128', 'amount': 450, 'payment_type': 'COD', 'products': '1 capsule', 'audit_flag': 'तपशील IDX 185 वरून'}),
    (187, [188, 189], {'customer_name': 'अब्दुल सलीम (Abdul Saleem)', 'phone': '9400075086', 'pincode': '673019', 'amount': 400, 'payment_type': 'Prepaid', 'products': 'Half kg powder', 'audit_flag': 'केरळ ऑर्डर, रक्कम व फोन IDX 188-189 वरून'}),
    (190, [191], {'customer_name': 'लक्ष्मण नांद्रेकर (Laxman Nandrekar)', 'phone': '9637992915', 'pincode': '416416', 'amount': 0, 'payment_type': 'Prepaid', 'products': '30 bottel tab arogyam', 'audit_flag': 'तिसरी ऑर्डर (30 बाटल्या)'}),
    (200, [202], {'customer_name': 'डॉ. मिलिंद मोरे (Dr. Milind More)', 'phone': '9689740360', 'pincode': '425001', 'amount': 0, 'payment_type': 'Prepaid', 'products': '4 seabuckthorn cap, 5 spirulina tab 120, 5 moringa tab, 5 ashwagandha tab', 'audit_flag': 'रेवा आयुर्वेद क्लिनिक पुरवठा, तपशील IDX 202 वरून'}),
    (228, [229], {'customer_name': 'बजरंग बळवंत कुंभार', 'phone': '', 'pincode': '416216', 'amount': 2200, 'payment_type': 'COD', 'products': '3 spirulina tablets ani 2 sea buckthorn capsules', 'audit_flag': 'तपशील IDX 229 वरून, कागल कोल्हापूर'}),
    (256, [], {'customer_name': 'अमोल अशोक आवटी (Amol Ashok Awati)', 'phone': '9028266335', 'pincode': '423104', 'amount': 370, 'payment_type': 'COD', 'products': '1 facewash 1 oil 1 soap', 'audit_flag': 'मनमाड बस स्थानक'}),
    (281, [283], {'customer_name': 'हितेश मेहता (Hitesh Mehta)', 'phone': '9869505518', 'pincode': '400004', 'amount': 1600, 'payment_type': 'Prepaid', 'products': '10 spirulina powder', 'audit_flag': 'तपशील व रक्कम IDX 283 वरून'}),
    (306, [307, 498], {'customer_name': 'एकनाथ बापू लोखंडे', 'phone': '9423268167', 'pincode': '416206', 'amount': 400, 'payment_type': 'Prepaid', 'products': '1 capsule', 'audit_flag': 'तपशील IDX 307 वरून, IDX 498 वर डॉकेट चौकशी'}),
    (313, [314], {'customer_name': 'देवाशिष पोहनकर (Devashish Pohankar)', 'phone': '9766896900', 'pincode': '441110', 'amount': 1200, 'payment_type': 'Prepaid', 'products': 'capsule 1, oil 1, shampoo 1, soap 1, facewash 1, facepack 1', 'audit_flag': 'नागपूर प्रीपेड कॉम्बो'}),
    (344, [], {'customer_name': 'आमिर मर्चंट (Amir Merchant)', 'phone': '9833110514', 'pincode': '400018', 'amount': 530, 'payment_type': 'Prepaid', 'products': 'Capsule 1 + facewash 1', 'audit_flag': 'वरळी मुंबई'}),
    (353, [354], {'customer_name': 'ग्राहक (परळ मुंबई)', 'phone': '8080214722', 'pincode': '400012', 'amount': 400, 'payment_type': 'Prepaid', 'products': 'Spirulina powder 1 + 1 sample bath soap', 'audit_flag': 'लक्ष्मी नारायण सोसायटी परळ, तपशील IDX 354 वरून'}),
    (393, [394], {'customer_name': 'रवी कुमार / आयुष्मान आयुर्वेदिक (Ravi Kumar)', 'phone': '7903016225', 'pincode': '825302', 'amount': 3000, 'payment_type': 'Prepaid', 'products': '5 spirulina capsule, 5 seabuckthorn capsule', 'audit_flag': 'हजारीबाग झारखंड, तपशील IDX 394 वरून'}),
    (395, [397], {'customer_name': 'ग्राहक (उत्तर प्रदेश)', 'phone': '9369262728', 'pincode': '', 'amount': 1850, 'payment_type': 'Prepaid', 'products': '120 tab 10 bottel', 'audit_flag': 'तपशील व रक्कम IDX 397 वरून'}),
    (399, [400], {'customer_name': 'सोनाली अमोल पवार (Sonali Amol Pawar)', 'phone': '9325919245', 'pincode': '422006', 'amount': 1000, 'payment_type': 'Prepaid', 'products': '3 spirulina capsule', 'audit_flag': 'इंदिरा नगर नाशिक, तपशील IDX 400 वरून'}),
    (430, [431, 432, 435], {'customer_name': 'केतन ढोलकिया / धेरी ब्युटी पार्लर (Ketan Dholakiya)', 'phone': '9712845336', 'pincode': '360055', 'amount': 350, 'payment_type': 'COD', 'products': '1 spirulina tab 60 tab', 'audit_flag': 'विंछिया राजकोट, तपशील IDX 435 वरून'}),
    (436, [437], {'customer_name': 'लिलाराम चांदवाणी / राजू धिवरे (Lilaram Chandwani)', 'phone': '9022836249', 'pincode': '421001', 'amount': 800, 'payment_type': 'COD', 'products': '2 capsule', 'audit_flag': 'उल्हासनगर, तपशील IDX 437 वरून'}),
    (462, [], {'customer_name': 'अच्युत दत्तात्रय दौले पाटील (Achut Daule Patil)', 'phone': '', 'pincode': '413705', 'amount': 2400, 'payment_type': 'COD', 'products': '3 spirulina 120 tab + 2 seabuckthorn capsules + 1 bath soap', 'audit_flag': 'राहुरी कॉलेज अहिल्यानगर'}),
    (472, [], {'customer_name': 'वेकरिया भावेश किशोरभाई (Bhavesh Vekariya)', 'phone': '8758556235', 'pincode': '362130', 'amount': 1050, 'payment_type': 'COD', 'products': '3 spirulina tab :- 120 tab', 'audit_flag': 'जुनागढ गुजरात'}),
    (504, [], {'customer_name': 'ब्रह्मानंद चौहान (BrahmaNand Chauhan)', 'phone': '8595579636', 'pincode': '248003', 'amount': 500, 'payment_type': 'COD', 'products': 'Sea buckthorn :- capsule 1', 'audit_flag': 'देहराडून उत्तराखंड'}),
    (531, [536], {'customer_name': 'लक्ष्मण सोमाण्णा गेजगे (Laxman Gejage)', 'phone': '9970086889', 'pincode': '416413', 'amount': 350, 'payment_type': 'Prepaid', 'products': 'Spirulina tab 60 tab 1', 'audit_flag': 'जथ सांगली, तपशील IDX 536 वरून'}),
    (537, [538], {'customer_name': 'चंद्रकांत प्रल्हाद ढोरे', 'phone': '9881147752', 'pincode': '443001', 'amount': 1760, 'payment_type': 'COD', 'products': '5 seabuckthorn 5 spirulina 60 tab pack', 'audit_flag': 'बुलढाणा, तपशील व रक्कम IDX 538 वरून'}),
    (564, [565], {'customer_name': 'वसंत दिगंबर जोशी (Vasant Digambar Joshi)', 'phone': '', 'pincode': '422004', 'amount': 450, 'payment_type': 'COD', 'products': '1 capsule', 'audit_flag': 'नाशिक, तपशील IDX 565 वरून'}),
    (591, [592, 595, 616, 617], {'customer_name': 'स्मिता सिंग (Smita Singh)', 'phone': '', 'pincode': '421201', 'amount': 1880, 'payment_type': 'Prepaid', 'products': '20 kamla brand bottels', 'audit_flag': 'डोंबिवली पूर्व, तपशील IDX 592 वरून, IDX 616 वर पुनर्नोद'}),
    (618, [620], {'customer_name': 'व्ही. पावना (V. Pavna)', 'phone': '8341764069', 'pincode': '503224', 'amount': 4050, 'payment_type': 'COD', 'products': '10 seabuckthorn, 1 soap, 3 oil, Spirulina tab 120: 5, Moringa tab: 5', 'audit_flag': 'निझामाबाद तेलंगणा, तपशील IDX 620 वरून'}),
    (621, [622, 626], {'customer_name': 'अमित बबन चिंतले / लॅक्मे सलून (Amit Chintale)', 'phone': '9359914514', 'pincode': '411005', 'amount': 1150, 'payment_type': 'COD', 'products': '5 spirulina powder', 'audit_flag': 'एफ सी रोड पुणे, तपशील IDX 622 वरून'}),
    (624, [625], {'customer_name': 'सुनील पुंडलिक खेडकर', 'phone': '9226521901', 'pincode': '444303', 'amount': 5120, 'payment_type': 'COD', 'products': 'Spirulina cap 5, Moringa pow 5, Soap 5, Spiru pow 5, Seabuck cap 5, Face wash 5, Hair oil 5', 'audit_flag': 'खामगाव बुलढाणा, तपशील व रक्कम IDX 625 वरून'}),
    (660, [661, 662], {'customer_name': 'विश्वास बापू पोवार', 'phone': '9890697859', 'pincode': '416232', 'amount': 800, 'payment_type': 'Prepaid', 'products': 'Capsule 2 speed post', 'audit_flag': 'कागल कोल्हापूर, तपशील IDX 661 वरून'}),
    (698, [699, 701, 703, 705, 706], {'customer_name': 'ग्राहक (फोटोवरून पत्ता)', 'phone': '9992604067', 'pincode': '', 'amount': 2100, 'payment_type': 'COD', 'products': 'Moringa powder + spirulina powder', 'audit_flag': 'पत्ता फोटोमध्ये, तपशील व रक्कम IDX 699, 705 वरून'})
]

# Total Master Orders
ALL_MAY_ORDERS = []
for idx, merged, custom in manju_orders_def:
    ALL_MAY_ORDERS.append({
        'main_idx': idx,
        'merged_idxs': merged,
        'telecaller': 'मंजुश्री कस्तुरे',
        'is_telecaller': True,
        'custom': custom
    })

for idx, merged, custom in monu_orders_def:
    ALL_MAY_ORDERS.append({
        'main_idx': idx,
        'merged_idxs': merged,
        'telecaller': 'मोनू',
        'is_telecaller': True,
        'custom': custom
    })

for idx, merged, custom in yash_orders_def:
    ALL_MAY_ORDERS.append({
        'main_idx': idx,
        'merged_idxs': merged,
        'telecaller': 'यश सूर्यवंशी (फाउंडर डायरेक्ट)',
        'is_telecaller': False,
        'custom': custom
    })

ALL_MAY_ORDERS.sort(key=lambda x: x['main_idx'])

print(f"Manju Orders: {len(manju_orders_def)}")
print(f"Monu Orders: {len(monu_orders_def)}")
print(f"Yash Orders: {len(yash_orders_def)}")
print(f"Grand Total Orders: {len(ALL_MAY_ORDERS)}")

# Check duplicate main_idxs or merged_idxs
main_map = {}
merged_map = {}

for o in ALL_MAY_ORDERS:
    m = o['main_idx']
    if m in main_map:
        print(f"ERROR: Duplicate main_idx {m}")
    main_map[m] = o
    for sub in o['merged_idxs']:
        if sub in merged_map:
            print(f"ERROR: Sub-idx {sub} already merged into {merged_map[sub]}")
        merged_map[sub] = m

overlap = set(main_map.keys()).intersection(set(merged_map.keys()))
if overlap:
    print(f"ERROR: Overlap: {overlap}")
else:
    print("SUCCESS: 0 Overlap between main orders and merged sub-messages!")

print(f"Main Orders count: {len(main_map)}")
print(f"Merged Sub-messages count: {len(merged_map)}")

remaining = []
for i in range(len(msgs)):
    if i not in main_map and i not in merged_map:
        remaining.append(i)

print(f"Remaining excluded messages: {len(remaining)}")
print(f"Total check: {len(main_map)} + {len(merged_map)} + {len(remaining)} = {len(main_map) + len(merged_map) + len(remaining)} (Expected: {len(msgs)})")
