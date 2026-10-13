import type { APIRoute } from 'astro';

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

  // 4. Source / Attribution
  const utms: Record<string, string> = {};
  (order.note_attributes || []).forEach((attr: any) => {
    if (attr.name && attr.value) utms[attr.name] = attr.value;
  });
  const campaign = utms['utm_campaign'] || utms['utm_source'] || 'Website Direct';

  return `🌿 *SUJATA NUTRILIVE — NEW ORDER*
━━━━━━━━━━━━━━━━━━━━━━━━
🛒 *Order:* #${orderNum} • *₹${order.total_price}* (${payType})
📦 *Item:* ${items}
👤 *Client:* ${name} • \`${phone}\`
📍 *Address:* ${street ? street + ', ' : ''}${city}
🌐 *Source:* Website Direct (${campaign})
━━━━━━━━━━━━━━━━━━━━━━━━`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return new Response(JSON.stringify({ error: 'Empty body' }), { status: 400 });
    }

    const order = JSON.parse(rawBody);

    const botToken =
      import.meta.env.TELEGRAM_BOT_TOKEN ||
      process.env.TELEGRAM_BOT_TOKEN ||
      '8922846279:AAFZXUeM6lZc4t0x1AtKjOwPHAE0IBeugSI';
    const chatId =
      import.meta.env.TELEGRAM_CHAT_ID ||
      process.env.TELEGRAM_CHAT_ID ||
      '847419012';

    if (!botToken || !chatId) {
      return new Response(JSON.stringify({ error: 'Telegram credentials missing' }), { status: 500 });
    }

    const text = formatCorporateOrderMessage(order);

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    const telegramData = await telegramRes.json();
    return new Response(
      JSON.stringify({ success: true, messageId: telegramData.result?.message_id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
