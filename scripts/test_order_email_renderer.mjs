import fs from 'fs';
import nodemailer from 'nodemailer';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

function formatShopifyOfficialOrderHtml(order) {
  const orderNum = order.order_number || order.name || '1030';
  const orderId = order.id || '18964958904452';
  const viewOrderUrl = `https://admin.shopify.com/store/tvczdq-nu/orders/${orderId}`;
  
  const addr = order.shipping_address || order.billing_address || {};
  const customerName = ((addr.first_name || order.customer?.first_name || '') + ' ' + (addr.last_name || order.customer?.last_name || '')).trim() || 'Valued Customer';
  
  // Format Date and Time in IST
  const createdAt = order.created_at ? new Date(order.created_at) : new Date();
  const dateStr = createdAt.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric'
  });
  const timeStr = createdAt.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();

  // Payment processing method
  const gateways = (order.payment_gateway_names || []).join(' ').toLowerCase();
  const isCod =
    order.gateway === 'cash_on_delivery' ||
    gateways.includes('cod') ||
    gateways.includes('cash') ||
    order.financial_status === 'pending';
  
  let paymentMethod = 'Razorpay';
  if (isCod) {
    paymentMethod = 'Cash on Delivery (COD)';
  } else if (order.payment_gateway_names && order.payment_gateway_names.length > 0) {
    paymentMethod = order.payment_gateway_names.join(', ');
  }

  // Delivery Method
  const shippingTitle = order.shipping_lines?.[0]?.title || 'Free Express Shipping (100% On Us)';
  const shippingPrice = parseFloat(order.shipping_lines?.[0]?.price || '0.00').toFixed(2);

  // Address
  const street1 = addr.address1 || '';
  const street2 = addr.address2 || '';
  const city = addr.city || '';
  const province = addr.province || addr.province_code || '';
  const zip = addr.zip || '';
  const country = addr.country || 'India';
  const rawPhone = addr.phone || order.customer?.phone || order.phone || '';
  let phoneFormatted = rawPhone.replace(/\s+/g, '');
  if (phoneFormatted && !phoneFormatted.startsWith('+')) {
    phoneFormatted = '+' + (phoneFormatted.length === 10 ? '91' : '') + phoneFormatted;
  }

  // Items HTML
  const itemsHtml = (order.line_items || []).map((item) => {
    const itemPrice = parseFloat(item.price || '0').toFixed(2);
    const lineTotal = (parseFloat(item.price || '0') * (item.quantity || 1)).toFixed(2);
    const variantTitle = item.variant_title ? `<span class="order-list__item-variant" style="font-size: 14px; line-height: 1.42; color: #6D7175;">${item.variant_title}</span> • ` : '';
    const sku = item.sku ? `<span class="order-list__item-variant" style="font-size: 14px; line-height: 1.42; color: #6D7175;">SKU: ${item.sku}</span>` : '';
    const itemImg = 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_yruxb3yruxb3yrux_compact_cropped.png?v=1788606546';

    return `
    <tr class="order-list__item" style="margin-top: 0; margin-bottom: 0; width: 100%; padding: 0;">
      <td class="order-list__item__cell" style="-webkit-text-size-adjust: 100%; -moz-text-size-adjust: 100%; -ms-text-size-adjust: 100%; text-size-adjust: 100%; margin-top: 0; margin-bottom: 0; padding: 0 0 20px; border-width: 0;">
        <table style="width: 100%; border-collapse: collapse; border-spacing: 0; padding: 0;" cellpadding="0" cellspacing="0">
          <tbody><tr>
            <td class="order-list__image-cell" style="margin-top: 0; margin-bottom: 0; padding: 0; border-width: 0;" valign="middle">
              <img src="${itemImg}" align="left" width="60" height="60" class="order-list__product-image" style="height: auto; line-height: 0; outline: none; text-decoration: none; vertical-align: top; margin-right: 15px; border-radius: 4px; border: 1px solid #C9CCCF;"/>
            </td>
            <td class="order-list__product-description-cell" style="width: 100%; padding: 0; border-width: 0;">
              <span class="order-list__item-title" style="font-size: 14px; line-height: 1.42; color: #202223; font-weight: 500;">
                ${item.title}
              </span><br/>
              <span style="color: #202223; font-size: 14px; line-height: 1.42;">Rs. ${itemPrice} × ${item.quantity}</span><br/>
              ${variantTitle}${sku}
            </td>
            <td class="order-list__price-cell" style="white-space: nowrap; padding: 0; border-width: 0;" align="right">
              <p class="order-list__item-price" style="color: #202223; line-height: 20px; font-weight: 400; margin: 0 0 0 16px; padding: 0; font-size: 14px;">
                Rs. ${lineTotal}
              </p>
            </td>
          </tr></tbody>
        </table>
      </td>
    </tr>`;
  }).join('');

  // Subtotal Calculation
  const subtotal = (order.line_items || []).reduce((acc, i) => acc + (parseFloat(i.price || '0') * (i.quantity || 1)), 0).toFixed(2);

  // Discounts
  let discountsHtml = '';
  const totalDiscounts = parseFloat(order.total_discounts || '0');
  if (totalDiscounts > 0) {
    const code = order.discount_applications?.[0]?.code || 'DISCOUNT';
    discountsHtml = `
    <tr class="subtotal-line" style="margin-top: 0; margin-bottom: 0; padding: 0;">
      <td class="subtotal-line__title" style="padding: 2px 0; border-width: 0;">
        <p style="color: #202223; line-height: 1.42em; margin: 0; padding: 0; font-size: 14px;">Order discount</p>
        <span style="font-size: 13px; line-height: 1.42em; color: #6D7175;">
          <svg style="width: 12px; height: 12px; vertical-align: middle; fill: #6D7175; margin-right: 4px;" viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>
          ${code} (-Rs. ${totalDiscounts.toFixed(2)})
        </span>
      </td>
      <td class="subtotal-line__value" style="padding: 2px 0; border-width: 0; font-size: 14px; color: #202223;" align="right">
        -Rs. ${totalDiscounts.toFixed(2)}
      </td>
    </tr>`;
  }

  // Tax lines
  let taxHtml = '';
  if (order.tax_lines && order.tax_lines.length > 0) {
    const tax = order.tax_lines[0];
    const taxRate = tax.rate ? (tax.rate * 100).toFixed(1) : '18.0';
    const taxTitle = `${tax.title || 'IGST'} ${taxRate}%`;
    taxHtml = `
    <tr class="subtotal-line" style="margin-top: 0; margin-bottom: 0; padding: 0;">
      <td class="subtotal-line__title" style="padding: 2px 0; border-width: 0;">
        <p style="color: #202223; line-height: 1.42em; margin: 0; padding: 0; font-size: 14px;">Tax</p>
        <span style="font-size: 13px; line-height: 1.42em; color: #6D7175;">(${taxTitle})</span>
      </td>
      <td class="subtotal-line__value" style="padding: 2px 0; border-width: 0; font-size: 14px; color: #202223;" align="right">
        Rs. ${parseFloat(tax.price || '0').toFixed(2)}
      </td>
    </tr>`;
  }

  const totalPrice = parseFloat(order.total_price || '0').toFixed(2);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">
<html style="font-size: 14px; font-weight: 400; line-height: 20px; color: #202223; font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; margin: 0; padding: 0;">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="viewport" content="width=device-width"/>
<style>
body { margin: 0 !important; padding: 0; height: 100%; width: 100%; font-size: 14px; font-weight: 400; line-height: 20px; color: #202223; font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; }
img { border: 0; height: auto; outline: none; text-decoration: none; vertical-align: top; }
.mail-button:hover { background-color: #007658; border-color: #007658; }
a, a:hover, a:active, a:visited { color: #1990C6; }
@media (max-width: 534px) {
  .container.section { width: 100% !important; margin: 0 auto !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; }
}
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f7;">
  <table class="row" style="width: 100%; border-collapse: collapse; border-spacing: 0; margin-top: 0; margin-bottom: 0; padding: 0;" cellpadding="0" cellspacing="0">
    <tbody>
      <tr class="mail-priority-indicator" style="height: 8px; padding: 0;" bgcolor="#c9cccf">
        <td style="padding: 0; border-width: 0;"></td>
      </tr>
    </tbody>
  </table>

  <table class="body" style="width: 100%; border-collapse: collapse; border-spacing: 0; margin-top: 0; margin-bottom: 0; padding: 0;" cellpadding="0" cellspacing="0">
    <tbody>
      <tr>
        <td align="center" style="padding: 24px 10px;">
          <table class="container section" style="width: 100%; max-width: 470px; text-align: left; border-radius: 8px; margin: 0 auto; background: #ffffff; border: 1px solid #C9CCCF; border-collapse: separate;" cellpadding="0" cellspacing="0">
            <tbody>
              <!-- TOP SECTION -->
              <tr>
                <td style="padding: 24px 20px 20px;">
                  <div style="font-size: 14px; color: #202223; line-height: 1.5; margin-bottom: 18px;">
                    ${customerName} placed order #${orderNum} on ${dateStr} at ${timeStr}.
                  </div>
                  <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tbody><tr>
                      <td>
                        <a class="mail-button" href="${viewOrderUrl}" style="color: white; text-decoration: none; font-size: 14px; font-weight: 500; display: inline-block; background-color: #008060; border-radius: 4px; padding: 10px 18px; border: none;">View order</a>
                      </td>
                    </tr></tbody>
                  </table>
                </td>
              </tr>

              <!-- ORDER SUMMARY SECTION -->
              <tr>
                <td style="border-top: 1px solid #C9CCCF; padding: 20px;">
                  <strong style="color: #202223; font-weight: 600; font-size: 16px; display: block; margin-bottom: 16px;">Order summary</strong>
                  
                  <table style="width: 100%; border-collapse: collapse;" cellpadding="0" cellspacing="0">
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- SUBTOTAL LINES -->
                  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;" cellpadding="0" cellspacing="0">
                    <tbody>
                      <tr class="subtotal-line">
                        <td style="padding: 4px 0; color: #202223; font-size: 14px;">Subtotal</td>
                        <td style="padding: 4px 0; color: #202223; font-size: 14px;" align="right">Rs. ${subtotal}</td>
                      </tr>

                      ${discountsHtml}

                      <tr class="subtotal-line">
                        <td style="padding: 4px 0; color: #202223; font-size: 14px;">
                          Shipping<br>
                          <span style="font-size: 13px; color: #6D7175;">(${shippingTitle})</span>
                        </td>
                        <td style="padding: 4px 0; color: #202223; font-size: 14px;" align="right">Rs. ${shippingPrice}</td>
                      </tr>

                      ${taxHtml}

                      <tr style="border-top: 1px solid #e1e3e5;">
                        <td style="padding: 16px 0 0; font-weight: bold; font-size: 16px; color: #202223;">Total</td>
                        <td style="padding: 16px 0 0; font-weight: bold; font-size: 16px; color: #202223;" align="right">Rs. ${totalPrice} INR</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- CUSTOMER & FULFILLMENT DETAILS SECTION -->
              <tr>
                <td style="border-top: 1px solid #C9CCCF; padding: 20px;">
                  <div style="margin-bottom: 20px;">
                    <strong style="color: #202223; font-size: 14px;">Payment processing method</strong><br>
                    <p style="color: #202223; margin: 4px 0 0; font-size: 14px;">${paymentMethod}</p>
                  </div>

                  <div style="margin-bottom: 20px;">
                    <strong style="color: #202223; font-size: 14px;">Delivery method</strong><br>
                    <p style="color: #202223; margin: 4px 0 0; font-size: 14px;">${shippingTitle}</p>
                  </div>

                  <div>
                    <strong style="color: #202223; font-size: 14px;">Shipping address</strong><br>
                    <p style="color: #202223; margin: 4px 0 0; font-size: 14px; line-height: 1.5;">
                      ${customerName}<br>
                      ${street1 ? street1 + '<br>' : ''}
                      ${street2 ? street2 + '<br>' : ''}
                      ${city ? city + ', ' : ''}${province} ${zip}<br>
                      ${country}<br>
                      ${phoneFormatted ? '<a href="tel:' + phoneFormatted + '" style="color: #1990C6; text-decoration: none;">' + phoneFormatted + '</a>' : ''}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- FOOTER -->
          <table style="width: 100%; max-width: 470px; margin: 24px auto 0; text-align: center; color: #6d7175; font-size: 12px;" cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <td align="center" style="padding-bottom: 10px;">
                  <img src="https://cdn.shopify.com/shopifycloud/shopify/assets/mailer/merchant/shopify_logo-ab8bfbd03d685aa04a8db0c119c5cbee279b5f9bd32a26f9ad3df0a96d9b7f83.png" alt="Shopify" width="89" style="height: auto;"/>
                </td>
              </tr>
              <tr>
                <td align="center">
                  151 O'Connor Street, Ground floor, Ottawa, ON, K2P 2L8
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
}

async function testSendOrder1030() {
  const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  const oData = await oRes.json();
  const token = oData.access_token;

  const res = await fetch(`https://${domain}/admin/api/2024-04/orders/18964958904452.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  const order = data.order;

  const html = formatShopifyOfficialOrderHtml(order);

  const customerName = ((order.shipping_address?.first_name || '') + ' ' + (order.shipping_address?.last_name || '')).trim() || 'Customer';
  const subject = `[Sujata Nutrilive Agrotech] Order #${order.order_number} placed by ${customerName}`;

  console.log('Sending test email to sujatanutrilive@gmail.com with subject:', subject);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sujatanutrilive@gmail.com',
      pass: 'ysla kiuk wjju kbct'
    }
  });

  const info = await transporter.sendMail({
    from: '"Sujata Nutrilive Agrotech" <sujatanutrilive@gmail.com>',
    to: 'sujatanutrilive@gmail.com',
    subject: subject,
    html: html
  });

  console.log('✅ Email sent successfully! MessageId:', info.messageId);
}

testSendOrder1030();
