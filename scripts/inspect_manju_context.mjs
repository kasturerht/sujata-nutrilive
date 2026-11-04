import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

console.log('=== CONTEXT AROUND MANJU 110 (26/10/2026 ~15:00-16:00) ===');
for (const m of msgs) {
  if (m.dateStr === '26/10/2026' && m.timeStr >= '15:20' && m.timeStr <= '16:00') {
    console.log(`${m.dateStr} ${m.timeStr} [${m.sender}]: ${m.text.replace(/\r?\n/g, ' ')}`);
  }
}

console.log('\n=== CONTEXT AROUND MANJU 133 & 134 (29/10/2026 ~16:00-18:00) ===');
for (const m of msgs) {
  if (m.dateStr === '29/10/2026' && m.timeStr >= '16:00' && m.timeStr <= '18:00') {
    console.log(`${m.dateStr} ${m.timeStr} [${m.sender}]: ${m.text.replace(/\r?\n/g, ' ')}`);
  }
}
