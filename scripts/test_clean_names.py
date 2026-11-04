import re, sys
sys.stdout.reconfigure(encoding='utf-8')

test_names = [
    ("चनबसप्पा विठोबा आलुरे  मु.पोस्ट होटगी गाव पटणे गल्ली चौडेश्वरी मंदिराजवळ होटगी गाव तालुका दक्षिण सोलापूर जिल्हा सोलापूर पिन   कोड 413215", "चनबसप्पा विठोबा आलुरे"),
    ("आत्मजः नूरा, पांधी का पार, पांधी का पार, बाड़मेर, राजस्थान - 344502", "नूरा"),
    ("नाव -विद्याधर खडकीकर", "विद्याधर खडकीकर"),
    ("Parinda chheda", "Parinda Chheda"),
    ("Dr. Janardan k pagar", "Dr. Janardan K Pagar")
]

def clean_name_smart(line):
    # Strip prefix
    line = re.sub(r'^(?:Name|नाव|Customer\s*Name|Client|आत्मजः)\s*[:=-]?\s*', '', line, flags=re.I).strip()
    # Split on address triggers
    parts = re.split(r'(?:Address|पत्ता|Mob|Ph|Pin|Contact|District|मु\s*पोस्ट|मु\.\s*पो|मुक्काम|तालुका|जिल्हा|पांधी\s*का\s*पार|प्लॉट)', line, flags=re.I)
    name = parts[0].strip('.,-:#* ')
    return name

for raw, expected in test_names:
    res = clean_name_smart(raw)
    print(f"Raw: {raw[:40]}... -> Extracted: {res} (Expected: {expected})")
