import imaplib
import email
from email.header import decode_header
import sys
import io

# Set stdout to UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import fs_env
user, pwd = fs_env.get_gmail_creds()

mail = imaplib.IMAP4_SSL("imap.gmail.com")
mail.login(user, pwd)

def check_folder(folder_name):
    print(f"\n=== Checking folder: {folder_name} ===")
    status, count = mail.select(f'"{folder_name}"', readonly=True)
    if status != 'OK':
        print(f"Could not open {folder_name}")
        return
    
    status, data = mail.search(None, 'ALL')
    if status != 'OK':
        return
    
    msg_ids = data[0].split()
    print(f"Total messages in {folder_name}: {len(msg_ids)}")
    
    for mid in msg_ids[-10:]:
        status, mdata = mail.fetch(mid, '(RFC822.HEADER)')
        if status != 'OK': continue
        msg = email.message_from_bytes(mdata[0][1])
        subj_raw = msg.get("Subject", "")
        decoded_parts = decode_header(subj_raw)
        subj_str = ""
        for part, enc in decoded_parts:
            if isinstance(part, bytes):
                subj_str += part.decode(enc or 'utf-8', errors='ignore')
            else:
                subj_str += str(part)
        sender = msg.get("From", "")
        date = msg.get("Date", "")
        to = msg.get("To", "")
        print(f"- Date: {date}\n  From: {sender}\n  To: {to}\n  Subject: {subj_str}\n")

check_folder("[Gmail]/Spam")
check_folder("INBOX")

mail.logout()
