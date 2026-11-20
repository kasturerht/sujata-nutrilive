import json

with open('scripts/meta_oct_nov_daywise.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for r in data:
    if float(r.get('spend', 0)) > 300:
        print(f"{r['date_start']} | {r['campaign_name']} | Spend: ₹{r['spend']}")
        for a in r.get('actions', []):
            print(f"   {a['action_type']}: {a['value']}")
        break
