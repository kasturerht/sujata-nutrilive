import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

// Telecallers list
const telecallersMap = {
  'Sujata Nutrilve Vaishnavi Diwate': 'Vaishnavi Diwate',
  'Sujata Nutrilive Manju': 'Manjushree Kasture',
  'Sujata Nutrilive Agrotech Punam kasture': 'Punam Kasture',
  'Karishma Patil Sujata Nutrilive': 'Karishma Patil',
  'Sujata Nutrilive': 'Monu'
};

function extractOrderDetails(text) {
  // Check if text looks like an order:
  // Must have a phone number OR pincode OR (product keyword AND amount)
  const hasPhone = /\b(?:[6-9]\d{9}|[6-9]\d{4}\s*\d{5})\b/.test(text) || /\b\d{5}\s*\d{5}\b/.test(text) || /\+91\s*\d+/.test(text);
  const hasPin = /\b(?:pin|pincode|post)\s*[-:]?\s*\d{6}\b/i.test(text) || /\b\d{6}\b/.test(text);
  const hasProduct = /(?:spirulina|buckthorn|sea\s*buckthorn|capsule|tablet|combo|soap|cream|moringa|shilajit|chikki|b12|toothpaste)/i.test(text);
  
  // Extract amount: e.g. "COD 999/-", "1600/-", "Cod: 2200/-", "Prepaid 550/-", "2400/- COD", "Rs. 1050", "₹945"
  // Look for patterns like (?:COD|Prepaid|Rs\.?|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:COD|Prepaid)?)?
  const amountPatterns = [
    /(?:cod|prepaid|rec by cod|amount|amt|total)?\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?)?/gi,
    /(\d{3,5})\s*\/(?:-|\s*cod|\s*prepaid)/gi
  ];

  if (!hasProduct && !hasPhone) {
    return null; // Not an order
  }

  // Find price
  let amount = 0;
  let matches = [];

  // Match specific patterns
  const m1 = text.match(/(?:cod|prepaid|rec by cod|amount|amt|total)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
  const m2 = text.match(/(\d{3,5})\s*\/-\s*(?:cod|prepaid)?/i);
  const m3 = text.match(/(?:cod|prepaid)\s*(\d{3,5})/i);
  const m4 = text.match(/(\d{3,5})\s*(?:rs|inr)/i);

  if (m1) {
    amount = parseInt(m1[1]);
  } else if (m2) {
    amount = parseInt(m2[1]);
  } else if (m3) {
    amount = parseInt(m3[1]);
  } else if (m4) {
    amount = parseInt(m4[1]);
  }

  // Avoid matching pincodes (like 422003) as amount
  if (amount > 50000 || (amount >= 400000 && amount <= 499999)) {
    amount = 0;
  }

  return {
    isOrder: (hasPhone && (hasProduct || amount > 0)) || (hasProduct && amount > 0),
    amount
  };
}

console.log('Testing extraction...');
