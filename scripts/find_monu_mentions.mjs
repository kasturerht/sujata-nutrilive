import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

msgs.forEach(m => {
  if (m.text.toLowerCase().includes('monu')) {
    console.log(`${m.dateStr} ${m.timeStr} | ${m.sender}:`);
    console.log(m.text);
    console.log('---');
  }
});
