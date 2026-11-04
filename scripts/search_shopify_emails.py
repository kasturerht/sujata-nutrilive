import imaplib
import email
from email.header import decode_header
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import fs_env
user, pwd = fs_env.get_gmail_creds()

mail = imaplib.IMAP4_SSL("imap.gmail.com")
mail.login(user, pwd)

def search_query(q):
    print(f"\n=== Searching for query: {q} across [Gmail]/All Mail ===")
    mail.select('"[Gmail]/All Mail"', readonly=True)
    status, data = mail.search(None, q)
    if status != 'OK':
        print("Search failed")
        return
    msg_ids = data[0].split()
    print(f"Total matching messages: {len(msg_ids)}")
    for mid in msg_ids[-10:]:
        status, mdata = mail.fetch(mid, '(RFC822.HEADER)')
        if status != 'OK': continue
        msg = email.message_from_bytes(mdata[0][1])
        subj_raw = msg.get("Subject", "")
        decoded_parts = decode_header(subj_raw)
        subj_str = "".join([
            part.decode(enc or 'utf-8', errors='ignore') if isinstance(part, bytes) else str(part)
            for part, enc in decoded_parts
        ])
        sender = msg.get("From", "")
        date = msg.get("Date", "")
        to = msg.get("To", "")
        print(f"- Date: {date} | From: {sender} | Subj: {subj_str}")

search_query('FROM "shopify"')
search_query('SUBJECT "1030"')
search_query('SUBJECT "1029"')
search_query('SUBJECT "1028"')
search_query('FROM "razorpay"')

mail.logout()
