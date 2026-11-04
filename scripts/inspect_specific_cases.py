import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/april_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    messages = json.load(f)

# Let's inspect specific items:
# 1. Renuka Rodi (IDX 46-50)
# 2. Rajesh Sarnaik (IDX 141, 187, 307)
# 3. Dr. Satish Savarkar (IDX 213-214)
# 4. Roshan Raut (IDX 216-226)
# 5. Somnath Shinde (IDX 221)
# 6. Bhausaheb Ahire (IDX 249 vs 278)
# 7. Sameep Waghmare (IDX 235-237)
# 8. Dashrath Chavan (IDX 287-288)
# 9. Sujata Pise (IDX 341)
# 10. Basant Kumar Ogar (IDX 382-383)
# 11. Vishwas Bapu Powar (IDX 394-396)
# 12. Kapil Ingle / New Mauli Distributor (IDX 454-455)
# 13. Dr Ranjana (IDX 483)
# 14. Mahavir courier / IDX 491
# 15. Smart Look Beauty Clinic (IDX 501-502)
# 16. Dr Rajkumar Rangari (IDX 506-508)
# 17. RagNidan Ayurveda (IDX 388-389)

print("Checking details...")
