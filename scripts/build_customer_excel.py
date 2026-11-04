import json
import re
import os
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Load October messages
with open('scripts/october_whatsapp_messages.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

# Load verified orders metadata to get exact message indices for each caller
with open('scripts/verified_october_telecaller_orders.json', 'r', encoding='utf-8') as f:
    verified_data = json.load(f)

# Mapping of sender to caller
callers_map = {
    'Sujata Nutrilve Vaishnavi Diwate': 'Vaishnavi Diwate',
    'Sujata Nutrilive Manju': 'Manjushree Kasture',
    'Sujata Nutrilive Agrotech Punam kasture': 'Punam Kasture',
    'Karishma Patil Sujata Nutrilive': 'Karishma Patil',
    'Sujata Nutrilive': 'Monu'
}

# We need the verified indices for each caller
caller_valid_indices = {}
caller_order_meta = {}

for caller_key, info in verified_data.items():
    if caller_key == 'Manjushree Kasture':
        orders = info['directOrders'] + info['webOrders']
    else:
        orders = info.get('orders', [])
    
    caller_valid_indices[caller_key] = set(o['idx'] for o in orders)
    for o in orders:
        caller_order_meta[(caller_key, o['idx'])] = o

print("Loaded verified order indices.")
