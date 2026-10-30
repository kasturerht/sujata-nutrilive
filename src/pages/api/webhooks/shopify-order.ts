import nodemailer from 'nodemailer';
import type { APIRoute } from 'astro';
import process from 'node:process';
import crypto from 'node:crypto';

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

    const eventId = `order_${order.id || order.order_number}`;
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

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #064E3B; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #064E3B; margin: 0; font-size: 22px;">🌿 Sujata Nutrilive Agrotech</h2>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Official Instant Order Alert • 100% Direct Delivery</p>
      </div>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 15px; font-weight: bold; color: #166534;">🎉 Order Confirmed: #${orderNum}</span>
        <span style="font-weight: 900; color: #166534; font-size: 18px;">₹${totalPrice}</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 35%;"><strong>Payment Channel:</strong></td>
          <td style="padding: 8px 0; color: #111827; font-weight: bold;">${payType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Customer Name:</strong></td>
          <td style="padding: 8px 0; color: #111827; font-weight: bold;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Phone Number:</strong></td>
          <td style="padding: 8px 0; color: #111827; font-weight: bold;"><a href="tel:${phone}" style="color: #064E3B; text-decoration: none;">${phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;"><strong>Delivery Address:</strong></td>
          <td style="padding: 8px 0; color: #111827; line-height: 1.5;">${city}</td>
        </tr>
      </table>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px; color: #111827; font-size: 14px;">📦 Ordered Formulations:</h4>
        <div style="background: #f9fafb; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #374151; line-height: 1.8;">
          ${items}
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 11px; color: #9ca3af;">
        Direct Automated Dispatch from Sujata Nutrilive Cloud Webhook Sentinel<br>
        Delivered directly to <strong>sujatanutrilive@gmail.com</strong>
      </div>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });

    await transporter.sendMail({
      from: `"Sujata Nutrilive Orders" <${gmailUser}>`,
      to: 'sujatanutrilive@gmail.com',
      subject: `🌿 [New Order #${orderNum}] ₹${totalPrice} (${payType}) - ${name}`,
      html: htmlContent
    });
    console.log(`✅ Direct order email successfully delivered to sujatanutrilive@gmail.com for #${orderNum}`);
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
  const utms: Record<string, string> = {};
  (order.note_attributes || []).forEach((attr: any) => {
    if (attr && attr.name && attr.value) utms[attr.name] = attr.value;
  });
  const campaign = utms['utm_campaign'] || utms['utm_source'] || 'Website Direct';

  return `🌿 *SUJATA NUTRILIVE — NEW ORDER*
━━━━━━━━━━━━━━━━━━━━━━━━

🛒 *Order:* #${orderNum} • *₹${order.total_price}* (${payType})
📦 *Item:* ${items}

👤 *Client:* ${name} • \`${phone}\`

📍 *Address:* ${fullAddress}

🌐 *Source:* Website Direct (${campaign})
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
    let order: any = null;
    try {
      order = await request.json();
    } catch {
      const text = await request.text();
      order = JSON.parse(text);
    }

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
    if (enableWebhookCapi && metaPixelId && metaAccessToken) {
      capiResult = await sendMetaCapiPurchase(order, metaPixelId, metaAccessToken);
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
        metaCapiResponse: capiResult
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
