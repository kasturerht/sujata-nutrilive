# scripts/inspect_place_response.py
import json

with open("scripts/gmb_rpc_responses.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Number of responses: {len(data)}")
for i, item in enumerate(data):
    url = item["url"]
    body = item["body"]
    print(f"\n--- Item {i}: {url[:100]} ---")
    if body.startswith(")]}'"):
        body = body[4:].strip()
    try:
        parsed = json.loads(body)
        print("Successfully parsed as JSON!")
        # Let's search recursively for string items that look like names or reviews
        found_strings = []
        def search_strings(obj):
            if isinstance(obj, str):
                if len(obj) > 10 and not obj.startswith("http") and not obj.startswith("0x"):
                    found_strings.append(obj)
            elif isinstance(obj, list):
                for x in obj:
                    search_strings(x)
            elif isinstance(obj, dict):
                for k, v in obj.items():
                    search_strings(v)
        search_strings(parsed)
        print(f"Found {len(found_strings)} strings:")
        for s in found_strings[:30]:
            print(f" - {s}")
    except Exception as e:
        print("JSON parse error:", e)
        print("Raw snippet:", body[:500])
