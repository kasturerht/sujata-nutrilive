import sys, json

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/march_whatsapp_messages_TRUE.json', 'r', encoding='utf-8') as f:
    msgs = json.load(f)

def inspect_around(idx, count_before=3, count_after=6):
    print(f"\n==================== AROUND IDX {idx} ====================")
    start = max(0, idx - count_before)
    end = min(len(msgs) - 1, idx + count_after)
    for m in msgs[start:end+1]:
        print(f"[{m['index']}] {m['timestamp']} - {m['sender']}: {m['content']}")

inspect_around(6, 2, 5) # Pradeep Nirmal 1
inspect_around(10, 2, 5) # Pradeep Nirmal 2
inspect_around(64, 2, 5) # Pradeep Nirmal 3

inspect_around(75, 2, 5) # 423301 9022991045
inspect_around(342, 2, 5)
inspect_around(366, 2, 5)

inspect_around(157, 2, 5) # Sanjay Dhangar 1
inspect_around(245, 2, 5) # Sanjay Dhangar 2

inspect_around(350, 2, 6) # Arogyam 1
inspect_around(400, 2, 6) # Arogyam 2

inspect_around(375, 2, 6) # Deepak, Shakuntala, Sandiip repeat

inspect_around(475, 2, 8) # Harish Gogad
