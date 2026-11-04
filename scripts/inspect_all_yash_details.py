import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

from build_july_candidate_dataset import extract_pincode, extract_phone, extract_amount_and_payment

# Master definitions for Yash orders:
# (main_idx, [merged_sub_indices], default_name, default_amount, default_payment, note)

yash_order_specs = [
    # 01/07/2026
    (0, [1, 4], "पत्रकार मुजम्मिल कमालीवाले", 900, "Prepaid", "Spirulina powder + Ashwagandha powder, Prepaid"),
    (18, [19, 21], "स्वामी आनंद भारतीय", 2495, "Prepaid", "Spirulina 120 tab (10) + Powder (5) + Facewash (1) + Oil (1) + Soap (1)"),
    # 02/07/2026
    (33, [], "राघवेंद्र", 950, "Prepaid", "Raghu nivas, Belgaum"),
    (71, [72], "बालाजी बळीराम सुर्वणकर", 1050, "COD", "Spirulina cap 1 + Seabuckthorn cap 1 + Spirulina tab 60 1"),
    (73, [], "बिंदू कुमार", 450, "COD", "Spirulina tablets 120"),
    # 03/07/2026
    (90, [], "स्वामी सोमनाथ", 900, "COD", "1 spirulina tab 120 + 1 seabuckthorn cap"),
    (91, [92, 93], "हरियाणा रेवाडी ग्राहक", 450, "COD", "1 tablet cod 450"),
    (94, [95, 96, 97], "निलेश माधवे", 950, "COD", "1 spirulina tab + 1 seabuckthorn"),
    # 06/07/2026
    (217, [], "अण्णासाहेब तुकाराम गावंडे", 999, "COD", "Combo pack"),
    # 07/07/2026
    (221, [225], "स्वामी आनंद भारतीय", 3500, "Prepaid", "Seabuckthorn 2 + Spirulina 120 tab 1 + Oil 1 + Powder 10 + Kesuda soap 12"),
    (222, [223], "सुनिता भरते", 950, "COD", "1 bride cream + 1 facewash"),
    # 08/07/2026
    (249, [250], "मनोज एम. ठाकूर", 0, "Prepaid", "Sample spirulina tab 1 moringa tab 1 (नमुना / Sample)"),
    # 09/07/2026
    (251, [252, 253], "हरी ओम कश्यप", 950, "COD", "Spirulina tab 120 + seabuckthorn cap 1"),
    # 10/07/2026
    (267, [268], "बाळासाहेब ढोकळे", 950, "COD", "Combo pack"),
    # 11/07/2026
    (277, [278], "विजय गुप्ता", 500, "Prepaid", "Speed post order"),
    (280, [281, 282], "मनोज एम. ठाकूर", 0, "Prepaid", "पिनकोड 411061 सह पुन्हा पोस्ट (Duplicate/Repost of IDX 249)"),
    (284, [283], "शोभा विलास काकडे", 500, "Prepaid", "Seabuckthorn capsule 1, Prepaid 500"),
    (298, [296, 297], "विद्याधर खडकीकर", 4500, "Prepaid", "डिस्ट्रीब्युटर सॅम्पल पॅक (Distributor Sample)"),
    # 12/07/2026
    (303, [], "रत्नेश्वर प्रसाद", 1050, "COD", "3 bottle cod 1050"),
    (304, [305], "सोनाली अमोल पवार", 1150, "Prepaid", "2 facewash + 1 bride cream"),
    # 13/07/2026
    (306, [307], "पंचकुला हरियाणा ग्राहक", 600, "COD", "1 spirulina cap + 1 seabuckthorn cap"),
    (308, [309, 310], "ओम नॅचरोपॅथी आणि थेरपी सेंटर", 3500, "Prepaid", "क्लिनिक ऑर्डर 1: 5 spirulina tab + 5 seabuckthorn + 5 moringa tab + 5 ashwagandha tab"),
    # 14/07/2026
    (328, [327, 329, 331, 335], "विद्याधर खडकीकर", 0, "Prepaid", "स्पीड पोस्ट फोन नंबर सह डिस्पॅच (Linked to IDX 298)"),
    # 16/07/2026
    (358, [359, 442], "देवमन नामदेव वाघ", 1800, "COD", "2 spirulina tab + 2 seabuckthorn cap (पिनकोड सुधारणा IDX 442)"),
    # 17/07/2026
    (374, [373, 375], "कुलवीर सिंग", 0, "Prepaid", "120 tab plane + seabuckthorn 1 sample (नमुना / Sample)"),
    (376, [378], "पवन विश्वकर्मा", 2770, "COD", "5 seabuckthorn + 5 spirulina + 5 moringa powder"),
    (381, [380, 382], "रंजू संदीप जांभुळकर", 0, "Prepaid", "Sample soap facewash + 1 spirulina tab 120 bottle (नमुना / Sample)"),
    # 18/07/2026
    (443, [], "सोमशेखर निर्णी / स्वामी सोमनाथ", 1800, "Prepaid", "Spirulina tab 2 + seabuckthorn cap 2"),
    # 19/07/2026
    (449, [448, 451], "डॉ. दीपक दत्तात्रय तडस", 900, "Prepaid", "स्पीड पोस्टने पाठवलेले पार्सल (Speed post parcel)"),
    # 21/07/2026
    (507, [508, 509], "गोकुळ टिमकरे", 600, "COD", "Seabuckthorn 1"),
    # 23/07/2026
    (551, [], "सागर ज्ञानेश्वर गवारे", 600, "COD", "Spirulina powder 2 pocket 100 gram"),
    # 25/07/2026
    (573, [], "ग्राहक (+91 62661 31257)", 900, "COD", "Spirulina seabuckthorn combo"),
    (577, [578, 579, 580], "ओम नॅचरोपॅथी आणि थेरपी सेंटर", 1800, "Prepaid", "क्लिनिक ऑर्डर 2: 10 capsules spirulina"),
    (582, [586, 590], "पवन विश्वकर्मा", 15000, "Prepaid", "B2B बल्क मॅन्युफॅक्चरिंग ऑर्डर (40 seabuckthorn + 40 spirulina + 40 moringa)"),
    (600, [601, 602], "सीमा त्रिपाठी", 500, "Prepaid", "1 seabuckthorn prepaid 500"),
    # 26/07/2026
    (631, [632], "प्रदीप निर्मल", 1050, "COD", "1050 combo"),
    (633, [634], "कुमारसैन शिमला ग्राहक", 1050, "COD", "Spirulina 120 tab + seabuckthorn 60 cap combo + soap facewash pack"),
    (636, [], "नाशिक ग्राहक", 1000, "COD", "1 spirulina 120 tab + 1 seabuckthorn + facewash + soap + pack"),
    (637, [638], "राजेंद्र सुखदेव निकम", 1050, "Prepaid", "6 spirulina capsule prepaid"),
    # 27/07/2026
    (663, [664], "स्वामी आनंद भारतीय", 900, "Prepaid", "5 oil prepaid"),
    # 28/07/2026
    (668, [669], "अशोक सुखदेव देशमुख", 2400, "COD", "3 spirulina powder + 3 seabuckthorn"),
    (670, [671], "सोमशेखर निर्णी", 1600, "Prepaid", "4 seabuckthorn bottle prepaid"),
    # 29/07/2026
    (682, [683, 684], "ओम नॅचरोपॅथी आणि थेरपी सेंटर", 3500, "Prepaid", "क्लिनिक ऑर्डर 3: 5 moringa + 5 ashwagandha + 5 seabuckthorn"),
    (689, [690], "संदीप भाई", 1850, "Prepaid", "4 spirulina tab + 4 seabuckthorn cap + 1 soap + 1 moringa powder"),
    # 31/07/2026
    (748, [749, 751], "डॉ. राजकुमार रंगारी", 3500, "Prepaid", "10 spirulina capsule + 5 spirulina tab + 5 seabuckthorn cap"),
    (752, [753], "रामेश्वर स्वामी", 850, "Prepaid", "2 bottle"),
    (755, [754, 756], "बाळासाहेब ढोकळे", 950, "COD", "Combo spirulina seabuckthorn (पुनर्नोंद / Re-order)"),
    (757, [758], "अच्युत दत्तात्रय दौले पाटील", 1300, "COD", "1 shilajit + 1 wheat grass + 1 b 12"),
]

print(f"Total Yash order specs defined: {len(yash_order_specs)}")
