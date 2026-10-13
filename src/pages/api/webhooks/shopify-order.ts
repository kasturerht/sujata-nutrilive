import type { APIRoute } from 'astro';

export const prerender = false;

function formatTelegramOrderMessage(order: any): string {
  const orderNum = order.order_number || order.name || 'N/A';
  const createdAt = order.created_at
    ? new Date(order.created_at).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Just now';

  // 1. Payment Detection: COD vs Prepaid
  const gateways = order.payment_gateway_names || [];
  const gatewayStr = gateways.join(', ').toLowerCase();
  const isCod =
    order.gateway === 'cash_on_delivery' ||
    gatewayStr.includes('cod') ||
    gatewayStr.includes('cash') ||
    order.financial_status === 'pending';

  const paymentMode = isCod
    ? '📦 CASH ON DELIVERY (COD)'
    : '⚡ PREPAID (Online / UPI)';
  const paymentStatus = order.financial_status === 'paid' ? '✅ Paid' : '⏳ Pending / COD';

  // 2. Line Items
  const itemsText = (order.line_items || [])
    .map((item: any) => {
      const variantInfo = item.variant_title ? ` (${item.variant_title})` : '';
      return `• *${item.title}${variantInfo}*\n  ↳ संख्या (Qty): *${item.quantity}* | किंमत: *₹${item.price}*`;
    })
    .join('\n');

  // 3. Customer & Address
  const addr = order.shipping_address || order.billing_address || {};
  const custName = `${addr.first_name || order.customer?.first_name || ''} ${addr.last_name || order.customer?.last_name || ''}`.trim() || 'N/A';
  const custPhone = addr.phone || order.customer?.phone || order.phone || 'N/A';
  const custEmail = order.customer?.email || order.email || 'N/A';

  const addrParts = [
    addr.address1,
    addr.address2,
    addr.city,
    addr.province || addr.province_code,
    addr.zip,
    addr.country
  ].filter(Boolean);
  const fullAddress = addrParts.length > 0 ? addrParts.join(', ') : 'Not provided';

  // 4. Attribution / Campaign Tracking
  const utms: Record<string, string> = {};
  (order.note_attributes || []).forEach((attr: any) => {
    if (attr.name && attr.value) utms[attr.name] = attr.value;
  });
  const sourceName = utms['utm_source'] || (utms['_fbc'] ? 'Meta Ad' : 'Direct Website');
  const campaignName = utms['utm_campaign'] ? ` (${utms['utm_campaign']})` : '';

  return `🔔 *नवीन वेबसाइट ऑर्डर प्राप्त झाली!* 🌿
━━━━━━━━━━━━━━━━━━━━
📦 *ऑर्डर क्रमांक:* \`#${orderNum}\`
📅 *वेळ:* ${createdAt}
🌐 *सोर्स:* www.sujatanutrilive.com (थेट वेबसाइट)

🛍️ *ऑर्डर केलेले प्रॉडक्ट:*
${itemsText || '• No items listed'}

💰 *पेमेंट तपशील:*
• *एकूण रक्कम:* *₹${order.total_price}*
• *पेमेंट प्रकार:* ${paymentMode}
• *पेमेंट स्थिती:* ${paymentStatus}

👤 *ग्राहक माहिती:*
• *नाव:* ${custName}
• *मोबाईल:* \`${custPhone}\`
• *ईमेल:* ${custEmail}
• *पत्ता:* ${fullAddress}

📊 *ट्रॅफिक माहिती:*
• Source: ${sourceName}${campaignName}

━━━━━━━━━━━━━━━━━━━━
🚀 *टीप: ही ऑर्डर ग्राहकाने थेट आपल्या अधिकृत वेबसाइटवरून ऑनलाईन बुक केली आहे.*`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return new Response(JSON.stringify({ error: 'Empty body' }), { status: 400 });
    }

    const order = JSON.parse(rawBody);

    const botToken = import.meta.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '8922846279:AAFZXUeM6lZc4t0x1AtKjOwPHAE0IBeugSI';
    const chatId = import.meta.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '847419012';

    if (!botToken || !chatId) {
      console.error('❌ Missing Telegram credentials');
      return new Response(JSON.stringify({ error: 'Telegram credentials missing' }), { status: 500 });
    }

    const text = formatTelegramOrderMessage(order);

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
    console.log('✅ Telegram order alert sent:', telegramData.ok ? 'Success' : telegramData.description);

    return new Response(JSON.stringify({ success: true, messageId: telegramData.result?.message_id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('❌ Error processing Shopify webhook:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
