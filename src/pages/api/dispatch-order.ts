import type { APIRoute } from 'astro';
import { connect } from '@tidbcloud/serverless';

export const prerender = false;

// Pincode to State Mapping
function getStateFromPincode(pincode: string): string {
  if (!pincode || pincode.length !== 6) return 'MAHARASHTRA';
  const prefix = pincode.substring(0, 2);
  const stateMap: Record<string, string> = {
    '11': 'DELHI',
    '12': 'HARYANA', '13': 'HARYANA',
    '14': 'PUNJAB', '15': 'PUNJAB', '16': 'PUNJAB',
    '17': 'HIMACHAL PRADESH',
    '18': 'JAMMU AND KASHMIR', '19': 'JAMMU AND KASHMIR',
    '20': 'UTTAR PRADESH', '21': 'UTTAR PRADESH', '22': 'UTTAR PRADESH', '23': 'UTTAR PRADESH',
    '24': 'UTTAR PRADESH', '25': 'UTTAR PRADESH', '26': 'UTTAR PRADESH', '27': 'UTTAR PRADESH', '28': 'UTTAR PRADESH',
    '30': 'RAJASTHAN', '31': 'RAJASTHAN', '32': 'RAJASTHAN', '33': 'RAJASTHAN', '34': 'RAJASTHAN',
    '36': 'GUJARAT', '37': 'GUJARAT', '38': 'GUJARAT', '39': 'GUJARAT',
    '40': 'MAHARASHTRA', '41': 'MAHARASHTRA', '42': 'MAHARASHTRA', '43': 'MAHARASHTRA', '44': 'MAHARASHTRA',
    '45': 'MADHYA PRADESH', '46': 'MADHYA PRADESH', '47': 'MADHYA PRADESH', '48': 'MADHYA PRADESH', '49': 'MADHYA PRADESH',
    '50': 'TELANGANA', '51': 'ANDHRA PRADESH', '52': 'ANDHRA PRADESH', '53': 'ANDHRA PRADESH',
    '56': 'KARNATAKA', '57': 'KARNATAKA', '58': 'KARNATAKA', '59': 'KARNATAKA',
    '60': 'TAMIL NADU', '61': 'TAMIL NADU', '62': 'TAMIL NADU', '63': 'TAMIL NADU', '64': 'TAMIL NADU',
    '67': 'KERALA', '68': 'KERALA', '69': 'KERALA',
    '70': 'WEST BENGAL', '71': 'WEST BENGAL', '72': 'WEST BENGAL', '73': 'WEST BENGAL', '74': 'WEST BENGAL',
    '75': 'ODISHA', '76': 'ODISHA', '77': 'ODISHA',
    '80': 'BIHAR', '81': 'BIHAR', '82': 'BIHAR', '83': 'JHARKHAND', '84': 'BIHAR', '85': 'BIHAR'
  };
  return stateMap[prefix] || 'MAHARASHTRA';
}

function cleanPhone(raw: any): string | null {
  if (!raw) return null;
  const cleaned = String(raw).replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned.substring(2);
  }
  if (cleaned.length >= 10) {
    const match = cleaned.match(/[6-9]\d{9}/);
    if (match) return match[0];
    return cleaned.slice(-10);
  }
  return null;
}

function splitAddress(fullAddr: string): { line1: string; line2: string } {
  let addr = fullAddr.replace(/[\r\n]+/g, ', ').replace(/\s+/g, ' ').trim();
  // Strip trailing pincodes or state names
  addr = addr.replace(/[\s,-]+[1-9]\d{5}\b.*$/, '').trim();
  addr = addr.replace(/[\s,-]+(?:Maharashtra|Gujarat|Delhi|Rajasthan|West Bengal|WB|MH|RJ)\b.*$/i, '').trim();

  const parts = addr.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const mid = Math.ceil(parts.length / 2);
    const line1 = parts.slice(0, mid).join(', ').substring(0, 45);
    const line2 = parts.slice(mid).join(', ').substring(0, 45);
    return { line1, line2 };
  } else {
    return {
      line1: addr.substring(0, 45),
      line2: addr.length > 45 ? addr.substring(45, 90) : ''
    };
  }
}

function extractCity(address: string, pincode: string): string {
  const lower = address.toLowerCase();
  const knownCities = [
    'pune', 'mumbai', 'nashik', 'nagpur', 'solapur', 'amravati', 'kolhapur',
    'aurangabad', 'chhatrapati sambhajinagar', 'sangli', 'satara', 'dhule',
    'jalgaon', 'ahmednagar', 'thane', 'kalyan', 'navi mumbai', 'nanded',
    'beed', 'latur', 'parbhani', 'washim', 'gondia', 'bhandara', 'wardha',
    'buldhana', 'chandrapur', 'gadchiroli', 'yavatmal', 'jalna', 'osmanabad',
    'dharashiv', 'palghar', 'raigad', 'ratnagiri', 'sindhudurg', 'khopoli',
    'godavarikhani', 'ramagundam', 'sangareddy', 'ajmer', 'valsad'
  ];
  for (const c of knownCities) {
    if (lower.includes(c)) {
      return c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return 'NASHIK';
}

function identifyCaller(rawSender: string, msgText: string): string {
  const combined = (rawSender + ' ' + msgText).toLowerCase();
  if (combined.includes('9922534443') || combined.includes('manju')) return 'Manjushree Kasture';
  if (combined.includes('9272471529') || combined.includes('vaishnavi')) return 'Vaishnavi Diwate';
  if (combined.includes('9922577344') || combined.includes('punam')) return 'Punam Kasture';
  if (combined.includes('9922500344') || combined.includes('monu')) return 'Monu';
  if (combined.includes('9503434653') || combined.includes('karishma')) return 'Karishma Patil';
  if (combined.includes('9096759653') || combined.includes('yash')) return 'Yash Suryawanshi (Founder Direct)';
  return 'Direct / Office';
}

function calculateWeight(productStr: string): number {
  const lower = productStr.toLowerCase();
  if (lower.includes('40 bottle') || lower.includes('40')) return 5000;
  if (lower.includes('13 bottle') || lower.includes('distributor')) return 1800;
  if (lower.includes('3 month') || lower.includes('6 bottle')) return 600;
  if (lower.includes('2 month') || lower.includes('4 bottle')) return 400;
  if (lower.includes('combo') || lower.includes('2 bottle')) return 220;
  if (lower.includes('powder')) return 180;
  if (lower.includes('120') || lower.includes('tablet')) return 180;
  return 220;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { text: rawBody };
    }

    const text: string = payload.text || payload.message || payload.order_text || '';
    const sender: string = payload.sender || payload.caller || '';

    // If structured JSON was passed
    let customerName = payload.customer_name || '';
    let mobile = cleanPhone(payload.mobile_number || payload.mobile || payload.phone);
    let fullAddress = payload.full_address || payload.address || '';
    let pincode = payload.pincode || '';
    let products = payload.products_ordered || payload.products || payload.product || '';
    let amount = parseFloat(payload.amount || payload.total_bill || '0');
    let paymentMode = payload.payment_mode || payload.payment || 'COD';
    let caller = payload.telecaller || payload.caller || '';

    // If raw text format from WhatsApp/MacroDroid was passed, parse it
    if (text && (!customerName || !mobile || !pincode)) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const lower = line.toLowerCase();
        if (/name\s*[:-]/i.test(line) && !customerName) {
          customerName = line.replace(/.*name\s*[:-]\s*/i, '').trim();
        } else if (/mobile\s*[:-]/i.test(line) && !mobile) {
          mobile = cleanPhone(line.replace(/.*mobile\s*[:-]\s*/i, '').trim());
        } else if (/pin(?:code)?\s*[:-]/i.test(line) && !pincode) {
          const m = line.match(/\b[1-9]\d{5}\b/);
          if (m) pincode = m[0];
        } else if (/address\s*[:-]/i.test(line) && !fullAddress) {
          fullAddress = line.replace(/.*address\s*[:-]\s*/i, '').trim();
        } else if (/product\s*[:-]/i.test(line) && !products) {
          products = line.replace(/.*product\s*[:-]\s*/i, '').trim();
        } else if (/total\s*bill\s*[:-]/i.test(line) && !amount) {
          const m = line.match(/\d+/);
          if (m) amount = parseFloat(m[0]);
        } else if (/payment\s*mode\s*[:-]/i.test(line)) {
          paymentMode = lower.includes('prepaid') ? 'Prepaid' : 'COD';
        }
      }

      // Regex fallbacks
      if (!pincode) {
        const pinMatch = text.match(/\b[1-9]\d{5}\b/);
        if (pinMatch) pincode = pinMatch[0];
      }
      if (!mobile) {
        mobile = cleanPhone(text);
      }
      if (!caller) {
        caller = identifyCaller(sender, text);
      }
    }

    if (!customerName || !mobile || !pincode) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing mandatory fields: customerName, mobile, or pincode',
        parsed: { customerName, mobile, pincode, fullAddress, amount, paymentMode, caller }
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Determine state & city
    const state = getStateFromPincode(pincode);
    const city = extractCity(fullAddress, pincode);
    const { line1, line2 } = splitAddress(fullAddress);

    // Channel routing
    let dispatchChannel = 'India Post';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('shadow') || lowerText.includes('shadowfax') || lowerText.includes('shadow fox')) {
      dispatchChannel = 'Shadowfax';
    } else if (lowerText.includes('office') || lowerText.includes('walk-in') || lowerText.includes('visited office')) {
      dispatchChannel = 'Office';
    }

    const weightGrams = calculateWeight(products);

    // Connect to TiDB Serverless
    const dbUrl = process.env.DATABASE_URL || 'mysql://3FeKz4HehHXuLCf.root:SujataNutriLive2026!Db@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sujata_nutrilive';
    const conn = connect({ url: dbUrl });

    // Check duplicate order within last 24h
    const dupCheck: any = await conn.execute(
      `SELECT order_id, order_date, amount FROM orders 
       WHERE customer_phone = ? AND order_date >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND amount = ? 
       LIMIT 1;`,
      [mobile, amount]
    );

    if (dupCheck && dupCheck.length > 0) {
      return new Response(JSON.stringify({
        success: true,
        is_duplicate: true,
        message: 'Order already exists in TiDB for this customer today',
        order_id: dupCheck[0].order_id
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Get Next Order ID
    const nextIdRes: any = await conn.execute('SELECT COALESCE(MAX(order_id), 0) + 1 AS next_id FROM orders;');
    const orderId = nextIdRes[0].next_id;

    const todayDate = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Kolkata' }).substring(0, 5);
    const monthStr = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

    // Insert Order into TiDB
    await conn.execute(`
      INSERT INTO orders 
      (order_id, order_date, order_time, month, customer_phone, customer_name, caller_name, pincode, full_address, products_ordered, amount, payment_mode, order_type, dispatch_channel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      orderId, todayDate, timeStr, monthStr, mobile, customerName, caller, pincode,
      fullAddress, products, amount, paymentMode, 'Direct Dispatch', dispatchChannel
    ]);

    // Upsert Customer
    await conn.execute(`
      INSERT INTO customers 
      (phone, full_name, default_address, city, state, pincode, total_orders, total_revenue, first_order_date, last_order_date, customer_segment)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 'New')
      ON DUPLICATE KEY UPDATE
        total_orders = total_orders + 1,
        total_revenue = total_revenue + VALUES(total_revenue),
        last_order_date = VALUES(last_order_date),
        default_address = IF(VALUES(default_address) != '', VALUES(default_address), default_address),
        pincode = VALUES(pincode),
        customer_segment = IF(total_revenue + VALUES(total_revenue) >= 5000, 'VIP', 'Repeat');
    `, [mobile, customerName, fullAddress, city, state, pincode, amount, todayDate, todayDate]);

    // Update Telecaller
    await conn.execute(`
      INSERT INTO telecallers (caller_name, total_orders, total_revenue)
      VALUES (?, 1, ?)
      ON DUPLICATE KEY UPDATE
        total_orders = total_orders + 1,
        total_revenue = total_revenue + VALUES(total_revenue);
    `, [caller, amount]);

    // Send Telegram Notification (if token available)
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (telegramToken && telegramChatId) {
      try {
        const msg = `🌿 *Sujata Nutrilive — New Order #${orderId}*\n\n` +
          `👤 *Customer:* ${customerName} (${mobile})\n` +
          `📍 *Address:* ${line1}, ${line2}\n` +
          `🏙️ *City:* ${city} | *Pincode:* ${pincode} (${state})\n` +
          `📦 *Product:* ${products}\n` +
          `💰 *Amount:* ₹${amount} (${paymentMode})\n` +
          `🚚 *Courier:* ${dispatchChannel} (${weightGrams}g)\n` +
          `📞 *Telecaller:* ${caller}\n` +
          `✅ *Status:* Recorded in TiDB Cloud`;

        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: msg,
            parse_mode: 'Markdown'
          })
        });
      } catch (e) {
        console.error('Telegram notification error:', e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Order ingested successfully into TiDB Cloud!',
      order: {
        order_id: orderId,
        date: todayDate,
        customer_name: customerName,
        phone: mobile,
        pincode,
        city,
        state,
        amount,
        payment_mode: paymentMode,
        dispatch_channel: dispatchChannel,
        weight_grams: weightGrams,
        telecaller: caller
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Dispatch Order Ingestion Error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Internal Server Error'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
