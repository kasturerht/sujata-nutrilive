import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

// Group by sender
const bySender = {};
msgs.forEach(m => {
  if (!bySender[m.sender]) bySender[m.sender] = [];
  bySender[m.sender].push(m);
});

console.log('=== SENDER SAMPLES IN OCTOBER 2026 ===\n');

for (const [sender, list] of Object.entries(bySender)) {
  console.log(`\n========================================`);
  console.log(`SENDER: ${sender} (Total: ${list.length} messages)`);
  console.log(`========================================`);
  // Print first 3 and last 3 samples
  const samples = list.slice(0, 3).concat(list.slice(-3));
  samples.forEach((s, idx) => {
    console.log(`--- [Sample ${idx + 1}] ${s.dateStr} ${s.timeStr} ---`);
    console.log(s.text.slice(0, 250) + (s.text.length > 250 ? '...' : ''));
  });
}
