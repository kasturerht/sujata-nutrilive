import os
import zipfile
import shutil

zip_path = r'C:\Users\Admin\Downloads\Daily orders dispatch  (9).zip'
dest_raw_zip = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\raw_zips\Daily orders dispatch  (9).zip'
extract_dir = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\raw_chats\21_november'

os.makedirs(os.path.dirname(dest_raw_zip), exist_ok=True)
os.makedirs(extract_dir, exist_ok=True)

# Copy zip
shutil.copy2(zip_path, dest_raw_zip)
print(f"Copied zip to {dest_raw_zip}")

# Extract
with zipfile.ZipFile(zip_path, 'r') as z:
    z.extractall(extract_dir)
print(f"Extracted to {extract_dir}")
