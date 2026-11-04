import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
}

const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const clientId = env.SHOPIFY_CLIENT_ID;
const clientSecret = env.SHOPIFY_CLIENT_SECRET;

async function getAccessToken() {
  const oRes = await fetch(`https://${shopifyDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    })
  });
  const oData = await oRes.json();
  return oData.access_token;
}

async function checkRecentOrders() {
  const token = await getAccessToken();
  const q = `
    query {
      orders(first: 20, reverse: true) {
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
            note
            customAttributes {
              key
              value
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${shopifyDomain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query: q })
  });

  const data = await res.json();
  console.log("Shopify Orders from Oct 24 to Oct 31:");
  (data?.data?.orders?.edges || []).forEach(e => {
    const o = e.node;
    const items = o.lineItems.edges.map(li => `${li.node.title} (x${li.node.quantity})`).join(', ');
    const utm = o.customAttributes?.find(a => a.key === 'utm_campaign' || a.key === 'utm_source')?.value || 'N/A';
    console.log(`Order ${o.name} | ${o.createdAt} | ₹${o.totalPriceSet.shopMoney.amount} | Status: ${o.displayFinancialStatus} | Items: ${items} | UTM: ${utm}`);
  });
}

checkRecentOrders().catch(console.error);
