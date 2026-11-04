# scripts/fetch_place_rpc.py
import urllib.request
import json
import re

url = "https://www.google.com/maps/preview/place?authuser=0&hl=en&gl=in&pb=!1m18!1s0x3bddeb29853bf1b7:0x19c8b835beec9b8f!2m2!1d20.196791!2d73.7183639!3m1!3e1!4m2!1s0x3bddeb29853bf1b7:0x19c8b835beec9b8f!7e81"

req = urllib.request.Request(
    url,
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Referer": "https://www.google.com/maps/"
    }
)

try:
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8', errors='ignore')
        print(f"Response length: {len(content)}")
        with open("scripts/place_raw.txt", "w", encoding="utf-8") as f:
            f.write(content)
        
        # Remove magic prefix if any like ")]}'"
        clean_content = content
        if clean_content.startswith(")]}'"):
            clean_content = clean_content[4:].strip()
            
        print("First 500 chars of response:")
        print(clean_content[:500])
except Exception as e:
    print("Error:", e)
