# scripts/filter_strings.py
import json

with open("scripts/gmb_rpc_responses.json", "r", encoding="utf-8") as f:
    data = json.load(f)

body = data[0]["body"]
if body.startswith(")]}'"):
    body = body[4:].strip()

parsed = json.loads(body)

found_strings = []
def search_strings(obj):
    if isinstance(obj, str):
        if not obj.startswith("http") and not obj.startswith("0x") and not obj.startswith("2ah"):
            found_strings.append(obj)
    elif isinstance(obj, list):
        for x in obj:
            search_strings(x)
    elif isinstance(obj, dict):
        for k, v in obj.items():
            search_strings(v)

search_strings(parsed)
print(f"Total strings: {len(found_strings)}")
for i, s in enumerate(found_strings):
    if len(s) > 3 and not s.startswith("CAE") and not s.startswith("CiA"):
        print(f"{i}: {s}")
