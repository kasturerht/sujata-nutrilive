import type { APIRoute } from 'astro';
import process from 'node:process';

export const prerender = false;

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
    service: 'Sujata Shopify Order Alerts Engine (100% Free Forever via Telegram)',
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

    // Telegram Alert (100% Free, Official Bot API, Zero Cost Forever)
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

    return new Response(
      JSON.stringify({
        success: true,
        orderType: isCod ? 'COD' : 'PREPAID',
        telegramDelivered: telegramSuccess,
        telegramResponse: tgData
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
