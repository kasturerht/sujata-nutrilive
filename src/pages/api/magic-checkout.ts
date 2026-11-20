import type { APIRoute } from 'astro';

export const prerender = false;

const RAZORPAY_KEY_ID = "rzp_live_TV8wwiNECUNJs0";

const MAX_ATTRIBUTES = 40;
function sanitizeAttributes(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
  for (const [rawKey, rawVal] of Object.entries(input as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_ATTRIBUTES) break;
    const key = String(rawKey).trim().slice(0, 64);
    if (!/^[A-Za-z0-9_\-]+$/.test(key)) continue;
    if (rawVal === null || rawVal === undefined || typeof rawVal === 'object') continue;
    const val = String(rawVal).trim().slice(0, 300);
    if (val) out[key] = val;
  }
  return out;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const items = body.items || [];
    let couponCode = body.coupon_code || '';
    const paymentMode = body.payment_mode || 'upi';
    // Attribution travels as Shopify cart attributes (Razorpay copies them onto the Shopify order, verified on
    // orders #1039-#1042) plus a human-readable note. Sanitised: string keys/values, bounded size.
    const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 1000) : null;
    const attributes = sanitizeAttributes(body.attributes);
    attributes._checkout_path = 'magic';

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Cart is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 🛡️ Silicon Valley Business Rule 1: Guard UPI10 from COD leakage
    // If the customer chose COD, never send UPI10 to Razorpay
    if (paymentMode === 'cod' && (/^upi/i.test(couponCode) || couponCode === 'UPI10')) {
      couponCode = '';
    }

    // 🛡️ Silicon Valley Business Rule 2: Dynamic No-COD Detection (e.g. SpiruGlow Soap)
    const hasNoCodItem = items.some((item: any) => 
      item.noCod === true || 
      /soap|spiruglow/i.test(item.title || '') || 
      /soap|spiruglow/i.test(item.handle || '')
    );

    // Format items for Razorpay Magic Shopify Cart API
    const formattedItems = items.map((item: any) => {
      const rawId = String(item.id || item.variantId || '');
      const variantIdNum = parseInt(rawId.replace('gid://shopify/ProductVariant/', ''), 10);
      return {
        id: variantIdNum,
        variant_id: variantIdNum,
        quantity: Math.max(1, Math.min(10, parseInt(item.quantity, 10) || 1))
      };
    });

    const totalCount = formattedItems.reduce((sum: number, i: any) => sum + i.quantity, 0);
    const cartToken = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Initialize Magic Checkout session on Razorpay
    const magicCheckoutRes = await fetch(`https://api.razorpay.com/v1/magic/checkout/shopify?key_id=${RAZORPAY_KEY_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        cart: {
          token: cartToken,
          note,
          attributes,
          item_count: totalCount,
          items: formattedItems
        },
        coupon_code: couponCode || undefined
      })
    });

    if (!magicCheckoutRes.ok) {
      const errText = await magicCheckoutRes.text();
      console.error('Magic Checkout API failure:', magicCheckoutRes.status, errText);
      return new Response(JSON.stringify({ success: false, error: 'Magic Checkout session failed' }), {
        status: magicCheckoutRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const checkData = await magicCheckoutRes.json();
    const shopifyCheckoutId = checkData.shopify_checkout_id;

    if (!shopifyCheckoutId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing shopify_checkout_id' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Create Magic Order using shopify_checkout_id
    const orderRes = await fetch(`https://api.razorpay.com/v1/magic/order/shopify?key_id=${RAZORPAY_KEY_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://api.razorpay.com'
      },
      body: JSON.stringify({
        shopify_checkout_id: shopifyCheckoutId
      })
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error('Magic Order API failure:', orderRes.status, errText);
      return new Response(JSON.stringify({ success: false, error: 'Magic Order creation failed' }), {
        status: orderRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const orderData = await orderRes.json();

    const isUpiDiscount = paymentMode === 'upi' || (/^upi/i.test(couponCode) || couponCode === 'UPI10');
    const shouldHideCod = hasNoCodItem || isUpiDiscount;

    return new Response(JSON.stringify({
      success: true,
      order_id: orderData.order_id,
      shopify_checkout_id: shopifyCheckoutId,
      key_id: RAZORPAY_KEY_ID,
      payment_mode: paymentMode,
      hide_cod: shouldHideCod,
      has_no_cod_item: hasNoCodItem,
      // Razorpay amounts are in paise; used for an accurate client-side purchase value.
      order_amount: typeof orderData.amount === 'number' && orderData.amount > 0 ? orderData.amount / 100 : null,
      line_items: orderData.line_items || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Magic Checkout Route Error:', err);
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
