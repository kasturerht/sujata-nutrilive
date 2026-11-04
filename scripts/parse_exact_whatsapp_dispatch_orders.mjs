import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

// Telecallers mapping
const senderToTelecaller = {
  'Sujata Nutrilve Vaishnavi Diwate': 'Vaishnavi Diwate',
  'Sujata Nutrilive Manju': 'Manjushree Kasture',
  'Sujata Nutrilive Agrotech Punam kasture': 'Punam Kasture',
  'Karishma Patil Sujata Nutrilive': 'Karishma Patil',
  'Sujata Nutrilive': 'Monu',
  'Yash R. Suryawanshi': 'Yash (Admin/Direct)',
  'Om Amazon Dispatch': 'Om (Amazon/Direct)'
};

function parseOrderMessage(text) {
  const clean = text.trim();

  // Basic filters to reject chatter
  if (clean === '<Media omitted>' || clean === 'This message was deleted') return null;
  if (clean.length < 25) return null;
  if (/^(?:okay|oaky|yes sir|done|speed post|hold|call kar|hello|\.+)/i.test(clean) && clean.length < 50) return null;

  // An order must have address/customer signals:
  const hasPhone = /\b(?:[6-9]\d{9}|[6-9]\d{4}\s*\d{5})\b/.test(clean) || /\b\d{5}\s*\d{5}\b/.test(clean) || /\+91\s*\d+/.test(clean) || /phone|mob|mo\.|mb/i.test(clean);
  const hasPincode = /\b(?:pin|pincode|post)\s*[-:]?\s*\d{6}\b/i.test(clean) || /\b\d{6}\b/.test(clean);
  const hasProduct = /(?:spirulina|buckthorn|sea\s*buckthorn|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3)/i.test(clean);
  const hasPayment = /(?:cod|prepaid|advance|paid|\/-|rs\.?|inr|₹)/i.test(clean);

  // Must have phone AND (product OR payment OR pin)
  if (!hasPhone) {
    // If no phone, must have product AND payment AND pin
    if (!(hasProduct && hasPayment && hasPincode)) return null;
  }

  // It's an order! Now let's extract amount cleanly:
  let amount = 0;

  // Patterns in priority order
  const p1 = clean.match(/(?:total\s*cod\s*amount|total\s*amount|total\s*cod|totalcod|rec\s*by\s*cod|cod\s*amount|order\s*amount)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
  const p2 = clean.match(/(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?)?/i);
  const p3 = clean.match(/(?:rs\.?|inr|₹)\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?)?/i);
  const p4 = clean.match(/(\d{3,5})\s*\/(?:-|\s*cod|\s*prepaid)/i);
  const p5 = clean.match(/(\d{3,5})\s*(?:rs|inr|cod|prepaid)/i);

  if (p1) {
    amount = parseInt(p1[1]);
  } else if (p2) {
    amount = parseInt(p2[1]);
  } else if (p3) {
    amount = parseInt(p3[1]);
  } else if (p4) {
    amount = parseInt(p4[1]);
  } else if (p5) {
    amount = parseInt(p5[1]);
  }

  // Sanity check on amount (avoid matching 6-digit pincodes or dates)
  if (amount > 30000 || (amount >= 400000 && amount <= 499999) || (amount >= 100000 && amount <= 399999)) {
    amount = 0;
  }

  // Special fallbacks based on product if amount is 0
  if (amount === 0) {
    if (/3\s*month|3\s*spirulina.*3\s*sea|combo\s*\(3x\)/i.test(clean)) amount = 2200;
    else if (/2\s*month|2\s*spirulina.*2\s*sea|combo\s*\(2x\)/i.test(clean)) amount = 1600;
    else if (/combo|1\s*spirulina.*1\s*sea|healthy\s*life/i.test(clean)) amount = 1000;
    else if (/b12|vitamin\s*b12/i.test(clean)) amount = 550;
    else if (/powder/i.test(clean)) amount = 350;
    else if (/capsule|tablet/i.test(clean)) amount = 500;
    else if (/soap/i.test(clean)) amount = 60;
  }

  // Check if this was a forwarded website order
  const isWebsiteOrder = clean.includes('SUJATA NUTRILIVE — NEW ORDER') || clean.includes('Source: Website Direct');

  return {
    isWebsiteOrder,
    amount,
    text: clean
  };
}

const telecallerResults = {
  'Vaishnavi Diwate': { count: 0, totalVal: 0, orders: [] },
  'Manjushree Kasture': { count: 0, totalVal: 0, orders: [], webForwardedCount: 0, webForwardedVal: 0 },
  'Punam Kasture': { count: 0, totalVal: 0, orders: [] },
  'Karishma Patil': { count: 0, totalVal: 0, orders: [] },
  'Monu': { count: 0, totalVal: 0, orders: [] },
  'Yash (Admin/Direct)': { count: 0, totalVal: 0, orders: [] },
  'Others': { count: 0, totalVal: 0, orders: [] }
};

for (const m of msgs) {
  const caller = senderToTelecaller[m.sender] || 'Others';
  const parsed = parseOrderMessage(m.text);
  if (!parsed) continue;

  const entry = {
    date: m.dateStr,
    time: m.timeStr,
    sender: m.sender,
    amount: parsed.amount,
    isWebsiteOrder: parsed.isWebsiteOrder,
    text: parsed.text
  };

  if (!telecallerResults[caller]) {
    telecallerResults[caller] = { count: 0, totalVal: 0, orders: [] };
  }

  telecallerResults[caller].count++;
  telecallerResults[caller].totalVal += parsed.amount;
  telecallerResults[caller].orders.push(entry);

  if (caller === 'Manjushree Kasture' && parsed.isWebsiteOrder) {
    telecallerResults[caller].webForwardedCount = (telecallerResults[caller].webForwardedCount || 0) + 1;
    telecallerResults[caller].webForwardedVal = (telecallerResults[caller].webForwardedVal || 0) + parsed.amount;
  }
}

fs.writeFileSync('scripts/parsed_whatsapp_dispatch_summary.json', JSON.stringify(telecallerResults, null, 2), 'utf8');

console.log('=== OFFICIAL WHATSAPP DISPATCH GROUP ORDERS (OCTOBER 2026) ===\n');

for (const [name, res] of Object.entries(telecallerResults)) {
  console.log(`👤 ${name}:`);
  console.log(`   - Total Orders in WhatsApp: ${res.count} orders`);
  console.log(`   - Total Value: ₹${res.totalVal.toLocaleString('en-IN')}`);
  if (res.webForwardedCount > 0) {
    console.log(`     (Includes ${res.webForwardedCount} website orders forwarded for dispatch = ₹${res.webForwardedVal})`);
    console.log(`     (Direct Telecalling Orders: ${res.count - res.webForwardedCount} orders = ₹${(res.totalVal - res.webForwardedVal).toLocaleString('en-IN')})`);
  }
}
