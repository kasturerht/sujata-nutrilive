import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));
const punam = data['Punam Kasture'];

console.log('=== PUNAM ALL MESSAGES CLASSIFICATION ===');
for (const m of punam) {
  const text = m.text;
  // Does it look like an order?
  const hasPhone = /\b(?:[6-9]\d{9}|[6-9]\d{4}\s*\d{5})\b/.test(text) || /\b\d{5}\s*\d{5}\b/.test(text) || /\+91\s*\d+/.test(text) || /phone|mob|mo\.|mb/i.test(text);
  const hasProduct = /(?:spirulina|buckthorn|sea\s*buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3)/i.test(text);
  const hasPayment = /(?:cod|prepaid|advance|paid|\/-|rs\.?|inr|₹)/i.test(text);

  // Let's extract amount
  const p1 = text.match(/(?:total\s*cod\s*amount|total\s*amount|total\s*cod|totalcod|rec\s*by\s*cod|cod\s*amount|order\s*amount|amount)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
  const p2 = text.match(/(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?)?/i);
  const p3 = text.match(/(?:rs\.?|inr|₹)\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?)?/i);
  const p4 = text.match(/(\d{3,5})\s*\/(?:-|\s*cod|\s*prepaid)/i);
  const p5 = text.match(/(\d{3,5})\s*(?:rs|inr|cod|prepaid)/i);

  let amt = 0;
  if (p1) amt = parseInt(p1[1]);
  else if (p2) amt = parseInt(p2[1]);
  else if (p3) amt = parseInt(p3[1]);
  else if (p4) amt = parseInt(p4[1]);
  else if (p5) amt = parseInt(p5[1]);

  console.log(`[${m.idx}] Amt: ${amt} | Date: ${m.date} | Phone: ${hasPhone} | Prod: ${hasProduct} | Pay: ${hasPayment} | Preview: ${text.substring(0, 40).replace(/\n/g, ' ')}`);
}
