import fs from 'fs';

const content = fs.readFileSync('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'utf8');

// Regex for WhatsApp message start: DD/MM/YYYY, HH:MM - Sender: Message
const msgRegex = /^(\d{2}\/\d{2}\/\d{4}),\s*(\d{1,2}:\d{2}(?:\s*[ap]m)?)\s*-\s*([^:]+):\s*([\s\S]*?)(?=(?:^\d{2}\/\d{2}\/\d{4},\s*\d{1,2}:\d{2})|\Z)/gm;

const messages = [];
let match;

while ((match = msgRegex.exec(content)) !== null) {
  const dateStr = match[1]; // DD/MM/YYYY
  const timeStr = match[2];
  const sender = match[3].trim();
  const text = match[4].trim();

  // Check if date is in October 2026
  if (dateStr.endsWith('/10/2026')) {
    messages.push({
      dateStr,
      timeStr,
      sender,
      text
    });
  }
}

console.log(`Total messages in October 2026: ${messages.length}`);

// Get all senders in October 2026
const senderCounts = {};
messages.forEach(m => {
  senderCounts[m.sender] = (senderCounts[m.sender] || 0) + 1;
});
console.log('\nSenders in October 2026:');
console.log(senderCounts);

fs.writeFileSync('scripts/october_whatsapp_messages.json', JSON.stringify(messages, null, 2), 'utf8');
