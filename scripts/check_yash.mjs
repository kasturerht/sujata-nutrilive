import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

const yashMsgs = msgs.filter(m => m.sender === 'Yash R. Suryawanshi');
console.log('Total Yash messages:', yashMsgs.length);

let orderCount = 0;
let totalVal = 0;

for (const m of yashMsgs) {
  const text = m.text.replace(/(\d),(\d{3})/g, '$1$2').trim();
  const hasPhone = /(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/.test(text);
  const hasPincode = /\b(?:pin|pincode|post)\s*[-:]?\s*\d{6}\b/i.test(text) || /\b(?:4\d{5}|5\d{5}|7\d{5}|1\d{5}|2\d{5}|3\d{5}|6\d{5}|8\d{5})\b/.test(text);
  const hasProduct = /(?:spirulina|buckthorn|sea\s*buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|facewash|oil|shampoo|paste|d3|tulshi|drops|spurlina)/i.test(text);

  if ((hasPhone || hasPincode) && hasProduct && text.length > 40) {
    orderCount++;
    let clean = text.replace(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g, ' [PHONE] ');
    clean = clean.replace(/\b\d{5}\s*\d{5}\b/g, ' [PHONE] ');
    clean = clean.replace(/\b(?:pin|pincode|post|code)\s*[-:]?\s*\d{6}\b/gi, ' [PIN] ');
    clean = clean.replace(/\b[1-9]\d{5}\b/g, ' [PIN] ');

    let amt = 0;
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
    totalVal += amt;
    // console.log(`[Yash Order #${orderCount}] ₹${amt} | ${text.substring(0, 45).replace(/\n/g, ' ')}`);
  }
}

console.log(`Yash Orders: ${orderCount}, Total: ₹${totalVal}`);
