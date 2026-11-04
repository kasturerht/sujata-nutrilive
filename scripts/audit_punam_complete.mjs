import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));
const punam = data['Punam Kasture'];

console.log('=== AUDITING PUNAM KASTURE ORDERS ===');

const orders = [];
const nonOrders = [];

for (let i = 0; i < punam.length; i++) {
  const m = punam[i];
  let raw = m.text.replace(/(\d),(\d{3})/g, '$1$2');

  // Chatter filters
  if (raw === '<Media omitted>' || raw === 'This message was deleted') {
    nonOrders.push({ idx: i + 1, reason: 'Media/Deleted', text: raw });
    continue;
  }
  if (raw.length < 30) {
    nonOrders.push({ idx: i + 1, reason: 'Short chatter', text: raw });
    continue;
  }
  if (/^(?:ya order status|hi order aj dispatch|okay|hi order pack|change karychi|hi order phochali|dispatch cha photo|hi order dispatch|parat pahije|kele nhi ye)/i.test(raw.trim()) && raw.length < 80) {
    nonOrders.push({ idx: i + 1, reason: 'Chatter/status', text: raw });
    continue;
  }

  // Check phone or address signals
  const hasPhone = /(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/.test(raw) || /phone|mob|mo\.|mb/i.test(raw);
  const hasPincode = /\b(?:pin|pincode|post)\s*[-:]?\s*\d{6}\b/i.test(raw) || /\b(?:4\d{5}|5\d{5}|7\d{5}|1\d{5}|2\d{5}|3\d{5}|6\d{5}|8\d{5})\b/.test(raw);

  if (!hasPhone && !hasPincode) {
    nonOrders.push({ idx: i + 1, reason: 'Not an order', text: raw });
    continue;
  }

  // Extract amount
  let clean = raw.replace(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g, ' [PHONE] ');
  clean = clean.replace(/\b\d{5}\s*\d{5}\b/g, ' [PHONE] ');
  clean = clean.replace(/\b(?:pin|pincode|post|code)\s*[-:]?\s*\d{6}\b/gi, ' [PIN] ');
  clean = clean.replace(/\b[1-9]\d{5}\b/g, ' [PIN] ');

  let amt = 0;

  // Labeled totals
  const mTotal = clean.match(/(?:total\s*cod\s*amount|total\s*amount|total\s*cod|totalcod|rec\s*by\s*cod|cod\s*amount|order\s*amount|total\s*[-:])\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
  if (mTotal) amt = parseInt(mTotal[1]);

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

  // Check Bhaginath Govind Sontakke: ₹2,400
  if (raw.includes('Bhaginath Govind Sontakke')) amt = 2400;

  let cust = 'Unknown';
  const nameM = raw.match(/(?:name|नाव)\s*[:=-]?\s*([^\n\r,•]+)/i);
  if (nameM) cust = nameM[1].trim();
  else cust = raw.split(/\r?\n/)[0].trim();

  orders.push({
    idx: i + 1,
    date: m.date,
    time: m.time,
    cust,
    amt,
    text: raw
  });
}

console.log(`Total Punam Orders Parsed: ${orders.length}`);
let totalVal = 0;
for (const o of orders) {
  totalVal += o.amt;
  const flag = o.amt === 0 ? '❌ ZERO' : '✅';
  console.log(`  [#${o.idx}] ${o.date} | ₹${o.amt} | ${o.cust} | ${flag}`);
}
console.log(`>>> Total Punam Value: ₹${totalVal.toLocaleString('en-IN')}`);

console.log(`\nNon-orders count: ${nonOrders.length}`);
for (const no of nonOrders) {
  console.log(`  [#${no.idx}] ${no.reason}: ${no.text.substring(0, 50).replace(/\n/g, ' ')}`);
}
