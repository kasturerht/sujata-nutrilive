import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Master Order Definitions
# Format: (main_idx, [merged_sub_indices], sender_name_marathi, sender_channel_key, custom_fields)

ALL_ORDERS = []

# --- 1. Punam Kasture (9 orders) ---
punam_indices = [526, 538, 557, 605, 667, 708, 709, 741, 744]
for idx in punam_indices:
    ALL_ORDERS.append({
        'main_idx': idx,
        'merged_idxs': [],
        'telecaller': 'पूनम कस्तुरे',
        'channel_key': 'punam',
        'is_telecaller': True,
        'custom': {}
    })

# --- 2. Darshan Bayas (+91 88051 68275) (17 orders) ---
darshan_orders = [
    (446, [], {}),
    (452, [455], {'amount': 1050, 'audit_flag': 'किंमत IDX 455 मध्ये स्पष्ट केली (1050 sir)'}),
    (456, [], {'amount': 900}),
    (457, [], {'amount': 1050}),
    (459, [], {'amount': 500}),
    (492, [], {'amount': 1150}),
    (510, [], {'amount': 600}),
    (525, [], {'amount': 1115}),
    (540, [], {'amount': 600}),
    (541, [], {'amount': 900}),
    (640, [], {'amount': 2400, 'payment_type': 'Prepaid'}),
    (660, [], {'amount': 2400, 'payment_type': 'Prepaid'}),
    (661, [], {'amount': 950}),
    (672, [], {'amount': 950}),
    (678, [], {'amount': 950}),
    (688, [], {'amount': 1050}),
    (747, [], {'amount': 900, 'payment_type': 'Prepaid'}),
]
for main_idx, merged, custom in darshan_orders:
    ALL_ORDERS.append({
        'main_idx': main_idx,
        'merged_idxs': merged,
        'telecaller': 'टेलिकॉलर (+91 88051 68275)',
        'channel_key': 'darshan',
        'is_telecaller': True,
        'custom': custom
    })

# --- 3. Monu (Sujata Nutrilive) (10 orders) ---
monu_orders = [
    (184, [185, 186], {'amount': 600, 'payment_type': 'Prepaid', 'products': 'Spirulina tab 60 3 bottel', 'audit_flag': 'प्रीपेड ऑर्डर (कॅटलॉग किंमत अंदाजे ₹600)'}),
    (319, [], {'amount': 2300, 'payment_type': 'Prepaid', 'products': '3 Korean cream (2120) + 1 Hair oil (180)'}),
    (529, [], {'amount': 1050}),
    (533, [], {'amount': 1050}),
    (536, [], {'amount': 1050}),
    (543, [], {'amount': 3500, 'products': '5 spirulina tab 120 + 5 seabuckthorn cap 60 (5 combo)'}),
    (553, [], {'amount': 950}),
    (576, [], {'amount': 2050, 'products': 'Spirulina tab 120 (6)'}),
    (597, [595, 596], {'amount': 1000, 'products': '5 combo todays offer', 'audit_flag': 'पर्यायी फोन नंबर IDX 595-596 वरून जोडला'}),
    (711, [], {'amount': 350, 'products': '1 spirulina powder'}),
]
for main_idx, merged, custom in monu_orders:
    ALL_ORDERS.append({
        'main_idx': main_idx,
        'merged_idxs': merged,
        'telecaller': 'मोनू',
        'channel_key': 'monu',
        'is_telecaller': True,
        'custom': custom
    })

# --- 4. Manjushree Kasture (Sujata Nutrilive Manju) (47 orders) ---
# 46 unique orders + 1 rebook (465)
manju_orders = [
    (2, [], {'amount': 999}),
    (10, [], {'amount': 1100}),
    (14, [], {'amount': 500}),
    (15, [], {'amount': 850}),
    (76, [], {'amount': 1800, 'payment_type': 'Prepaid'}),
    (77, [], {'amount': 450}),
    (78, [], {'amount': 999}),
    (119, [127], {'amount': 2400, 'audit_flag': 'फोन नंबर IDX 127 वरून जोडला (+91 98816 66073)'}),
    (121, [], {'amount': 500}),
    (177, [], {'amount': 850}),
    (182, [], {'amount': 999}),
    (183, [], {'amount': 450}),
    (216, [], {'amount': 999}),
    (230, [], {'amount': 850}),
    (231, [], {'amount': 999}),
    (248, [], {'amount': 500}),
    (276, [], {'amount': 999}),
    (325, [], {'amount': 999}),
    (343, [349], {'amount': 999, 'audit_flag': 'फोन नंबर IDX 349 वरून जोडला (+91 96371 93363)'}),
    (347, [], {'amount': 999}),
    (379, [], {'amount': 500}),
    (465, [], {'amount': 450, 'audit_flag': 'रिटर्न ऑर्डर रीबुक (Rebook of Return Order IDX 77 - दिनेश साळुंखे)'}),
    (504, [], {'amount': 900}),
    (505, [], {'amount': 950}),
    (506, [], {'amount': 950}),
    (513, [], {'amount': 6300, 'products': '15 bottles Spirulina tab 120 + 15 bottles seabuckthorn cap'}),
    (527, [], {'amount': 950}),
    (550, [], {'amount': 900, 'payment_type': 'Prepaid'}),
    (552, [], {'amount': 950}),
    (558, [], {'amount': 2400, 'payment_type': 'Prepaid'}),
    (559, [], {'amount': 950}),
    (592, [], {'amount': 1050}),
    (604, [], {'amount': 1050}),
    (616, [], {'amount': 1050}),
    (620, [], {'amount': 1050}),
    (622, [621], {'amount': 1050, 'audit_flag': 'पत्ता सुधारणा IDX 621 वरून जोडली'}),
    (639, [], {'amount': 300, 'payment_type': 'Prepaid'}),
    (665, [], {'amount': 950}),
    (666, [], {'amount': 950}),
    (674, [], {'amount': 1050}),
    (675, [], {'amount': 1050}),
    (676, [], {'amount': 1050}),
    (687, [], {'amount': 1050}),
    (702, [], {'amount': 999, 'payment_type': 'Prepaid'}),
    (703, [], {'amount': 999, 'payment_type': 'Prepaid'}),
    (742, [], {'amount': 950}),
    (743, [], {'amount': 850, 'payment_type': 'Prepaid'}),
]
for main_idx, merged, custom in manju_orders:
    ALL_ORDERS.append({
        'main_idx': main_idx,
        'merged_idxs': merged,
        'telecaller': 'मंजुश्री कस्तुरे',
        'channel_key': 'manju',
        'is_telecaller': True,
        'custom': custom
    })

# --- 5. Om Amazon Dispatch (Warehouse Dispatch Orders) (3 orders) ---
om_orders = [
    (556, [], {'amount': 2400, 'payment_type': 'Prepaid', 'products': '1 Spirulina Powder + 3 seabuckthorn + 2 (120) Tables', 'audit_flag': 'प्रीपेड ऑर्डर (कॅटलॉग किंमत अंदाजे ₹2400)'}),
    (572, [], {'amount': 950, 'payment_type': 'COD', 'products': 'Combo 1: Spirulina tab 120 + Seabuckthorn 60'}),
    (677, [], {'amount': 950, 'payment_type': 'COD', 'products': 'Seabuckthorn 1 + Spirulina tab 1'}),
]
for main_idx, merged, custom in om_orders:
    ALL_ORDERS.append({
        'main_idx': main_idx,
        'merged_idxs': merged,
        'telecaller': 'वेअरहाऊस डिस्पॅच',
        'channel_key': 'warehouse',
        'is_telecaller': False,
        'custom': custom
    })

# --- 6. Yash R. Suryawanshi (Founder Direct Orders) (45 orders) ---
yash_orders_def = [
    (0, [1, 4], {'customer_name': 'पत्रकार मुजम्मिल कमालीवाले', 'amount': 900, 'payment_type': 'Prepaid', 'products': 'Spirulina powder + Ashwagandha powder', 'audit_flag': 'प्रीपेड ऑर्डर (किंमत ₹900)'}),
    (18, [19, 21], {'customer_name': 'स्वामी आनंद भारतीय', 'amount': 2495, 'payment_type': 'Prepaid', 'products': 'Spirulina 120 tab (10) + Powder (5) + Facewash (1) + Oil (1) + Soap (1)', 'audit_flag': 'किंमत IDX 21 वरून (Prepaid 2495)'}),
    (33, [], {'customer_name': 'राघवेंद्र', 'amount': 1220, 'payment_type': 'Prepaid', 'products': '1 spirulina 120 tab + 1 seabuckthorn cap + 5 soap'}),
    (71, [72], {'customer_name': 'बालाजी बळीराम सुर्वणकर', 'amount': 1050, 'payment_type': 'COD', 'products': 'Spirulina cap 1 + Seabuckthorn cap 1 + Spirulina tab 60 1'}),
    (73, [], {'customer_name': 'बिंदू कुमार', 'amount': 450, 'payment_type': 'COD', 'products': 'Spirulina tablets 120'}),
    (90, [], {'customer_name': 'स्वामी सोमनाथ', 'amount': 900, 'payment_type': 'COD', 'products': '1 spirulina tab (120) + 1 seabuckthorn cap'}),
    (91, [92, 93], {'customer_name': 'हरियाणा रेवाडी ग्राहक', 'amount': 450, 'payment_type': 'COD', 'products': '1 tablet'}),
    (94, [95, 96, 97], {'customer_name': 'निलेश माधवे', 'amount': 950, 'payment_type': 'COD', 'products': '1 spirulina tab + 1 seabuckthorn', 'audit_flag': 'पिनकोड (95), फोन (96), उत्पादन/किंमत (97) जोडले'}),
    (217, [], {'customer_name': 'अण्णासाहेब तुकाराम गावंडे', 'amount': 2450, 'payment_type': 'COD', 'products': '3 months combo pack'}),
    (221, [225], {'customer_name': 'स्वामी आनंद भारतीय', 'amount': 3500, 'payment_type': 'Prepaid', 'products': 'Seabuckthorn 2 + Spirulina 120 tab 1 + Oil 1 + Powder 10 + Kesuda soap 12', 'audit_flag': 'उत्पादने व किंमत IDX 225 वरून जोडली (Prepaid 3500)'}),
    (222, [223], {'customer_name': 'सुनिता भरते', 'amount': 950, 'payment_type': 'COD', 'products': '1 bride cream + 1 facewash'}),
    (249, [250], {'customer_name': 'मनोज एम. ठाकूर', 'amount': 0, 'payment_type': 'Prepaid', 'products': 'Sample spirulina tab 1 moringa tab 1', 'audit_flag': 'नमुना / मोफत सॅम्पल (Free Sample)'}),
    (251, [252, 253], {'customer_name': 'हरी ओम कश्यप', 'amount': 950, 'payment_type': 'COD', 'products': 'Spirulina tab 120 + seabuckthorn cap 1'}),
    (267, [268], {'customer_name': 'बाळासाहेब ढोकळे', 'amount': 950, 'payment_type': 'COD', 'products': 'Combo pack'}),
    (277, [278], {'customer_name': 'विजय गुप्ता', 'amount': 1000, 'payment_type': 'Prepaid', 'products': '2 seabuckthorn + 1 spirulina tab 60', 'audit_flag': 'स्पीड पोस्टने पुनर्नोंद (Speed post re-dispatch)'}),
    (280, [281, 282], {'customer_name': 'मनोज एम. ठाकूर', 'amount': 0, 'payment_type': 'Prepaid', 'products': 'Sample spirulina tab 1 moringa tab 1', 'audit_flag': 'पिनकोड 411061 सह पुन्हा पोस्ट (Repost of IDX 249)'}),
    (284, [283], {'customer_name': 'शोभा विलास काकडे', 'amount': 500, 'payment_type': 'Prepaid', 'products': 'Seabuckthorn capsule 1', 'audit_flag': 'किंमत IDX 283 वरून जोडली (500 prepaid)'}),
    (298, [296, 297], {'customer_name': 'विद्याधर खडकीकर', 'amount': 4500, 'payment_type': 'Prepaid', 'products': 'Distributor sample: 10 spirulina tab, 10 cap, 10 seabuckthorn, 5 moringa, 3 ashwagandha, 5 soap + samples', 'audit_flag': 'डिस्ट्रीब्युटर सॅम्पल पॅक (Distributor Sample)'}),
    (303, [], {'customer_name': 'रत्नेश्वर प्रसाद', 'amount': 1050, 'payment_type': 'COD', 'products': '3 bottle'}),
    (304, [305], {'customer_name': 'सोनाली अमोल पवार', 'amount': 1150, 'payment_type': 'Prepaid', 'products': '2 facewash + 1 bride cream'}),
    (306, [307], {'customer_name': 'पंचकुला हरियाणा ग्राहक', 'amount': 600, 'payment_type': 'COD', 'products': '1 spirulina capsule + 1 seabuckthorn capsules'}),
    (308, [309, 310], {'customer_name': 'ओम नॅचरोपॅथी आणि थेरपी सेंटर', 'amount': 3500, 'payment_type': 'Prepaid', 'products': '5 spirulina tab + 5 seabuckthorn + 5 moringa tab + 5 ashwagandha tab', 'audit_flag': 'क्लिनिक ऑर्डर भाग १ (Clinic Order 1)'}),
    (328, [327, 329, 331, 335], {'customer_name': 'विद्याधर खडकीकर', 'amount': 0, 'payment_type': 'Prepaid', 'products': 'Distributor sample (Speed post)', 'audit_flag': 'स्पीड पोस्ट डिस्पॅच व फोन नंबर नोंद (Linked to IDX 298)'}),
    (358, [359, 442], {'customer_name': 'देवमन नामदेव वाघ', 'amount': 1800, 'payment_type': 'COD', 'products': '2 spirulina tab + 2 seabuckthorn cap', 'audit_flag': 'पिनकोड सुधारणा IDX 442 वरून जोडली (444201)'}),
    (374, [373, 375], {'customer_name': 'कुलवीर सिंग', 'amount': 0, 'payment_type': 'Prepaid', 'products': '120 tab plane + seabuckthorn 1 sample', 'audit_flag': 'नमुना / मोफत सॅम्पल (Free Sample)'}),
    (376, [378], {'customer_name': 'पवन विश्वकर्मा', 'amount': 2770, 'payment_type': 'COD', 'products': '5 seabuckthorn + 5 spirulina + 5 moringa powder'}),
    (381, [380, 382], {'customer_name': 'रंजू संदीप जांभुळकर', 'amount': 0, 'payment_type': 'Prepaid', 'products': 'Sample soap facewash + 1 spirulina tab 120 bottle', 'audit_flag': 'नमुना / मोफत सॅम्पल (Free Sample)'}),
    (443, [], {'customer_name': 'सोमशेखर निर्णी / स्वामी सोमनाथ', 'amount': 1800, 'payment_type': 'Prepaid', 'products': 'Spirulina tab 2 + seabuckthorn cap 2'}),
    (449, [448, 451], {'customer_name': 'डॉ. दीपक दत्तात्रय तडस', 'amount': 900, 'payment_type': 'Prepaid', 'products': 'स्पीड पोस्ट पार्सल', 'audit_flag': 'स्पीड पोस्टने पाठवलेले पार्सल (Speed post receipt)'}),
    (507, [508, 509], {'customer_name': 'गोकुळ टिमकरे', 'amount': 600, 'payment_type': 'COD', 'products': 'Seabuckthorn 1'}),
    (551, [], {'customer_name': 'सागर ज्ञानेश्वर गवारे', 'amount': 600, 'payment_type': 'COD', 'products': 'Spirulina powder 2 pocket 100 gram'}),
    (573, [], {'customer_name': 'ग्राहक (+91 62661 31257)', 'amount': 900, 'payment_type': 'COD', 'products': 'Spirulina seabuckthorn combo'}),
    (577, [578, 579, 580], {'customer_name': 'ओम नॅचरोपॅथी आणि थेरपी सेंटर', 'amount': 1800, 'payment_type': 'Prepaid', 'products': '10 capsules spirulina', 'audit_flag': 'क्लिनिक ऑर्डर भाग २ (Clinic Order 2)'}),
    (582, [586, 590], {'customer_name': 'पवन विश्वकर्मा', 'amount': 15000, 'payment_type': 'Prepaid', 'products': '40 seabuckthorn + 40 spirulina + 40 moringa extract', 'audit_flag': 'B2B बल्क मॅन्युफॅक्चरिंग ऑर्डर (120 बॉटल्स)'}),
    (600, [601, 602], {'customer_name': 'सीमा त्रिपाठी', 'amount': 500, 'payment_type': 'Prepaid', 'products': '1 seabuckthorn'}),
    (631, [632], {'customer_name': 'प्रदीप निर्मल', 'amount': 1050, 'payment_type': 'COD', 'products': '1050 combo'}),
    (633, [634], {'customer_name': 'कुमारसैन शिमला ग्राहक', 'amount': 1050, 'payment_type': 'COD', 'products': 'Spirulina 120 tab + seabuckthorn 60 cap combo + soap facewash pack'}),
    (636, [], {'customer_name': 'नाशिक ग्राहक', 'amount': 1000, 'payment_type': 'COD', 'products': '1 spirulina 120 tab + 1 seabuckthorn + facewash + soap + pack'}),
    (637, [638], {'customer_name': 'राजेंद्र सुखदेव निकम', 'amount': 1050, 'payment_type': 'Prepaid', 'products': '6 spirulina capsule'}),
    (663, [664], {'customer_name': 'स्वामी आनंद भारतीय', 'amount': 900, 'payment_type': 'Prepaid', 'products': '5 oil'}),
    (668, [669], {'customer_name': 'अशोक सुखदेव देशमुख', 'amount': 2400, 'payment_type': 'COD', 'products': '3 spirulina powder + 3 seabuckthorn'}),
    (670, [671], {'customer_name': 'सोमशेखर निर्णी', 'amount': 1600, 'payment_type': 'Prepaid', 'products': '4 seabuckthorn bottle'}),
    (682, [683, 684], {'customer_name': 'ओम नॅचरोपॅथी आणि थेरपी सेंटर', 'amount': 3500, 'payment_type': 'Prepaid', 'products': '5 moringa + 5 ashwagandha + 5 seabuckthorn', 'audit_flag': 'क्लिनिक ऑर्डर भाग ३ (Clinic Order 3)'}),
    (689, [690], {'customer_name': 'संदीप भाई', 'amount': 1850, 'payment_type': 'Prepaid', 'products': '4 spirulina tab + 4 seabuckthorn cap + 1 soap + 1 moringa powder'}),
    (748, [749, 751], {'customer_name': 'डॉ. राजकुमार रंगारी', 'amount': 3500, 'payment_type': 'Prepaid', 'products': '10 spirulina cap + 5 spirulina tab + 5 seabuckthorn cap'}),
    (752, [753], {'customer_name': 'रामेश्वर स्वामी', 'amount': 850, 'payment_type': 'Prepaid', 'products': '2 bottle'}),
    (755, [754, 756], {'customer_name': 'बाळासाहेब ढोकळे', 'amount': 950, 'payment_type': 'COD', 'products': 'Combo spirulina seabuckthorn (पुनर्नोंद / Re-order)'}),
    (757, [758], {'customer_name': 'अच्युत दत्तात्रय दौले पाटील', 'amount': 1300, 'payment_type': 'COD', 'products': '1 shilajit + 1 wheat grass + 1 b 12'}),
]
for main_idx, merged, custom in yash_orders_def:
    ALL_ORDERS.append({
        'main_idx': main_idx,
        'merged_idxs': merged,
        'telecaller': 'यश सूर्यवंशी (फाउंडर डायरेक्ट)',
        'channel_key': 'founder',
        'is_telecaller': False,
        'custom': custom
    })

print(f"Total Master Orders: {len(ALL_ORDERS)}")

# Calculate message coverage:
order_main_idxs = set(o['main_idx'] for o in ALL_ORDERS)
order_merged_idxs = set(idx for o in ALL_ORDERS for idx in o['merged_idxs'])
covered_idxs = order_main_idxs.union(order_merged_idxs)

print(f"Main order messages: {len(order_main_idxs)}")
print(f"Merged sub-messages: {len(order_merged_idxs)}")
print(f"Total covered messages: {len(covered_idxs)}")
print(f"Remaining messages to classify: {len(msgs) - len(covered_idxs)}")
print(f"Overlap between main and merged: {order_main_idxs.intersection(order_merged_idxs)}")
