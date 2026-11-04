import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Monu candidates
monu_cands = [
    # (main_idx, [merged_idxs], name, phone, pin, amount, payment, products, note)
    (0, [], "अशोक कांबळे (Ashok Kamble)", "9325808280", "411001", 1000, "COD", "1 spirulina capsule + 1 seabackthorn", ""),
    (26, [66, 67], "सोनाली चेतन मगर (Sonali Chetan Magar)", "8080646189", "413106", 450, "COD", "1 spirulina capsule", "फोन नंबर IDX 66-67 वरून"),
    (28, [29], "शाहआलम (Shahalam handicapped artist)", "9870681956", "247001", 350, "COD", "tab 60 bottel", "तपशील IDX 29 वरून"),
    (34, [32, 33, 35, 36], "ग्राहक (फोटोवरून पत्ता)", "8898695555", "", 450, "COD", "1 tab bottel", "पत्ता फोटोमध्ये, फोन व प्रॉडक्ट IDX 34-35 वरून"),
    (92, [], "अनिल हरी अडागळे (Anil Hari Adagale)", "8767844563", "431010", 950, "COD", "1 seabackthorn + 1 spirulina capsule", "पहिली ऑर्डर"),
    (115, [], "प्रवीण कुमार (Parveen Kumar)", "7231810915", "335704", 1050, "COD", "3 capsule", ""),
    (117, [], "वाशू सिंधानी (Vashu Sindhani)", "9921343397", "421005", 1400, "Prepaid", "spirulina capsule 3 bottle + 1 facewash + 1 oil", ""),
    (118, [], "सुहास जगदाळे (Suhas Jagdale)", "989941919", "416001", 1050, "COD", "spirulina 3 capsule", ""),
    (177, [], "राहुल यल्लप्पा कुत्रे (Rahul Yallappa Kutre)", "9920190147", "400013", 500, "COD", "1 bottle tab (90)", ""),
    (201, [], "सुनील कटारे (Sunil Katare)", "8591992529", "421201", 450, "Prepaid", "1 spirulina capsule", "प्रीपेड स्टँडर्ड दर"),
    (205, [], "विवेक कुलकर्णी (Vivek Kulkarni)", "9284540304", "416112", 630, "COD", "1 spirulina capsule + 1 facewash", ""),
    (209, [], "ओम कश्यप (Om Kashyap)", "9266387415", "110077", 450, "COD", "1 spirulina capsule", ""),
    (309, [310], "सचिन वेंडोले (Sachin Wendole)", "9975724815", "431132", 950, "Prepaid", "1 moringa powder + 1 seabuckthorn + 1 spirulina 120 tab", "तपशील IDX 310 वरून"),
    (343, [], "काकासाहेब कौतिकराव जाधव", "9970567939", "431111", 750, "COD", "1 spirulina capsule + 1 spirulina powder", ""),
    (384, [], "नैनेश जोशी (Nainesh Joshi)", "9820716736", "400022", 1050, "COD", "3 spirulina capsule", ""),
    (391, [], "संतोष कोकणे (Santosh Kokane)", "9594600073", "401105", 500, "COD", "spirulina Tablet (120)", ""),
    (461, [], "संगीता एस. टाकळकर (Sangita S. Takalkar)", "8999830214", "416007", 450, "Prepaid", "spirulina 1 Capsule (60)", "प्रीपेड स्टँडर्ड दर"),
    (468, [], "महेंद्र साळुंखे (Mahendra Salunkhe)", "9221085750", "421503", 1000, "COD", "1 spirulina capsule + 1 seabackthorn capsule", ""),
    (494, [], "मुन्ना शर्मा (Munna Sharma)", "9860143601", "425107", 450, "Prepaid", "1 bottle seabackthorn", "प्रीपेड दर"),
    (508, [509], "यशवंत शेळके (Yeshwant Shelke)", "7588692023", "440022", 450, "COD", "2 bottle spirulina (60) / 120 tab 1 bottle", "अपडेट IDX 509 वरून"),
    (512, [], "कैलास दवणे (Kailas Davane)", "7249895237", "401506", 600, "Prepaid", "1 spirulina Capsule + 1 moringa powder", "प्रीपेड कॉम्बो दर"),
    (528, [529], "सिद्धेश्वर जगन्नाथ येडवे", "9923944944", "411061", 2200, "Prepaid", "3 स्पिरुलिना टॅब्लेट (120) + 2 seabackthorn", "रक्कम व पुष्टी IDX 529 वरून"),
    (530, [], "गोपाल कृष्ण परिहार (Gopal Krishn Parihar)", "9825007456", "381415", 450, "COD", "1 spirulina capsule", ""),
    (533, [], "अनिल हरी अडागळे (Anil Hari Adagale)", "8767844563", "431010", 1000, "COD", "1 seabackthorn + 1 spirulina capsule", "दुसरी ऑर्डर (COD 1000)"),
    (575, [], "राम दास (Ram Das)", "7355560450", "226030", 1050, "COD", "3 बॉटल स्पिरुलिना कॅप्सुल", "पहिली ऑर्डर (25/05)"),
    (604, [605, 606, 607, 608, 609, 610, 612], "तानाजी अशोक शिंदे (Tanaji Shinde)", "9022803013", "416207", 450, "Prepaid", "capsule 1 (speed post)", "सलग ८ मेसेज एकत्र"),
    (647, [], "हिमांशु गोसाई (Himanshu Gosai)", "9723166293", "385001", 850, "COD", "1 spirulina Capsule + 1 seabackthorn", ""),
    (648, [], "शिव प्रसाद सैकिया (Siva Prasad Saikia)", "8761938999", "784176", 650, "COD", "2 bottle spirulina tablet (120)", ""),
    (665, [], "डॉ. नारायण वाघोले (Dr. Narayan Waghole)", "9623491919", "410501", 650, "COD", "3 bottle spirulina tablet (60)", ""),
    (666, [], "अमित सोधी (Amit Sodhi)", "8168861816", "124001", 800, "COD", "2 bottle spirulina capsule", ""),
    (674, [], "विद्याधर खडकीकर (Vidyadhar Khadkikar)", "8275521651", "431122", 0, "Prepaid", "1 बॉटल कॅप्सुल sample", "मोफत सॅम्पल बाटली"),
    (675, [], "नवनीत सुतार (Navneet Sutar)", "9825026228", "382715", 800, "COD", "2 bottle spirulina capsule", ""),
    (679, [], "सोनाली चेतन मगर (Sonali Chetan Magar)", "8080646189", "413106", 500, "COD", "1 spirulina capsule", "दुसरी ऑर्डर (30/05)"),
    (685, [686], "राजेंद्र सुकदेव निकम (Rajendra Sukadeo Nikam)", "8956051949", "422101", 450, "Prepaid", "1 capsule prepaid", "तपशील IDX 686 वरून"),
    (687, [], "मोहन विष्णुपंत काळे (Mohan Vishnupant Kale)", "8830904205", "442401", 1000, "Prepaid", "1 बॉटल स्पिरुलिना कॅप्सुल + 1 बॉटल seabackthorn", "स्पीड पोस्टने पाठवले"),
    (695, [], "पंडित प्रमोद शर्मा (Pandit Pramod Sharma)", "9719495976", "251001", 450, "COD", "capsule 1", ""),
    (696, [697], "राजन वालिया (Rajn Walia)", "8053153271", "133203", 450, "COD", "capsule 1", "तपशील IDX 697 वरून (मे महिन्याची ऑर्डर)")
]

print(f"Monu Orders count: {len(monu_cands)}")
print(f"Total Monu amount: Rs {sum(o[5] for o in monu_cands):,}")
