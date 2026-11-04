import imaplib
import email
import sys
import io
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import fs_env

user, pwd = fs_env.get_gmail_creds()
mail = imaplib.IMAP4_SSL('imap.gmail.com')
mail.login(user, pwd)
mail.select('"[Gmail]/All Mail"', readonly=True)

status, data = mail.search(None, 'SUBJECT "1029"')
msg_ids = data[0].split()
print("Found IDs for 1029:", msg_ids)

if msg_ids:
    status, mdata = mail.fetch(msg_ids[-1], '(RFC822)')
    msg = email.message_from_bytes(mdata[0][1])
    print("Subject:", msg.get("Subject"))
    print("From:", msg.get("From"))
    print("To:", msg.get("To"))
    
    for part in msg.walk():
        if part.get_content_type() == 'text/html':
            html = part.get_payload(decode=True).decode('utf-8', errors='ignore')
            with open('scripts/shopify_email_1029_template.html', 'w', encoding='utf-8') as f:
                f.write(html)
            print("Saved HTML, length:", len(html))
            break

mail.logout()
