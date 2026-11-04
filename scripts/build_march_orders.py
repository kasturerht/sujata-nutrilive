import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect Monu's orders first:
# We already saw Monu's candidates. Let's list each one and verify if it's an order, duplicate, or cancelled.
monu_orders = []

# Monu's candidates:
# 1. [172-174] 11/03: M. Karunanithi.M., Chennai, 9080023631, 2 capsule spirulina 1 seabackthorn COD 1149
# 2. [175] 11/03: Boota kanel singh, Ludhiana, 9569999269, 2 capsule COD 650
# 3. [206] 12/03: kiran gurav, Pandharpur, 413304, Capsule - 5, Tab -5, Soap - 5, Shampoo -2, Oil- 2, Powder -2, Total 3180 COD
# 4. [213] 13/03: मधुकर वाघ, परभणी, 431521, 9158602352, 1 tablet 300 + COD 50 = 350 COD
# 5. [215, 220] 13/03: sagar Tanaji Kadam, Pandharpur, 8055753868, spirulina capsule 5, Seabackthorn 1, COD 1290
# 6. [217] 13/03: masna Balaji Hake, Gangakhed Parbhani, 431514, 8262935942, 2 tablets, Total 450 COD
# 7. [222] 13/03: Ketan Kholiya, Rajkot, 8160037527, 2 capsule, COD 650
# 8. [244] 14/03: Ram khandagale, Pimpri Pune, 411018, 9022850599, powder, Prepaid
# 9. [282-283] 16/03: दोडमिसे राजाभाऊ, पुणे 411051, 8149807422, स्पीरुलींना कॅप्सूल दोन डब्या 60+60, Prepaid
# 10. [324] 17/03: कांताराम तुकाराम चवरे, भोसरी पुणे 411039, 9970693961, 1 spirulina capsule, Prepaid
# 11. [344-345] 18/03: shakil khan, Bhiwandi 421302, 8767230232, 1 capsule bottle, COD 400 rs
# 12. [347] 18/03: Ashwin dhand advocate., Samrala Ludhiana Punjab 141114, 9814381177, 1 spirulina capsule, COD 350
# 13. [348] 18/03: Deepak Rama more, Mukkam khadki Khandala 414006, 9850537967 / 9834632421, 1 spirulina powder, Prepaid 300
# 14. [357] 19/03: शकुंतला माणिकराव भास्करे, नांदेड 431602, 8668335375, 1 spirulina powder, COD 350
# 15. [358] 19/03: Sandiip Samant, Andheri West Mumbai 400053, 8591823455, 1 spirulina 1 seabackthorn, Prepaid 749 rs
# 16. [406] 21/03: dhyal ghegat, Bhusaval 425201, 9226162587, 1 spirulina powder, COD 350
# 17. [420-423] 22-23/03: Mahantesh Basavaraj Karle, Kalewadi Pimpri Chinchwad Pune 411019, 7558273645, 120 tab bottel 2, COD (or Prepaid? Let's check amount)
# 18. [475, 481] 23-24/03: Harish Gogad, Nashik 422005, 9420089022, spirulina capsule, COD 350 (single order posted 23rd evening, re-posted 24th morning)
# 19. [484-488] 24/03: Anil Patil, Kandiwali West Mumbai 400067, 7303995999, spirulina tablet 2, Prepaid 400
# 20. [502-506] 24/03: Boota Kanel Singh (repeat order), Ludhiana, 9569999269, 3 spirulina capsule, COD 900
# 21. [533-535] 25/03: Siddharth S Karmakar, Nallasopara East Palghar 401209, 8237999619, spirulina Tab, Prepaid 300
# 22. [543-544] 25/03: Dr. S. N. Pathan, Nagpur 440013, 9011313471, Spirulina tablet 300 + Spirulina capsule 400, COD 750 (with COD charge)
# 23. [564] 25/03: मंगेश पाटील, पलूस सांगली 416310, 9765987575, 2 seabukthron, Prepaid (amount? let's check)
# 24. [575-577, 621-624] 26/03: Sachin Kumar, Gangapur City Sawai Madhopur Rajasthan 322201, 9610502425, 1 seabuckthorn 1 spirulina 120 tab, Prepaid 800 (Monu took order, Yash confirmed prepaid 800)
# 25. [653-654] 27/03: Krishna nivrutti kadam, Nahre ambegaon Pune 411046, 8956239054, Capsule 1, COD 350
# 26. [672-673] 27/03: Rajesh Tungewar, Nanded waghala 431601, 8999662065, capsule 1, facewash 1, soap 1, Prepaid 565
# 27. [684] 28/03: ishwar Yogi, Hissar Haryana 125001, 9355682568, 2 spirulina Tab, COD 450
# 28. [690] 28/03: जीवन नवले, पाली बीड 431153, 9075437997, capsule 5, टॅब्लेट 6, पावडर 4, साबण 1, Prepaid (amount? let's check)
# 29. [696-698] 29/03: Jayprabhu dhole, Jalna 431203, 9130081268, 60 tab 2 bottels (amount? COD or Prepaid?)
# 30. [702] 29/03: Ashish dhondiram shinde, Kalewadi Pune 411017, 8669853409, 2 tab, COD 450
# 31. [718] 30/03: Jitendra kumar Ray, Vaishali Bihar 844505, 9123430920, COD 850
# 32. [730] 31/03: Ssanjay Jalindar Kshirsagar, Solapur 413003, 8149128281, 1 seabackthorn, 1 spirulina tab, COD 800
# 33. [731-732] 31/03: Jaidev yogi, Jaipur Rajasthan 303001, 9929647423, 5 tab, COD 900
# 34. [733] 31/03: s. fernandez, Nalasopara West 401203, 7875595977, spirulina 120 tab + seabuckthorn 60 capsules, COD 800
# 35. [734-735] 31/03: Ankit K Panchal, Surat 394185, 7588928423, 60 tab 1 bottel, COD 350

print("Monu candidates count listed:", 35)
