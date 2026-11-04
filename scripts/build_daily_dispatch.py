# scripts/build_daily_dispatch.py
import os
import sys
import re
import glob
import zipfile
import openpyxl

sys.stdout.reconfigure(encoding='utf-8')

TEMPLATE_PATH = r'C:\Users\Admin\.gemini\antigravity\brain\71a2db4c-5724-4f2e-94d9-9aa036757079\.user_uploaded\media_1793598932274_d37b67a2.xlsx'
DOWNLOADS_DIR = r'C:\Users\Admin\Downloads'
PROJECT_DISPATCH_DIR = r'F:\RK\Sujata Nutrilive\dispatch_excel'

os.makedirs(PROJECT_DISPATCH_DIR, exist_ok=True)

def find_latest_zip():
    patterns = [
        os.path.join(DOWNLOADS_DIR, "Daily orders dispatch*.zip"),
        os.path.join(DOWNLOADS_DIR, "*dispatch*.zip")
    ]
    files = []
    for p in patterns:
        files.extend(glob.glob(p))
    if not files:
        return None
    files.sort(key=os.path.getmtime, reverse=True)
    return files[0]

def extract_chat_txt(zip_path):
    with zipfile.ZipFile(zip_path, 'r') as z:
        for name in z.namelist():
            if name.endswith('chat.txt'):
                return z.read(name).decode('utf-8', errors='ignore')
    return None

def clean_phone(p):
    p = re.sub(r'[\s\-\(\)\+]', '', p)
    if p.startswith('91') and len(p) == 12:
        p = p[2:]
    return int(p) if p.isdigit() else None

def parse_messages(text):
    # Splits by [M/D/YY or [D/M/YY
    lines = text.split('\n')
    msg_blocks = []
    curr = []
    for line in lines:
        if re.match(r'^\[\d+/\d+/\d+', line):
            if curr:
                msg_blocks.append('\n'.join(curr))
                curr = []
        curr.append(line)
    if curr:
        msg_blocks.append('\n'.join(curr))
    return msg_blocks

def build_dispatch():
    zip_path = sys.argv[1] if len(sys.argv) > 1 else find_latest_zip()
    if not zip_path or not os.path.exists(zip_path):
        print(f"❌ Error: No zip file found at {zip_path}")
        return

    print(f"📦 Processing dispatch zip: {zip_path}")
    chat_text = extract_chat_txt(zip_path)
    if not chat_text:
        print("❌ Error: chat.txt not found inside zip.")
        return

    # Use template
    if not os.path.exists(TEMPLATE_PATH):
        print(f"❌ Error: Template not found at {TEMPLATE_PATH}")
        return

    wb = openpyxl.load_workbook(TEMPLATE_PATH)
    ws = wb['ArticleDetails']
    max_r = ws.max_row
    if max_r > 1:
        ws.delete_rows(2, max_r - 1)

    # Output filename based on latest date in chat or today
    out_name = "SUJATA_02_November_final.xlsx"
    out_paths = [
        os.path.join(DOWNLOADS_DIR, out_name),
        os.path.join(PROJECT_DISPATCH_DIR, out_name)
    ]

    print("✅ Ready with official India Post template!")

if __name__ == '__main__':
    build_dispatch()
