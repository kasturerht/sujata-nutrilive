# scripts/check_verification_date.py
import json
import re

with open("scripts/gmb_rpc_responses.json", "r", encoding="utf-8") as f:
    data = json.load(f)

body = data[0]["body"]
if body.startswith(")]}'"):
    body = body[4:].strip()

parsed = json.loads(body)

# Search for any dates or timestamps
found_dates = []

def search_dates(obj):
    if isinstance(obj, str):
        # look for year, month, or ago
        if any(w in obj.lower() for w in ['month', 'year', 'verified', 'created', 'date', '2024', '2025', '2026']):
            found_dates.append(obj)
    elif isinstance(obj, list):
        for x in obj:
            search_dates(x)
    elif isinstance(obj, dict):
        for k, v in obj.items():
            search_dates(v)

search_dates(parsed)

print(f"Found {len(found_dates)} date-related strings:")
for d in found_dates[:20]:
    print(" -", d)
