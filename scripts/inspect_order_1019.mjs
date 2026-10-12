import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      process.env[trimmed.substring(0, idx).trim()] = val;
    }
  }
}
loadEnv();

async function getAccessToken() {
  const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    })
  });

  if (!oRes.ok) {
    throw new Error(`Failed to get OAuth token: ${oRes.status} ${await oRes.text()}`);
  }

  const data = await oRes.json();
  return data.access_token;
}

async function inspectOrder1019() {
  const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const token = await getAccessToken();

  // 1. Fetch from REST API (filtering or searching for order 1019)
  const restUrl = `https://${domain}/admin/api/2024-04/orders.json?name=1019&status=any`;
  const res = await fetch(restUrl, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const restData = await res.json();
  
  // If not found by name, fetch last 10 orders
  let order = restData.orders && restData.orders.length > 0 ? restData.orders[0] : null;
  if (!order) {
    const lastOrdersRes = await fetch(`https://${domain}/admin/api/2024-04/orders.json?limit=10&status=any`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const lastOrdersData = await lastOrdersRes.json();
    order = (lastOrdersData.orders || []).find(o => String(o.order_number) === '1019' || o.name === '#1019');
    if (!order && lastOrdersData.orders?.length > 0) {
      console.log("Recent orders:", lastOrdersData.orders.map(o => ({ id: o.id, name: o.name, number: o.order_number, created: o.created_at })));
      order = lastOrdersData.orders[0]; // Most recent order
    }
  }

  console.log("=== REST ORDER DATA ===");
  if (order) {
    console.log({
      id: order.id,
      name: order.name,
      order_number: order.order_number,
      created_at: order.created_at,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status,
      payment_gateway_names: order.payment_gateway_names,
      total_price: order.total_price,
      subtotal_price: order.subtotal_price,
      total_discounts: order.total_discounts,
      discount_codes: order.discount_codes,
      source_name: order.source_name,
      source_identifier: order.source_identifier,
      source_url: order.source_url,
      referring_site: order.referring_site,
      landing_site: order.landing_site,
      landing_site_ref: order.landing_site_ref,
      client_details: order.client_details,
      note_attributes: order.note_attributes,
      customer: {
        id: order.customer?.id,
        first_name: order.customer?.first_name,
        last_name: order.customer?.last_name,
        orders_count: order.customer?.orders_count,
        city: order.shipping_address?.city,
        province: order.shipping_address?.province,
        country: order.shipping_address?.country
      },
      line_items: order.line_items?.map(li => ({
        title: li.title,
        quantity: li.quantity,
        price: li.price,
        variant_title: li.variant_title
      }))
    });

    // 2. Fetch GraphQL Customer Journey
    const gqlQuery = `
      query getRecentJourneys {
        orders(first: 5, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              referrerUrl
              sourceIdentifier
              sourceName
              customerJourneySummary {
                daysToConversion
                momentsCount {
                  count
                }
                firstVisit {
                  id
                  occurredAt
                  landingPage
                  referrerUrl
                  source
                  sourceDescription
                  marketingEvent {
                    type
                    utmCampaign
                    utmSource
                    utmMedium
                  }
                }
                lastVisit {
                  id
                  occurredAt
                  landingPage
                  referrerUrl
                  source
                  sourceDescription
                  marketingEvent {
                    type
                    utmCampaign
                    utmSource
                    utmMedium
                  }
                }
              }
            }
          }
        }
      }
    `;

    const gqlRes = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({ query: gqlQuery })
    });
    const gqlData = await gqlRes.json();
    fs.writeFileSync('data/order_1019_full_dump.json', JSON.stringify(order, null, 2), 'utf8');
    console.log("Full order dump written to data/order_1019_full_dump.json");

    if (order.customer?.id) {
      const cRes = await fetch(`https://${domain}/admin/api/2024-04/customers/${order.customer.id}.json`, {
        headers: { 'X-Shopify-Access-Token': token }
      });
      const cData = await cRes.json();
      console.log("\n=== CUSTOMER PROFILE ===");
      console.log({
        id: cData.customer?.id,
        first_name: cData.customer?.first_name,
        last_name: cData.customer?.last_name,
        email: cData.customer?.email,
        phone: cData.customer?.phone,
        orders_count: cData.customer?.orders_count,
        total_spent: cData.customer?.total_spent,
        created_at: cData.customer?.created_at
      });
    }
  } else {
    console.log("Order 1019 not found.");
  }
}

inspectOrder1019().catch(console.error);
