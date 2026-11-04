import fs from 'fs';

const msgs = JSON.parse(fs.readFileSync('scripts/october_whatsapp_messages.json', 'utf8'));

// Master clean parser
export function analyzeAllTelecallers() {
  const result = {
    'Vaishnavi Diwate': { name: 'Vaishnavi Diwate', phone: '99225 34443', orders: [] },
    'Manjushree Kasture': { name: 'Manjushree Kasture', phone: '92724 71529', directOrders: [], webOrders: [] },
    'Punam Kasture': { name: 'Punam Kasture', phone: '99225 00344', orders: [] },
    'Karishma Patil': { name: 'Karishma Patil', phone: '99225 77344', orders: [] },
    'Monu': { name: 'Monu', phone: '95034 34653', orders: [] },
    'Yash (Admin/Direct)': { name: 'Yash R. Suryawanshi (Admin)', phone: 'Founder', orders: [] }
  };

  // 1. VAISHNAVI DIWATE
  const vaishnaviMsgs = msgs.filter(m => m.sender === 'Sujata Nutrilve Vaishnavi Diwate');
  for (let i = 0; i < vaishnaviMsgs.length; i++) {
    const m = vaishnaviMsgs[i];
    const text = m.text.replace(/(\d),(\d{3})/g, '$1$2').trim();

    // Skip non-orders
    if (text === '<Media omitted>' || text === 'This message was deleted') continue;
    if (i + 1 === 2 || i + 1 === 3 || i + 1 === 15 || i + 1 === 19 || i + 1 === 20 || i + 1 === 22 || i + 1 === 23 || i + 1 === 24 || i + 1 === 25 || i + 1 === 26 || i + 1 === 29 || i + 1 === 30 || i + 1 === 31 || i + 1 === 32 || i + 1 === 33 || i + 1 === 38 || i + 1 === 50 || i + 1 === 60 || i + 1 === 63 || i + 1 === 69 || i + 1 === 70 || i + 1 === 73 || i + 1 === 74 || i + 1 === 76 || i + 1 === 77 || i + 1 === 85) {
      continue;
    }

    // Office deliveries
    if (i + 1 === 16) {
      result['Vaishnavi Diwate'].orders.push({ idx: i + 1, date: m.dateStr, time: m.timeStr, cust: 'Adhikar Chaudhari (Office Delivery)', amt: 1700, type: 'Office Delivery' });
      continue;
    }
    if (i + 1 === 17) {
      result['Vaishnavi Diwate'].orders.push({ idx: i + 1, date: m.dateStr, time: m.timeStr, cust: 'Prakash Jadhav (Office Delivery)', amt: 2400, type: 'Office Delivery' });
      continue;
    }
    if (i + 1 === 18) {
      result['Vaishnavi Diwate'].orders.push({ idx: i + 1, date: m.dateStr, time: m.timeStr, cust: 'Vijay Bharambe (Office Delivery)', amt: 1500, type: 'Office Delivery' });
      continue;
    }

    // Standard orders
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

    const firstLine = text.split(/\r?\n/)[0].trim().replace(/^Name:\s*/i, '');
    result['Vaishnavi Diwate'].orders.push({
      idx: i + 1,
      date: m.dateStr,
      time: m.timeStr,
      cust: firstLine,
      amt,
      type: 'Direct Dispatch'
    });
  }

  // 2. PUNAM KASTURE
  const punamMsgs = msgs.filter(m => m.sender === 'Sujata Nutrilive Agrotech Punam kasture');
  for (let i = 0; i < punamMsgs.length; i++) {
    const m = punamMsgs[i];
    const text = m.text.replace(/(\d),(\d{3})/g, '$1$2').trim();

    // Skip non-orders
    if (text === '<Media omitted>' || text === 'This message was deleted') continue;
    if ([13, 20, 22, 27, 31, 32, 33, 34, 35, 39, 40, 41, 45, 46, 55, 58, 60].includes(i + 1)) {
      continue;
    }

    let amt = 0;
    if (i + 1 === 3) {
      amt = 2400; // Bhaginath Govind Sontakke
    } else {
      let clean = text.replace(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g, ' [PHONE] ');
      clean = clean.replace(/\b\d{5}\s*\d{5}\b/g, ' [PHONE] ');
      clean = clean.replace(/\b(?:pin|pincode|post|code)\s*[-:]?\s*\d{6}\b/gi, ' [PIN] ');
      clean = clean.replace(/\b[1-9]\d{5}\b/g, ' [PIN] ');

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
    }

    const firstLine = text.split(/\r?\n/)[0].trim().replace(/^Name:\s*/i, '');
    result['Punam Kasture'].orders.push({
      idx: i + 1,
      date: m.dateStr,
      time: m.timeStr,
      cust: firstLine,
      amt,
      type: i + 1 === 59 ? 'Office Pickup' : 'Direct Dispatch'
    });
  }

  // 3. KARISHMA PATIL
  const karishmaMsgs = msgs.filter(m => m.sender === 'Karishma Patil Sujata Nutrilive');
  for (let i = 0; i < karishmaMsgs.length; i++) {
    const m = karishmaMsgs[i];
    const text = m.text.replace(/(\d),(\d{3})/g, '$1$2').trim();

    if (text === '<Media omitted>' || text === 'This message was deleted') continue;

    let amt = 0;
    if (i + 1 === 14) {
      amt = 500; // Mayur Salve Office order
    } else {
      let clean = text.replace(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g, ' [PHONE] ');
      clean = clean.replace(/\b\d{5}\s*\d{5}\b/g, ' [PHONE] ');
      clean = clean.replace(/\b(?:pin|pincode|post|code)\s*[-:]?\s*\d{6}\b/gi, ' [PIN] ');
      clean = clean.replace(/\b[1-9]\d{5}\b/g, ' [PIN] ');

      const mCod = clean.match(/(?:cod|prepaid|advance|paid)\s*[:=-]?\s*(?:rs\.?|inr|₹)?\s*(\d{3,5})/i);
      if (mCod) amt = parseInt(mCod[1]);
      if (!amt) {
        const mSlash = clean.match(/(?:rs\.?|inr|₹)?\s*(\d{3,5})\s*(?:\/-\s*(?:cod|prepaid)?|\s*\/\s*cod|\s*rs\b)/i);
        if (mSlash) amt = parseInt(mSlash[1]);
      }
      if (!amt) {
        const mPre = clean.match(/(\d{3,5})\s*(?:\/-\s*|\s*-\s*|\s*)(?:cod|prepaid|paid)/i);
        if (mPre) amt = parseInt(mPre[1]);
      }
    }

    const firstLine = text.split(/\r?\n/)[0].trim().replace(/^Name:\s*/i, '');
    result['Karishma Patil'].orders.push({
      idx: i + 1,
      date: m.dateStr,
      time: m.timeStr,
      cust: firstLine,
      amt,
      type: i + 1 === 14 ? 'Office Order' : 'Direct Dispatch'
    });
  }

  // 4. MONU
  const monuMsgs = msgs.filter(m => m.sender === 'Sujata Nutrilive');
  for (let i = 0; i < monuMsgs.length; i++) {
    const m = monuMsgs[i];
    const text = m.text.replace(/(\d),(\d{3})/g, '$1$2').trim();

    if (text === '<Media omitted>' || text === 'This message was deleted') continue;
    // Skip non-orders
    if ([1, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 18, 20, 21, 22, 24, 25, 27, 29, 30, 31, 32, 33, 36, 40, 42, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 59, 61, 62, 63, 66, 72, 73, 74, 77, 79, 80, 81, 83, 86, 87, 88, 89, 90, 91, 95, 96, 100, 101, 102, 103, 105, 106, 108, 109, 110, 112, 115, 116, 119, 120, 121, 125, 126, 127, 128, 130, 131, 132, 133, 136, 137, 139, 140, 141, 142, 143, 144, 147, 148, 150, 152, 153, 154, 155].includes(i + 1)) {
      continue;
    }

    let amt = 0;
    if (i + 1 === 26) amt = 1000; // Jitendra Kumar Yadav
    else if (i + 1 === 107) amt = 2500; // Nanda Dnyaneshwer (edited in #108 to 2500)
    else if (i + 1 === 117) amt = 1600; // Shaikh Salman (Cod: 2 month combo 1600)
    else if (i + 1 === 85) amt = 1080; // Anup Rawat
    else {
      let clean = text.replace(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g, ' [PHONE] ');
      clean = clean.replace(/\b\d{5}\s*\d{5}\b/g, ' [PHONE] ');
      clean = clean.replace(/\b(?:pin|pincode|post|code)\s*[-:]?\s*\d{6}\b/gi, ' [PIN] ');
      clean = clean.replace(/\b[1-9]\d{5}\b/g, ' [PIN] ');

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
    }

    const firstLine = text.split(/\r?\n/)[0].trim().replace(/^Name:\s*/i, '');
    result['Monu'].orders.push({
      idx: i + 1,
      date: m.dateStr,
      time: m.timeStr,
      cust: firstLine,
      amt,
      type: i + 1 === 28 || i + 1 === 146 ? 'Office Order' : 'Direct Dispatch'
    });
  }

  // 5. MANJUSHREE KASTURE
  const manjuMsgs = msgs.filter(m => m.sender === 'Sujata Nutrilive Manju');
  for (let i = 0; i < manjuMsgs.length; i++) {
    const m = manjuMsgs[i];
    const text = m.text.replace(/(\d),(\d{3})/g, '$1$2').trim();

    if (text === '<Media omitted>' || text === 'This message was deleted') continue;
    // Skip chatter
    if ([1, 4, 5, 7, 9, 10, 11, 14, 15, 23, 25, 26, 31, 34, 35, 36, 40, 48, 49, 51, 53, 54, 58, 59, 60, 62, 64, 65, 72, 73, 75, 78, 84, 86, 87, 92, 93, 96, 97, 98, 99, 100, 111, 113, 114, 115, 122, 123, 124, 125, 126, 129, 131, 135].includes(i + 1)) {
      continue;
    }

    // Check if web order
    const isWeb = [19, 20, 22, 24, 28, 30, 32, 37, 105, 106, 117, 119, 121, 127, 137].includes(i + 1);

    let amt = 0;
    if (i + 1 === 110) amt = 1080; // Dilip P Joshi (Navratri combo)
    else if (i + 1 === 133) amt = 550; // Gauri Gurunath Wamanacharya (Vitamin B12 prepaid)
    else if (i + 1 === 134) amt = 315; // Rajkumar k vadgave (Spirulina powder prepaid)
    else if (i + 1 === 119) amt = 499; // Bharat Sharma (Web order)
    else {
      let clean = text.replace(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g, ' [PHONE] ');
      clean = clean.replace(/\b\d{5}\s*\d{5}\b/g, ' [PHONE] ');
      clean = clean.replace(/\b(?:pin|pincode|post|code)\s*[-:]?\s*\d{6}\b/gi, ' [PIN] ');
      clean = clean.replace(/\b[1-9]\d{5}\b/g, ' [PIN] ');

      const mWebAmt = text.match(/•\s*₹([\d\.]+)/);
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
    }

    let cust = 'Unknown';
    const nameM = text.match(/(?:name|नाव|client)\s*[:=-]?\s*([^\n\r,•]+)/i);
    if (nameM) cust = nameM[1].trim();
    else cust = text.split(/\r?\n/)[0].trim();

    const orderObj = {
      idx: i + 1,
      date: m.dateStr,
      time: m.timeStr,
      cust,
      amt,
      type: isWeb ? 'Website Order (Forwarded)' : 'Direct Dispatch'
    };

    if (isWeb) {
      result['Manjushree Kasture'].webOrders.push(orderObj);
    } else {
      result['Manjushree Kasture'].directOrders.push(orderObj);
    }
  }

  return result;
}

const finalRes = analyzeAllTelecallers();
fs.writeFileSync('scripts/verified_october_telecaller_orders.json', JSON.stringify(finalRes, null, 2), 'utf8');
console.log('Saved scripts/verified_october_telecaller_orders.json');
