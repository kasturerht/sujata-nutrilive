import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

const telecallersMap = {
  'Sujata Nutrilve Vaishnavi Diwate': 'Vaishnavi Diwate',
  'Sujata Nutrilive Manju': 'Manjushree Kasture',
  'Sujata Nutrilive Agrotech Punam kasture': 'Punam Kasture',
  'Karishma Patil Sujata Nutrilive': 'Karishma Patil',
  'Sujata Nutrilive': 'Monu'
};

const ordersByTelecaller = {
  'Monu': [],
  'Vaishnavi Diwate': [],
  'Punam Kasture': [],
  'Manjushree Kasture': [],
  'Karishma Patil': [],
  'Others': []
};

// Also let's keep track of non-order messages
const otherMessages = [];

for (const m of msgs) {
  const caller = telecallersMap[m.sender] || (m.sender === 'Yash R. Suryawanshi' ? 'Yash' : 'Others');
  const text = m.text.trim();

  // Check if message is an order:
  // Must contain address/phone indicators or product keywords + price
  const hasPhone = /\b(?:[6-9]\d{9}|[6-9]\d{4}\s*\d{5})\b/.test(text) || /\b\d{5}\s*\d{5}\b/.test(text) || /\+91\s*\d+/.test(text);
  const hasPin = /\b\d{6}\b/.test(text);
  const hasProduct = /(?:spirulina|buckthorn|sea\s*buckthorn|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste)/i.test(text);
  const hasPaymentKeyword = /(?:cod|prepaid|advance|paid|gpay|phonepe|\/-)/i.test(text);

  // An order in this group is an address post with customer name, phone, product, and COD/Prepaid amount
  const isLikelyOrder = (hasPhone && (hasProduct || hasPaymentKeyword || hasPin)) || (hasProduct && hasPaymentKeyword && (hasPin || text.length > 50));

  // Exclude simple chatter, logistics status queries, or media omitted
  const isChatter = text === '<Media omitted>' || 
                    text.toLowerCase().includes('booking box') || 
                    text.toLowerCase().includes('dilivery keli ka') || 
                    text.toLowerCase().includes('lavkar pathva') ||
                    text.toLowerCase().includes('tracking number') ||
                    text.toLowerCase().includes('this message was deleted') ||
                    text.length < 25;

  if (isLikelyOrder && !isChatter) {
    // Extract amount
    let amt = 0;
    
    // Look for explicit patterns
    // e.g. "COD 999/-", "2400/- COD", "Cod: 2200/-", "Prepaid 550/-", "COD 1600", "550/-", "1000/-"
    const patterns = [
      /(?:cod|prepaid|advance|paid|rec by cod|total|amt)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i,
      /(\d{3,5})\s*\/(?:-|\s*cod|\s*prepaid)/i,
      /(?:cod|prepaid)\s*(\d{3,5})/i,
      /(\d{3,5})\s*rs/i
    ];

    for (const pat of patterns) {
      const match = text.match(pat);
      if (match) {
        const val = parseInt(match[1]);
        // Avoid pincodes like 422003, 400089 etc.
        if (val < 30000 && !(val >= 400000 && val <= 499999) && !(val >= 100000 && val <= 399999)) {
          amt = val;
          break;
        }
      }
    }

    const orderObj = {
      date: m.dateStr,
      time: m.timeStr,
      sender: m.sender,
      caller: caller,
      text: text,
      amount: amt
    };

    if (ordersByTelecaller[caller]) {
      ordersByTelecaller[caller].push(orderObj);
    } else {
      ordersByTelecaller['Others'].push(orderObj);
    }
  } else {
    otherMessages.push({
      date: m.dateStr,
      time: m.timeStr,
      sender: m.sender,
      text: text
    });
  }
}

fs.writeFileSync('scripts/parsed_telecaller_orders.json', JSON.stringify(ordersByTelecaller, null, 2), 'utf8');

console.log('=== SUMMARY OF PARSED ORDERS IN OCTOBER 2026 ===\n');

for (const [caller, list] of Object.entries(ordersByTelecaller)) {
  const totalVal = list.reduce((sum, o) => sum + o.amount, 0);
  const zeroAmtCount = list.filter(o => o.amount === 0).length;
  console.log(`👤 ${caller}:`);
  console.log(`   - Total Orders: ${list.length}`);
  console.log(`   - Total Value: ₹${totalVal}`);
  if (zeroAmtCount > 0) {
    console.log(`   - Orders without detected amount: ${zeroAmtCount}`);
  }
}
