import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import fs_env

user, pwd = fs_env.get_gmail_creds()

def send_test():
    msg = MIMEMultipart()
    msg['From'] = f"Sujata Order Sentinel <{user}>"
    msg['To'] = "sujatanutrilive@gmail.com"
    msg['Subject'] = "🧪 [System Check] Sujata Nutrilive Direct Order Notification Engine"

    body = """Hello Team Sujata!
This is a direct automated order notification test.
Your Gmail SMTP credentials are 100% active and working.
Every future order can be delivered instantly here!"""
    msg.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(user, pwd)
        server.send_message(msg)
    print("SUCCESS: Test email delivered directly to sujatanutrilive@gmail.com via SMTP!")

send_test()
