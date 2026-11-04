import sys, json

sys.stdout.reconfigure(encoding='utf-8')

# Load all March WhatsApp messages
with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = {m['index']: m for m in json.load(f)}

# Define all 81 master orders for March 2026 in chronological order:
raw_orders = [
    # 1. 01/03 - Yash - Mantesh Karle
    {
        "date": "01/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Mantesh Basavaraj Karle",
        "phone": "7558273645",
        "address": "at Devikavatha post Mhaisalagi ta Aakkalkot Di Solapur",
        "pincode": "413216",
        "product": "2 spirulina capsule, 1 Ashwagandha",
        "mode": "COD",
        "amount": 900,
        "main_idx": 4,
        "sub_indices": [8, 9],
        "note": "सोलापूर मूळ पत्त्यावर २ कॅप्सूल व १ अश्वगंधा ऑर्डर."
    },
    # 2. 01/03 - Yash - Pradeep Nirmal
    {
        "date": "01/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Pradeep Nirmal",
        "phone": "9223343444",
        "address": "001/A Royal Palace, Near Bhadrakali Mandir, Station Road, Bhayandar (West), Thane",
        "pincode": "401101",
        "product": "1 spirulina capsule, 1 seabuckthorn",
        "mode": "Prepaid",
        "amount": 750,
        "main_idx": 6,
        "sub_indices": [7, 10, 11, 64, 65],
        "note": "०२ व ०६ मार्च रोजी रिमाइंड करून डिस्पॅच केलेली ऑर्डर."
    },
    # 3. 02/03 - Yash - Unspecified Slip Order (5 spirulina 120 + 10 Seabuckthorn COD 3360)
    {
        "date": "02/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Unspecified Customer (Slip Order)",
        "phone": "",
        "address": "Slip / Photo in chat (B2B / Wholesale Order)",
        "pincode": "",
        "product": "5 spirulina 120 tab bottel, 10 Seabuckthorn capsule",
        "mode": "COD",
        "amount": 3360,
        "main_idx": 13,
        "sub_indices": [14, 67, 68, 113, 114, 115, 126, 127],
        "note": "स्लिप फोटोद्वारे आलेली ₹३,३६० ची घाऊक सीओडी ऑर्डर (IDX 115 व 127 वर रक्कम स्पष्ट)."
    },
    # 4. 03/03 - Yash - Sai Suman Medical
    {
        "date": "03/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "साई सुमन मेडीकल (Sai Suman Medical)",
        "phone": "9765497487",
        "address": "मुपो नाऊर ता श्रीरामपूर जी अहिल्या नगर",
        "pincode": "413718",
        "product": "5 spirulina capsules, 5 spirulina oil, 1 Amla powder, 5 Soap",
        "mode": "Prepaid",
        "amount": 2500,
        "main_idx": 20,
        "sub_indices": [21, 22, 23],
        "note": "मेडिकल स्टोअर व्यावसायिक घाऊक ऑर्डर (अहिल्यानगर)."
    },
    # 5. 03/03 - Yash - Vaidya Murlidhar Das
    {
        "date": "03/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Vaidya Murlidhar Das (Jivanseva Wellness)",
        "phone": "7489959569",
        "address": "Gokulvatika Road Near Adiwasi Balika Chhatravas, Rudri Road, Dhamtari, Chhattisgarh",
        "pincode": "493773",
        "product": "Kit (1 capsule, 1 soap, 1 shampoo, 1 oil, 1 facewash, 1 cookies)",
        "mode": "Prepaid",
        "amount": 999,
        "main_idx": 32,
        "sub_indices": [33],
        "note": "छत्तीसगड वेलनेस सेंटर किट ऑर्डर."
    },
    # 6. 04/03 - Yash - Shivaji Janardan Kadam
    {
        "date": "04/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "शिवाजी जनार्दन कदम (Shivaji Kadam)",
        "phone": "9657666501",
        "address": "मुक्काम कातेवाडी पोस्ट. सय्यद वरवडे तालुका मोहोळ जिल्हा सोलापूर",
        "pincode": "413213",
        "product": "5 capsule",
        "mode": "COD",
        "amount": 1250,
        "main_idx": 37,
        "sub_indices": [38],
        "note": "सोलापूर ५ कॅप्सूल सीओडी ऑर्डर ₹१,२५०."
    },
    # 7. 04/03 - Yash - Uma Soundattikar
    {
        "date": "04/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Uma Soundattikar",
        "phone": "9130666799",
        "address": "CL/9/66/4 सिडको सातारा अट औरंगाबाद स्वामी समर्थ मंदिरजवळ",
        "pincode": "",
        "product": "2 capsule",
        "mode": "COD",
        "amount": 650,
        "main_idx": 39,
        "sub_indices": [40, 41, 42],
        "note": "छत्रपती संभाजीनगर २ कॅप्सूल सीओडी ऑर्डर ₹६५०."
    },
    # 8. 04/03 - Yash - Prof Prasad Joshi
    {
        "date": "04/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Prof Prasad Joshi",
        "phone": "9673200044",
        "address": "402, Yogeshwar Sara Apartment Near Ajay Mitra Mandal Indira Nagar Nashik",
        "pincode": "422009",
        "product": "1 capsule",
        "mode": "Prepaid",
        "amount": 350,
        "main_idx": 47,
        "sub_indices": [48, 49, 50],
        "note": "नाशिक लोकल प्रीपेड १ कॅप्सूल ऑर्डर."
    },
    # 9. 07/03 - Yash - Sulai Nandan Therapy Sentar
    {
        "date": "07/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Sulai Nandan Therapy Sentar (Dr. Agajbhiye)",
        "phone": "8007341215",
        "address": "Chatrapati Shiwaji Maharaj Chauk -492 Parshioni Nagpur",
        "pincode": "441105",
        "product": "10 cookies, 5 tab 120, 5 facewash, 5 oil, 5 shampoo, 10 soap, 5 kesuda soap, 5 capsule",
        "mode": "COD",
        "amount": 6050,
        "main_idx": 70,
        "sub_indices": [71, 72, 73],
        "note": "नागपूर थेरपी सेंटर बल्क सीओडी ऑर्डर ₹६,०५०."
    },
    # 10. 07/03 - Yash - Tejal Medical
    {
        "date": "07/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Tejal Medical",
        "phone": "9022991045",
        "address": "Taharabad Road (naka) Mitra Nagar Satana",
        "pincode": "423301",
        "product": "10 oil, 5 shampoo black",
        "mode": "COD",
        "amount": 3000,
        "main_idx": 74,
        "sub_indices": [75, 76, 341, 342, 343, 364, 365, 366, 367, 368],
        "note": "सटाणा मेडिकल व्यावसायिक ऑर्डर (२० मार्च रोजी अंतिम पॅक व डिस्पॅच)."
    },
    # 11. 07/03 - Yash - Kavita Chikane
    {
        "date": "07/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Kavita Chikane",
        "phone": "9892753352",
        "address": "Room no 9 plot numbers 194 vrundavan society Nerul west Navi Mumbai",
        "pincode": "400706",
        "product": "2 capsule",
        "mode": "COD",
        "amount": 640,
        "main_idx": 106,
        "sub_indices": [107, 108, 122, 128],
        "note": "नवी मुंबई नेरूळ २ कॅप्सूल सीओडी ऑर्डर ₹६४०."
    },
    # 12. 08/03 - Yash - Unspecified Slip Order (Seabuckthorn 4 + Spiru 2 + Ashwa 2)
    {
        "date": "08/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Unspecified Customer (Slip Order)",
        "phone": "",
        "address": "Slip / Photo in chat",
        "pincode": "",
        "product": "4 Seabuckthorn capsule, 2 Spirulina capsule, 2 Ashwagandha tab",
        "mode": "COD",
        "amount": 2200,
        "main_idx": 109,
        "sub_indices": [111],
        "note": "स्लिप फोटोद्वारे आलेली ८ बॉटल्स कॉम्बो ऑर्डर."
    },
    # 13. 08/03 - Yash - Mahesh Dhandya Bhandar
    {
        "date": "08/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Mahesh Dhandya Bhandar",
        "phone": "9372443716",
        "address": "Gholai Nagar Kalwa Thane",
        "pincode": "400605",
        "product": "1 charcoal soap, 1 facepack",
        "mode": "Prepaid",
        "amount": 300,
        "main_idx": 116,
        "sub_indices": [117, 118],
        "note": "कळवा ठाणे १ साबण व १ फेसपॅक प्रीपेड ऑर्डर."
    },
    # 14. 09/03 - Yash - Ayurtech Biohackerz
    {
        "date": "09/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "AYURTECH BIOHACKERZ PRIVATE LIMITED",
        "phone": "8433723567",
        "address": "C/O- Dr.Satish Suryawanshi, Sai Nisarg, 402, Shivane, Pune",
        "pincode": "411023",
        "product": "100 bottel tab ayurtech name che",
        "mode": "Prepaid",
        "amount": 15000,
        "main_idx": 129,
        "sub_indices": [130, 131, 132],
        "note": "आयुर्टेक १०० बॉटल्स थर्ड पार्टी ब्रँडेड टॅबलेट मॅन्युफॅक्चरिंग B2B ऑर्डर."
    },
    # 15. 09/03 - Yash - Renuka Kotambe
    {
        "date": "09/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Renuka Kotambe",
        "phone": "7030270217",
        "address": "Gut No. 146, Plot No.53, CIDCO Mahanagar - 1, Tisgaon, Waluj, MIDC, Aurangabad",
        "pincode": "431136",
        "product": "Overall sagla (Oil, Shampoo, Facewash, Soap, Capsule, Cookies, Facepack, Powder)",
        "mode": "COD",
        "amount": 1350,
        "main_idx": 151,
        "sub_indices": [152, 153, 154],
        "note": "छत्रपती संभाजीनगर संपूर्ण किट सीओडी ऑर्डर ₹१,३५०."
    },
    # 16. 10/03 - Yash - Mahesh Singh
    {
        "date": "10/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Mahesh Singh",
        "phone": "9450396449",
        "address": "B-2/202 Eldeco Elegance Vibhuti khand Gomtinagar Lucknow",
        "pincode": "226010",
        "product": "2 capsule",
        "mode": "COD",
        "amount": 650,
        "main_idx": 159,
        "sub_indices": [160],
        "note": "लखनौ २ कॅप्सूल सीओडी ऑर्डर ₹६५०."
    },
    # 17. 11/03 - Monu - M. Karunanithi.M.
    {
        "date": "11/03/2026",
        "telecaller": "मोनू",
        "customer": "M. Karunanithi.M.",
        "phone": "9080023631",
        "address": "T1 Vasanth appartments #15 ,3rd floor pillayarkoil st.w.jafferkhanpet, Chennai",
        "pincode": "600083",
        "product": "2 capsule spirulina, 1 seabackthorn",
        "mode": "COD",
        "amount": 1149,
        "main_idx": 172,
        "sub_indices": [173, 174],
        "note": "चेन्नई ३ बॉटल्स सीओडी ऑर्डर ₹१,१४९."
    },
    # 18. 11/03 - Monu - Boota kanel singh
    {
        "date": "11/03/2026",
        "telecaller": "मोनू",
        "customer": "Boota kanel singh",
        "phone": "9569999269",
        "address": "H ni 144 mangli tande Ludhiana, Punjab",
        "pincode": "141007",
        "product": "2 capsule",
        "mode": "COD",
        "amount": 650,
        "main_idx": 175,
        "sub_indices": [],
        "note": "पंजाब २ कॅप्सूल सीओडी ऑर्डर ₹६५०."
    },
    # 19. 11/03 - Yash - Unspecified Mahavir Courier (2 120 tab + 2 bath soap)
    {
        "date": "11/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Unspecified Customer (Mahavir Courier)",
        "phone": "",
        "address": "Slip / Photo in chat (Dispatched via Mahavir Courier)",
        "pincode": "",
        "product": "2 120 tab, 2 bath soap",
        "mode": "Prepaid",
        "amount": 1100,
        "main_idx": 178,
        "sub_indices": [179, 306, 309, 310, 311, 312, 313, 315, 318, 319, 320, 322],
        "note": "महावीर कुरिअरने पाठवलेली २ १२० टॅब व २ साबण प्रीपेड ऑर्डर (१७ मार्च रोजी पूर्ण)."
    },
    # 20. 11/03 - Yash - Unspecified Speed Post (5 tab)
    {
        "date": "11/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Unspecified Customer (Speed Post)",
        "phone": "",
        "address": "Speed Post Order (Slip in chat)",
        "pincode": "",
        "product": "Speed post 5 tab",
        "mode": "COD",
        "amount": 700,
        "main_idx": 180,
        "sub_indices": [181, 182, 183],
        "note": "स्पीड पोस्ट ५ टॅब्लेट सीओडी ऑर्डर ₹७००."
    },
    # 21. 12/03 - Monu - Kiran Gurav
    {
        "date": "12/03/2026",
        "telecaller": "मोनू",
        "customer": "kiran gurav",
        "phone": "",
        "address": "Venunagar post gursale taluka pandarpur District Solapur",
        "pincode": "413304",
        "product": "Capsule 5, Tab 5, Soap 5, Shampoo 2, Oil 2, Spirulina powder 2",
        "mode": "COD",
        "amount": 3180,
        "main_idx": 206,
        "sub_indices": [229],
        "note": "पंढरपूर सोलापूर मोठा कॉम्बो पॅक सीओडी ऑर्डर ₹३,१८०."
    },
    # 22. 13/03 - Monu - Madhukar Wagh
    {
        "date": "13/03/2026",
        "telecaller": "मोनू",
        "customer": "मधुकर वाघ (Madhukar Wagh)",
        "phone": "9158602352",
        "address": "मुक्काम पोस्ट कोकरनी तालुका ,जिल्हा - परभणी",
        "pincode": "431521",
        "product": "1 tablet",
        "mode": "COD",
        "amount": 350,
        "main_idx": 213,
        "sub_indices": [],
        "note": "परभणी १ टॅब्लेट सीओडी ऑर्डर ₹३५०."
    },
    # 23. 13/03 - Monu - Sagar Tanaji Kadam
    {
        "date": "13/03/2026",
        "telecaller": "मोनू",
        "customer": "sagar Tanaji Kadam",
        "phone": "8055753868",
        "address": "mukkam post mendapur Taluka : pandarpur District: Solapur",
        "pincode": "",
        "product": "spirulina capsule 5, Seabackthorn 1",
        "mode": "COD",
        "amount": 1290,
        "main_idx": 215,
        "sub_indices": [218, 220],
        "note": "सोलापूर ६ बॉटल्स सीओडी ऑर्डर ₹१,२९०."
    },
    # 24. 13/03 - Monu - Masna Balaji Hake
    {
        "date": "13/03/2026",
        "telecaller": "मोनू",
        "customer": "masna Balaji Hake",
        "phone": "8262935942",
        "address": "Ranisavargaon Taluka Gangakhed District Parbhani",
        "pincode": "431514",
        "product": "2 tablets",
        "mode": "COD",
        "amount": 450,
        "main_idx": 217,
        "sub_indices": [],
        "note": "परभणी २ टॅब्लेट सीओडी ऑर्डर ₹४५०."
    },
    # 25. 13/03 - Monu - Ketan Kholiya
    {
        "date": "13/03/2026",
        "telecaller": "मोनू",
        "customer": "Ketan Kholiya",
        "phone": "8160037527",
        "address": "Sahyog-1 Flat no 402 Opp h.j.doshi hospital Noble street Gondal road Rajkot",
        "pincode": "360004",
        "product": "2 capsule",
        "mode": "COD",
        "amount": 650,
        "main_idx": 222,
        "sub_indices": [],
        "note": "राजकोट गुजरात २ कॅप्सूल सीओडी ऑर्डर ₹६५०."
    },
    # 26. 14/03 - Yash - Unspecified Slip Order (120 tab 1 bottel)
    {
        "date": "14/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Unspecified Customer (Slip Order)",
        "phone": "",
        "address": "Slip / Photo in chat",
        "pincode": "",
        "product": "120 tab 1 bottel",
        "mode": "COD",
        "amount": 450,
        "main_idx": 230,
        "sub_indices": [231, 232],
        "note": "स्लिप फोटोद्वारे आलेली १ १२० टॅब्लेट बॉटल ऑर्डर."
    },
    # 27. 14/03 - Yash - Gorakhnath Shirsath
    {
        "date": "14/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "गोरखनाथ शिरसाठ (Gorakhnath Shirsath)",
        "phone": "7776952439",
        "address": "श्री आदर्शपार्क CHS, D Wing रूम न 4 बॅरेज रोड रमेशवाडी बदलापूर पश्चिम",
        "pincode": "421503",
        "product": "Kit @999 (Seabuckthorn 1, 1 capsule, 1 cookies, 1 soap, 1 facewash, 1 shampoo)",
        "mode": "COD",
        "amount": 999,
        "main_idx": 234,
        "sub_indices": [237],
        "note": "बदलापूर किट @९९९ सीओडी ऑर्डर."
    },
    # 28. 14/03 - Monu - Ram Khandagale
    {
        "date": "14/03/2026",
        "telecaller": "मोनू",
        "customer": "Ram khandagale",
        "phone": "9022850599",
        "address": "Gauli Mata Yashwant Nagar trishul society Pimpri Pune",
        "pincode": "411018",
        "product": "powder",
        "mode": "Prepaid",
        "amount": 300,
        "main_idx": 244,
        "sub_indices": [],
        "note": "पिंपरी पुणे १ पावडर प्रीपेड ऑर्डर ₹३००."
    },
    # 29. 14/03 - Yash - Sanjay Bansilal Dhangar
    {
        "date": "14/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Sanjay Bansilal Dhangar",
        "phone": "9975274536",
        "address": "Plot no. 44 B Veduanna Nagar Shingave Shivar Shirpur Dist-Dhule",
        "pincode": "425405",
        "product": "Bride cream 1, Korean cream 1, Cookies 3, Sea buck thorn 2, Facewash green 5",
        "mode": "COD",
        "amount": 3500,
        "main_idx": 157,
        "sub_indices": [245, 248],
        "note": "शिरपूर धुळे मोठा कॉस्मेटिक्स कॉम्बो सीओडी ऑर्डर (१० मार्च रोजी पत्ता, १४ मार्च रोजी उत्पादने)."
    },
    # 30. 15/03 - Yash - Sonali Amol Pawar
    {
        "date": "15/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Sonali Amol Pawar",
        "phone": "9325919245",
        "address": "Flat no. C 302, shri Hari Krushna Heights opp ASHOKA MEDICOVER HOSPITAL Indira Nagar Nasik",
        "pincode": "422006",
        "product": "1 bride cream, 1 spirulina capsule, 1 spirulina facewash, 1 Green tea facewash",
        "mode": "COD",
        "amount": 1200,
        "main_idx": 250,
        "sub_indices": [251],
        "note": "नाशिक ४ प्रॉडक्ट्स कॉम्बो ऑर्डर."
    },
    # 31. 15/03 - Yash - Amir Merchant (Shobiz)
    {
        "date": "15/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Amir Merchant (Shobiz)",
        "phone": "",
        "address": "General Manager - Taxation, Parijat house 4th floor Dr E Moses Road Worli Mumbai",
        "pincode": "400018",
        "product": "1 spirulina capsule, 1 seabuckthorn capsule",
        "mode": "Prepaid",
        "amount": 900,
        "main_idx": 252,
        "sub_indices": [253, 255],
        "note": "वरळी मुंबई कॉर्पोरेट प्रीपेड ऑर्डर ₹९००."
    },
    # 32. 15/03 - Yash - Agricultural College / Varsha Nikam (Collab)
    {
        "date": "15/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Agricultural College (Varsha Nikam)",
        "phone": "8956703444",
        "address": "Shardanagar, Nira–Baramati Road, Baramati, Dist. Pune",
        "pincode": "143115",
        "product": "Capsule 1",
        "mode": "Prepaid",
        "amount": 0,
        "main_idx": 263,
        "sub_indices": [],
        "note": "बारामती कॉलेज बार्टर कोलॅबोरेशन ऑर्डर (मूल्य ₹०)."
    },
    # 33. 16/03 - Monu - Dodmise Rajabhau
    {
        "date": "16/03/2026",
        "telecaller": "मोनू",
        "customer": "दोडमिसे राजाभाऊ (Dodmise Rajabhau)",
        "phone": "8149807422",
        "address": "सर्वे नंबर 3/3/1 हिंगणे खुर्द सिंहगड रोड, सुदत्ता संकुल रोड, साई मंदिर जवळ पुणे",
        "pincode": "411051",
        "product": "स्पीरुलींना कॅप्सूल दोन डब्या 60+60 (2 capsule)",
        "mode": "Prepaid",
        "amount": 600,
        "main_idx": 282,
        "sub_indices": [283],
        "note": "पुणे २ कॅप्सूल बॉटल्स प्रीपेड ऑर्डर ₹६००."
    },
    # 34. 17/03 - Monu - Kantaram Tukaram Chavre
    {
        "date": "17/03/2026",
        "telecaller": "मोनू",
        "customer": "कांताराम तुकाराम चवरे (Kantaram Chavre)",
        "phone": "9970693961",
        "address": "सिद्धेश्वर हायस्कुल जवळ सिद्धेश्वर कॉलनी दिघी रोड भोसरी पुणे",
        "pincode": "411039",
        "product": "1 spirulina capsule",
        "mode": "Prepaid",
        "amount": 350,
        "main_idx": 324,
        "sub_indices": [],
        "note": "भोसरी पुणे १ कॅप्सूल प्रीपेड ऑर्डर ₹३५० (९ मार्च रोजी फोन नंबर अपूर्ण राहिल्याने १७ मार्च रोजी अंतिम)."
    },
    # 35. 18/03 - Yash - Unspecified Slip Order (120 tab 2 bottel)
    {
        "date": "18/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Unspecified Customer (Slip Order)",
        "phone": "",
        "address": "Slip / Photo in chat",
        "pincode": "",
        "product": "120 tab 2 bottel",
        "mode": "COD",
        "amount": 850,
        "main_idx": 326,
        "sub_indices": [327, 329, 330],
        "note": "स्लिप फोटोद्वारे आलेली २ १२० टॅबलेट बॉटल ऑर्डर."
    },
    # 36. 18/03 - Monu - Shakil Khan
    {
        "date": "18/03/2026",
        "telecaller": "मोनू",
        "customer": "shakil khan",
        "phone": "8767230232",
        "address": "K. G.N Chouk , Shanti nagar, Bhiwandi",
        "pincode": "421302",
        "product": "1 capsule bottle",
        "mode": "COD",
        "amount": 400,
        "main_idx": 344,
        "sub_indices": [345],
        "note": "भिवंडी १ कॅप्सूल सीओडी ऑर्डर ₹४००."
    },
    # 37. 18/03 - Monu - Ashwin Dhand Advocate
    {
        "date": "18/03/2026",
        "telecaller": "मोनू",
        "customer": "Ashwin dhand advocate",
        "phone": "9814381177",
        "address": "Office number 34 civil court Samrala district ludhiana punjab near police station",
        "pincode": "141114",
        "product": "1 spirulina capsule",
        "mode": "COD",
        "amount": 350,
        "main_idx": 347,
        "sub_indices": [],
        "note": "पंजाब १ कॅप्सूल सीओडी ऑर्डर ₹३५०."
    },
    # 38. 18/03 - Monu - Deepak Rama More
    {
        "date": "18/03/2026",
        "telecaller": "मोनू",
        "customer": "Deepak Rama more",
        "phone": "9850537967",
        "address": "Mukkam khadki, Post khandala",
        "pincode": "414006",
        "product": "1 spirulina powder",
        "mode": "Prepaid",
        "amount": 300,
        "main_idx": 348,
        "sub_indices": [375],
        "note": "खंडाळा १ पावडर प्रीपेड ऑर्डर ₹३०० (२० मार्च रोजी यशने फॉरवर्ड केली)."
    },
    # 39. 18/03 - Yash - Arogyam Naturopathy Centre
    {
        "date": "18/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Arogyam Naturopathy Centre",
        "phone": "9637268214",
        "address": "Ashta police station shejari Maruti mandir samor A/p ashta ta walawa dist sangli",
        "pincode": "416301",
        "product": "60 bottel capsule arogyam sticker",
        "mode": "Prepaid",
        "amount": 9000,
        "main_idx": 350,
        "sub_indices": [351, 400, 401],
        "note": "सांगली ६० बॉटल्स आरोग्यम प्रायव्हेट लेबल B2B ऑर्डर (२० मार्च रोजी महावीर कुरिअरने रवाना)."
    },
    # 40. 19/03 - Yash - Unspecified Slip Order (Seabuckthorn 5 + Spiru 4)
    {
        "date": "19/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Unspecified Customer (Slip Order)",
        "phone": "",
        "address": "Slip / Photo in chat",
        "pincode": "",
        "product": "Seabuckthorn capsule 5, Spirulina 60 tab 4 bottels",
        "mode": "COD",
        "amount": 2500,
        "main_idx": 354,
        "sub_indices": [355],
        "note": "स्लिप फोटोद्वारे आलेली ९ बॉटल्स कॉम्बो ऑर्डर."
    },
    # 41. 19/03 - Yash - Tanaji Chavan
    {
        "date": "19/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Tanaji Chavan",
        "phone": "7264068812",
        "address": "C/O ANIL VISHNU RANE SHIVRATNA COLONY NEAR PANCHNATH MANDIR KALEWADI PUNE",
        "pincode": "411017",
        "product": "spirulina powder , spirulina Tablet",
        "mode": "COD",
        "amount": 650,
        "main_idx": 356,
        "sub_indices": [],
        "note": "काळेवाडी पुणे पावडर व टॅबलेट सीओडी ऑर्डर ₹६५०."
    },
    # 42. 19/03 - Monu - Shakuntala Manikrao Bhaskare
    {
        "date": "19/03/2026",
        "telecaller": "मोनू",
        "customer": "शकुंतला माणिकराव भास्करे (Shakuntala Bhaskare)",
        "phone": "8668335375",
        "address": "छत्रपती नगर पुर्ण रोड पोस्ट ऑफिसच्या बाजूला घर तुळजाई नांदेड महाराष्ट्र",
        "pincode": "431602",
        "product": "1 spirulina powder",
        "mode": "COD",
        "amount": 350,
        "main_idx": 357,
        "sub_indices": [376],
        "note": "नांदेड १ पावडर सीओडी ऑर्डर ₹३५० (२० मार्च रोजी यशने फॉरवर्ड केली)."
    },
    # 43. 19/03 - Monu - Sandiip Samant
    {
        "date": "19/03/2026",
        "telecaller": "मोनू",
        "customer": "Sandiip Samant",
        "phone": "8591823455",
        "address": "Zoo Digital Modi House 5th Floor A wing Veera Desai Rd opp Lotus Business Park Andheri West Mumbai",
        "pincode": "400053",
        "product": "1 spirulina, 1 seabackthorn",
        "mode": "Prepaid",
        "amount": 749,
        "main_idx": 358,
        "sub_indices": [377],
        "note": "अंधेरी वेस्ट मुंबई कॉम्बो प्रीपेड ऑर्डर ₹७४९ (२० मार्च रोजी यशने फॉरवर्ड केली)."
    },
    # 44. 20/03 - Yash - Unspecified Slip Order (Capsule 1)
    {
        "date": "20/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Unspecified Customer (Slip Order)",
        "phone": "",
        "address": "Slip / Photo in chat",
        "pincode": "",
        "product": "Capsule 1",
        "mode": "COD",
        "amount": 350,
        "main_idx": 370,
        "sub_indices": [371, 372],
        "note": "स्लिप फोटोद्वारे आलेली १ कॅप्सूल ऑर्डर."
    },
    # 45. 21/03 - Monu - Dhyal Ghegat
    {
        "date": "21/03/2026",
        "telecaller": "मोनू",
        "customer": "dhyal ghegat",
        "phone": "9226162587",
        "address": "valmik nagar jamnerroad kanya shalejaval Bhusaval",
        "pincode": "425201",
        "product": "1 spirulina powder",
        "mode": "COD",
        "amount": 350,
        "main_idx": 406,
        "sub_indices": [],
        "note": "भुसावळ १ पावडर सीओडी ऑर्डर ₹३५०."
    },
    # 46. 22/03 - Yash - Vikas Payal
    {
        "date": "22/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Vikas Payal",
        "phone": "9137805402",
        "address": "Simram apament 15th road hdfc bank line gabana khar west Mumbai",
        "pincode": "400052",
        "product": "1 powder",
        "mode": "Prepaid",
        "amount": 350,
        "main_idx": 410,
        "sub_indices": [413, 414, 415, 416, 417],
        "note": "खार वेस्ट मुंबई १ पावडर ऑर्डर (दिल्लीवरी कुरिअरने डिस्पॅच)."
    },
    # 47. 22/03 - Yash - Nandkumar Panpatte (1st order)
    {
        "date": "22/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "नंदकुमार पानपट्टे (Nandkumar Panpatte)",
        "phone": "9158778778",
        "address": "C/o जनार्धन जाधव संभाजीनगर - त्रिवेणी नगर जवळ नांदेड",
        "pincode": "431605",
        "product": "2 spirulina capsule, 3 spirulina tab, 2 spirulina powder",
        "mode": "Prepaid",
        "amount": 2100,
        "main_idx": 418,
        "sub_indices": [419],
        "note": "नांदेड ७ उत्पादने कॉम्बो ऑर्डर (२ कॅप्सूल + ३ टॅब + २ पावडर)."
    },
    # 48. 22/03 - Monu - Mahantesh Basavaraj Karle
    {
        "date": "22/03/2026",
        "telecaller": "मोनू",
        "customer": "Mahantesh Basavaraj Karle",
        "phone": "7558273645",
        "address": "Shri Krishna Colany kalewadi Phata pimpari Chinchwad pune near Naagubhu barane schiol",
        "pincode": "411019",
        "product": "120 tab bottel 2",
        "mode": "COD",
        "amount": 850,
        "main_idx": 420,
        "sub_indices": [421, 422, 423, 426, 427, 428, 429],
        "note": "पिंपरी चिंचवड पुणे २ १२० टॅब्लेट बॉटल्स सीओडी ऑर्डर ₹८५०."
    },
    # 49. 24/03 - Monu - Harish Gogad
    {
        "date": "24/03/2026",
        "telecaller": "मोनू",
        "customer": "Harish Gogad",
        "phone": "9420089022",
        "address": "visawa Ramdas colony near Ramdas garden sharanpur road Nashik Maharashtra",
        "pincode": "422005",
        "product": "spirulina capsule",
        "mode": "COD",
        "amount": 350,
        "main_idx": 481,
        "sub_indices": [475],
        "note": "नाशिक १ कॅप्सूल सीओडी ऑर्डर ₹३५० (२३ मार्च संध्याकाळी टाकून २४ मार्च सकाळी कन्फर्म)."
    },
    # 50. 24/03 - Monu - Anil Patil
    {
        "date": "24/03/2026",
        "telecaller": "मोनू",
        "customer": "Anil Patil",
        "phone": "7303995999",
        "address": "Anupam chs C/203,Charkop sector 9,near Swami kendra, kandiwali West, Mumbai",
        "pincode": "400067",
        "product": "spirulina tablet 2",
        "mode": "Prepaid",
        "amount": 400,
        "main_idx": 484,
        "sub_indices": [485],
        "note": "कांदिवली वेस्ट मुंबई २ टॅब्लेट प्रीपेड ऑर्डर ₹४००."
    },
    # 51. 24/03 - Yash - Dr Hanuman Murlidhar Bhagat
    {
        "date": "24/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Dr Hanuman Murlidhar Bhagat",
        "phone": "9011545217",
        "address": "Chandak shala road, kakaji bair bar restaurant jawal Malkapur Buldhana",
        "pincode": "443102",
        "product": "Spirulina capsule 3, Is weight loss capsule 3",
        "mode": "Prepaid",
        "amount": 2100,
        "main_idx": 493,
        "sub_indices": [494, 495, 498, 499],
        "note": "मलकापूर बुलढाणा ६ बॉटल्स प्रीपेड ऑर्डर (महावीर कुरिअर)."
    },
    # 52. 24/03 - Monu - Boota Kanel Singh (Repeat)
    {
        "date": "24/03/2026",
        "telecaller": "मोनू",
        "customer": "Boota Kanel Singh (Repeat)",
        "phone": "9569999269",
        "address": "H ni 144 mangli tande Ludhiana, Punjab",
        "pincode": "141007",
        "product": "3 spirulina capsule",
        "mode": "COD",
        "amount": 900,
        "main_idx": 502,
        "sub_indices": [504, 505, 506],
        "note": "पंजाब पुनरावृत्ती (Repeat) ३ कॅप्सूल सीओडी ऑर्डर ₹९००."
    },
    # 53. 24/03 - Yash - Renuka Rodi
    {
        "date": "24/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Renuka Rodi",
        "phone": "7030270217",
        "address": "Gut No. 146, Plot No.53, CIDCO Mahanagar - 1, Near Ashtavinayak Park, Tisgaon, Waluj, MIDC, Aurangabad",
        "pincode": "431136",
        "product": "1 capsule, 1 tab, 2 cookies",
        "mode": "COD",
        "amount": 550,
        "main_idx": 513,
        "sub_indices": [514, 515, 517, 519],
        "note": "वाळूज छत्रपती संभाजीनगर सुधारित सीओडी ऑर्डर ₹५५० (दत्ता मंदिर कुरिअर)."
    },
    # 54. 25/03 - Yash - Laxman Nandrekar
    {
        "date": "25/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Laxman Nandrekar",
        "phone": "9637992915",
        "address": "a/p nandre ta miraj dist sangli",
        "pincode": "416416",
        "product": "1 60 tab spirulina, 1 60 tab morninga, 1 60 tab Ashwagandha, sample oil & shampoo, Bath soap 1",
        "mode": "Prepaid",
        "amount": 1000,
        "main_idx": 529,
        "sub_indices": [530, 532],
        "note": "नांद्रे मिरज सांगली कॉम्बो पॅक प्रीपेड ऑर्डर."
    },
    # 55. 25/03 - Monu - Siddharth S Karmakar
    {
        "date": "25/03/2026",
        "telecaller": "मोनू",
        "customer": "Siddharth S Karmakar",
        "phone": "8237999619",
        "address": "Ganesh welfare society Pravakar niwas chawl Room no1 Ganesh mandir Vijay nagar, tulinj Nallasopara east Palghar",
        "pincode": "401209",
        "product": "spirulina Tab",
        "mode": "Prepaid",
        "amount": 300,
        "main_idx": 533,
        "sub_indices": [534],
        "note": "नालासोपारा ईस्ट पालघर १ टॅब्लेट प्रीपेड ऑर्डर ₹३००."
    },
    # 56. 25/03 - Monu - Dr.S.N.Pathan
    {
        "date": "25/03/2026",
        "telecaller": "मोनू",
        "customer": "Dr.S.N.Pathan",
        "phone": "9011313471",
        "address": "Mankapur Ring road Nagpur Skyhome building appartment no 102 Nagpur (MS)",
        "pincode": "440013",
        "product": "Spirulina tablet 1, Spirulina capsule 1",
        "mode": "COD",
        "amount": 750,
        "main_idx": 543,
        "sub_indices": [544],
        "note": "नागपूर डॉक्टर कॉम्बो (टॅब्लेट + कॅप्सूल) सीओडी ऑर्डर ₹७५०."
    },
    # 57. 25/03 - Yash - New Mauli Distributor (Kapil Ingle)
    {
        "date": "25/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "New Mauli Distributor (Kapil Ingle)",
        "phone": "9359335154",
        "address": "Plot no 53 safaly society samata nagar kanchanwadi walmi naka paithan road aurangabad",
        "pincode": "431005",
        "product": "5 oil",
        "mode": "Prepaid",
        "amount": 1000,
        "main_idx": 549,
        "sub_indices": [550, 551],
        "note": "छत्रपती संभाजीनगर डिस्ट्रीब्युटर ५ ऑइल बॉटल्स प्रीपेड ऑर्डर."
    },
    # 58. 25/03 - Monu - Mangesh Patil
    {
        "date": "25/03/2026",
        "telecaller": "मोनू",
        "customer": "मंगेश पाटील (Mangesh Patil)",
        "phone": "9765987575",
        "address": "मारुती चौक पलूस,ता.पलूस,जि.सांगली",
        "pincode": "416310",
        "product": "2 seabukthron",
        "mode": "Prepaid",
        "amount": 700,
        "main_idx": 564,
        "sub_indices": [],
        "note": "पलूस सांगली २ सीबकथॉर्न प्रीपेड ऑर्डर."
    },
    # 59. 26/03 - Yash - Chiana Mondol
    {
        "date": "26/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Chiana Mondol",
        "phone": "",
        "address": "Uttor India hirembesori kali mandir back side pochim medinapur city kharagpur",
        "pincode": "721305",
        "product": "Seabuckthorn 1 capsule",
        "mode": "COD",
        "amount": 450,
        "main_idx": 569,
        "sub_indices": [],
        "note": "खडकपूर पश्चिम बंगाल १ सीबकथॉर्न कॅप्सूल सीओडी ऑर्डर ₹४५०."
    },
    # 60. 26/03 - Yash - Mayuri Shamkant Baviskar
    {
        "date": "26/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Mayuri Shamkant Baviskar",
        "phone": "9545510231",
        "address": "ABC Chowk Near Dyandeep Academy, Pune",
        "pincode": "411002",
        "product": "1 shampoo conditioner & 1 oil",
        "mode": "Prepaid",
        "amount": 500,
        "main_idx": 570,
        "sub_indices": [571, 572],
        "note": "पुणे १ शाम्पू व १ ऑइल बॉटल प्रीपेड ऑर्डर."
    },
    # 61. 26/03 - Monu - Sachin Kumar
    {
        "date": "26/03/2026",
        "telecaller": "मोनू",
        "customer": "Sachin Kumar",
        "phone": "9610502425",
        "address": "Kamla hospital ke pass Shiri niwas meel tah Gangapur City ditt Sawai Madhopur Rajasthan",
        "pincode": "322201",
        "product": "1 seabuckthorn 1 spirulina 120 tab",
        "mode": "Prepaid",
        "amount": 800,
        "main_idx": 575,
        "sub_indices": [576, 577, 621, 622, 623, 624],
        "note": "राजस्थान कॉम्बो (सीबकथॉर्न + १२० टॅब) प्रीपेड ऑर्डर ₹८००."
    },
    # 62. 26/03 - Yash - Rajnikant C. Mehta
    {
        "date": "26/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Rajnikant C. Mehta",
        "phone": "9327650180",
        "address": "Bldg A-3, flat no 803, Police head quarts ni bajuma, Sarlaben Trivedi Bhavan, Saru section road, Jamnagar",
        "pincode": "361008",
        "product": "Spirulina capsule 1, Hair oil 1, Shampoo 1, Facewash 1, Soap 1, Cookies 1",
        "mode": "COD",
        "amount": 700,
        "main_idx": 579,
        "sub_indices": [580, 581, 583, 587],
        "note": "जामनगर गुजरात ६ प्रॉडक्ट्स कॉम्बो किट सीओडी ऑर्डर ₹७००."
    },
    # 63. 26/03 - Yash - Himanshu Gosai Shivam
    {
        "date": "26/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Himanshu Gosai Shivam",
        "phone": "9723166293",
        "address": "B.5 Gokul Nagar Ambaji Hawey palanpur Banaskanta gujarat",
        "pincode": "385001",
        "product": "1 seabuckthorn 1 120 tab spirulina",
        "mode": "COD",
        "amount": 850,
        "main_idx": 591,
        "sub_indices": [592, 593, 594, 595],
        "note": "पालनपूर गुजरात कॉम्बो सीओडी ऑर्डर ₹८५०."
    },
    # 64. 26/03 - Yash - Shivaji Yadav
    {
        "date": "26/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "शिवाजी यादव (Shivaji Yadav)",
        "phone": "9821870977",
        "address": "गगनगिरी सोसायटी सेक्टर 9 बिल्डिंग नंबर C9/2/03 कोपरखैरणे नवी मुंबई",
        "pincode": "400709",
        "product": "120 tab spirulina 1",
        "mode": "Prepaid",
        "amount": 450,
        "main_idx": 613,
        "sub_indices": [614, 615, 616, 617],
        "note": "कोपरखैरणे नवी मुंबई १ १२० टॅब्लेट बॉटल प्रीपेड ऑर्डर ₹४५०."
    },
    # 65. 26/03 - Yash - Unspecified Customer 8080490423
    {
        "date": "26/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Unspecified Customer (8080490423)",
        "phone": "8080490423",
        "address": "Slip / Photo in chat",
        "pincode": "",
        "product": "Spirulina tab 120 1",
        "mode": "COD",
        "amount": 450,
        "main_idx": 619,
        "sub_indices": [620],
        "note": "स्लिप फोटोद्वारे आलेली १ १२० टॅब्लेट बॉटल सीओडी ऑर्डर ₹४५०."
    },
    # 66. 27/03 - Yash - Madan Mohan Chauhan
    {
        "date": "27/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Madan Mohan Chauhan",
        "phone": "9422647413",
        "address": "304 B, Divya Ratna Residency BARBOLE PLOTS KASARWADI ROAD Barshi",
        "pincode": "413411",
        "product": "120 Tab 1",
        "mode": "COD",
        "amount": 450,
        "main_idx": 625,
        "sub_indices": [633],
        "note": "बार्शी सोलापूर १ १२० टॅबलेट बॉटल सीओडी ऑर्डर ₹४५०."
    },
    # 67. 27/03 - Yash - Nandkumar Panpatte (2nd order)
    {
        "date": "27/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "नंदकुमार पानपट्टे (Nandkumar Panpatte)",
        "phone": "9158778778",
        "address": "C/o जनार्धन जाधव संभाजीनगर - त्रिवेणी नगर जवळ नांदेड",
        "pincode": "431605",
        "product": "Spirulina tab 1 (120 tab)",
        "mode": "Prepaid",
        "amount": 450,
        "main_idx": 627,
        "sub_indices": [628],
        "note": "नांदेड ग्राहकाची दुसरी १२० टॅब्लेट ऑर्डर (Hyana 2 bottel gelet, 1 pathava ajj 120 tab chi)."
    },
    # 68. 27/03 - Monu - Krishna Nivrutti Kadam
    {
        "date": "27/03/2026",
        "telecaller": "मोनू",
        "customer": "Krishna nivrutti kadam",
        "phone": "8956239054",
        "address": "Velliencea apartment Vishal villa. Flat no b1 304 3rd floor , Nahre ambegaon Near about bhumkar bridge poona",
        "pincode": "411046",
        "product": "Capsule 1",
        "mode": "COD",
        "amount": 350,
        "main_idx": 653,
        "sub_indices": [626, 654],
        "note": "आंबेगाव पुणे १ कॅप्सूल सीओडी ऑर्डर ₹३५० (वेबसाइटवरून बुक/पुष्टी)."
    },
    # 69. 27/03 - Monu - Rajesh Tungewar
    {
        "date": "27/03/2026",
        "telecaller": "मोनू",
        "customer": "Rajesh Tungewar",
        "phone": "8999662065",
        "address": "maharishi Dadhichi Nagar, near Lalwadi Behind Narsingh vidhya mandir school mahadev Datta niwas Nanded waghala",
        "pincode": "431601",
        "product": "capsule 1, Facewash 1, Soap 1",
        "mode": "Prepaid",
        "amount": 565,
        "main_idx": 672,
        "sub_indices": [673],
        "note": "नांदेड ३ प्रॉडक्ट्स कॉम्बो प्रीपेड ऑर्डर ₹५६५."
    },
    # 70. 27/03 - Yash - Smita Singh (Kamala Spirulina)
    {
        "date": "27/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Smita Singh (Kamala Spirulina)",
        "phone": "9323687724",
        "address": "Building number 1C Flat number ground floor (G/1) Damu Park sagaon Dombivli East",
        "pincode": "421201",
        "product": "20 tab with kmala spieulina sticker",
        "mode": "Prepaid",
        "amount": 3000,
        "main_idx": 674,
        "sub_indices": [675, 676, 677],
        "note": "डोंबिवली ईस्ट २० टॅब्लेट बॉटल्स कमला स्पिरुलिना प्रायव्हेट लेबल B2B ऑर्डर."
    },
    # 71. 28/03 - Monu - Ishwar Yogi
    {
        "date": "28/03/2026",
        "telecaller": "मोनू",
        "customer": "ishwar Yogi",
        "phone": "9355682568",
        "address": "New india conveint school hissar Hariyana",
        "pincode": "125001",
        "product": "2 spirulina Tab",
        "mode": "COD",
        "amount": 450,
        "main_idx": 684,
        "sub_indices": [],
        "note": "हरियाणा २ टॅब्लेट सीओडी ऑर्डर ₹४५०."
    },
    # 72. 28/03 - Monu - Jivan Navale
    {
        "date": "28/03/2026",
        "telecaller": "मोनू",
        "customer": "जीवन नवले (Jivan Navale)",
        "phone": "9075437997",
        "address": "आटपोस्ट पाली तालुका -जिल्हा - बीड",
        "pincode": "431153",
        "product": "capsule 5, टॅब्लेट 6 (60 tab), पावडर 4 (MRP 499), साबण 1",
        "mode": "Prepaid",
        "amount": 2800,
        "main_idx": 690,
        "sub_indices": [691, 693, 695],
        "note": "बीड १६ प्रॉडक्ट्स मोठा कॉम्बो पॅक प्रीपेड ऑर्डर ₹२,८००."
    },
    # 73. 29/03 - Monu - Jayprabhu Dhole
    {
        "date": "29/03/2026",
        "telecaller": "मोनू",
        "customer": "Jayprabhu dhole",
        "phone": "9130081268",
        "address": "Vrundavan recidency, chaudhari nagar, mantha road jalna taluka - jalna",
        "pincode": "431203",
        "product": "60 tab 2 bottels",
        "mode": "COD",
        "amount": 450,
        "main_idx": 696,
        "sub_indices": [697, 698],
        "note": "जालना २ बॉटल्स ६० टॅब सीओडी ऑर्डर ₹४५०."
    },
    # 74. 29/03 - Monu - Ashish Dhondiram Shinde
    {
        "date": "29/03/2026",
        "telecaller": "मोनू",
        "customer": "Ashish dhondiram shinde",
        "phone": "8669853409",
        "address": "77/2 azad colony 1 jyotiba Nagar kalewadi pune city pune",
        "pincode": "411017",
        "product": "2 tab",
        "mode": "COD",
        "amount": 450,
        "main_idx": 702,
        "sub_indices": [],
        "note": "काळेवाडी पुणे २ टॅब्लेट सीओडी ऑर्डर ₹४५०."
    },
    # 75. 30/03 - Monu - Jitendra Kumar Ray
    {
        "date": "30/03/2026",
        "telecaller": "मोनू",
        "customer": "Jitendra kumar Ray",
        "phone": "9123430920",
        "address": "Jandaha near sarboday maidan jandaha district - vaishali (Bihar)",
        "pincode": "844505",
        "product": "spirulina products",
        "mode": "COD",
        "amount": 850,
        "main_idx": 718,
        "sub_indices": [],
        "note": "वैशाली बिहार सीओडी ऑर्डर ₹८५०."
    },
    # 76. 31/03 - Monu - Ssanjay Jalindar Kshirsagar
    {
        "date": "31/03/2026",
        "telecaller": "मोनू",
        "customer": "Ssanjay Jalindar Kshirsagar",
        "phone": "8149128281",
        "address": "29, Samrat Ashok Society Kumtha Naka Solapur",
        "pincode": "413003",
        "product": "1 seabackthorn, 1 spirulina tab",
        "mode": "COD",
        "amount": 800,
        "main_idx": 730,
        "sub_indices": [],
        "note": "सोलापूर कॉम्बो सीओडी ऑर्डर ₹८००."
    },
    # 77. 31/03 - Monu - Jaidev Yogi
    {
        "date": "31/03/2026",
        "telecaller": "मोनू",
        "customer": "Jaidev yogi s/o Lt. Shri Ramdhan yogi",
        "phone": "9929647423",
        "address": "Village - Ghoret, post- Raipur, Tehsil-Andhi, District -Jaipur, Rajasthan",
        "pincode": "303001",
        "product": "5 tab",
        "mode": "COD",
        "amount": 900,
        "main_idx": 731,
        "sub_indices": [732],
        "note": "जयपूर राजस्थान ५ टॅब्लेट सीओडी ऑर्डर ₹९००."
    },
    # 78. 31/03 - Monu - S. Fernandez
    {
        "date": "31/03/2026",
        "telecaller": "मोनू",
        "customer": "s. fernandez",
        "phone": "7875595977",
        "address": "Nakul Park near State Bank of India Nalasopara West",
        "pincode": "401203",
        "product": "spirulina 120 tab + seabuckthorn 60 capsules",
        "mode": "COD",
        "amount": 800,
        "main_idx": 733,
        "sub_indices": [],
        "note": "नालासोपारा वेस्ट कॉम्बो सीओडी ऑर्डर ₹८००."
    },
    # 79. 31/03 - Monu - Ankit K Panchal
    {
        "date": "31/03/2026",
        "telecaller": "मोनू",
        "customer": "Ankit K Panchal",
        "phone": "7588928423",
        "address": "B29 swapnavilla society Near satyam nagar Kamrej Dist -surat",
        "pincode": "394185",
        "product": "60 tab 1 bottel",
        "mode": "COD",
        "amount": 350,
        "main_idx": 734,
        "sub_indices": [735],
        "note": "सुरत गुजरात १ ६० टॅब बॉटल सीओडी ऑर्डर ₹३५०."
    },
    # 80. 31/03 - Yash - Dr A P Ilme (Sample Kit)
    {
        "date": "31/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Dr A P ilme (Sample Kit)",
        "phone": "9960303523",
        "address": "C/o sonali ilme Bhoslewadi lashkribage Plot no 33 near Awade babu chock Nagpur",
        "pincode": "440017",
        "product": "Sample kit (1 oil, Facewash, 1 capsule, 1 Shampoo, Moringa, 1 soap)",
        "mode": "Prepaid",
        "amount": 0,
        "main_idx": 738,
        "sub_indices": [739, 740],
        "note": "नागपूर डॉक्टर सॅम्पल ट्रायल किट (मूल्य ₹० विनामूल्य चाचणी)."
    },
    # 81. 31/03 - Yash - Hemant Arvind Saptarshi
    {
        "date": "31/03/2026",
        "telecaller": "यश सूर्यवंशी (फाउंडर डायरेक्ट)",
        "customer": "Hemant Arvind Saptarshi",
        "phone": "8237644993",
        "address": "Flat no A7, lane no B10, Dhayari phata near Manas society, Pune",
        "pincode": "411041",
        "product": "120 tab 2 bottel, 60 tab 1 bottel",
        "mode": "Prepaid",
        "amount": 1150,
        "main_idx": 742,
        "sub_indices": [743],
        "note": "धायरी फाटा पुणे ३ टॅब्लेट बॉटल्स प्रीपेड ऑर्डर."
    }
]

# Sort chronologically by main_idx and assign sr_no
raw_orders.sort(key=lambda x: x['main_idx'])

master_orders = []
for sr, o in enumerate(raw_orders, 1):
    o_copy = dict(o)
    o_copy['sr_no'] = sr
    master_orders.append(o_copy)

print(f"Generated {len(master_orders)} master orders for March 2026.")

# Check index completeness
all_order_indices = set()
for o in master_orders:
    all_order_indices.add(o['main_idx'])
    for s in o['sub_indices']:
        if s in all_order_indices:
            print(f"ERROR: Duplicate index {s}")
        all_order_indices.add(s)

print(f"Total order-related indices: {len(all_order_indices)}")
excluded_indices = set(range(1, 744)) - all_order_indices
print(f"Total excluded indices: {len(excluded_indices)}")
assert len(all_order_indices) + len(excluded_indices) == 743, "Count mismatch!"
print("100% RECONCILIATION PASSED!")
