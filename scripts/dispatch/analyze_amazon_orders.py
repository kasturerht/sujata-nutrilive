import json

with open('scripts/amazon_orders_oct_nov.json', 'r', encoding='utf-8') as f:
    amz_orders = json.load(f)

print(f"Total Amazon orders from SP-API: {len(amz_orders)}")

shipped = [o for o in amz_orders if o['OrderStatus'] != 'Canceled']
canceled = [o for o in amz_orders if o['OrderStatus'] == 'Canceled']
print(f"Shipped: {len(shipped)} | Canceled: {len(canceled)}")

oct_shipped = [o for o in shipped if o['PurchaseDate'].startswith('2026-10')]
nov_shipped = [o for o in shipped if o['PurchaseDate'].startswith('2026-11')]

oct_rev = sum(float(o.get('OrderTotal', {}).get('Amount', 0)) for o in oct_shipped)
nov_rev = sum(float(o.get('OrderTotal', {}).get('Amount', 0)) for o in nov_shipped)

print(f"October Amazon Shipped: {len(oct_shipped)} orders | Rev: ₹{oct_rev:,.2f}")
print(f"November Amazon Shipped: {len(nov_shipped)} orders | Rev: ₹{nov_rev:,.2f}")
print(f"Total Amazon Shipped: {len(shipped)} orders | Rev: ₹{(oct_rev + nov_rev):,.2f}")

# Payment mode
oct_cod = sum(1 for o in oct_shipped if 'COD' in o.get('ShipServiceLevel', '') or o.get('PaymentMethod') == 'COD')
oct_prepaid = len(oct_shipped) - oct_cod
nov_cod = sum(1 for o in nov_shipped if 'COD' in o.get('ShipServiceLevel', '') or o.get('PaymentMethod') == 'COD')
nov_prepaid = len(nov_shipped) - nov_cod
print(f"October: Prepaid={oct_prepaid}, COD={oct_cod}")
print(f"November: Prepaid={nov_prepaid}, COD={nov_cod}")

print("\nRecent 10 Amazon orders:")
for o in shipped[:10]:
    dt = o['PurchaseDate'][:10]
    oid = o['AmazonOrderId']
    amt = o.get('OrderTotal', {}).get('Amount', '0')
    city = o.get('ShippingAddress', {}).get('City', 'N/A')
    pay = 'COD' if 'COD' in o.get('ShipServiceLevel', '') else 'Prepaid'
    print(f"{dt} | {oid} | ₹{amt:6} | {pay:7} | {city}")
