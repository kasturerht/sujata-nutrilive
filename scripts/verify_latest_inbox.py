import imaplib
import email
from email.header import decode_header
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import fs_env

user, pwd = fs_env.get_gmail_creds()
mail = imaplib.IMAP4_SSL('imap.gmail.com')
mail.login(user, pwd)
mail.select('INBOX', readonly=True)

status, data = mail.search(None, 'ALL')
msg_ids = data[0].split()
print("Latest 3 in INBOX:")
for mid in msg_ids[-3:]:
    s, mdata = mail.fetch(mid, '(RFC822.HEADER)')
    m = email.message_from_bytes(mdata[0][1])
    subj_raw = m.get("Subject", "")
    decoded_parts = decode_header(subj_raw)
    subj_str = "".join([
        part.decode(enc or 'utf-8', errors='ignore') if isinstance(part, bytes) else str(part)
        for part, enc in decoded_parts
    ])
    print(f"- Subj: {subj_str} | Date: {m.get('Date')} | From: {m.get('From')}")

mail.logout()
