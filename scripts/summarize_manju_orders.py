import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/manju_orders_list.txt', 'r', encoding='utf-8') as f:
    text = f.read()

orders = text.split('='*40)
print(f"Total order blocks: {len(orders)-1}")
for i, o in enumerate(orders[:-1]):
    lines = [l for l in o.strip().split('\n') if l.strip()]
    header = lines[0] if lines else ''
    first_line = lines[1] if len(lines) > 1 else ''
    last_line = lines[-1] if len(lines) > 1 else ''
    print(f"#{i+1:2d} | {header} | {first_line[:35]} | {last_line[:35]}")
