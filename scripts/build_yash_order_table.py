import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/july_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

# Known orders/pairs for Yash R. Suryawanshi:
# Let's map each order with (main_idx, [merged_indices], customer_name, note)

yash_orders = [
    # 1. Mujammil kamaliwale (IDX 0, merged 1, 4)
    (0, [1, 4], "Mujammil Kamaliwale"),
    # 2. Swami Anand Bhartiya (IDX 18, merged 19, 21)
    (18, [19, 21], "Swami Anand Bhartiya"),
    # 3. Raghavendra (IDX 33)
    (33, [], "Raghavendra"),
    # 4. Balaji Baliram Survanakar (IDX 71, merged 72)
    (71, [72], "Balaji Baliram Survanakar"),
    # 5. Bindu kumar (IDX 73)
    (73, [], "Bindu kumar"),
    # 6. Swami Somanath (IDX 90)
    (90, [], "Swami Somanath"),
    # 7. Haryana Rewari order (IDX 91, merged 92, 93)
    (91, [92, 93], "Haryana Rewari customer"),
    # 8. Nilesh Madhavai (IDX 94, merged 95, 96, 97)
    (94, [95, 96, 97], "Nilesh Madhavai"),
    # 9. Annasaheb Tukaram Gawande (IDX 217)
    (217, [], "Annasaheb Tukaram Gawande"),
    # 10. Swami Anand Bhartiya (IDX 221, merged 225)
    (221, [225], "Swami Anand Bhartiya"),
    # 11. Sunita bharate (IDX 222, merged 223)
    (222, [223], "Sunita bharate"),
    # 12. Manoj M Thakur (IDX 249, merged 250) [Sample]
    (249, [250], "Manoj M Thakur"),
    # 13. Hari om kashyap (IDX 251, merged 252, 253)
    (251, [252, 253], "Hari om kashyap"),
    # 14. Balasaheb Dhokale (IDX 267, merged 268)
    (267, [268], "Balasaheb Dhokale"),
    # 15. Vijay Gupta (IDX 277, merged 278)
    (277, [278], "Vijay Gupta"),
    # 16. Manoj M Thakur repost (IDX 280, merged 281, 282) - Pincode addition
    (280, [281, 282], "Manoj M Thakur (Repost)"),
    # 17. Shobha vilas kakade (IDX 284, merged 283)
    (284, [283], "Shobha vilas kakade"),
    # 18. Vidyadhar Khadkikar (IDX 297, 298, merged 296)
    (298, [296, 297], "Vidyadhar Khadkikar"),
    # 19. Ratneshwar Prasad (IDX 303)
    (303, [], "Ratneshwar Prasad"),
    # 20. Sonali Amol Pawar (IDX 304, merged 305)
    (304, [305], "Sonali Amol Pawar"),
    # 21. Panchkula customer (IDX 306, merged 307)
    (306, [307], "Panchkula customer"),
    # 22. Om naturopathy (IDX 308, merged 309, 310)
    (308, [309, 310], "Om naturopathy"),
    # 23. Vidyadhar Khadkikar (IDX 327, 328, merged 329, 331, 335)
    (328, [327, 329, 331, 335], "Vidyadhar Khadkikar"),
    # 24. Kulvir singh (IDX 373, 374, merged 375)
    (374, [373, 375], "Kulvir singh"),
    # 25. Pavan Vishwakarma (IDX 376, merged 378)
    (376, [378], "Pavan Vishwakarma"),
    # 26. Ranju Sandip Jambhulkar (IDX 380, 381, merged 382)
    (381, [380, 382], "Ranju Sandip Jambhulkar"),
    # 27. Swami somnath / Someshekher nirni (IDX 443)
    (443, [], "Someshekher nirni / Swami Somnath"),
    # 28. Gokul Timkare (IDX 507, merged 508, 509)
    (507, [508, 509], "Gokul Timkare"),
    # 29. MS Rajput (IDX 511)
    (511, [], "MS Rajput"),
    # 30. Sagar Dnyaneshwar Gaware (IDX 551)
    (551, [], "Sagar Dnyaneshwar Gaware"),
    # 31. Spirulina seabuckthorn combo (IDX 573) - Phone +91 6266 131 257
    (573, [], "Customer 6266131257"),
    # 32. Om naturopathy (IDX 577, merged 578, 579, 580)
    (577, [578, 579, 580], "Om naturopathy"),
    # 33. Pavan Vishwakarma (IDX 582)
    (582, [], "Pavan Vishwakarma"),
    # 34. Seema Tripathi (IDX 600, merged 601, 602)
    (600, [601, 602], "Seema Tripathi"),
    # 35. Pradeep Nirmal (IDX 631, merged 632)
    (631, [632], "Pradeep Nirmal"),
    # 36. Kumarsain Shimla customer (IDX 633, merged 634)
    (633, [634], "Kumarsain Shimla customer"),
    # 37. Nashik customer (IDX 636)
    (636, [], "Nashik customer"),
    # 38. Rajendra sukadeo Nikam (IDX 637, merged 638)
    (637, [638], "Rajendra sukadeo Nikam"),
    # 39. Swami Anand Bhartiya (IDX 663, merged 664)
    (663, [664], "Swami Anand Bhartiya"),
    # 40. Ashok Sukhadev Deshmukh (IDX 668, merged 669)
    (668, [669], "Ashok Sukhadev Deshmukh"),
    # 41. Someshekher nirni (IDX 670, merged 671)
    (670, [671], "Someshekher nirni"),
    # 42. Om naturopathy (IDX 682, merged 683, 684)
    (682, [683, 684], "Om naturopathy"),
    # 43. Sandip bhai (IDX 689, merged 690)
    (689, [690], "Sandip bhai"),
    # 44. Dr. Rajkumar Rangari (IDX 748, merged 749, 751)
    (748, [749, 751], "Dr. Rajkumar Rangari"),
    # 45. Rameshwar Swami (IDX 752, merged 753)
    (752, [753], "Rameshwar Swami"),
    # 46. Balasaheb Dhokale (IDX 754, 755, merged 756)
    (755, [754, 756], "Balasaheb Dhokale"),
    # 47. Achut Dattatray Daule Patil (IDX 757, merged 758)
    (757, [758], "Achut Dattatray Daule Patil"),
]

print(f"Total candidate orders for Yash: {len(yash_orders)}")
