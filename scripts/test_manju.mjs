import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));
const manju = data['Manjushree Kasture'];

console.log('=== MANJU ALL MESSAGES CLASSIFICATION ===');
for (const m of manju) {
  let cleanText = m.text.replace(/(\d),(\d{3})/g, '$1$2'); // remove commas from numbers
  const hasPhone = /\b(?:[6-9]\d{9}|[6-9]\d{4}\s*\d{5})\b/.test(cleanText) || /\b\d{5}\s*\d{5}\b/.test(cleanText) || /\+91\s*\d+/.test(cleanText) || /phone|mob|mo\.|mb/i.test(cleanText);
  const hasProduct = /(?:spirulina|buckthorn|sea\s*buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|oil|shampoo|paste|d3|tulshi|drops)/i.test(cleanText);
  const hasPayment = /(?:cod|prepaid|advance|paid|\/-|rs\.?|inr|₹)/i.test(cleanText);
  const isWeb = /SUJATA NUTRILIVE — NEW ORDER|Source: Website Direct|\(Website order\)/i.test(cleanText);

  // Let's extract amount
  const p1 = cleanText.match(/(?:total\s*cod\s*amount|total\s*amount|total\s*cod|totalcod|rec\s*by\s*cod|cod\s*amount|order\s*amount|amount)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
  const p2 = cleanText.match(/(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?)?/i);
  const p3 = cleanText.match(/(?:rs\.?|inr|₹)\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?)?/i);
  const p4 = cleanText.match(/(\d{3,5})\s*\/(?:-|\s*cod|\s*prepaid)/i);
  const p5 = cleanText.match(/(\d{3,5})\s*(?:rs|inr|cod|prepaid)/i);

  let amt = 0;
  if (p1) amt = parseInt(p1[1]);
  else if (p2) amt = parseInt(p2[1]);
  else if (p3) amt = parseInt(p3[1]);
  else if (p4) amt = parseInt(p4[1]);
  else if (p5) amt = parseInt(p5[1]);

  console.log(`[${m.idx}] Amt: ${amt} | Web: ${isWeb} | Date: ${m.date} | Phone: ${hasPhone} | Prod: ${hasProduct} | Pay: ${hasPayment} | Preview: ${cleanText.substring(0, 45).replace(/\n/g, ' ')}`);
}
