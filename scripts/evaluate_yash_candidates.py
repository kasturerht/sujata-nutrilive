import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/june_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect each candidate index in Yash candidates
# 1. IDX 12: Chandrakant labade (450 COD)
# 2. IDX 50: Anand Kumar (Agra) -> merged 51, 55 (1600 COD, 15 capsules bottle white bottle 60 cap)
# 3. IDX 66 / 310: Raghunandan organik feeds (Jalna) (9595227331) -> Prepaid, golden cap spirulina
# 4. IDX 71 / 152: Mahaveer medical (Satna 485001, 8349401895) -> Sample kit 1 and 100 bottle spirulina 100 tab sealed bottle
# 5. IDX 83: Rajendra Mehara (Jaipur 302004, 8949266062) -> 60 tab 1 cod 300
# 6. IDX 105: V.Pavna (Armoor 503224) -> merged 106 (8341764069, 4050 COD, 10 seabuckthorn 1 soap, 3 oil, Spirulina tab 120: 5, Moringa tab: 5)
# 7. IDX 113: Rajdev singh jat (Bhopal 462038) -> merged 114, 115 (8827062595, 999 COD, 1 spirulina 1 seabuckthorn)
# 8. IDX 114: sub-message of 113
# 9. IDX 116: Naresh tukaram bambal (Warud 444906) -> merged 117 (7588664235, 900 COD, Spirulina seabuckthorn)
# 10. IDX 121: Avdut rajane (Yavatmal 445230) -> merged 122 (7823884489, 450 COD, Spirulina tablets 120)
# 11. IDX 145: Dodmise Rajendra (Pune 411051, 8149807422) -> merged 146 (1050 COD, 3 capsule)
# 12. IDX 148 / 149: Rekha mohan Bhole (Chinchwad Pune 411033, 9271555179) -> merged 149, wait what product/amount?
# 13. IDX 156: Santosh kumar gupta (Garhwa 822128, 9708185321) -> merged 157 (10 capsule 5 120 tab 5 powder 1 facewash)
# 14. IDX 160: Chandrakant labade -> duplicate reminder of IDX 12
# 15. IDX 165 / 166: Vijaybhai bhagvatibhai patel (Surat 394130, 9376452299) -> merged 165, 167 (1550 COD, 5 spirulina capsule)
# 16. IDX 202: Kalpeshbhai Chandubhai Patel (Vadodara 390020, 9173356935) -> merged 203 (3000 COD, 5 spirulina capsules 5 seabuckthorn)
# 17. IDX 275: Prashant vinayak wayadande (Satara 415524, 9922639596) -> merged 276 (500 COD, Capsule 1)
# 18. IDX 277: Surinder singh (Lalheri 141401, 9464038599) -> Prepaid 2 bottle spirulina tablet
# 19. IDX 281: Deepak Prabhakar Naik (Nashik 422003, 9823713616) -> 450 COD, 1 bottle capsule
# 20. IDX 320: Rajendra sukadeo Nikam (Nashik 422101, 8956051949) -> merged 321, 322 (1200 Prepaid, 3 spirulina cap + 2 powder + 1 seabuckthorn)
# 21. IDX 324: Tejal medical (Satana 423301, 9022991045) -> merged 323, 325 (20 oil 20 shampoo)
# 22. IDX 327: Kalyani nilesh kumbhar (Pune 411051, 8793165621) -> merged 328 (250 COD, Oil 1)
# 23. IDX 363: Girish Clinic (Ulhasnagar 421004) -> merged 364 (7021880353, Capsule 10, Seabuckthorn 2)
# 24. IDX 379: P P Bhusari (Chh sambhaji Nagar 431001) -> merged 380, 381 (8668959150, 800 COD, seabuckthorn 120 cap 1)
# 25. IDX 385: Kiran Nimba Patil (Dhule 425427) -> Spirulina powder 1pack 1 facewash. (Wait! Manju had Kiran Nimba Patil at 308! Is this duplicate or 2nd order?)
# 26. IDX 421: Sangita Ingle (Pune 411048, 8459177575) -> merged 422 (500 COD, Spirulina capsule 1)
# 27. IDX 433-436: Deepali Nitin Pawar (Pune 411037, 7820997018) -> (1000 COD, Spirulina capsules 1 + seabuckthorn 60 1)
# 28. IDX 450: Javed Khan (Delhi 110084, 9899751058) -> (1650 COD, 2 spirulina 120 tab + 2 seabuckthorn 60 cap)
# 29. IDX 470: Neeta prashant chhatre (Kharghar 410210, 9619965932) -> (1050 COD, Spirulina powder 100g + 2 pocket seabuckthorn capsule 120 bottle 1)
# 30. IDX 490: Kalyani Nilesh Kumbhar (Pune 411051, 8793165621) -> merged 491 (Prepaid, 1 shampoo)
# 31. IDX 498: Plot 426 Nigadi Pune 411044, 7276999947 -> merged 499, 501 (1050 COD, 3 tablets 120)
# 32. IDX 502: Prashant vinayak wayadande (Satara 415524, 9922639596) -> merged 503 (500 COD, Capsule 1) (Second order after 275!)
# 33. IDX 525: Balaji Baliram Survanakar (Pune 411062, 9172276975) -> wait, check 525 vs 598!
# 34. IDX 526: Kashinath kondaji ahire (Nashik 423204) -> merged 527, 528 (9145607383, 450 Prepaid, Spirulina 120 tab)
# 35. IDX 534: MANOJ MADHUKAR NAGOTKAR (Panvel 410206, 9969924025) -> (1050 COD, Spirulina cap + Spirulina tab 60 + Seabuckthorn 60)
# 36. IDX 535: Kapil Ingle (Aurangabad 431005, 9359335154) -> merged 536 (Oil 5)
# 37. IDX 538: Suryakanwal aggarwal (Delhi 110087, 9312333983) -> (Prepaid, half kg powder spirulina + sample soap 1)
# 38. IDX 551: Kashinath kondaji ahire (Nashik 423204) -> merged 552, 553 (Second order: Spped post order 2 prepaid 120 tab spirulina)
# 39. IDX 563: Nandkishor Sadashiv Jadhav (Beed 431122, 9850590181) -> merged 564 (Prepaid, 1 seabuckthorn 1 capsule)
# 40. IDX 598: Balaji Baliram Survanakar (Pune 411062, 9172276975) -> merged 599 (1050 COD, Spirulina cap 1 + Seabuckthorn cap 1 + Spirulina tab 60 1)
# 41. IDX 635: Vijay Gupta (Mughalsarai 232101, 6394025383) -> (1000 Prepaid, 2 seabuckthorn 1 spirulina tab 60)
# 42. IDX 796: Ramesh Chandra Srivastava (Varanasi 221003, 9984057458) -> (1000 COD, 120 tab 1, Capsule 1, Seabuckthorn 1)
# 43. IDX 799: Sunita bharate (Loni Rahata 413736, 8983981909) -> merged 800 (1680 COD, 2 bride cream)
# 44. IDX 802: Bindu kumar (Pune 411040, 9511783513) -> (450 COD, spirulina tablets 120)
# 45. IDX 824 / 835: Patrkar Mujammil kamaliwale (Pandharpur 413304, 7277720606) -> merged 825, 834, 836 (1380 COD, Spirulina powder + Ashwagandha powder + Spirulina & seabuckthorn cap)
# 46. IDX 842: Laxman Nandrekar (Sangli 416416, 9637992915) -> merged 843 (35 tablets speed post spirulina)
# 47. IDX 845: Om naturopathy (Jamner 424206, 7083575525) -> merged 846, 847 (3550 Prepaid, 5 spirulina tab + 5 seabuckthorn cap + 5 moringa tab + 5 ashwagandha tab)
# 48. IDX 848: Santosh kumar gupta (Garhwa 822128, 9708185321) -> merged 849 (5180 COD, Capsule 20, Tablets 120: 10, Oil 1, Facewash 1, Soap 1)
# 49. IDX 870: P P Bhusari (Chh sambhaji Nagar 431001, 8668959150) -> merged 871, 872 (800 COD, seabuckthorn 120 cap 1) (Second order after 379!)
# 50. IDX 883: Padmashri Prashant Barde (Kolhapur 416013, 9890615059) -> (999 Prepaid, Combo pack)
# 51. IDX 890: Pankaj Namdeo (Dewas 455001, 8889077717) -> merged 891 (Capsule 1, Prepaid/COD?)
# 52. IDX 897: Manjushree Rohit Kasture (Kolhapur 416006, 9272471529) -> merged 898 (2 spirulina tablets 1 seabuckthorn) (Internal dispatch for Manju)
# 53. IDX 899: Parinda chheda (Dombivli 421201, 9004519968) -> merged 900, 901 (Bride cream sample, Choti 5 gram dabi, oil facewash without sticker, shampoo)
# 54. IDX 910: Laxman Nandrekar (Sangli 416416, 9637992915) -> merged 911 (Arogyam tablets 20, Powder 5, Moringa tablets 5)

print("Check completed.")
