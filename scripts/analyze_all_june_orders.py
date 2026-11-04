import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

print(f"Total messages in June: {len(msgs)}")

# Let's inspect Monu candidate orders:
# Let's write down the exact list of candidates for Monu:
monu_candidates = [
    # (main_idx, [merged_idxs], name, phone, pin, amount, payment, products, note)
    (10, [], "क्षमा बोराटे (Kshama Borate)", "8446030060", "411001", 1000, "Prepaid", "Spirulina Capsule (60), Seabuckthorn capsule (60), Spirulina soap", ""),
    (17, [18, 19, 20], "राजन वालिया (Rajn Walia)", "8053153271", "133203", 0, "Prepaid", "Customer order via photo (details in photo)", "Photo order, amount omitted in text"),
    (30, [], "मनोज राय (Monoj Rai)", "8271121111", "802101", 950, "COD", "5 spirulina Tablet", "Second phone: 9708982770"),
    (32, [], "प्राजक्ता काकडे (Prajkta Kakade)", "", "411047", 850, "COD", "1 spirulina tablet (60) + 1 Seabuckthorn capsule", "No phone in text"),
    (40, [], "किशनाराम (Kishanaram)", "9351233788", "342023", 500, "COD", "1 SPIRULINA CAPSULES", ""),
    (56, [57], "स्वप्निल गोर (Swapnil Vishwanath Gore)", "9975636758", "412207", 0, "Prepaid", "1 spirulina capsule + 1 seabuckthorn", "Amount prepaid not specified in text"),
    (85, [86], "चंद्र निधान पांडे (Chandra Nidhaan Pandey)", "6386612641", "212107", 900, "COD", "1 spirulina tablet (120) + 1 seabuckthorn capsule", "Second phone: 9452649400"),
    (87, [], "अमरजीत सिंग (Amarjeet Singh)", "9928983924", "335001", 800, "COD", "2 spirulina capsule", ""),
    (97, [100], "बी. के. पांडे (B K Pandey)", "7905967051", "271801", 1500, "COD", "5 bottle spirulina capsule", ""),
    (124, [125, 126, 127], "अनिकेत संधान (Aniket Sandhan)", "7385358383", "400059", 800, "Prepaid", "1 capsule 1 seabuckthorn", ""),
    (183, [], "स्वामी सोमनाथ (Swami Somanath)", "7499195554", "411021", 900, "COD", "1 spirulina tab (120) + 1 seabuckthorn capsule", ""),
    (190, [], "प्रशांत पाटील (Prashant Patil)", "9834744219", "443201", 650, "COD", "3 bottle spirulina tab (60)", "Second phone: 9284397148"),
    (191, [], "गणेश शंकर फुलपती (Ganesh Shankar Fulpati)", "7219511838", "413006", 900, "COD", "1 spirulina tab (120) + 1 seabuckthorn capsule", ""),
    (204, [205], "धिरज (Dhiraj)", "8766597194", "413521", 450, "COD", "capsule 1", ""),
    (206, [207, 208, 209, 210, 211], "रामवृक्ष (Ramvriksh)", "9616233399", "221005", 450, "COD", "120 tab", ""),
    (229, [], "नीरज काप्ता (Neeraj Kapta)", "9418120564", "171207", 650, "COD", "3 bottle spirulina tab (60)", ""),
    (274, [], "शामल चंद्रसेन पवार (Shamal Chandrsen Pawar)", "8652206306", "400030", 400, "Prepaid", "1 spirulina capsule", "Prepaid single capsule standard rate"),
    (278, [279], "पत्रकार मुजम्मील कमालीवाले (Patrkar Mujammil Kamaliwale)", "7277720606", "413304", 1150, "COD", "spirulina bride cream facewash shampoo", "First order"),
    (307, [], "अक्षर पटेल (Akshar Patel)", "9987032015", "400068", 849, "Prepaid", "1 bottle spirulina tablet (120) + 1 bottle seabuckthorn capsule", ""),
    (309, [], "शीला गौतम कानडे", "9359387008", "416216", 1050, "COD", "3 बॉटल स्पिरुलिना कॅप्सुल", ""),
    (349, [], "सोपान गणपत उभाडे (Sopan Ganpat Ubhade)", "8087889670", "422205", 900, "Prepaid", "1 spirulina Capsule + 1 seabuckthorn capsule", ""),
    (524, [], "विकास जाधव (Vikas Jadhav)", "9822543646", "422011", 5100, "COD", "6 SPIRULINA CAPSULES + 6 SEABUCKTHORN CAPSULE", ""),
    (537, [], "दलजीत सिंग (Daljit Singh)", "7889947066", "181133", 900, "COD", "1 bottle spirulina 120 tab + 1 bottle seabuckthorn capsule", ""),
    (566, [567, 568, 569], "सतीश पावसकर (Satish Pawaskar)", "8879291772", "400081", 1050, "COD", "spirulina tab 60: 1, seabuckthorn 60: 1, spirulina capsules: 1", ""),
    (572, [573], "स्वामी आनंद भारतीय (Swami Anand Bhartiya)", "9399511299", "483504", 0, "Prepaid", "Moringa: 5, Seabuckthorn: 3, Spirulina tab: 3", "Recurring partner order, amount zero/prepaid"),
    (574, [], "राम कपूर (Ram Kapoor)", "8899113003", "248007", 1050, "COD", "3 spirulina capsule", ""),
    (636, [], "दिलीप बाळकृष्ण पवार (Dilip Balkrishna Pawar)", "9820133820", "410218", 2550, "COD", "3 spirulina capsule + 3 seabuckthorn capsule", ""),
    # 640: Duplicate repost of 278 (patrkar Mujammil) for status check
    (666, [], "अक्रम एंटरप्रायझेस (Akram Enterprises)", "7050114637", "822133", 3110, "COD", "Spirulina cap 5, Shampoo 3, Hair oil 3, Sea buckthorn 5", "2110 COD + 1000 Prepaid = 3110 Total"),
    (735, [], "एस. के. साबेर अली (SK Saber Ali)", "8348347709", "721433", 500, "COD", "1 spirulina capsule", ""),
    (736, [], "कल्पना दत्तात्रय ठोंबरे", "8087003190", "412210", 500, "COD", "1 bottle spirulina capsule", ""),
    (743, [], "भारतभाई मखेचा (Bharatbhai Makhecha)", "9173178433", "360575", 450, "COD", "2 bottle spirulina tablet", ""),
    (801, [], "दिवाण जाकीर हुसेन (Dewan Jakir Hussain)", "9957892749", "781311", 1050, "COD", "1 bottle SPIRULINA tab 120 + 1 bottle seabuckthorn capsule", "Re-dispatch / second order with 120 tab"),
    (803, [], "विकी एम. सुरती (Vicky M Surti)", "8460249658", "396191", 1050, "COD", "1 spirulina tab 120 + 1 seabuckthorn capsule", "Second phone: 9173089658"),
    (865, [864, 866], "नितीन झेमसे (Nitin Zemse)", "9223289527", "400703", 2500, "COD", "3 months pack: 3 spiru capsule + 3 seab cap", "")
]

print(f"Monu candidate orders defined: {len(monu_candidates)}")
