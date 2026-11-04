import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));
const vaishnavi = data['Vaishnavi Diwate'];

console.log('=== AUDITING VAISHNAVI DIWATE ORDERS ===');

const orders = [];
const nonOrders = [];

for (let i = 0; i < vaishnavi.length; i++) {
  const m = vaishnavi[i];
  let raw = m.text.replace(/(\d),(\d{3})/g, '$1$2');

  // Chatter filters
  if (raw === '<Media omitted>' || raw === 'This message was deleted') {
    nonOrders.push({ idx: i + 1, reason: 'Media/Deleted', text: raw });
    continue;
  }
  if (raw.length < 30 && !/office/i.test(raw)) {
    nonOrders.push({ idx: i + 1, reason: 'Short chatter', text: raw });
    continue;
  }
  if (/^(?:he order jevdha|ya orderchi|he order lavkar|hi order mala|ok sir|nahi takat|vijay desai|jevdha lavkar|\?\?|okay sorry|rajesh khatavkar|lavkar pathav|lavkar pathvay|gift|location:|yacha location|he office la)/i.test(raw.trim()) && !/^(?:vijal|baburao|belkar|udhav|pravin|bhanumati|vivek|vidula|vishal|rajendra|hiraman|swapna|order prepaid)/i.test(raw) && raw.length < 100) {
    nonOrders.push({ idx: i + 1, reason: 'Chatter/status', text: raw });
    continue;
  }

  // Office orders
  if (/order prepaid delivered from office/i.test(raw)) {
    const amtM = raw.match(/(\d{3,5})/);
    orders.push({
      idx: i + 1,
      date: m.date,
      time: m.time,
      cust: 'Office Delivery/Walk-in',
      amt: amtM ? parseInt(amtM[1]) : 0,
      isOffice: true,
      text: raw
    });
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

console.log(`Total Vaishnavi Orders Parsed: ${orders.length}`);
let totalVal = 0;
for (const o of orders) {
  totalVal += o.amt;
  const flag = o.amt === 0 ? '❌ ZERO' : '✅';
  console.log(`  [#${o.idx}] ${o.date} | ₹${o.amt} | ${o.cust} | ${flag}`);
}
console.log(`>>> Total Vaishnavi Value: ₹${totalVal.toLocaleString('en-IN')}`);

console.log(`\nNon-orders count: ${nonOrders.length}`);
for (const no of nonOrders) {
  console.log(`  [#${no.idx}] ${no.reason}: ${no.text.substring(0, 50).replace(/\n/g, ' ')}`);
}
