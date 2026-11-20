import re
import json

chat_file = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\raw_chats\20_november\chat.txt'
with open(chat_file, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'\[(\d{1,2}[\/\.]\d{1,2}[\/\.]\d{2,4}),\s*(\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM|am|pm)?)\]\s*([^:]+):\s*'

splits = list(re.finditer(pattern, text))
print(f'Total messages matching header: {len(splits)}')

orders = []
for i, m in enumerate(splits):
    date_str = m.group(1)
    time_str = m.group(2)
    sender = m.group(3).strip()
    
    start = m.end()
    end = splits[i+1].start() if i+1 < len(splits) else len(text)
    body = text[start:end].strip()
    
    if 'SUJATA NUTRILIVE ORDER' in body or ('Name:' in body and 'Mobile:' in body):
        orders.append({
            'raw_date': date_str,
            'time': time_str,
            'sender': sender,
            'body': body
        })

print(f'Found order messages: {len(orders)}')
for idx, o in enumerate(orders):
    lines = [l.strip() for l in o['body'].split('\n') if l.strip()]
    name = next((l.split(':', 1)[1].strip() for l in lines if l.startswith('Name:')), 'Unknown')
    mobile = next((l.split(':', 1)[1].strip() for l in lines if l.startswith('Mobile:')), 'Unknown')
    prod = next((l.split(':', 1)[1].strip() for l in lines if l.startswith('Product:')), 'Unknown')
    total = next((l.split(':', 1)[1].strip() for l in lines if l.startswith('Total Bill:')), 'Unknown')
    pay = next((l.split(':', 1)[1].strip() for l in lines if l.startswith('Payment Mode:')), 'Unknown')
    pincode = next((l.split(':', 1)[1].strip() for l in lines if l.startswith('Pincode:')), 'Unknown')
    addr = next((l.split(':', 1)[1].strip() for l in lines if l.startswith('Address:')), 'Unknown')
    print(f"{idx+1}. [{o['raw_date']} {o['time']}] {o['sender']} | Name: {name} | Mob: {mobile} | Pin: {pincode} | Pay: {pay} | Bill: {total} | Prod: {prod[:30]}")
