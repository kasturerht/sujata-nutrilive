import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

// Filter only messages from "Sujata Nutrilive"
const snMsgs = msgs.filter(m => m.sender === 'Sujata Nutrilive');
console.log(`Total messages from 'Sujata Nutrilive': ${snMsgs.length}`);

// Print some samples of orders posted by "Sujata Nutrilive"
snMsgs.slice(0, 15).forEach((m, idx) => {
  console.log(`--- [SN ${idx + 1}] ${m.dateStr} ${m.timeStr} ---`);
  console.log(m.text);
});
