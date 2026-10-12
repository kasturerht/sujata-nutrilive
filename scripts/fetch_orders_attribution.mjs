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

async function fetchOrders() {
  const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const token = await getAccessToken();
  console.log("Successfully obtained OAuth token.");

  // Update .env with new token
  try {
    const envPath = path.resolve('.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('SHOPIFY_ADMIN_ACCESS_TOKEN=')) {
      envContent = envContent.replace(/SHOPIFY_ADMIN_ACCESS_TOKEN=.*/, `SHOPIFY_ADMIN_ACCESS_TOKEN=${token}`);
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log("Updated SHOPIFY_ADMIN_ACCESS_TOKEN in .env");
    }
  } catch(e) {
    console.warn("Could not update .env:", e.message);
  }

  // 1. Fetch REST orders
  const restUrl = `https://${domain}/admin/api/2024-04/orders.json?status=any&limit=250`;
  const res = await fetch(restUrl, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  
  if (!res.ok) {
    console.error("REST Orders error:", res.status, await res.text());
    return;
  }

  const { orders } = await res.json();
  console.log(`\nFound ${orders.length} orders on Shopify.\n`);

  // 2. Fetch GraphQL Customer Journey for each order
  const gqlQuery = `
    query getOrderAttribution($first: Int!) {
      orders(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            displayFinancialStatus
            displayFulfillmentStatus
            referrerUrl
            referringSite
            sourceIdentifier
            sourceName
            customerJourneySummary {
              daysToConversion
              momentsCount
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

  let gqlOrders = [];
  try {
    const gqlRes = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({
        query: gqlQuery,
        variables: { first: 50 }
      })
    });
    const gqlData = await gqlRes.json();
    if (gqlData.data && gqlData.data.orders) {
      gqlOrders = gqlData.data.orders.edges.map(e => e.node);
    } else {
      console.log("GraphQL Response:", JSON.stringify(gqlData));
    }
  } catch (err) {
    console.error("GraphQL query error:", err);
  }

  const gqlMap = new Map();
  for (const go of gqlOrders) {
    gqlMap.set(go.name, go);
  }

  const detailedOrders = orders.map(o => {
    const gql = gqlMap.get(o.name) || {};
    return {
      order_id: o.id,
      order_number: o.order_number,
      order_name: o.name,
      created_at: o.created_at,
      financial_status: o.financial_status,
      fulfillment_status: o.fulfillment_status,
      total_price: o.total_price,
      currency: o.currency,
      customer: o.customer ? {
        first_name: o.customer.first_name,
        last_name: o.customer.last_name,
        email: o.customer.email,
        phone: o.customer.phone,
        orders_count: o.customer.orders_count
      } : null,
      shipping_address: o.shipping_address ? {
        city: o.shipping_address.city,
        province: o.shipping_address.province,
        zip: o.shipping_address.zip,
        country: o.shipping_address.country
      } : null,
      line_items: o.line_items.map(li => ({
        title: li.title,
        quantity: li.quantity,
        price: li.price,
        variant_title: li.variant_title
      })),
      referring_site: o.referring_site,
      landing_site: o.landing_site,
      landing_site_ref: o.landing_site_ref,
      source_name: o.source_name,
      source_url: o.source_url,
      note_attributes: o.note_attributes,
      customer_journey: gql.customerJourneySummary || null,
      referrer_url_gql: gql.referrerUrl || null,
      referring_site_gql: gql.referringSite || null,
      cancelled_at: o.cancelled_at,
      cancel_reason: o.cancel_reason
    };
  });

  fs.writeFileSync('scripts/orders_attribution_dump.json', JSON.stringify(detailedOrders, null, 2), 'utf8');
  console.log("Saved full attribution dump to scripts/orders_attribution_dump.json");

  // Summary printout
  console.log("\n==================== ORDER ATTRIBUTION SUMMARY ====================");
  for (const o of detailedOrders) {
    console.log(`\nOrder: ${o.order_name} | Date: ${o.created_at} | Total: ₹${o.total_price} | Status: ${o.financial_status}`);
    console.log(`Customer: ${o.customer?.first_name || 'N/A'} ${o.customer?.last_name || ''} (${o.shipping_address?.city || 'No City'}, ${o.shipping_address?.province || ''})`);
    console.log(`Items: ${o.line_items.map(l => `${l.title} x${l.quantity}`).join(', ')}`);
    console.log(`REST Referring Site: ${o.referring_site || 'None (Direct / Internal)'}`);
    console.log(`REST Landing Site: ${o.landing_site || 'None'}`);
    console.log(`REST Source Name: ${o.source_name}`);
    console.log(`Note Attributes:`, JSON.stringify(o.note_attributes));
    if (o.customer_journey) {
      console.log(`Customer Journey:`, JSON.stringify(o.customer_journey, null, 2));
    }
  }
}

fetchOrders().catch(console.error);
