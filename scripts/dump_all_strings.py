# scripts/dump_all_strings.py
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
        found_strings.append(obj)
    elif isinstance(obj, list):
        for x in obj:
            search_strings(x)
    elif isinstance(obj, dict):
        for k, v in obj.items():
            search_strings(v)

search_strings(parsed)

with open("scripts/place_all_strings.txt", "w", encoding="utf-8") as f:
    for i, s in enumerate(found_strings):
        f.write(f"{i}: {s}\n")

print(f"Dumped {len(found_strings)} strings to scripts/place_all_strings.txt")
