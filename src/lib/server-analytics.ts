// src/lib/server-analytics.ts
// Server-side purchase analytics for Shopify orders (orders/create webhook).
//
// Why: browser-only purchase tracking loses orders (in-app webviews kill the redirect, Shopify-hosted
// checkout never reaches /thank-you) and reports estimated values. The webhook sees EVERY order with
// its exact total, so it is the source of truth for GA4 revenue.
import crypto from 'node:crypto';

type AnyOrder = Record<string, any>;

const env = (key: string): string | undefined =>
  (typeof process !== 'undefined' && process.env?.[key]) || (import.meta.env as Record<string, string | undefined>)[key] || undefined;

/** Shopify order note_attributes -> plain map. */
export function orderAttributes(order: AnyOrder): Record<string, string> {
  const map: Record<string, string> = {};
  for (const attr of order?.note_attributes || []) {
    if (attr && attr.name && attr.value != null && attr.value !== '') map[String(attr.name)] = String(attr.value);
  }
  return map;
}

/**
 * Transaction ID shared by browser and server so GA4 / Meta can de-duplicate:
 * Magic Checkout orders carry the Razorpay order ID (the browser uses the same one);
 * all other orders fall back to the Shopify order name.
 */
export function purchaseTransactionId(order: AnyOrder): string {
  const attrs = orderAttributes(order);
  return attrs['razorpay_order_id'] || String(order?.name || order?.order_number || order?.id || '');
}

/** Verifies X-Shopify-Hmac-Sha256 against the raw body. Returns null when no secret is configured. */
export function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null): boolean | null {
  const secret = env('SHOPIFY_WEBHOOK_SECRET') || env('SHOPIFY_CLIENT_SECRET');
  if (!secret) return null;
  if (!hmacHeader) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Orders that did not come from the website (POS, manual draft orders) are not web purchases. */
export function isWebOrder(order: AnyOrder): boolean {
  const source = String(order?.source_name || '').toLowerCase();
  return !['pos', 'shopify_draft_order', 'iphone', 'android'].includes(source);
}

/**
 * GA4 Measurement Protocol purchase. Requires GA4_API_SECRET (GA4 Admin > Data streams > web stream >
 * Measurement Protocol API secrets). Uses the visitor's real GA client/session IDs captured at checkout
 * (_ga_cid / _ga_sid attributes) so revenue is attributed to the session that produced it.
 */
export async function sendGa4Purchase(order: AnyOrder): Promise<{ sent: boolean; reason?: string; status?: number; transaction_id?: string }> {
  const apiSecret = env('GA4_API_SECRET');
  const measurementId = env('PUBLIC_GA4_ID') || env('PUBLIC_GTAG_ID') || 'G-5WZ8DNW2PD';
  if (!apiSecret) return { sent: false, reason: 'GA4_API_SECRET not configured' };
  if (!isWebOrder(order)) return { sent: false, reason: `skipped non-web order (${order?.source_name})` };

  const attrs = orderAttributes(order);
  const transactionId = purchaseTransactionId(order);
  const value = Number(order.current_total_price ?? order.total_price ?? 0);
  if (!transactionId || !(value >= 0)) return { sent: false, reason: 'missing transaction id/value' };

  // Real GA client ID when the buyer came through our site; otherwise a stable synthetic one per order.
  const clientId = attrs['_ga_cid'] || `${(parseInt(String(order.id || '0').slice(-9), 10) || Date.now() % 1e9)}.${Math.floor(new Date(order.created_at || Date.now()).getTime() / 1000)}`;
  const sessionId = attrs['_ga_sid'] && /^\d+$/.test(attrs['_ga_sid']) ? Number(attrs['_ga_sid']) : undefined;

  const shipping = Number(order.total_shipping_price_set?.shop_money?.amount ?? 0);
  const tax = Number(order.current_total_tax ?? order.total_tax ?? 0);
  const coupon = (order.discount_codes || []).map((d: any) => d.code).filter(Boolean).join(',');
  const gateways = (order.payment_gateway_names || []).join(' ').toLowerCase();
  const paymentType = /cod|cash/.test(gateways) ? 'cod' : (attrs['payment_method'] || gateways || 'prepaid');

  const items = (order.line_items || []).map((li: any, index: number) => {
    const qty = Number(li.quantity || 1);
    const lineDiscount = (li.discount_allocations || []).reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
    return {
      item_id: String(li.variant_id || li.product_id || li.sku || `line_${index}`),
      item_name: li.title || li.name || 'Sujata Formulation',
      item_variant: li.variant_title || undefined,
      item_brand: 'Sujata Nutrilive',
      price: Number(li.price || 0),
      discount: qty ? Math.round((lineDiscount / qty) * 100) / 100 : 0,
      quantity: qty,
      index
    };
  });

  const createdMs = new Date(order.created_at || Date.now()).getTime();
  const payload = {
    client_id: clientId,
    // MP accepts events up to 72h old; older webhook retries are sent "now".
    timestamp_micros: Date.now() - createdMs < 71 * 3600 * 1000 ? createdMs * 1000 : undefined,
    non_personalized_ads: false,
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: transactionId,
          value,
          currency: order.currency || 'INR',
          tax,
          shipping,
          coupon: coupon || undefined,
          payment_type: paymentType,
          shopify_order: String(order.name || ''),
          ...(sessionId ? { session_id: sessionId, engagement_time_msec: 1 } : {}),
          items
        }
      }
    ]
  };

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(4000)
  });
  return { sent: res.status >= 200 && res.status < 300, status: res.status, transaction_id: transactionId };
}

/** One-line source summary for team notifications. */
export function describeOrderSource(order: AnyOrder): string {
  const a = orderAttributes(order);
  if (!a['utm_source'] && !a['_ft_source']) return 'Unknown (no attribution captured)';
  const last = `${a['utm_source'] || '(direct)'} / ${a['utm_medium'] || '(none)'}${a['utm_campaign'] ? ` (${a['utm_campaign']})` : ''}`;
  const first = a['_ft_source'] ? `${a['_ft_source']} / ${a['_ft_medium'] || '(none)'}` : '';
  return first && first !== last.split(' (')[0] ? `${last} · first: ${first}` : last;
}
