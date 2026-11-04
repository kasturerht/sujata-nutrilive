import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Let's inspect Yash's candidates carefully:
# We have identified 47 candidate entries for Yash.
# Let's write a script to evaluate each one and verify if it was:
# 1. A valid unique order
# 2. A repost/duplicate (e.g. Pradeep Nirmal reposted, Arogyam reposted, Tejal Medical reposted)
# 3. A cancellation (e.g. Pradeep Baburao Patil Jamner COD 650 cancelled, Smita Singh 1st attempt cancelled, Sudha Mandage cancelled/office visit)
# 4. Media slip orders (what details exist for them)
