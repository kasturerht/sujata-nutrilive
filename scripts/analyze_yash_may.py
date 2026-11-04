import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/may_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Yash candidates list
yash_candidates_def = [
    # 1. IDX 10: Vikram (Airport rd, Lohegaon, Pune 411047, 9422112621) -> merged 11, 12 (450 prepaid, spirulina 90 tab 1 bottle)
    # 2. IDX 14: Dr. Rajkumar Laxman Rangari (Akola 444003, 9921186248) -> merged 15, 16 (Prepaid, what product?)
    # 3. IDX 38: Dr. Ranjana (Igatpuri, 7498651800) -> merged 39 (1 powder prepaid 400)
    # 4. IDX 47: Sunfab India (Bhilwara 311001, 7976521638) -> 1 capsule 1 oil 1 shampoo cod 650/-
    # 5. IDX 48: Mahesh Gusai (Gandhidham 370240, 9624396169) -> tab 90 pack 1 cod 450
    # 6. IDX 50: Snehal Sawant (Nashik expo order) -> 10 capsule
    # 7. IDX 51: Laxman Nandrekar (Sangli 416416, 9637992915) -> merged 52 (50 bottle arogyam 60 tab speed post)
    # 8. IDX 61: Sunita Bharate (Loni 413736, 8983981909) -> merged 62, 63 (1 korean cream 1 facewash cod 900)
    # 9. IDX 85: Amar Paithane (Wadwani Beed 431144, 7767883288) -> spirulina tab 350/- COD
    # 10. IDX 101: Vinayak (Baramati 413102, 9619707465) -> Spiru tab 90 1 bottle prepaid 400
    # 11. IDX 139: Akshayraj Arvindkumar Shriniwas (Akshay Gajbhiye) (Parshioni 441105) -> Cod 9000 (Bulk order)
    # 12. IDX 154: Laxman Nandrekar (Sangli 416416, 9637992915) -> 30 bottle spirulina 60 tab (Second order)
    # 13. IDX 181: Shri Vinayak Raghunath Shinde (Kolhapur 416109, 9960587676) -> 1 spirulina tablets 1 seabuckthorn capsule cod 850
    # 14. IDX 184: Santosh Kumar Gupta (Garhwa 822128, 9708185321) -> merged 185 (1 capsule)
    # 15. IDX 187: Abdul Saleem (Calicut Kerala 673019, 9400075086) -> merged 188, 189 (Half kg powder 400 prepaid)
    # 16. IDX 190: Laxman Nandrekar (Sangli 416416, 9637992915) -> merged 191 (30 bottle tab arogyam) (Third order)
    # 17. IDX 200: Dr. Milind More (Jalgaon 425001, 9689740360) -> merged 202 (4 bottle 60 cap seabuckthorn, 5 120 tab spirulina, 5 moringa tab, 5 ashwagandha tab)
    # 18. IDX 215: Parveen Kumar (Sriganganagar 335704, 7231810915) -> Repost of Monu's IDX 115 (status check / dispatch instruction)
    # 19. IDX 228: Bajrang Balwant Kumbhar (Kagal Kolhapur 416216) -> merged 229 (3 spirulina tab + 2 seabuckthorn cap cod 2200)
    # 20. IDX 256: Amol Ashok Awati (Manmad 423104, 9028266335) -> 1 facewash 1 oil 1 soap cod 370/-
    # 21. IDX 281: Hitesh Mehta (Mumbai 400004, 9869505518) -> merged 283 (10 spirulina powder prepaid 1600)
    # 22. IDX 306: Eknath Bapu Lokhande (Gaganbawda Kolhapur 416206, 9423268167) -> merged 307 (1 capsule 400 prepaid)
    # 23. IDX 313: Devashish Pohankar (Nagpur 441110, 9766896900) -> merged 314 (capsule 1, oil 1, shampoo 1, soap 1, facewash 1, facepack 1 prepaid)
    # 24. IDX 323: Chandrakant Labade -> Reminder of Manju's order (IDX 227)
    # 25. IDX 344: Amir Merchant (Worli Mumbai 400018, 9833110514) -> Capsule 1 + facewash 1 :- 530 prepaid
    # 26. IDX 353: Laxmi Narayan Soc Parel Mumbai 400012 -> merged 354 (8080214722, Spirulina powder 1 prepaid + 1 sample bath soap)
    # 27. IDX 357: Vinayak Raghunath Shinde (Kolhapur 416109, 9960587676) -> Repost / status of IDX 181
    # 28. IDX 393: Ayushman Ayurvedic / Ravi Kumar (Hazaribagh Jharkhand 825302, 7903016225) -> merged 394 (5 spirulina capsule, 5 seabuckthorn capsule prepaid)
    # 29. IDX 395: 9369262728 -> merged 397 (120 tab 10 bottle prepaid 1850/-)
    # 30. IDX 399: Sonali Amol Pawar (Nashik 422006, 9325919245) -> merged 400 (3 spirulina capsule 1000 prepaid)
    # 31. IDX 430: Dhery Beauty Parlour / Ketan Dholakiya (Rajkot 360055, 9712845336) -> Beauty parlour order
    # 32. IDX 436: Lilaram Chandwani / Raju Dhivare (Ulhasnagar 421001, 9022836249) -> Ulhasnagar order
    # 33. IDX 462: Achut Dattatray Daule Patil (Rahuri Ahilyanagar 413705) -> 3 spirulina 120 tab + 2 seabuckthorn cap + 1 soap cod 2400
    # 34. IDX 472: Vekariya Bhavesh Kishorbhai (Junagadh 362130, 8758556235) -> 3 spirulina tab (120) total 1050 COD
    # 35. IDX 498: Eknath Bapu Lokhande -> Repost / docket request of IDX 306
    # 36. IDX 504: BrahmaNand Chauhan (Dehradun 248003, 8595579636) -> Sea buckthorn capsule 1 500 cod
    # 37. IDX 510: Chandrakant Labade -> 2nd reminder of Manju's order (IDX 227)
    # 38. IDX 531: Laxman Somanna Gejage (Jath Sangli 416413, 9970086889) -> merged 536 (Spirulina tab 350 prepaid 60 tab 1)
    # 39. IDX 537: Chandrakant Pralhad Dhore (Buldhana 443001, 9881147752) -> Buldhana order
    # 40. IDX 564: Vasant Digambar Joshi (Nashik 422004) -> merged 565 (1 capsule cod 450)
    # 41. IDX 591: Smita Singh (Dombivli 421201) -> merged 592 (20 kamla brand bottles 1880 prepaid)
    # 42. IDX 616: Smita Singh -> Repost of 591
    # 43. IDX 618: V. Pavna (Armoor 503224, 8341764069) -> merged 620 (10 seabuckthorn, 1 soap, 3 oil, 5 spirulina tab 120, 5 moringa tab cod 4050)
    # 44. IDX 621: Amit Baban Chintale (Pune 411005, 9359914514) -> merged 622 (5 spirulina powder cod 1150)
    # 45. IDX 624: Sunil Pundlik Khedkar (Khamgaon 444303, 9226521901) -> merged 625 (5 spirulina cap, 5 moringa pow, 5 soap, 5 spiru pow, 5 seabuck cap, 5 facewash, 5 oil cod 5120)
    # 46. IDX 660: Vishwas Bapu Powar (Kagal Kolhapur 416232, 9890697859) -> merged 661, 662 (Capsule 2 speed post)
    # 47. IDX 698: Photo address -> merged 699, 703, 705 (9992604067, Moringa powder + spirulina powder cod 2100)
]

print("Yash candidates analyzed.")
