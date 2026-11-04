import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

DEVNAGARI_DIGITS = str.maketrans('०१२३४५६७८९', '0123456789')
def clean(text):
    return text.translate(DEVNAGARI_DIGITS)

def normalize_line_spaces(text):
    lines = []
    for line in text.split('\n'):
        # collapse spaces between digits inside a line only
        l = line
        while re.search(r'(\d)[ \t]+(\d)', l):
            l = re.sub(r'(\d)[ \t]+(\d)', r'\1\2', l)
        lines.append(l)
    return '\n'.join(lines)

def extract_phone(text):
    t = normalize_line_spaces(clean(text))
    # Find all 10-digit numbers starting with 6-9
    m = re.findall(r'(?:\+?91[\s-]?)?([6-9]\d{9})\b', t)
    if m: return m[0]
    m = re.findall(r'\b([6-9]\d{9})\b', t)
    if m: return m[0]
    m = re.findall(r'(?:\+?91[\s-]?)?([6-9]\d{8,9})\b', t)
    if m: return m[0]
    return ""

def extract_pincode(text):
    t = normalize_line_spaces(clean(text))
    m = re.search(r'(?:pin|pincode|code|पिन|पिनकोड)[\s:.-]*([1-9]\d{5})\b', t, re.IGNORECASE)
    if m: return m.group(1)
    all_pins = re.findall(r'\b([1-9]\d{5})\b', t)
    filtered = [p for p in all_pins if not re.search(r'\d' + p, t) and not re.search(p + r'\d', t)]
    if filtered: return filtered[-1]
    return ""

samples = [
    "Rahul handa\n607, amber building,  rto, suresh nagar andheri west Mumbai 400053\n90824 11721\n2 bottles of sea buckthorn \n850/- COD",
    "श्रीनिवास सुरेश भास्करे \nमुक्काम पोस्ट वेळापूर तालुका माळशिरस जिल्हा सोलापूर पनासे वस्ती पुणे पंढरपूर रोड पिन कोड 41 31 13 \nमोबाईल नंबर 95 61 741 739\n950/- COD",
    "Dr. Rajkumar Rangari. Shankar Nagar Akot road Akola. 444003. Maharashtra.. 9921186248",
    "शिवाजी जनार्दन कदम \nराहणार कातेवाडी पोस्ट \nसय्यद वरवडे तालुका मोहोळ जिल्हा सोलापूर 413 213\n96 57 66 65 01\n120 - 60 combo\n850/- COD",
    "Mrs.Naseema A.Kader ( 98190 04866 )\n Address -Plot no.46 - 55.Chadda Crescent CHS,\n B-1 / 206, Sector-17, \nBeside Grain Merchent CHS. Vashi, Navi Mumbai-400 703."
]

for s in samples:
    print(f"Text: {s.splitlines()[0]}")
    print(f"Phone: {extract_phone(s)} | Pin: {extract_pincode(s)}")
    print("-" * 40)
