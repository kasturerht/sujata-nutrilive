import fs from 'fs';

const filePath = 'src/pages/api/webhooks/shopify-order.ts';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add import nodemailer
if (!code.includes("import nodemailer from 'nodemailer';")) {
  code = "import nodemailer from 'nodemailer';\n" + code;
}

// 2. Add sendOrderEmail function
const emailFnCode = `
async function sendOrderEmail(order: any, isCod: boolean): Promise<boolean> {
  const gmailUser = (typeof process !== 'undefined' && process.env?.GMAIL_USER) || 'sujatanutrilive@gmail.com';
  const gmailPass = (typeof process !== 'undefined' && process.env?.GMAIL_APP_PASSWORD) || '';
  if (!gmailUser || !gmailPass) {
    console.warn('GMAIL_USER or GMAIL_APP_PASSWORD missing, skipping direct email dispatch');
    return false;
  }

  const orderNum = order.order_number || order.name || 'N/A';
  const payType = isCod ? 'Cash on Delivery (COD)' : 'Prepaid (Online / UPI)';
  const totalPrice = order.total_price || '0.00';
  const items = (order.line_items || []).map((i: any) => {
    const v = i.variant_title ? ' (' + i.variant_title + ')' : '';
    return '• <strong>' + i.title + v + '</strong> × ' + i.quantity + ' (₹' + i.price + ')';
  }).join('<br>');
  const addr = order.shipping_address || order.billing_address || {};
  const name = ((addr.first_name || order.customer?.first_name || '') + ' ' + (addr.last_name || order.customer?.last_name || '')).trim() || 'Valued Customer';
  const phone = addr.phone || order.customer?.phone || order.phone || 'N/A';
  const city = [addr.address1, addr.address2, addr.city, addr.province, addr.zip].filter(Boolean).join(', ');

  const htmlContent = \`
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #064E3B; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #064E3B; margin: 0; font-size: 22px;">🌿 Sujata Nutrilive Agrotech</h2>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Official Instant Order Alert • 100% Direct Delivery</p>
      </div>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 15px; font-weight: bold; color: #166534;">🎉 Order Confirmed: #\${orderNum}</span>
        <span style="font-weight: 900; color: #166534; font-size: 18px;">₹\${totalPrice}</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 35%;"><strong>Payment Channel:</strong></td>
          <td style="padding: 8px 0; color: #111827; font-weight: bold;">\${payType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Customer Name:</strong></td>
          <td style="padding: 8px 0; color: #111827; font-weight: bold;">\${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Phone Number:</strong></td>
          <td style="padding: 8px 0; color: #111827; font-weight: bold;"><a href="tel:\${phone}" style="color: #064E3B; text-decoration: none;">\${phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Delivery Address:</strong></td>
          <td style="padding: 8px 0; color: #111827; line-height: 1.5;">\${city}</td>
        </tr>
      </table>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px; color: #111827; font-size: 14px;">📦 Ordered Formulations:</h4>
        <div style="background: #f9fafb; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #374151; line-height: 1.8;">
          \${items}
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 11px; color: #9ca3af;">
        Direct Automated Dispatch from Sujata Nutrilive Cloud Webhook Sentinel<br>
        Delivered directly to <strong>sujatanutrilive@gmail.com</strong>
      </div>
    </div>
  \`;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });

    await transporter.sendMail({
      from: \`"Sujata Nutrilive Orders" <\${gmailUser}>\`,
      to: 'sujatanutrilive@gmail.com',
      subject: \`🌿 [New Order #\${orderNum}] ₹\${totalPrice} (\${payType}) - \${name}\`,
      html: htmlContent
    });
    console.log(\`✅ Direct order email successfully delivered to sujatanutrilive@gmail.com for #\${orderNum}\`);
    return true;
  } catch(e: any) {
    console.error('Direct order email dispatch failed:', e?.message || e);
    return false;
  }
}
`;

// Insert emailFnCode before formatCorporateOrderMessage
if (!code.includes('async function sendOrderEmail')) {
  code = code.replace('function formatCorporateOrderMessage', emailFnCode + '\nfunction formatCorporateOrderMessage');
}

// In POST function, call sendOrderEmail
const webhookReturnTarget = `    let capiResult = null;
    if (enableWebhookCapi && metaPixelId && metaAccessToken) {
      capiResult = await sendMetaCapiPurchase(order, metaPixelId, metaAccessToken);
    }`;

const webhookReturnReplacement = `    let capiResult = null;
    if (enableWebhookCapi && metaPixelId && metaAccessToken) {
      capiResult = await sendMetaCapiPurchase(order, metaPixelId, metaAccessToken);
    }

    // 3. Direct Automated Email Dispatch to sujatanutrilive@gmail.com
    let emailDelivered = false;
    try {
      emailDelivered = await sendOrderEmail(order, isCod);
    } catch(e) {
      console.error('Direct email dispatch caught error:', e);
    }`;

if (code.includes(webhookReturnTarget)) {
  code = code.replace(webhookReturnTarget, webhookReturnReplacement);
  code = code.replace('telegramDelivered: telegramSuccess,', 'telegramDelivered: telegramSuccess,\n        emailDelivered: emailDelivered,');
  console.log('✅ Successfully patched shopify-order.ts with direct email notification engine!');
} else {
  console.error('❌ Could not find webhookReturnTarget in shopify-order.ts');
}

fs.writeFileSync(filePath, code, 'utf8');
