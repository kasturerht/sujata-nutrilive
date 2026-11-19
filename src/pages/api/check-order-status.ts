import type { APIRoute } from 'astro';

export const prerender = false;

let cachedAdminToken: string | null = null;
let tokenExpiresAt = 0;

async function getShopifyAdminToken(domain: string, clientId: string, clientSecret: string): Promise<string | null> {
  if (cachedAdminToken && Date.now() < tokenExpiresAt) {
    return cachedAdminToken;
  }
  try {
    const authRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });
    if (authRes.ok) {
      const data = await authRes.json();
      cachedAdminToken = data.access_token;
      tokenExpiresAt = Date.now() + 86000000; // ~24h cache
      return cachedAdminToken;
    }
  } catch(e) {
    console.error('Failed to get Shopify Admin Token:', e);
  }
  return null;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');

    if (!orderId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing order_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
    const clientId = process.env.SHOPIFY_CLIENT_ID || '';
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ success: false, error: 'Shopify Admin API credentials not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = await getShopifyAdminToken(domain, clientId, clientSecret);
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Unable to authenticate with Shopify' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Query the latest 5 orders from Shopify
    const ordersRes = await fetch(`https://${domain}/admin/api/2024-04/orders.json?limit=5&status=any`, {
      headers: { 'X-Shopify-Access-Token': token }
    });

    if (!ordersRes.ok) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch Shopify orders' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await ordersRes.json();
    const orders = data.orders || [];

    // Look for matching order by note_attributes or recent completion (< 15 mins)
    const fifteenMinsAgo = Date.now() - (15 * 60 * 1000);
    const matchingOrder = orders.find((o: any) => {
      const orderCreatedTime = new Date(o.created_at).getTime();
      if (orderCreatedTime < fifteenMinsAgo) return false;

      // Check if order ID matches note attributes or tags
      const hasAttrMatch = (o.note_attributes || []).some((attr: any) => 
        attr && attr.value && String(attr.value).includes(orderId)
      );
      if (hasAttrMatch) return true;

      // Or if gateway / browser_ip matches
      return false;
    });

    if (matchingOrder) {
      return new Response(JSON.stringify({
        success: true,
        is_paid: matchingOrder.financial_status === 'paid' || matchingOrder.financial_status === 'pending',
        shopify_order_number: matchingOrder.order_number,
        amount: matchingOrder.total_price,
        financial_status: matchingOrder.financial_status
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      is_paid: false,
      message: 'Order not found in recent orders or still processing'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch(err: any) {
    console.error('Check Order Status Error:', err);
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
