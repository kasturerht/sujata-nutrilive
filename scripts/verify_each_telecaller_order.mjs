import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));

// Helper function to extract exact order amount from order text
export function parseExactOrder(text) {
  // Normalize text: remove comma from numbers like 1,600 -> 1600
  let t = text.replace(/(\d),(\d{3})/g, '$1$2');

  // Reject chatter/system messages
  if (t === '<Media omitted>' || t === 'This message was deleted') return null;
  if (/^(?:okay|done|ho|nahi|yes sir|change|return|location:)/i.test(t.trim()) && t.length < 60) return null;

  // Must have phone or (customer address signals)
  const phoneMatch = t.match(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/);
  const hasPhone = !!phoneMatch || /phone|mob|mo\.|mb|contact/i.test(t);
  const hasPincode = /\b(?:pin|pincode|post)\s*[-:]?\s*\d{6}\b/i.test(t) || /\b(?:4\d{5}|5\d{5}|7\d{5}|1\d{5}|2\d{5}|3\d{5}|6\d{5}|8\d{5})\b/.test(t);
  const hasProduct = /(?:spirulina|buckthorn|sea\s*buckthorn|seabukthron|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste|powder|face\s*pack|facewash|oil|shampoo|paste|d3|tulshi|drops|spurlina)/i.test(t);
  const hasPayment = /(?:cod|prepaid|advance|paid|\/-|rs\.?|inr|₹|cash)/i.test(t);

  // If it's a short chatter message that mentions order or cancellation
  if (/^this order is cancelled/i.test(t.trim())) return null;
  if (/^edit kara/i.test(t.trim())) return null;
  if (/^te monday la bollele/i.test(t.trim())) return null;
  if (/^hi order ashi pathva/i.test(t.trim()) && t.length < 50) return null;
  if (/^order prepaid delivered from office/i.test(t.trim())) {
    // Office order!
    const amtM = t.match(/(\d{3,5})\s*(?:\/-)?/);
    return {
      isOrder: true,
      isOffice: true,
      amount: amtM ? parseInt(amtM[1]) : 0,
      customer: 'Office Delivery/Walk-in',
      phone: '',
      cleanText: t
    };
  }

  // General check
  if (!((hasPhone && (hasProduct || hasPayment || hasPincode)) || (hasProduct && hasPayment && hasPincode))) {
    return null;
  }

  // Extract amount
  let amount = 0;

  // Check specific patterns
  // 1. "Total COD Amount: ₹1350" or "Total Amount: 1600" or "COD Amount: 1600"
  const mTotal = t.match(/(?:total\s*cod\s*amount|total\s*amount|total\s*cod|totalcod|rec\s*by\s*cod|cod\s*amount|order\s*amount|cash\s*collected)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
  if (mTotal) {
    amount = parseInt(mTotal[1]);
  }

  // 2. "COD: 2 month combo 1600" or "COD: 1600" or "Prepaid: 2200" or "COD 999/-"
  if (!amount) {
    const mCod = t.match(/(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:[a-z0-9\s]{0,20})?(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-)?/i);
    // Be careful that the matched number isn't part of phone number or pincode!
    if (mCod) {
      const val = parseInt(mCod[1]);
      if (val >= 100 && val <= 35000 && !/\b\d{6}\b/.test(mCod[1])) {
        amount = val;
      }
    }
  }

  // 3. "₹1,600/-" or "1600/-" or "1600 /- cod" or "1600 RS"
  if (!amount) {
    const mSlash = t.match(/(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?|\s*rs\b|\s*cod\b|\s*prepaid\b)/i);
    if (mSlash) {
      const val = parseInt(mSlash[1]);
      if (val >= 100 && val <= 35000) {
        amount = val;
      }
    }
  }

  // Customer name extraction
  let customer = 'Unknown';
  const nameM = t.match(/(?:name|नाव)\s*[:=-]?\s*([^\n\r,]+)/i);
  if (nameM) {
    customer = nameM[1].trim();
  } else {
    // First line before newline or comma
    const firstLine = t.split(/\r?\n/)[0].trim();
    if (firstLine.length < 40 && !/^(?:hi|hello|sir|order)/i.test(firstLine)) {
      customer = firstLine;
    }
  }

  // Phone extraction
  let phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : '';

  const isWeb = /SUJATA NUTRILIVE — NEW ORDER|Source: Website Direct|\(Website order\)/i.test(t);

  return {
    isOrder: true,
    isWeb,
    amount,
    customer,
    phone,
    rawText: t
  };
}
