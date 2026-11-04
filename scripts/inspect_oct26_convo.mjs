import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

for (let i = 0; i < msgs.length; i++) {
  const m = msgs[i];
  if (m.dateStr === '26/10/2026' && m.timeStr >= '18:00' && m.timeStr <= '19:10') {
    console.log(`${m.dateStr} ${m.timeStr} [${m.sender}]: ${m.text.replace(/\r?\n/g, ' ')}`);
  }
}
