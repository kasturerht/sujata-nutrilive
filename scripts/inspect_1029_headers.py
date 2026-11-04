import imaplib
import email
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import fs_env
user, pwd = fs_env.get_gmail_creds()

mail = imaplib.IMAP4_SSL("imap.gmail.com")
mail.login(user, pwd)
mail.select('"[Gmail]/All Mail"', readonly=True)

status, data = mail.search(None, 'SUBJECT "1029"')
if status == 'OK' and data[0]:
    mid = data[0].split()[-1]
    status, mdata = mail.fetch(mid, '(RFC822)')
    msg = email.message_from_bytes(mdata[0][1])
    print("=== ORDER #1029 HEADERS ===")
    print("From:", msg.get("From"))
    print("To:", msg.get("To"))
    print("Delivered-To:", msg.get("Delivered-To"))
    print("Date:", msg.get("Date"))
    print("Subject:", msg.get("Subject"))
    print("X-Shopify-Notification-Id:", msg.get("X-Shopify-Notification-Id"))
    print("Message-ID:", msg.get("Message-ID"))

mail.logout()
