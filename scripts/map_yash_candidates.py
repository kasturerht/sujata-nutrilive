import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect the candidate list for Yash:
yash_order_groups = [
    # 1. Mantesh Karle
    {"name": "Mantesh Basavaraj Karle", "indices": [4, 8, 9], "product": "2 spirulina capsule, 1 Ashwagandha", "amount": 900, "mode": "COD", "city": "Solapur", "pin": "413216", "phone": "7558273645"},
    # 2. Pradeep Nirmal (posted 1st March)
    {"name": "Pradeep Nirmal", "indices": [6, 7, 10, 11, 64, 65], "product": "1 seabuckthorn, 1 spirulina capsule", "amount": 750, "mode": "Prepaid", "city": "Bhayandar West", "pin": "401101", "phone": "9223343444"},
    # 3. Media order 5 spirulina 120 + 10 Seabuckthorn COD 3360
    {"name": "Unspecified Customer (Slip Order)", "indices": [13, 14, 67, 68, 113, 114, 115, 126, 127], "product": "5 spirulina 120 bottel, 10 Seabuckthorn capsule", "amount": 3360, "mode": "COD", "city": "Slip / Media", "pin": "", "phone": ""},
    # 4. Sai Suman Medical
    {"name": "साई सुमन मेडीकल (Sai Suman Medical)", "indices": [20, 21, 22, 23], "product": "5 spirulina capsules, 5 spirulina oil, 1 Amla powder, 5 Soap", "amount": 2500, "mode": "Prepaid", "city": "Naur Shrirampur", "pin": "413718", "phone": "9765497487"},
    # 5. Vaidya Murlidhar Das
    {"name": "Vaidya Murlidhar Das (Jivanseva Wellness)", "indices": [32, 33], "product": "Kit (1 capsule, 1 soap, 1 shampoo, 1 oil, 1 facewash, 1 cookies)", "amount": 999, "mode": "Prepaid", "city": "Dhamtari Chhattisgarh", "pin": "493773", "phone": "7489959569"},
    # 6. Shivaji Janardan Kadam
    {"name": "शिवाजी जनार्दन कदम (Shivaji Kadam)", "indices": [37, 38], "product": "5 capsule", "amount": 1250, "mode": "COD", "city": "Mohol Solapur", "pin": "413213", "phone": "9657666501"},
    # 7. Uma Soundattikar
    {"name": "Uma Soundattikar", "indices": [39, 40, 41, 42], "product": "2 capsule", "amount": 650, "mode": "COD", "city": "Aurangabad", "pin": "", "phone": "9130666799"},
    # 8. Prof Prasad Joshi
    {"name": "Prof Prasad Joshi", "indices": [47, 48, 49, 50], "product": "1 capsule", "amount": 350, "mode": "Prepaid", "city": "Indira Nagar Nashik", "pin": "422009", "phone": "9673200044"},
    # 9. Sulai Nandan Therapy Sentar
    {"name": "Sulai Nandan Therapy Sentar (Dr. Agajbhiye)", "indices": [70, 71, 72, 73], "product": "10 cookies, 5 tab 120, 5 facewash, 5 oil, 5 shampoo, 10 soap, 5 kesuda small soap, 5 capsule", "amount": 6050, "mode": "COD", "city": "Parshioni Nagpur", "pin": "441105", "phone": "8007341215"},
    # 10. Tejal Medical
    {"name": "Tejal Medical", "indices": [74, 75, 76, 341, 342, 343, 364, 365, 366, 367, 368], "product": "10 oil, 5 shampoo black", "amount": 3000, "mode": "COD", "city": "Satana", "pin": "423301", "phone": "9022991045"},
    # 11. Kavita Chikane
    {"name": "Kavita Chikane", "indices": [106, 107, 108, 122, 128], "product": "2 capsule", "amount": 640, "mode": "COD", "city": "Nerul West Navi Mumbai", "pin": "400706", "phone": "9892753352"},
    # 12. Media order Seabuckthorn 4 + Spiru 2 + Ashwa 2
    {"name": "Unspecified Customer (Slip Order)", "indices": [109, 111], "product": "4 Seabuckthorn capsule, 2 Spirulina capsule, 2 Ashwagandha tab", "amount": 2200, "mode": "COD", "city": "Slip / Media", "pin": "", "phone": ""},
    # 13. Mahesh Dhandya Bhandar
    {"name": "Mahesh Dhandya Bhandar", "indices": [116, 117, 118], "product": "1 charcoal soap, 1 facepack", "amount": 300, "mode": "Prepaid", "city": "Kalwa Thane", "pin": "400605", "phone": "9372443716"},
    # 14. Ayurtech Biohackerz Private Limited
    {"name": "AYURTECH BIOHACKERZ PRIVATE LIMITED", "indices": [129, 130, 131, 132], "product": "100 bottel tab Ayurtech branded", "amount": 15000, "mode": "Prepaid", "city": "Shivane Pune", "pin": "411023", "phone": "8433723567"},
    # 15. Renuka Kotambe
    {"name": "Renuka Kotambe", "indices": [151, 152, 153, 154], "product": "Overall sagla (Oil, Shampoo, Facewash, Soap, Capsule, Cookies, Facepack, Spirulina powder)", "amount": 1350, "mode": "COD", "city": "Waluj Aurangabad", "pin": "431136", "phone": "7030270217"},
    # 16. Sanjay Bansilal Dhangar
    {"name": "Sanjay Bansilal Dhangar", "indices": [157, 245, 248], "product": "1 bride cream, 1 korean cream, 3 cookies, 2 seabuckthorn, 5 green facewash", "amount": 3500, "mode": "COD", "city": "Shirpur Dhule", "pin": "425405", "phone": "9975274536"},
    # 17. Mahesh Singh
    {"name": "Mahesh Singh", "indices": [159, 160], "product": "2 capsule", "amount": 650, "mode": "COD", "city": "Gomtinagar Lucknow", "pin": "226010", "phone": "9450396449"},
    # 18. Media order 2 120 tab + 2 bath soap (Mahavir courier)
    {"name": "Unspecified Customer (Mahavir Courier)", "indices": [178, 179, 306, 309, 310, 311, 312, 313, 315, 318, 319, 320, 322], "product": "2 120 tab, 2 bath soap", "amount": 1100, "mode": "Prepaid", "city": "Slip / Media", "pin": "", "phone": ""},
    # 19. Speed post 5 tab
    {"name": "Unspecified Customer (Speed Post)", "indices": [180, 181, 182, 183], "product": "Speed post 5 tab", "amount": 700, "mode": "COD", "city": "Speed Post", "pin": "", "phone": ""},
    # 20. Media order 120 tab 1 bottel
    {"name": "Unspecified Customer (Slip Order)", "indices": [230, 231, 232], "product": "120 tab 1 bottel", "amount": 450, "mode": "COD", "city": "Slip / Media", "pin": "", "phone": ""},
    # 21. Gorakhnath Shirsath
    {"name": "गोरखनाथ शिरसाठ (Gorakhnath Shirsath)", "indices": [234, 237], "product": "Kit @999 (1 seabuckthorn, 1 capsule, 1 cookies, 1 soap, 1 facewash, 1 shampoo)", "amount": 999, "mode": "COD", "city": "Badlapur", "pin": "421503", "phone": "7776952439"},
    # 22. Sonali Amol Pawar
    {"name": "Sonali Amol Pawar", "indices": [250, 251], "product": "1 bride cream, 1 spirulina capsule, 1 spirulina facewash, 1 green tea facewash", "amount": 1200, "mode": "COD", "city": "Indira Nagar Nasik", "pin": "422006", "phone": "9325919245"},
    # 23. Amir Merchant
    {"name": "Amir Merchant (Shobiz)", "indices": [252, 253, 255], "product": "1 spirulina capsule, 1 seabuckthorn capsule", "amount": 900, "mode": "Prepaid", "city": "Worli Mumbai", "pin": "400018", "phone": ""},
    # 24. Agricultural College / Varsha Nikam
    {"name": "Agricultural College / Varsha Nikam", "indices": [263], "product": "1 capsule", "amount": 0, "mode": "Prepaid (Collab)", "city": "Baramati Pune", "pin": "143115", "phone": "8956703444"},
    # 25. Media order 120 tab 2 bottel
    {"name": "Unspecified Customer (Slip Order)", "indices": [326, 327, 329, 330], "product": "120 tab 2 bottel", "amount": 850, "mode": "COD", "city": "Slip / Media", "pin": "", "phone": ""},
    # 26. Arogyam Naturopathy Centre
    {"name": "Arogyam Naturopathy Centre", "indices": [350, 351, 400, 401], "product": "60 bottel capsule Arogyam sticker", "amount": 9000, "mode": "Prepaid", "city": "Ashta Walwa Sangli", "pin": "416301", "phone": "9637268214"},
    # 27. Media order Seabuckthorn 5 + Spiru 60 tab 4
    {"name": "Unspecified Customer (Slip Order)", "indices": [354, 355], "product": "5 Seabuckthorn capsule, 4 60 tab spirulina", "amount": 2500, "mode": "COD", "city": "Slip / Media", "pin": "", "phone": ""},
    # 28. Tanaji Chavan
    {"name": "Tanaji Chavan", "indices": [356], "product": "spirulina powder, spirulina tab", "amount": 650, "mode": "COD", "city": "Kalewadi Pune", "pin": "411017", "phone": "7264068812"},
    # 29. Media order Capsule 1
    {"name": "Unspecified Customer (Slip Order)", "indices": [370, 371, 372], "product": "1 capsule", "amount": 350, "mode": "COD", "city": "Slip / Media", "pin": "", "phone": ""},
    # 30. Vikas Payal
    {"name": "Vikas Payal", "indices": [410, 413, 414, 415, 416, 417], "product": "1 powder", "amount": 350, "mode": "Prepaid", "city": "Khar West Mumbai", "pin": "400052", "phone": "9137805402"},
    # 31. Nandkumar Panpatte (1st order)
    {"name": "नंदकुमार पानपट्टे (Nandkumar Panpatte)", "indices": [418, 419], "product": "2 spirulina capsule, 3 spirulina tab, 2 spirulina powder", "amount": 2100, "mode": "Prepaid", "city": "Sambhajinagar Nanded", "pin": "431605", "phone": "9158778778"},
    # 32. Dr Hanuman Murlidhar Bhagat
    {"name": "Dr Hanuman Murlidhar Bhagat", "indices": [493, 494, 495, 498, 499], "product": "3 spirulina capsule, 3 weight loss capsule", "amount": 2100, "mode": "Prepaid", "city": "Malkapur Buldhana", "pin": "443102", "phone": "9011545217"},
    # 33. Renuka Rodi
    {"name": "Renuka Rodi", "indices": [513, 514, 515, 517, 519], "product": "1 capsule, 1 tab, 2 cookies", "amount": 550, "mode": "COD", "city": "Tisgaon Waluj Aurangabad", "pin": "431136", "phone": "7030270217"},
    # 34. Laxman Nandrekar
    {"name": "Laxman Nandrekar", "indices": [529, 530, 532], "product": "1 60 tab spirulina, 1 60 tab moringa, 1 60 tab Ashwagandha, samples, 1 soap", "amount": 1000, "mode": "Prepaid", "city": "Nandre Miraj Sangli", "pin": "416416", "phone": "9637992915"},
    # 35. New Mauli Distributor - Kapil Ingle
    {"name": "New Mauli Distributor (Kapil Ingle)", "indices": [549, 550, 551], "product": "5 oil", "amount": 1000, "mode": "Prepaid", "city": "Kanchanwadi Aurangabad", "pin": "431005", "phone": "9359335154"},
    # 36. Chiana Mondol
    {"name": "Chiana Mondol", "indices": [569], "product": "1 seabuckthorn capsule", "amount": 450, "mode": "COD", "city": "Kharagpur West Bengal", "pin": "721305", "phone": ""},
    # 37. Mayuri Shamkant Baviskar
    {"name": "Mayuri Shamkant Baviskar", "indices": [570, 571, 572], "product": "1 shampoo conditioner & 1 oil", "amount": 500, "mode": "Prepaid", "city": "ABC Chowk Pune", "pin": "411002", "phone": "9545510231"},
    # 38. Rajnikant C. Mehta
    {"name": "Rajnikant C. Mehta", "indices": [579, 580, 581, 583, 587], "product": "1 spirulina capsule, 1 hair oil, 1 shampoo, 1 facewash, 1 soap, 1 cookies", "amount": 700, "mode": "COD", "city": "Jamnagar Gujarat", "pin": "361008", "phone": "9327650180"},
    # 39. Himanshu Gosai Shivam
    {"name": "Himanshu Gosai Shivam", "indices": [591, 592, 593, 594, 595], "product": "1 seabuckthorn, 1 120 tab spirulina", "amount": 850, "mode": "COD", "city": "Palanpur Gujarat", "pin": "385001", "phone": "9723166293"},
    # 40. Shivaji Yadav
    {"name": "शिवाजी यादव (Shivaji Yadav)", "indices": [613, 614, 615, 616, 617], "product": "1 120 tab spirulina", "amount": 450, "mode": "Prepaid", "city": "Koparkhairane Navi Mumbai", "pin": "400709", "phone": "9821870977"},
    # 41. Order at 8080490423
    {"name": "Unspecified Customer (8080490423)", "indices": [619, 620], "product": "1 120 tab spirulina", "amount": 450, "mode": "COD", "city": "Slip / Media", "pin": "", "phone": "8080490423"},
    # 42. Madan Mohan Chauhan
    {"name": "Madan Mohan Chauhan", "indices": [625, 633], "product": "1 120 Tab", "amount": 450, "mode": "COD", "city": "Barshi Solapur", "pin": "413411", "phone": "9422647413"},
    # 43. Nandkumar Panpatte (2nd order)
    {"name": "नंदकुमार पानपट्टे (Nandkumar Panpatte)", "indices": [627, 628], "product": "1 120 tab spirulina", "amount": 450, "mode": "Prepaid", "city": "Sambhajinagar Nanded", "pin": "431605", "phone": "9158778778"},
    # 44. Smita Singh (Kamala Spirulina)
    {"name": "Smita Singh (Kamala Spirulina)", "indices": [674, 675, 676, 677], "product": "20 tab with Kamala Spirulina sticker", "amount": 3000, "mode": "Prepaid", "city": "Dombivli East", "pin": "421201", "phone": "9323687724"},
    # 45. Dr A P Ilme (Sample)
    {"name": "Dr A P ilme (Sample)", "indices": [738, 739, 740], "product": "Sample kit (1 oil, facewash, 1 capsule, 1 shampoo, moringa, 1 soap)", "amount": 0, "mode": "Sample / Free", "city": "Nagpur", "pin": "440017", "phone": "9960303523"},
    # 46. Hemant Arvind Saptarshi
    {"name": "Hemant Arvind Saptarshi", "indices": [742, 743], "product": "2 bottles 120 tab, 1 bottle 60 tab", "amount": 1150, "mode": "Prepaid", "city": "Dhayari Phata Pune", "pin": "411041", "phone": "8237644993"}
]

print(f"Total Yash Orders: {len(yash_order_groups)}")
