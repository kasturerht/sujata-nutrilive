# scripts/check_gmail_rejection.py
import imaplib
import email
from email.header import decode_header
import sys

GMAIL_USER = "sujatanutrilive@gmail.com"
GMAIL_PASS = "ysla kiuk wjju kbct"

def clean_subject(subj):
    if not subj:
        return ""
    decoded_list = decode_header(subj)
    res = ""
    for decoded, charset in decoded_list:
        if isinstance(decoded, bytes):
            res += decoded.decode(charset or 'utf-8', errors='ignore')
        else:
            res += str(decoded)
    return res

def main():
    print(f"Connecting to imap.gmail.com for {GMAIL_USER}...")
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(GMAIL_USER, GMAIL_PASS)
        print("Logged in successfully!")

        mail.select("INBOX")

        # Search for emails mentioning google or api or business profile or allowlist or case
        status, messages = mail.search(None, '(OR (FROM "google") (SUBJECT "Google"))')
        print(f"Found {len(messages[0].split())} emails matching Google.")

        email_ids = messages[0].split()
        # Let's inspect the latest 30 emails
        recent_ids = email_ids[-30:] if len(email_ids) > 30 else email_ids
        recent_ids.reverse()

        matching_emails = []

        for eid in recent_ids:
            res, msg_data = mail.fetch(eid, "(RFC822.HEADER)")
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subj = clean_subject(msg.get("Subject"))
                    sender = clean_subject(msg.get("From"))
                    date = msg.get("Date")
                    
                    if any(k in subj.lower() for k in ["business", "profile", "api", "case", "allowlist", "cloud", "project", "reject", "access"]):
                        matching_emails.append((eid, subj, sender, date))

        print(f"\nFound {len(matching_emails)} relevant emails:")
        for eid, subj, sender, date in matching_emails:
            print(f"ID {eid.decode()}: [{date}] From: {sender} | Subj: {subj}")

        # Fetch and dump full body of matching emails
        for eid, subj, sender, date in matching_emails:
            res, full_data = mail.fetch(eid, "(RFC822)")
            for part in full_data:
                if isinstance(part, tuple):
                    full_msg = email.message_from_bytes(part[1])
                    body = ""
                    if full_msg.is_multipart():
                        for p in full_msg.walk():
                            if p.get_content_type() == "text/plain":
                                body += p.get_payload(decode=True).decode('utf-8', errors='ignore')
                    else:
                        body = full_msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                        
                    print(f"\n=======================================================")
                    print(f"MAIL DETAILS: {subj} ({date})")
                    print(f"=======================================================")
                    print(body[:2000])

        mail.close()
        mail.logout()

    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
