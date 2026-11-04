import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

console.log('=== CONTEXT AROUND MSG 26 (07/10/2026 ~15:45-16:00) ===');
for (const m of msgs) {
  if (m.dateStr === '07/10/2026' && m.timeStr >= '15:40' && m.timeStr <= '16:05') {
    console.log(m.dateStr + ' ' + m.timeStr + ' [' + m.sender + ']: ' + m.text.replace(/\r?\n/g, ' '));
  }
}

console.log('\n=== CONTEXT AROUND MSG 50 (16/10/2026 ~13:55-14:15) ===');
for (const m of msgs) {
  if (m.dateStr === '16/10/2026' && m.timeStr >= '13:50' && m.timeStr <= '14:20') {
    console.log(m.dateStr + ' ' + m.timeStr + ' [' + m.sender + ']: ' + m.text.replace(/\r?\n/g, ' '));
  }
}
