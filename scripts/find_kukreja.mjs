import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

for (const m of msgs) {
  if (m.text.toLowerCase().includes('kukreja') || m.text.toLowerCase().includes('saurabh')) {
    console.log(m.dateStr + ' ' + m.timeStr + ' [' + m.sender + ']: ' + m.text.replace(/\r?\n/g, ' '));
  }
}
