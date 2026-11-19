// scripts/check_shopify_nov1_nov19.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const clientId = env.SHOPIFY_CLIENT_ID;
const clientSecret = env.SHOPIFY_CLIENT_SECRET;

async function run() {
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
  const token = oData.access_token;

  const q = `
    query {
      orders(first: 50, reverse: true, query: "created_at:>=2026-11-01") {
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
            tags
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
  const orders = data.data?.orders?.edges?.map(e => e.node) || [];
  console.log(`=== SHOPIFY ORDERS (NOV 01 - NOV 19, 2026): ${orders.length} ORDERS ===`);
  
  let totalRevenue = 0;
  orders.forEach(o => {
    const amount = parseFloat(o.totalPriceSet.shopMoney.amount);
    totalRevenue += amount;
    const items = o.lineItems.edges.map(li => `${li.node.title} (x${li.node.quantity})`).join(', ');
    const utm = o.customAttributes?.map(a => `${a.key}:${a.value}`).join(' | ') || 'No UTM';
    console.log(`${o.name} | ${o.createdAt.slice(0, 10)} | ₹${amount} | ${o.displayFinancialStatus} | ${items} | ${utm}`);
  });
  console.log(`\nTotal Shopify Online Revenue (Nov 1 - Nov 19): ₹${totalRevenue.toFixed(2)}`);
}

run().catch(console.error);
