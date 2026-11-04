import type { APIRoute } from 'astro';
import { connect } from '@tidbcloud/serverless';
import * as XLSX from 'xlsx';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export const prerender = false;

function getStateFromPincode(pincode: string): string {
  if (!pincode || pincode.length !== 6) return 'MAHARASHTRA';
  const prefix = pincode.substring(0, 2);
  const stateMap: Record<string, string> = {
    '11': 'DELHI', '12': 'HARYANA', '13': 'HARYANA',
    '14': 'PUNJAB', '15': 'PUNJAB', '16': 'PUNJAB',
    '17': 'HIMACHAL PRADESH', '18': 'JAMMU AND KASHMIR', '19': 'JAMMU AND KASHMIR',
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

function splitAddress(fullAddr: string): { line1: string; line2: string } {
  let addr = (fullAddr || '').replace(/[\r\n]+/g, ', ').replace(/\s+/g, ' ').trim();
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
  const lower = (address || '').toLowerCase();
  const knownCities = [
    'pune', 'mumbai', 'nashik', 'nagpur', 'solapur', 'amravati', 'kolhapur',
    'aurangabad', 'chhatrapati sambhajinagar', 'sangli', 'satara', 'dhule',
    'jalgaon', 'ahmednagar', 'thane', 'kalyan', 'navi mumbai', 'nanded',
    'beed', 'latur', 'parbhani', 'washim', 'gondia', 'bhandara', 'wardha',
    'buldhana', 'chandrapur', 'gadchiroli', 'yavatmal', 'jalna', 'osmanabad',
    'dharashiv', 'palghar', 'raigad', 'ratnagiri', 'sindhudurg', 'khopoli',
    'godavarikhani', 'ramagundam', 'sangareddy', 'ajmer', 'valsad', 'shirur'
  ];
  for (const c of knownCities) {
    if (lower.includes(c)) {
      return c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return 'NASHIK';
}

function calculateWeight(productStr: string): number {
  const lower = (productStr || '').toLowerCase();
  if (lower.includes('40 bottle') || lower.includes('40')) return 5000;
  if (lower.includes('13 bottle') || lower.includes('distributor')) return 1800;
  if (lower.includes('3 month') || lower.includes('6 bottle')) return 600;
  if (lower.includes('2 month') || lower.includes('4 bottle')) return 400;
  if (lower.includes('combo') || lower.includes('2 bottle')) return 220;
  if (lower.includes('powder')) return 180;
  if (lower.includes('120') || lower.includes('tablet')) return 180;
  return 220;
}

export const ALL: APIRoute = async ({ request }) => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'mysql://3FeKz4HehHXuLCf.root:SujataNutriLive2026!Db@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sujata_nutrilive';
    const conn = connect({ url: dbUrl });

    // 1. Fetch pending orders for India Post
    const pendingOrders: any = await conn.execute(`
      SELECT 
        order_id, order_date, order_time, customer_phone, customer_name,
        caller_name, pincode, full_address, products_ordered, amount,
        payment_mode, order_type
      FROM orders
      WHERE dispatch_channel = 'India Post' AND manifest_id IS NULL
      ORDER BY order_id ASC;
    `);

    if (!pendingOrders || pendingOrders.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending India Post orders to dispatch today. Everything is up to date!'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    console.log(`Found ${pendingOrders.length} pending orders for India Post dispatch.`);

    // 2. Prepare Date & Filename
    const now = new Date();
    const dayStr = String(now.getDate()).padStart(2, '0');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthStr = monthNames[now.getMonth()];
    const manifestName = `SUJATA_${dayStr}_${monthStr}_final.xlsx`;

    // 3. Load Template
    let templatePath = path.resolve('src/data/india_post_template.xlsx');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/71a2db4c-5724-4f2e-94d9-9aa036757079/.user_uploaded/media_1793598932274_d37b67a2.xlsx');
    }

    const templateBuf = fs.readFileSync(templatePath);
    const wb = XLSX.read(templateBuf, { type: 'buffer' });
    const existingRows = XLSX.utils.sheet_to_json(wb.Sheets['ArticleDetails'], { header: 1 }) as any[][];
    const headers = existingRows[0];

    // 4. Build 48-column Data Rows
    const dataRows: any[][] = [headers];
    let totalCodAmount = 0;

    for (let i = 0; i < pendingOrders.length; i++) {
      const o = pendingOrders[i];
      const sr = i + 1;
      const weight = calculateWeight(o.products_ordered);
      const isLargeBox = weight >= 1500;
      const length = isLargeBox ? 25 : 15;
      const breadth = isLargeBox ? 20 : 15;
      const height = isLargeBox ? 15 : 13;

      const state = getStateFromPincode(o.pincode);
      const city = extractCity(o.full_address, o.pincode);
      const { line1, line2 } = splitAddress(o.full_address);

      const isCod = (o.payment_mode || '').toUpperCase().includes('COD');
      const codCode = isCod ? 'COD' : null;
      const codVal = isCod ? `${parseInt(o.amount)}/-` : null;
      if (isCod) totalCodAmount += parseFloat(o.amount || 0);

      const receiverMobile = parseInt(String(o.customer_phone).replace(/\D/g, '').slice(-10)) || o.customer_phone;
      const receiverPin = parseInt(String(o.pincode).replace(/\D/g, '')) || o.pincode;

      const row = [
        sr,                               // 1. SERIAL NUMBER
        null,                             // 2. BARCODE NO
        weight,                           // 3. PHYSICAL WEIGHT
        'NROL',                           // 4. SHAPE OF ARTICLE
        length,                           // 5. LENGTH
        breadth,                          // 6. BREADTH/DIAMETER
        height,                           // 7. HEIGHT
        true,                             // 8. PRIORITY FLAG
        'ND',                             // 9. DELIVERY INSTRUCTION
        'RTS',                            // 10. INSTRUCTION RTS
        'SUJATA NUTRILIVE',               // 11. SENDER NAME
        'SUJATA NUTRILIVE AGROTECH',      // 12. SENDER COMPANY
        'NASHIK',                         // 13. SENDER ADD LINE 1
        'NASHIK',                         // 14. SENDER ADD LINE 2
        'NASHIK',                         // 15. SENDER CITY
        'MAHARASHTRA',                    // 16. SENDER STATE
        422007,                           // 17. SENDER PINCODE
        null,                             // 18. SENDER EMAILID
        null,                             // 19. SENDER ALT CONTACT
        null,                             // 20. SENDER KYC
        null,                             // 21. SENDER TAX REFERENCE
        o.customer_name,                  // 22. RECEIVER NAME
        null,                             // 23. RECEIVER COMPANY
        line1,                            // 24. RECEIVER ADD LINE 1
        line2,                            // 25. RECEIVER ADD LINE 2
        city,                             // 26. RECEIVER CITY
        state,                            // 27. RECEIVER STATE
        receiverPin,                      // 28. RECEIVER PINCODE
        null,                             // 29. RECEIVER EMAILID
        null,                             // 30. RECEIVER ALT CONTACT
        null,                             // 31. RECEIVER KYC
        null,                             // 32. RECEIVER TAX REFERENCE
        false,                            // 33. ALT ADDRESS FLAG
        false,                            // 34. PICKUP ADDRESS FLAG
        422007,                           // 35. DROP OFF PINCODE
        null,                             // 36. DROPOFF/PICKUP OFFICE ID
        9834783503,                       // 37. SENDER MOBILE NO
        receiverMobile,                   // 38. RECEIVER MOBILE NO
        null,                             // 39. PREPAYMENT CODE
        null,                             // 40. VALUE OF PREPAYMENT
        codCode,                          // 41. CODR/COD
        codVal,                           // 42. VALUE FOR CODR/COD
        null,                             // 43. INSURANCE TYPE
        null,                             // 44. VALUE OF INSURANCE
        false,                            // 45. ACK
        true,                             // 46. REGISTRATION
        true,                             // 47. OTP BASED DELIVERY
        null                              // 48. BULK REFERENCE
      ];
      dataRows.push(row);
    }

    // 5. Build New Sheet & Excel Buffer
    wb.Sheets['ArticleDetails'] = XLSX.utils.aoa_to_sheet(dataRows);
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 6. Save locally if running on local workspace
    try {
      const localDestinations = [
        `F:/RK/Sujata Nutrilive/dispatch_excel/${manifestName}`,
        `C:/Users/Admin/Downloads/${manifestName}`,
        `F:/RK/Sujata Nutrilive/Daily orders dispatch/reports/${manifestName}`
      ];
      for (const dest of localDestinations) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, excelBuffer);
      }
      console.log(`Saved local copies of ${manifestName}`);
    } catch (e) {
      console.log('Local file save skipped (likely cloud environment):', e);
    }

    // 7. Send Email with Attachment via Nodemailer
    const gmailUser = process.env.GMAIL_USER || 'sujatanutrilive@gmail.com';
    const gmailPass = process.env.GMAIL_APP_PASSWORD || 'ysla kiuk wjju kbct';
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });

    let ordersHtml = `
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Segoe UI, sans-serif; font-size: 13px;">
        <tr style="background-color: #166534; color: white;">
          <th>Sr</th><th>Customer Name</th><th>City / State</th><th>Pincode</th><th>Mobile</th><th>Amount</th><th>Mode</th><th>Caller</th>
        </tr>
    `;
    pendingOrders.forEach((o: any, idx: number) => {
      ordersHtml += `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
          <td align="center">${idx + 1}</td>
          <td><b>${o.customer_name}</b></td>
          <td>${extractCity(o.full_address, o.pincode)} (${getStateFromPincode(o.pincode)})</td>
          <td align="center">${o.pincode}</td>
          <td align="center">${o.customer_phone}</td>
          <td align="right">₹${parseFloat(o.amount).toLocaleString('en-IN')}</td>
          <td align="center"><b>${o.payment_mode}</b></td>
          <td>${o.caller_name}</td>
        </tr>
      `;
    });
    ordersHtml += `</table>`;

    const mailOptions = {
      from: `"Sujata Nutrilive Cloud" <${gmailUser}>`,
      to: `${gmailUser}, yash.suryawanshi@sujatanutrilive.com`,
      subject: `🌿 Sujata Nutrilive — India Post Dispatch Manifest (${manifestName})`,
      html: `
        <div style="font-family: Segoe UI, sans-serif; color: #1f2937; max-width: 800px; margin: auto;">
          <h2 style="color: #166534; border-bottom: 2px solid #166534; padding-bottom: 8px;">
            🌿 Sujata Nutrilive — Daily Orders Dispatch Manifest
          </h2>
          <p>सकाळचे १०:०० वाजताचे अधिकृत India Post ४-शीट डिस्पॅच एक्सेल तयार झाले आहे.</p>
          <div style="background-color: #ecfdf5; padding: 12px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #a7f3d0;">
            <p style="margin: 4px 0;">📦 <b>एकूण डिस्पॅच ऑर्डर्स:</b> ${pendingOrders.length}</p>
            <p style="margin: 4px 0;">💰 <b>एकूण संकलित होणारी COD रक्कम:</b> ₹${totalCodAmount.toLocaleString('en-IN')}/-</p>
            <p style="margin: 4px 0;">📄 <b>फाईलचे नाव:</b> <code>${manifestName}</code> (सोबत अटॅच केली आहे)</p>
          </div>
          <h3>📋 आजच्या डिस्पॅच ऑर्डर्सचा तपशील:</h3>
          ${ordersHtml}
          <p style="margin-top: 20px; font-size: 11px; color: #6b7280;">
            ही सिस्टीम स्वयंचलितरित्या TiDB Cloud Serverless व Vercel Cron द्वारे चालवली जाते. (Zero Human Touch)
          </p>
        </div>
      `,
      attachments: [
        {
          filename: manifestName,
          content: excelBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email with attachment ${manifestName} sent successfully to ${gmailUser}!`);

    // 8. Register Batch in TiDB & Update Orders
    const batchRes: any = await conn.execute(`
      INSERT INTO dispatch_batches (manifest_name, dispatch_date, order_count, total_cod_amount)
      VALUES (?, CURDATE(), ?, ?);
    `, [manifestName, pendingOrders.length, totalCodAmount]);

    const batchId = batchRes.insertId || 1;
    const orderIds = pendingOrders.map((o: any) => o.order_id);

    await conn.execute(`
      UPDATE orders 
      SET manifest_id = ? 
      WHERE order_id IN (${orderIds.join(',')});
    `, [batchId]);

    console.log(`Updated ${orderIds.length} orders with manifest_id = ${batchId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Daily dispatch manifest generated and emailed successfully!',
      batch: {
        batch_id: batchId,
        manifest_name: manifestName,
        orders_count: pendingOrders.length,
        total_cod_amount: totalCodAmount
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error('Daily Dispatch Cron Error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Internal Server Error'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
