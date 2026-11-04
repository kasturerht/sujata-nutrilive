import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

// Let's test amount extraction properly
function extractAmount(raw) {
  // Normalize text: remove comma from numbers like 1,600 -> 1600
  let t = raw.replace(/(\d),(\d{3})/g, '$1$2');

  // Strip phone numbers and pincodes so they don't interfere
  // Replace 10 digit phones with spaces
  let clean = t.replace(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g, ' [PHONE] ');
  clean = clean.replace(/\b\d{5}\s*\d{5}\b/g, ' [PHONE] ');
  // Replace 6-digit pincodes
  clean = clean.replace(/\b(?:pin|pincode|post|code)\s*[-:]?\s*\d{6}\b/gi, ' [PIN] ');
  clean = clean.replace(/\b[1-9]\d{5}\b/g, ' [PIN] ');

  // Patterns to look for amount:
  // Priority 1: explicitly labelled totals
  // e.g. "Total COD Amount: ₹1350", "Total Amount: 1600", "COD Amount: 1600", "Cash collected: 500"
  const m1 = clean.match(/(?:total\s*cod\s*amount|total\s*amount|total\s*cod|totalcod|rec\s*by\s*cod|cod\s*amount|order\s*amount|cash\s*collected|total\s*[-:])\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
  if (m1) return parseInt(m1[1]);

  // Priority 2: "COD: 1600", "Prepaid 2200", "Paid 1500", "COD 999/-", "COD1600/-", "COD= 1050/-"
  // Note: NO digits between COD/Prepaid and the number!
  const m2 = clean.match(/(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:combo\s*)?(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
  if (m2) return parseInt(m2[1]);

  // Priority 3: number followed by "/- cod" or "/- prepaid" or "/-" or "rs"
  // e.g. "1600/-", "999 /- cod", "2400 RS"
  const m3 = clean.match(/(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?|\s*\/\s*cod|\s*rs\b)/i);
  if (m3) return parseInt(m3[1]);

  // Priority 4: "1000/- COD" or "1080 /-COD"
  const m4 = clean.match(/(\d{3,5})\s*(?:\/-\s*|\s*-\s*|\s*)(?:cod|prepaid|paid)/i);
  if (m4) return parseInt(m4[1]);

  return 0;
}

// Test on all messages of telecallers
const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));
for (const [name, list] of Object.entries(data)) {
  console.log(`=== ${name} ===`);
  for (const m of list) {
    const amt = extractAmount(m.text);
    if (/cod|prepaid|advance|paid|\/-/i.test(m.text) && m.text.length > 50) {
      console.log(`[#${m.idx}] Amt: ${amt} | ${m.text.substring(0, 40).replace(/\n/g, ' ')}`);
    }
  }
}
