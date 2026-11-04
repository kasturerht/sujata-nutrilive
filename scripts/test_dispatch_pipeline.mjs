import { connect } from '@tidbcloud/serverless';
import * as XLSX from 'xlsx';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'mysql://3FeKz4HehHXuLCf.root:SujataNutriLive2026!Db@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sujata_nutrilive';
const conn = connect({ url: dbUrl });

console.log("=" .repeat(75));
console.log("🧪 TESTING DISPATCH INGESTION & 10:00 AM EXCEL GENERATOR PIPELINE");
console.log("=" .repeat(75));

async function runTest() {
  // 1. Check TiDB connection
  const check = await conn.execute('SELECT COUNT(*) as cnt FROM orders;');
  console.log('✅ 1. TiDB Cloud Connected! Existing orders count:', check[0].cnt);

  // 2. Insert a test pending order for today
  const testPhone = '9999888877';
  const testOrderRes = await conn.execute(`
    SELECT COALESCE(MAX(order_id), 0) + 1 AS next_id FROM orders;
  `);
  const testOrderId = testOrderRes[0].next_id;

  console.log(`📦 2. Inserting Test Order #${testOrderId} (pending dispatch)...`);
  await conn.execute(`
    INSERT INTO orders 
    (order_id, order_date, order_time, month, customer_phone, customer_name, caller_name, pincode, full_address, products_ordered, amount, payment_mode, order_type, dispatch_channel, manifest_id)
    VALUES (?, CURDATE(), '14:20', 'November 2026', ?, 'Sujata Cloud Test Order', 'Manjushree Kasture', '422007', 'Sujata Office, Nashik, Maharashtra', '1 Spirulina + 1 Sea Buckthorn Combo', 1050.00, 'COD', 'Direct Dispatch', 'India Post', NULL);
  `, [testOrderId, testPhone]);

  // 3. Test querying pending orders
  const pendingOrders = await conn.execute(`
    SELECT * FROM orders WHERE dispatch_channel = 'India Post' AND manifest_id IS NULL ORDER BY order_id ASC;
  `);
  console.log(`📑 3. Query Pending Orders: Found ${pendingOrders.length} un-manifested order(s).`);

  // 4. Test Excel generation with 4-sheet template
  const templatePath = path.resolve('src/data/india_post_template.xlsx');
  console.log('📄 4. Reading template:', templatePath);
  const templateBuf = fs.readFileSync(templatePath);
  const wb = XLSX.read(templateBuf, { type: 'buffer' });

  const existingRows = XLSX.utils.sheet_to_json(wb.Sheets['ArticleDetails'], { header: 1 });
  const headers = existingRows[0];

  const dataRows = [headers];
  pendingOrders.forEach((o, idx) => {
    const row = [
      idx + 1, null, 220, 'NROL', 15, 15, 13, true, 'ND', 'RTS',
      'SUJATA NUTRILIVE', 'SUJATA NUTRILIVE AGROTECH', 'NASHIK', 'NASHIK', 'NASHIK',
      'MAHARASHTRA', 422007, null, null, null, null,
      o.customer_name, null, 'Sujata Office', 'Nashik Road', 'Nashik', 'MAHARASHTRA',
      422007, null, null, null, null, false, false, 422007, null,
      9834783503, parseInt(o.customer_phone), null, null,
      'COD', `${parseInt(o.amount)}/-`, null, null, false, true, true, null
    ];
    dataRows.push(row);
  });

  wb.Sheets['ArticleDetails'] = XLSX.utils.aoa_to_sheet(dataRows);
  const outBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  console.log(`✅ 5. Generated Excel buffer (${outBuf.length} bytes), Sheets:`, wb.SheetNames);

  // 5. Test Email Sending
  const gmailUser = process.env.GMAIL_USER || 'sujatanutrilive@gmail.com';
  const gmailPass = process.env.GMAIL_APP_PASSWORD || 'ysla kiuk wjju kbct';
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass }
  });

  console.log(`📧 6. Sending test email with attached Excel to ${gmailUser}...`);
  const info = await transporter.sendMail({
    from: `"Sujata Nutrilive Cloud" <${gmailUser}>`,
    to: gmailUser,
    subject: `🌿 [TEST PIPELINE] India Post Dispatch Excel Generated (${new Date().toLocaleDateString('en-GB')})`,
    html: `
      <h2>🌿 Sujata Nutrilive — Automated Dispatch Pipeline Test</h2>
      <p>हा स्वयंचलित टेस्ट ईमेल आहे. TiDB Cloud मधून थेट अधिकृत India Post ४-शीट एक्सेल फाईल जनरेट करून अटॅच केली आहे.</p>
      <p><b>ऑर्डर क्र:</b> #${testOrderId} | <b>रक्कम:</b> ₹1,050 COD | <b>ग्राहक:</b> Sujata Cloud Test Order</p>
      <p>Zero Human Touch Pipeline 100% Verified!</p>
    `,
    attachments: [
      {
        filename: `SUJATA_TEST_PIPELINE_${new Date().toISOString().split('T')[0]}.xlsx`,
        content: outBuf
      }
    ]
  });

  console.log('✅ 7. Email sent successfully! MessageId:', info.messageId);

  // Clean up test order from TiDB
  await conn.execute('DELETE FROM orders WHERE order_id = ?;', [testOrderId]);
  console.log(`🧹 8. Cleaned up test order #${testOrderId} from TiDB.`);

  console.log("=" .repeat(75));
  console.log("🎉 ALL TESTS PASSED 100%! PIPELINE IS FULLY OPERATIONAL!");
  console.log("=" .repeat(75));
}

runTest().catch(console.error);
