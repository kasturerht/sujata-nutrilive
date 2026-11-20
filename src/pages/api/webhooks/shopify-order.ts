import nodemailer from 'nodemailer';
import type { APIRoute } from 'astro';
import process from 'node:process';
import crypto from 'node:crypto';
import { describeOrderSource, purchaseTransactionId, sendGa4Purchase, verifyShopifyWebhook } from '../../../lib/server-analytics';

export const prerender = false;

function sha256(val: string | undefined): string | undefined {
  if (!val) return undefined;
  const clean = String(val).trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('0')) digits = digits.substring(1);
  if (digits.length === 10) digits = '91' + digits;
  return sha256(digits);
}

async function sendMetaCapiPurchase(order: any, pixelId: string, accessToken: string) {
  try {
    // Extract _fbp, _fbc, and lead attribution from note attributes
    const notes: Record<string, string> = {};
    (order.note_attributes || []).forEach((attr: any) => {
      if (attr && attr.name && attr.value) notes[attr.name] = attr.value;
    });

    const addr = order.shipping_address || order.billing_address || {};
    const email = order.email || order.customer?.email || notes['_lead_email'] || '';
    const phone = addr.phone || order.customer?.phone || order.phone || notes['_lead_phone'] || '';
    const firstName = addr.first_name || order.customer?.first_name || '';
    const lastName = addr.last_name || order.customer?.last_name || '';
    const city = addr.city || '';
    const zip = addr.zip || '';
    const country = addr.country_code || 'in';

    const fbp = notes['_fbp'] || notes['fbp'] || undefined;
    const fbc = notes['_fbc'] || notes['fbc'] || undefined;

    const eventId = purchaseTransactionId(order) || `order_${order.id || order.order_number}`;
    const value = parseFloat(order.total_price || '0');
    const currency = order.currency || 'INR';

    const contents = (order.line_items || []).map((item: any) => ({
      id: String(item.variant_id || item.product_id || item.sku || 'sujata_item'),
      quantity: Number(item.quantity || 1),
      item_price: parseFloat(item.price || '0')
    }));

    const capiPayload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(new Date(order.created_at || Date.now()).getTime() / 1000),
          event_id: eventId,
          event_source_url: 'https://www.sujatanutrilive.com/checkout',
          action_source: 'website',
          user_data: {
            em: [sha256(email)].filter(Boolean),
            ph: [normalizePhone(phone)].filter(Boolean),
            fn: [sha256(firstName)].filter(Boolean),
            ln: [sha256(lastName)].filter(Boolean),
            ct: [sha256(city)].filter(Boolean),
            zp: [sha256(zip)].filter(Boolean),
            country: [sha256(country)].filter(Boolean),
            ...(fbp ? { fbp } : {}),
            ...(fbc ? { fbc } : {}),
            client_ip_address: order.browser_ip || undefined,
            client_user_agent: order.client_details?.user_agent || undefined
          },
          custom_data: {
            currency: currency,
            value: value,
            content_type: 'product',
            contents: contents
          }
        }
      ],
      access_token: accessToken
    };

    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capiPayload)
    });

    return await res.json();
  } catch (err: any) {
    console.error('Meta CAPI Dispatch Error:', err.message);
    return { error: err.message };
  }
}


async function sendOrderEmail(order: any, isCod: boolean): Promise<boolean> {
  const gmailUser = (typeof process !== 'undefined' && process.env?.GMAIL_USER) || 'sujatanutrilive@gmail.com';
  const gmailPass = (typeof process !== 'undefined' && process.env?.GMAIL_APP_PASSWORD) || 'ysla kiuk wjju kbct';
  if (!gmailUser || !gmailPass) {
    console.warn('GMAIL_USER or GMAIL_APP_PASSWORD missing, skipping direct email dispatch');
    return false;
  }

  const orderNum = order.order_number || order.name || 'N/A';
  const orderId = order.id || '';
  const viewOrderUrl = orderId ? `https://admin.shopify.com/store/tvczdq-nu/orders/${orderId}` : 'https://admin.shopify.com/store/tvczdq-nu/orders';

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
  let paymentMethod = 'Razorpay';
  if (isCod) {
    paymentMethod = 'Cash on Delivery (COD)';
  } else if (order.payment_gateway_names && order.payment_gateway_names.length > 0) {
    paymentMethod = order.payment_gateway_names.join(', ');
  }

  // Delivery Method & Shipping
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
  const defaultImg = 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_yruxb3yruxb3yrux_compact_cropped.png?v=1788606546';
  const itemsHtml = (order.line_items || []).map((item: any) => {
    const itemPrice = parseFloat(item.price || '0').toFixed(2);
    const lineTotal = (parseFloat(item.price || '0') * (item.quantity || 1)).toFixed(2);
    const variantTitle = item.variant_title ? `<span class="order-list__item-variant" style="font-size: 14px; line-height: 1.42; color: #6D7175;">${item.variant_title}</span> • ` : '';
    const sku = item.sku ? `<span class="order-list__item-variant" style="font-size: 14px; line-height: 1.42; color: #6D7175;">SKU: ${item.sku}</span>` : '';
    const itemImg = item.image?.src || defaultImg;

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
  const subtotal = (order.line_items || []).reduce((acc: number, i: any) => acc + (parseFloat(i.price || '0') * (i.quantity || 1)), 0).toFixed(2);

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

  const htmlContent = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">
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

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });

    const subject = `[Sujata Nutrilive Agrotech] Order #${orderNum} placed by ${customerName}`;

    await transporter.sendMail({
      from: `"Sujata Nutrilive Agrotech" <${gmailUser}>`,
      to: 'sujatanutrilive@gmail.com',
      subject: subject,
      html: htmlContent
    });
    console.log(`✅ Exact Shopify-format order email successfully delivered to sujatanutrilive@gmail.com for #${orderNum}`);
    return true;
  } catch(e: any) {
    console.error('Direct order email dispatch failed:', e?.message || e);
    return false;
  }
}

function formatCorporateOrderMessage(order: any): string {
  const orderNum = order.order_number || order.name || 'N/A';

  // 1. Payment Mode & Status
  const gateways = (order.payment_gateway_names || []).join(' ').toLowerCase();
  const isCod =
    order.gateway === 'cash_on_delivery' ||
    gateways.includes('cod') ||
    gateways.includes('cash') ||
    order.financial_status === 'pending';

  const payType = isCod ? 'COD' : 'PREPAID';

  // 2. Line Items (Compact)
  const items = (order.line_items || [])
    .map((i: any) => {
      const v = i.variant_title ? ` (${i.variant_title})` : '';
      return `${i.title}${v} × ${i.quantity}`;
    })
    .join('\n  ');

  // 3. Customer & Address
  const addr = order.shipping_address || order.billing_address || {};
  const name = `${addr.first_name || order.customer?.first_name || ''} ${addr.last_name || order.customer?.last_name || ''}`.trim() || 'N/A';
  const phone = addr.phone || order.customer?.phone || order.phone || 'N/A';
  const city = [addr.city, addr.province_code || addr.province, addr.zip].filter(Boolean).join(', ') || 'N/A';
  const street = [addr.address1, addr.address2].filter(Boolean).join(', ');
  const fullAddress = street ? `${street}, ${city}` : city;

  // 4. Source / Attribution
  // Escaped: campaign names often contain "_" which breaks Telegram Markdown and drops the alert.
  const sourceLine = describeOrderSource(order).replace(/[_*`\[]/g, '\\$&');

  return `🌿 *SUJATA NUTRILIVE — NEW ORDER*
━━━━━━━━━━━━━━━━━━━━━━━━

🛒 *Order:* #${orderNum} • *₹${order.total_price}* (${payType})
📦 *Item:* ${items}

👤 *Client:* ${name} • \`${phone}\`

📍 *Address:* ${fullAddress}

🌐 *Source:* ${sourceLine}
━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// Health check endpoint for testing
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    service: 'Sujata Shopify Order Alerts & Meta CAPI Engine (v2.0 Enterprise)',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    let order: any = null;
    try {
      order = JSON.parse(rawBody);
    } catch {
      order = null;
    }

    // Shopify signs webhooks with the app secret. Revenue-affecting dispatch (GA4 / CAPI) only runs for a
    // verified payload (or when no secret is configured), so a forged POST cannot inject fake purchases.
    const hmacStatus = verifyShopifyWebhook(rawBody, request.headers.get('x-shopify-hmac-sha256'));
    const trustedPayload = hmacStatus !== false;
    if (!trustedPayload) console.warn('Shopify webhook HMAC verification failed: analytics dispatch skipped.');

    if (!order) {
      return new Response(JSON.stringify({ error: 'Invalid or empty order payload' }), { status: 400 });
    }

    const gateways = (order.payment_gateway_names || []).join(' ').toLowerCase();
    const isCod =
      order.gateway === 'cash_on_delivery' ||
      gateways.includes('cod') ||
      gateways.includes('cash') ||
      order.financial_status === 'pending';

    const text = formatCorporateOrderMessage(order);

    // 1. Founder Telegram Alert (100% Free, Official Bot API, Zero Cost Forever)
    const botToken =
      (typeof process !== 'undefined' && process.env?.TELEGRAM_BOT_TOKEN) ||
      '8922846279:AAExG-cyXGGUx0G4SGSLIODL8md1cdbiNyI';
    const chatId =
      (typeof process !== 'undefined' && process.env?.TELEGRAM_CHAT_ID) ||
      '847419012';

    let telegramSuccess = false;
    let tgData = null;
    try {
      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      });
      tgData = await telegramRes.json();
      telegramSuccess = !!tgData.ok;
    } catch (e) {
      console.error('Telegram error:', e);
    }

    // 2. Server-Side Meta Conversions API (CAPI v21.0) Purchase Event Dispatch
    // 🛡️ SILICON VALLEY ARCHITECTURE FIX (OCTOBER 2026):
    // Shopify Official "Facebook & Instagram" App (App ID 2329312) is already active
    // on tvczdq-nu.myshopify.com and sends native Server CAPI.
    // Firing an un-deduplicated CAPI call here with custom event_id ('order_...') creates 
    // a duplicate purchase event (300% overcounting in Meta Ads Manager).
    // Gated behind ENABLE_WEBHOOK_META_CAPI flag to maintain single source of truth.
    const enableWebhookCapi =
      typeof process !== 'undefined' && process.env?.ENABLE_WEBHOOK_META_CAPI === 'true';
    const metaPixelId =
      (typeof process !== 'undefined' && process.env?.PUBLIC_META_PIXEL_ID) ||
      '1314112957191765';
    const metaAccessToken =
      (typeof process !== 'undefined' && process.env?.META_ADS_ACCESS_TOKEN) ||
      'EAAZAmug8oChABSqxHeW0lbtHCwkwMaQQsx5UqcYgYxLfn3qep4z4avHUZC26Nlv2OYU0Qqw0OkfIg4TcZBWVJJGCntlwH8kQiKzmLid0eyCQZC70ZBK56ZCt3mMoolHewqj2R07NVZAQV6ifdZBlyZBSoGVzZAqKHt7vaof15TcZBzmGzpYpmyHFM7ykDPOfoAhfQZDZD';

    let capiResult = null;
    if (trustedPayload && enableWebhookCapi && metaPixelId && metaAccessToken) {
      capiResult = await sendMetaCapiPurchase(order, metaPixelId, metaAccessToken);
    }

    // 2b. Server-side GA4 purchase (Measurement Protocol) with the exact Shopify order value.
    let ga4Result: any = null;
    if (trustedPayload) {
      try {
        ga4Result = await sendGa4Purchase(order);
      } catch (e: any) {
        ga4Result = { sent: false, reason: e?.message || 'GA4 MP error' };
        console.error('GA4 Measurement Protocol error:', e);
      }
    }

    // 3. Direct Automated Email Dispatch to sujatanutrilive@gmail.com
    let emailDelivered = false;
    try {
      emailDelivered = await sendOrderEmail(order, isCod);
    } catch (e) {
      console.error('Direct email dispatch caught error:', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderType: isCod ? 'COD' : 'PREPAID',
        telegramDelivered: telegramSuccess,
        emailDelivered: emailDelivered,
        metaCapiDelivered: capiResult?.events_received === 1,
        metaCapiResponse: capiResult,
        hmacVerified: hmacStatus,
        ga4Purchase: ga4Result
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message || 'Unknown server error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
