
import imaplib
import email
from email.header import decode_header
import datetime

user = "sujatanutrilive@gmail.com"
pwd = "ysla kiuk wjju kbct"

mail = imaplib.IMAP4_SSL("imap.gmail.com")
mail.login(user, pwd)

def check_folder(folder_name):
    print(f"\n=== Checking folder: {folder_name} ===")
    status, count = mail.select(f'"{folder_name}"', readonly=True)
    if status != 'OK':
        print(f"Could not open {folder_name}")
        return
    
    # Search for messages since yesterday
    date_str = (datetime.date.today() - datetime.timedelta(days=1)).strftime("%d-%b-%Y")
    status, data = mail.search(None, f'(SINCE "{date_str}")')
    if status != 'OK':
        print("Search failed")
        return
    
    msg_ids = data[0].split()
    print(f"Total messages found since yesterday: {len(msg_ids)}")
    
    for mid in msg_ids[-10:]:
        status, mdata = mail.fetch(mid, '(RFC822.HEADER)')
        if status != 'OK': continue
        msg = email.message_from_bytes(mdata[0][1])
        subj, encoding = decode_header(msg.get("Subject", ""))[0]
        if isinstance(subj, bytes):
            subj = subj.decode(encoding or "utf-8", errors="ignore")
        sender = msg.get("From", "")
        date = msg.get("Date", "")
        print(f"- [{folder_name}] Date: {date} | From: {sender[:40]} | Subj: {subj[:60]}")

check_folder("INBOX")
check_folder("[Gmail]/Spam")
check_folder("[Gmail]/All Mail")

mail.logout()
