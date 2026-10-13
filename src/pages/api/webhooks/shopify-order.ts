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
    const addr = order.shipping_address || order.billing_address || {};
    const email = order.email || order.customer?.email || '';
    const phone = addr.phone || order.customer?.phone || order.phone || '';
    const firstName = addr.first_name || order.customer?.first_name || '';
    const lastName = addr.last_name || order.customer?.last_name || '';
    const city = addr.city || '';
    const zip = addr.zip || '';
    const country = addr.country_code || 'in';

    // Extract _fbp & _fbc from note attributes if passed from checkout
    const notes: Record<string, string> = {};
    (order.note_attributes || []).forEach((attr: any) => {
      if (attr && attr.name && attr.value) notes[attr.name] = attr.value;
    });

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
      '8922846279:AAFZXUeM6lZc4t0x1AtKjOwPHAE0IBeugSI';
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
    const metaPixelId =
      (typeof process !== 'undefined' && process.env?.PUBLIC_META_PIXEL_ID) ||
      '1314112957191765';
    const metaAccessToken =
      (typeof process !== 'undefined' && process.env?.META_ADS_ACCESS_TOKEN) ||
      'EAAZAmug8oChABSqxHeW0lbtHCwkwMaQQsx5UqcYgYxLfn3qep4z4avHUZC26Nlv2OYU0Qqw0OkfIg4TcZBWVJJGCntlwH8kQiKzmLid0eyCQZC70ZBK56ZCt3mMoolHewqj2R07NVZAQV6ifdZBlyZBSoGVzZAqKHt7vaof15TcZBzmGzpYpmyHFM7ykDPOfoAhfQZDZD';

    let capiResult = null;
    if (metaPixelId && metaAccessToken) {
      capiResult = await sendMetaCapiPurchase(order, metaPixelId, metaAccessToken);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderType: isCod ? 'COD' : 'PREPAID',
        telegramDelivered: telegramSuccess,
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
