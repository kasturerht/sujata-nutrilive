import json

with open('scripts/telecallers_all_messages_october.json', 'r', encoding='utf-8') as f:
    caller_msgs = json.load(f)

v_msgs = caller_msgs['Vaishnavi Diwate']
m_msgs = caller_msgs['Monu']

print("=== Vaishnavi #64 (Kavita Naik) ===")
print(v_msgs[63]['text'])

print("\n=== Vaishnavi #72 (Sandeep Pawar) ===")
print(v_msgs[71]['text'])

print("\n=== Monu #94 (Patel Varsha) ===")
print(m_msgs[93]['text'])
