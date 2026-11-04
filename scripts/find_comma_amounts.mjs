import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

for (let i = 0; i < msgs.length; i++) {
  const m = msgs[i];
  if (/\d,\d{3}/.test(m.text)) {
    console.log(`[${i}] ${m.sender} (${m.dateStr}):`);
    console.log(m.text.replace(/\r?\n/g, ' \\n '));
    console.log('---');
  }
}
