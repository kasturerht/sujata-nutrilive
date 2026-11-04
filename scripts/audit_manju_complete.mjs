import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));
const manju = data['Manjushree Kasture'];

console.log('=== AUDITING MANJUSHREE KASTURE ORDERS ===');

const directOrders = [];
const webOrders = [];
const nonOrders = [];

for (let i = 0; i < manju.length; i++) {
  const m = manju[i];
  let raw = m.text.replace(/(\d),(\d{3})/g, '$1$2'); // remove commas like 1,600 -> 1600

  // Check if it's website forwarded
  const isWebTemplate = raw.includes('SUJATA NUTRILIVE — NEW ORDER');
  const isWebMention = raw.includes('(Website order)') || raw.includes('Source: Website Direct');

  // Chatter filters
  if (raw === '<Media omitted>' || raw === 'This message was deleted') {
    nonOrders.push({ idx: i + 1, reason: 'Media/Deleted', text: raw });
    continue;
  }
  if (raw.length < 35 && !/\d{6}/.test(raw)) {
    nonOrders.push({ idx: i + 1, reason: 'Short chatter', text: raw });
    continue;
  }
  if (/^(?:location:|send by courier|यांना 3 sea buckthorn|👆|ही ऑर्डर|packing|या ऑर्डर चे|परत buledart|post service|नाही|ok|ya order|13 october|anil pisal|contact kara|हो|dilip|hi order|product kay)/i.test(raw.trim()) && !isWebTemplate && raw.length < 100) {
    nonOrders.push({ idx: i + 1, reason: 'Chatter/status', text: raw });
    continue;
  }

  // Check phone or address signals
  const hasPhone = /(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/.test(raw) || /phone|mob|mo\.|mb/i.test(raw);
  const hasPincode = /\b(?:pin|pincode|post)\s*[-:]?\s*\d{6}\b/i.test(raw) || /\b(?:4\d{5}|5\d{5}|7\d{5}|1\d{5}|2\d{5}|3\d{5}|6\d{5}|8\d{5})\b/.test(raw);

  if (!hasPhone && !hasPincode && !isWebTemplate) {
    nonOrders.push({ idx: i + 1, reason: 'No phone/pin', text: raw });
    continue;
  }

  // Extract amount
  // Clean phone and pin first
  let clean = raw.replace(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g, ' [PHONE] ');
  clean = clean.replace(/\b\d{5}\s*\d{5}\b/g, ' [PHONE] ');
  clean = clean.replace(/\b(?:pin|pincode|post|code)\s*[-:]?\s*\d{6}\b/gi, ' [PIN] ');
  clean = clean.replace(/\b[1-9]\d{5}\b/g, ' [PIN] ');

  let amt = 0;

  // Web template amount
  const mWebAmt = raw.match(/•\s*₹([\d\.]+)/);
  if (mWebAmt) {
    amt = Math.round(parseFloat(mWebAmt[1]));
  }

  if (!amt) {
    const mTotal = clean.match(/(?:total\s*cod\s*amount|total\s*amount|total\s*cod|totalcod|rec\s*by\s*cod|cod\s*amount|order\s*amount|total\s*[-:])\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
    if (mTotal) amt = parseInt(mTotal[1]);
  }

  if (!amt) {
    const mCod = clean.match(/(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
    if (mCod) amt = parseInt(mCod[1]);
  }

  if (!amt) {
    const mSlash = clean.match(/(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?|\s*\/\s*cod|\s*rs\b)/i);
    if (mSlash) amt = parseInt(mSlash[1]);
  }

  if (!amt) {
    const mPre = clean.match(/(\d{3,5})\s*(?:\/-\s*|\s*-\s*|\s*)(?:cod|prepaid|paid)/i);
    if (mPre) amt = parseInt(mPre[1]);
  }

  // Special known cases without explicit amount
  if (!amt) {
    if (i + 1 === 110) amt = 1080; // Dilip P Joshi (Navratri combo)
    else if (i + 1 === 133) amt = 550; // Gauri Gurunath Wamanacharya (Vitamin B12 prepaid)
    else if (i + 1 === 134) amt = 315; // Rajkumar k vadgave (Spirulina powder prepaid)
  }

  // Customer name
  let cust = 'Unknown';
  const nameM = raw.match(/(?:name|नाव|client)\s*[:=-]?\s*([^\n\r,•]+)/i);
  if (nameM) cust = nameM[1].trim();
  else cust = raw.split(/\r?\n/)[0].trim();

  const orderObj = {
    idx: i + 1,
    date: m.date,
    time: m.time,
    cust,
    amt,
    isWeb: isWebTemplate || isWebMention,
    text: raw
  };

  if (isWebTemplate || isWebMention) {
    webOrders.push(orderObj);
  } else {
    directOrders.push(orderObj);
  }
}

console.log(`Direct Telecalling Orders: ${directOrders.length}`);
let directTotal = 0;
for (const o of directOrders) {
  directTotal += o.amt;
  console.log(`  [#${o.idx}] ${o.date} | ₹${o.amt} | ${o.cust}`);
}
console.log(`>>> Direct Telecalling Total: ₹${directTotal.toLocaleString('en-IN')}`);

console.log(`\nForwarded Website Orders: ${webOrders.length}`);
let webTotal = 0;
for (const o of webOrders) {
  webTotal += o.amt;
  console.log(`  [#${o.idx}] ${o.date} | ₹${o.amt} | ${o.cust}`);
}
console.log(`>>> Forwarded Website Total: ₹${webTotal.toLocaleString('en-IN')}`);

console.log(`\nNon-orders count: ${nonOrders.length}`);
for (const no of nonOrders) {
  console.log(`  [#${no.idx}] ${no.reason}: ${no.text.substring(0, 60).replace(/\n/g, ' ')}`);
}
