import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Let's inspect Monu orders amounts and modes
monu_orders = [
    # (idx, sub_indices, name, phone, address, pincode, product, mode, amount)
    (23, [24], 'वैशाली योगेश शिरसाठ', '7767846851', 'कुंभार गल्ली, प्रवरा अॅक्वा जवळ, बेलापूर खुर्द, ता. श्रीरामपूर, जि. अहिल्यानगर', '413715', '5 Bottle Capsule', 'COD', 1550),
    (51, [52, 53, 55, 56, 57], 'सोमनाथ पोटे', '9284882529', 'House No. 207, B Wing, 2nd Floor, Om Sai Heritage, Olive Complex, Maitri Park, Kalher, Thane', '421302', '1 Korean Cream, 2 Soap', 'COD', 1860),
    (71, [72, 101, 102, 128, 129, 130, 131], 'चंदना बसू', '7022890998', '38 Postal Audit Colony, Rana Pratap Nagar, Behind Durga Mandir, Nagpur', '440022', '2 Pack Spirulina Tablets', 'Prepaid', 450),
    (103, [104, 105, 106], 'हौसाजी गंगाराम गायकवाड', '7744967969', 'Narsi, Near ZP School, Shyamnagar, Tal. Naigaon, Dist. Nanded', '431709', 'Spirulina (120) 10 Bottle', 'COD', 1870),
    (115, [], 'मानबहादूर क्षत्रिय', '7350085959', 'C/O Gat No. 12, Plot 21 AD 22 B, Bhagatsingh Nagar, Vadgaon Kolhati, Bajajnagar, Chh. Sambhajinagar', '431136', '5 Capsule, 2 Seabuckthorn, 1 Soap', 'COD', 2500),
    (133, [134, 135], 'तेजल शंकर वाळुंज', '9579406586', 'At Post Wada, Tal. Khed, Dist. Pune', '412402', '2 Bottle + 1 Spirulina', 'COD', 900),
    (140, [137, 139], 'धनश्री शिरोळे', '7972358357', 'Ghodawat Consumer Limited, A/p Chipri Phata, Jaysingpur, Tal. Shirol, Dist. Kolhapur', '416101', '1 Spirulina Capsule', 'COD', 450),
    (141, [187, 188, 189, 190, 191, 195, 196, 299, 300, 301, 302, 303, 304, 307], 'राजेश सरनाईक', '9823429710', 'Blue Heaven Aquarium, 562 Sadashiv Peth, Chitra Shala Bldg, Kumthekar Road, Pune', '411030', '500g Moringa, 500g Spirulina, 1 Seabuckthorn, 200g Ashwagandha', 'COD', 1500),
    (147, [], 'सोपान गणपत उफाडे (ऑर्डर १)', '8087889670', 'Mukkam Post Varkheda, Tal. Dindori, Dist. Nashik', '422205', '3 Spirulina Capsule', 'COD', 1050),
    (184, [185, 186], 'अण्णासाहेब चंद्रकांत यादव', '7767846851', 'At Post Jamgaon, Tal. Barshi, Dist. Solapur', '413401', '1 Bottle Capsule', 'COD', 450),
    (211, [], 'उषा लक्ष्मण साळुंखे', '7276373466', 'Poona Dal and Besan 71/A, Hadapsar Industrial Estate, Pune', '411013', '2 Tab Bottle', 'COD', 500),
    (213, [214], 'डॉ. सतीश सावरकर', '9518565072', 'Happy Home Old Age Home, At Takli, Post Zhadshi, Selu, Wardha', '442104', '100g Spirulina Powder', 'COD', 350),
    (215, [], 'संजय हसमुखलाल परमार', '9326218925', 'Narshi Driver Chawl 237, Daftari Cross Road, Bandongri, Malad East, Mumbai', '400097', '1 Tablet Bottle', 'COD', 350),
    (225, [216, 217, 218, 219, 220, 222, 223, 224, 226], 'रोशन वृंदा विष्णू राऊत', '8691844173', 'Flat 104, Shreepati Corner, Plot 13, Sector 6, Karanjade, Panvel, Raigarh', '410206', '1 Capsule, 1 Facepack, 1 Facewash', 'Prepaid', 900),
    (221, [], 'सोमनाथ पिकू शिंदे', '9423024293', 'Mukkam Post Khatav, Dist. Satara', '415505', '3 Bottle Capsule', 'Prepaid', 1000),
    (238, [], 'विक्रम शिवाजी निकम', '9763416403', 'A. P. Shere Station, Tal. Karad, Dist. Satara', '415108', '2 Bottle Capsule', 'COD', 800),
    (248, [], 'विनीता विक्रम कवठे', '9764658180', 'H 9/769 Sukh Shanti Soc, Niljyoti, Gokhalenagar, Pune', '411016', '1 Spirulina Tablet', 'COD', 350),
    (249, [278, 279], 'भाऊसाहेब गोपीनाथ अहिरे', '7558252739', 'Mukkam Post Kolapewadi, Tal. Kopargaon, Dist. Ahilyanagar', '423602', '1 Spirulina Capsule, 1 Moringa Tab', 'COD', 750),
    (252, [], 'वाशू सिंधानी', '9921343397', 'Vishal Jeans Trading, Basant Bhar Road, Lalsai Market Galli 3, Ulhasnagar 5, Thane', '421005', '5 Bottle Capsule', 'COD', 1550),
    (271, [273, 274], 'राहुल भुसारी', '8097441914', '2A 504 Om Shivai CHS, Gulmohar Road, Devipada, Borivali East, Mumbai', '400066', '2 Spirulina Tablets', 'COD', 450),
    (272, [], 'कृष्णा वाकळे', '9503771777', 'House No. 10, Gat 635, Daxin Laxminagar, Moshi, Pune', '412105', '1 Bottle Spirulina Tab', 'COD', 350),
    (285, [], 'सुरेंदर कुमार', '9897183387', 'Chikana, Nalhera, Saharanpur, Uttar Pradesh', '247231', '1 Bottle Capsule', 'COD', 450),
    (289, [], 'बाला घोडके', '9021386833', 'Mukkam Pimpri, Tal. Selu, Dist. Parbhani', '431503', '3 Capsule', 'COD', 750),
    (298, [], 'विनोद कुमार', '9759773590', 'Nagela Chikana, Saharanpur, Uttar Pradesh', '247231', '1 Spirulina Cap', 'COD', 450),
    (327, [328], 'शाहीन बानो', '9927216670', 'Gram Dhaki, Post Sahaspur, Chakrata Road, Dehradun, Uttarakhand', '248197', '1 Capsule', 'COD', 450),
    (341, [], 'सुजाता पिसे', '9141023102', '130 High Street, Camp Belgaum, Karnataka', '590001', '3 Spirulina Tab, 1 Seabuckthorn, 1 Hair Oil, 2 Soap', 'Prepaid', 1369),
    (349, [], 'भारत अरोरा', '9876163655', '5/87 1st Floor, Subhash Nagar, Delhi', '110027', '2 Spirulina Tab', 'COD', 350),
    (412, [], 'राजेंद्र जनार्दन पाटील', '8483980076', 'At Post Khadaki, Tal. Pachora, Dist. Jalgaon', '424201', '5 Bottle 60 Tablet', 'COD', 900),
    (413, [414, 415, 416], 'गणेश बाबासाहेब दौले (ऑर्डर १ - श्रीगोंदा)', '9922083949', 'Daule Wasti, Chimbhale, Shrigonda, Ahmednagar', '413701', '1 Capsule', 'COD', 450),
    (417, [], 'अमर पैठणे', '7767883288', 'Chatrapati Shivaji Chowk, Beed Parli Road, Wadwani, Beed', '431144', 'Spirulina Tab', 'COD', 350),
    (427, [], 'सोपान गणपत उभाडे (ऑर्डर २ - साबण व शाम्पू)', '8087889670', 'Mukkam Post Varkheda, Tal. Dindori, Dist. Nashik', '422205', '3 Soap, 2 Spirulina Shampoo with Conditioner', 'Prepaid', 1020),
    (436, [], 'डॉ. रविकिरण बुलबुले', '9423273572', 'Iswar Chandra Bangla, Near ST Stand Anna Patil Nagar, Sangli', '416416', '5 Capsule, 5 Tab (120)', 'COD', 1850),
    (442, [], 'पंकज कुमार निराला', '9006134242', 'At+Post Dharahara, Dist. Bhagalpur, Bihar', '853204', '2 Tab', 'COD', 450),
    (444, [445], 'ऋजुता मंदसौरवाले', '9890445066', 'Flat 401, Shubhashree, Mayur Colony, Kothrud, Pune', '411038', '2 Bottle Spirulina Capsule', 'Prepaid', 650),
    (446, [], 'सुहास बसराज मेहत्रे', '9028303012', 'C/O Prasad Golai, Premlok Colony, Nade Nagar, Kalewadi, Pune', '411017', '2 Bottle Tablets (60)', 'COD', 450),
    (448, [449, 450, 451], 'सोमनाथ पोटे (ऑर्डर २ - स्किनकेअर कॉम्बो)', '9284882529', 'House No. 207, Om Sai Heritage, Kalher, Thane', '421302', '1 Capsule, 1 Night Cream, 2 Facepack, 2 Cookies', 'Prepaid', 1450),
    (463, [464], 'तानाजी चव्हाण', '7264068812', 'C/O Anil Vishnu Rane Sivratna Colony, Near Panchnath Mandir, Kalewadi, Pune', '411017', '2 Spirulina Tablet', 'COD', 450),
    (465, [], 'अनिल हरी अडागळे', '9284490062', 'Deolai Satara Parisar, Mhada Colony, Aurangabad', '431010', '1 स्पिरुलिना पावडर', 'COD', 350),
    (479, [], 'मनोज अवचार', '8828995922', 'NG Residency Bldg 10 Flat 101, Near Balkum Naka, Thane', '400608', '2 Bottle Tablets (60)', 'COD', 450),
    (481, [], 'सुरेश गोरे', '7218613556', 'At Post Dabewadi, Satara', '415001', '1 Spirulina Capsule, 1 Seabuckthorn', 'COD', 950),
    (484, [485, 486, 487], 'गणेश बाबासाहेब दौले (ऑर्डर २ - राहुरी)', '9158251199', 'At Jogeshwari Akhada, Tal. Rahuri, Dist. Ahilyanagar', '413705', '3 Spirulina Tab (60), 2 Moringa', 'Prepaid', 1000),
    (488, [489, 490], 'शिवाजी जनार्दन कदम', '9657666501', 'Katewadi, Post Sayyad Varvade, Tal. Mohol, Dist. Solapur', '413213', '3 Spirulina Tab (120)', 'Prepaid', 1000),
    (509, [], 'अमोल अशोक अवटी', '9028266335', 'Manmad Bus Stanak, Pass Vibhag, Manmad, Nashik', '423104', '1 Spirulina Capsule', 'COD', 500)
]

print(f"Monu orders count: {len(monu_orders)}")
monu_total = sum(o[8] for o in monu_orders)
monu_prepaid = sum(1 for o in monu_orders if o[7] == 'Prepaid')
monu_cod = sum(1 for o in monu_orders if o[7] == 'COD')
print(f"Monu Total: Rs {monu_total:,} (Prepaid: {monu_prepaid}, COD: {monu_cod})")
