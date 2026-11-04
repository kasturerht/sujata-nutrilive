import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

for (const m of msgs) {
  if (m.dateStr === '29/10/2026' && m.timeStr >= '23:30') {
    console.log(m.dateStr + ' ' + m.timeStr + ' [' + m.sender + ']: ' + m.text.replace(/\r?\n/g, ' '));
  }
  if (m.dateStr === '30/10/2026' && m.timeStr <= '11:00') {
    console.log(m.dateStr + ' ' + m.timeStr + ' [' + m.sender + ']: ' + m.text.replace(/\r?\n/g, ' '));
  }
}
