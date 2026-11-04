import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));

// Check each caller's messages thoroughly
for (const caller of ['Manjushree Kasture', 'Punam Kasture', 'Karishma Patil', 'Monu']) {
  const msgs = data[caller];
  console.log(`\n=======================================================`);
  console.log(`=== AUDITING: ${caller} (${msgs.length} messages) ===`);
  console.log(`=======================================================`);

  for (const m of msgs) {
    const text = m.text.replace(/\r?\n/g, ' \\n ');
    console.log(`[${m.idx}] ${m.date} ${m.time}: ${text}`);
  }
}
