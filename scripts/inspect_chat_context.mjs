import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

// Look at messages on 05/10/2026 around 17:00-18:00 and 06/10/2026 11:00-14:00
for (const m of msgs) {
  if (m.dateStr === '05/10/2026' && m.timeStr >= '17:00' && m.timeStr <= '17:30') {
    console.log(m.dateStr + ' ' + m.timeStr + ' [' + m.sender + ']: ' + m.text.replace(/\r?\n/g, ' '));
  }
  if (m.dateStr === '06/10/2026' && m.timeStr >= '11:00' && m.timeStr <= '14:00') {
    console.log(m.dateStr + ' ' + m.timeStr + ' [' + m.sender + ']: ' + m.text.replace(/\r?\n/g, ' '));
  }
}
