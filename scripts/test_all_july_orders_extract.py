import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Import extractors from build_july_candidate_dataset
from build_july_candidate_dataset import extract_pincode, extract_phone, extract_amount_and_payment

# Master Order Definitions
# Format: (main_idx, [merged_sub_indices], sender_category, telecaller_name_marathi, notes)

ORDERS_MAP = []

# --- 1. Punam Kasture (9 orders) ---
punam_indices = [526, 538, 557, 605, 667, 708, 709, 741, 744]
for idx in punam_indices:
    ORDERS_MAP.append((idx, [], 'punam', 'पूनम कस्तुरे', ''))

# --- 2. Darshan Bayas (+91 88051 68275) (17 orders) ---
darshan_orders = [
    (446, [], ''),
    (452, [455], 'Amount confirmed in IDX 455'),
    (456, [], ''),
    (457, [], ''),
    (459, [], ''),
    (492, [], ''),
    (510, [], ''),
    (525, [], ''),
    (540, [], ''),
    (541, [], ''),
    (640, [], ''),
    (660, [], ''),
    (661, [], ''),
    (672, [], ''),
    (678, [], ''),
    (688, [], ''),
    (747, [], ''),
]
for main_idx, merged, note in darshan_orders:
    ORDERS_MAP.append((main_idx, merged, 'darshan', 'टेलिकॉलर (+91 88051 68275)', note))

# --- 3. Monu (Sujata Nutrilive) (10 orders) ---
monu_orders = [
    (184, [185, 186], 'Prepaid order, amount estimated at 600 for 3 bottles 60 tab'),
    (319, [], ''),
    (529, [], ''),
    (533, [], ''),
    (536, [], ''),
    (543, [], ''),
    (553, [], ''),
    (576, [], ''),
    (597, [], ''),
    (711, [], ''),
]
for main_idx, merged, note in monu_orders:
    ORDERS_MAP.append((main_idx, merged, 'monu', 'मोनू', note))

# --- 4. Manjushree Kasture (Sujata Nutrilive Manju) ---
# 46 unique orders + 1 rebook (465)
manju_orders = [
    (2, [], ''),
    (10, [], ''),
    (14, [], ''),
    (15, [], ''),
    (76, [], ''),
    (77, [], ''),
    (78, [], ''),
    (119, [127], 'Phone number added in IDX 127'),
    (121, [], ''),
    (177, [], ''),
    (182, [], ''),
    (183, [], ''),
    (216, [], ''),
    (230, [], ''),
    (231, [], ''),
    (248, [], ''),
    (276, [], ''),
    (325, [], ''),
    (343, [349], 'Phone number added in IDX 349'),
    (347, [], ''),
    (379, [], ''),
    (465, [], 'Rebook of return order IDX 77 (Dinesh Salunkhe)'),
    (504, [], ''),
    (505, [], ''),
    (506, [], ''),
    (513, [], ''),
    (527, [], ''),
    (550, [], ''),
    (552, [], ''),
    (558, [], ''),
    (559, [], ''),
    (592, [], ''),
    (604, [], ''),
    (616, [], ''),
    (620, [], ''),
    (622, [621], 'Address correction added in IDX 621'),
    (639, [], ''),
    (665, [], ''),
    (666, [], ''),
    (674, [], ''),
    (675, [], ''),
    (676, [], ''),
    (687, [], ''),
    (702, [], ''),
    (703, [], ''),
    (742, [], ''),
    (743, [], ''),
]
for main_idx, merged, note in manju_orders:
    ORDERS_MAP.append((main_idx, merged, 'manju', 'मंजुश्री कस्तुरे', note))

# --- 5. Om Amazon Dispatch (Warehouse Dispatch Orders) ---
om_orders = [
    (428, [429, 442], 'Devman Namdev Wagh (order in 428/429, pincode corrected in 442)'),
    (556, [], 'Prepaid order, amount catalog value'),
    (572, [], ''),
    (677, [], ''),
]
for main_idx, merged, note in om_orders:
    ORDERS_MAP.append((main_idx, merged, 'om', 'वेअरहाऊस डिस्पॅच', note))

# --- 6. Yash R. Suryawanshi (Founder Direct Orders) ---
yash_orders_def = [
    (0, [1, 4], 'Prepaid order, amount catalog value'),
    (18, [19, 21], ''),
    (33, [], ''),
    (71, [72], ''),
    (73, [], ''),
    (90, [], ''),
    (91, [92, 93], ''),
    (94, [95, 96, 97], ''),
    (217, [], ''),
    (221, [225], ''),
    (222, [223], ''),
    (249, [250], 'Sample order (free)'),
    (251, [252, 253], ''),
    (267, [268], ''),
    (277, [278], 'Speed post order'),
    (280, [281, 282], 'Repost of Manoj Thakur with pincode'),
    (284, [283], 'Price in IDX 283 (500 prepaid)'),
    (298, [296, 297], 'Distributor sample 4500'),
    (303, [], ''),
    (304, [305], ''),
    (306, [307], ''),
    (308, [309, 310], 'Om naturopathy clinic order'),
    (328, [327, 329, 331, 335], 'Vidyadhar Khadkikar dispatch with phone number'),
    (374, [373, 375], 'Kulvir singh sample'),
    (376, [378], 'Pavan Vishwakarma'),
    (381, [380, 382], 'Ranju Sandip Jambhulkar sample'),
    (443, [], 'Someshekher nirni / Swami Somnath'),
    (507, [508, 509], 'Gokul Timkare'),
    (551, [], 'Sagar Dnyaneshwar Gaware'),
    (573, [], 'Customer 6266131257'),
    (577, [578, 579, 580], 'Om naturopathy clinic order 2'),
    (582, [586, 590], 'Pavan Vishwakarma B2B bulk order'),
    (600, [601, 602], 'Seema Tripathi'),
    (631, [632], 'Pradeep Nirmal'),
    (633, [634], 'Kumarsain Shimla customer'),
    (636, [], 'Nashik customer'),
    (637, [638], 'Rajendra sukadeo Nikam'),
    (663, [664], 'Swami Anand Bhartiya'),
    (668, [669], 'Ashok Sukhadev Deshmukh'),
    (670, [671], 'Someshekher nirni'),
    (682, [683, 684], 'Om naturopathy clinic order 3'),
    (689, [690], 'Sandip bhai'),
    (748, [749, 751], 'Dr. Rajkumar Rangari'),
    (752, [753], 'Rameshwar Swami'),
    (755, [754, 756], 'Balasaheb Dhokale (Re-order)'),
    (757, [758], 'Achut Dattatray Daule Patil'),
]
for main_idx, merged, note in yash_orders_def:
    ORDERS_MAP.append((main_idx, merged, 'yash', 'यश सूर्यवंशी (फाउंडर डायरेक्ट)', note))

print(f"Total orders mapped: {len(ORDERS_MAP)}")

# Check duplicate main_indices
main_indices = [o[0] for o in ORDERS_MAP]
print(f"Unique main indices: {len(set(main_indices))} == {len(main_indices)}")

# Check all merged indices
merged_indices = []
for o in ORDERS_MAP:
    merged_indices.extend(o[1])
print(f"Total merged indices: {len(merged_indices)}")
print(f"Overlap between main and merged: {set(main_indices).intersection(set(merged_indices))}")
