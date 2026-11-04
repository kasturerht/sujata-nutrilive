import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));
const monu = data['Monu'];

console.log('=== AUDITING MONU ORDERS ===');

const orders = [];
const nonOrders = [];

for (let i = 0; i < monu.length; i++) {
  const m = monu[i];
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
  if (/^(?:pack this|delivery charges|return|nahi udya|tyacha|hyala|order packed|prembhushan|dattatray|previous cod|asha nandgaonkar|te monday|udya ghetil|konti|name\?|done|okay|bluedart|moringa capsules|ho bluedart|orders kadachit|packed will|madam hi|kaal hyala|called not|hi order|this order is cancelled|toh 1150|thik ahe|1100 hotil|edit kara|pay kelet|sample|chikki|toothpaste ahet|tyacha payment|yes sir)/i.test(raw.trim()) && !/^\s*(?:name|नाव|mrs|mr|shri|[a-z]+\s+[a-z]+)/i.test(raw) && raw.length < 100) {
    nonOrders.push({ idx: i + 1, reason: 'Chatter/status', text: raw });
    continue;
  }

  // Check phone or address signals
  const hasPhone = /(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/.test(raw) || /phone|mob|mo\.|mb/i.test(raw);
  const hasPincode = /\b(?:pin|pincode|post)\s*[-:]?\s*\d{6}\b/i.test(raw) || /\b(?:4\d{5}|5\d{5}|7\d{5}|1\d{5}|2\d{5}|3\d{5}|6\d{5}|8\d{5})\b/.test(raw);
  const hasProduct = /(?:spirulina|buckthorn|sea\s*buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|facewash|oil|shampoo|paste|d3|tulshi|drops|spurlina)/i.test(raw);

  // Office order case: e.g. "Sachin jaadhav sipurlina tablet 1 450/- paid visited office"
  const isOfficeOrder = /visited office|office order/i.test(raw);

  if (!isOfficeOrder && !((hasPhone && (hasProduct || hasPincode)) || (hasProduct && hasPincode))) {
    nonOrders.push({ idx: i + 1, reason: 'Not an order', text: raw });
    continue;
  }

  // Extract amount
  let clean = raw.replace(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g, ' [PHONE] ');
  clean = clean.replace(/\b\d{5}\s*\d{5}\b/g, ' [PHONE] ');
  clean = clean.replace(/\b(?:pin|pincode|post|code)\s*[-:]?\s*\d{6}\b/gi, ' [PIN] ');
  clean = clean.replace(/\b[1-9]\d{5}\b/g, ' [PIN] ');

  let amt = 0;

  // Specific check for Shaikh Salman: "Cod: 2 month combo 1600"
  if (raw.includes('Shaikh Salman')) {
    amt = 1600;
  }

  // Specific check for Jitendra Kumar Yadav: "COD: 1000/-"
  if (raw.includes('Jitendra Kumar Yadav')) {
    amt = 1000;
  }

  // Check labeled totals
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

  // Fallback for Anup Rawat
  if (!amt && raw.includes('Anup Rawat')) {
    amt = 1080;
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

console.log(`Total Monu Orders Parsed: ${orders.length}`);
let totalVal = 0;
for (const o of orders) {
  totalVal += o.amt;
  const flag = o.amt === 0 ? '❌ ZERO' : '✅';
  console.log(`  [#${o.idx}] ${o.date} | ₹${o.amt} | ${o.cust} | ${flag}`);
}
console.log(`>>> Total Monu Value: ₹${totalVal.toLocaleString('en-IN')}`);

console.log(`\nNon-orders count: ${nonOrders.length}`);
for (const no of nonOrders) {
  console.log(`  [#${no.idx}] ${no.reason}: ${no.text.substring(0, 50).replace(/\n/g, ' ')}`);
}
