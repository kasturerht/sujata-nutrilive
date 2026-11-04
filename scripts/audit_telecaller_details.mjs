import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

const callers = {
  'Sujata Nutrilve Vaishnavi Diwate': 'Vaishnavi Diwate',
  'Sujata Nutrilive Manju': 'Manjushree Kasture',
  'Sujata Nutrilive Agrotech Punam kasture': 'Punam Kasture',
  'Karishma Patil Sujata Nutrilive': 'Karishma Patil',
  'Sujata Nutrilive': 'Monu'
};

// Let's inspect each caller's messages
for (const [sender, name] of Object.entries(callers)) {
  const callerMsgs = msgs.filter(m => m.sender === sender);
  console.log(`\n==================================================`);
  console.log(`AUDIT FOR: ${name} (${callerMsgs.length} messages)`);
  console.log(`==================================================`);

  let orderCount = 0;
  let chatterCount = 0;

  for (let i = 0; i < callerMsgs.length; i++) {
    const m = callerMsgs[i];
    const text = m.text.trim();

    // Check if it looks like an order (address / product / amount / phone)
    const hasPhone = /\b(?:[6-9]\d{9}|[6-9]\d{4}\s*\d{5})\b/.test(text) || /\b\d{5}\s*\d{5}\b/.test(text) || /\+91\s*\d+/.test(text) || /phone|mob|mo\.|mb/i.test(text);
    const hasProduct = /(?:spirulina|buckthorn|sea\s*buckthorn|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3)/i.test(text);
    const hasPayment = /(?:cod|prepaid|advance|paid|\/-|rs\.?|inr|₹)/i.test(text);
    const hasPincode = /\b(?:pin|pincode|post)\s*[-:]?\s*\d{6}\b/i.test(text) || /\b\d{6}\b/.test(text);

    const isOrderLike = (hasPhone && (hasProduct || hasPayment || hasPincode)) || (hasProduct && hasPayment && hasPincode);

    if (!isOrderLike) {
      chatterCount++;
      // Let's print chatter to make sure no real order was skipped
      console.log(`[CHATTER #${chatterCount}] ${m.dateStr} ${m.timeStr}: ${text.replace(/\n/g, ' ')}`);
    } else {
      orderCount++;
    }
  }

  console.log(`\nSummary for ${name}: Orders = ${orderCount}, Chatter = ${chatterCount}`);
}
