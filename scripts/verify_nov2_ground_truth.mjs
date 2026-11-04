// scripts/verify_nov2_ground_truth.mjs
import fs from 'fs';
import path from 'path';

// 1. Load .env
const env = {};
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

// 2. Load Razorpay keys
let rzpKey = null;
let rzpSecret = null;
if (fs.existsSync('rzp-key.csv')) {
  const lines = fs.readFileSync('rzp-key.csv', 'utf8').split(/\r?\n/);
  if (lines.length > 1) {
    const parts = lines[1].split(',');
    rzpKey = parts[0]?.trim();
    rzpSecret = parts[1]?.trim();
  }
}

const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const clientId = env.SHOPIFY_CLIENT_ID;
const clientSecret = env.SHOPIFY_CLIENT_SECRET;

async function getShopifyToken() {
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

async function run() {
  console.log("=== 1. SHOPIFY ORDERS VIA OAUTH TOKEN ===");
  try {
    const token = await getShopifyToken();
    const query = `
      query {
        orders(first: 20, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              channelInformation {
                channelDefinition {
                  channelName
                }
              }
              customer {
                displayName
                phone
                email
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

    const res = await fetch(`https://${shopifyDomain}/admin/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({ query })
    });

    const data = await res.json();
    if (data.data?.orders?.edges) {
      console.log(`Found ${data.data.orders.edges.length} recent orders:`);
      data.data.orders.edges.forEach(({ node: o }) => {
        const ist = new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        console.log(`Order: ${o.name} | Created: ${ist} | ₹${o.totalPriceSet.shopMoney.amount} | Financial: ${o.displayFinancialStatus} | Fulfillment: ${o.displayFulfillmentStatus}`);
        console.log(`  Customer: ${o.customer?.displayName} (${o.customer?.phone || o.customer?.email})`);
        console.log(`  Items: ${o.lineItems.edges.map(e => `${e.node.title} (x${e.node.quantity})`).join(', ')}`);
        console.log('----------------------------------------------------');
      });
    } else {
      console.log("GraphQL response:", JSON.stringify(data));
    }
  } catch (e) {
    console.error("Shopify error:", e.message);
  }

  console.log("\n=== 2. RAZORPAY ORDERS & PAYMENTS (YESTERDAY & RECENT) ===");
  if (rzpKey && rzpSecret) {
    const authHeader = 'Basic ' + Buffer.from(`${rzpKey}:${rzpSecret}`).toString('base64');
    try {
      // 10 recent payments
      const pRes = await fetch('https://api.razorpay.com/v1/payments?count=20', {
        headers: { Authorization: authHeader }
      });
      const pData = await pRes.json();
      console.log(`Recent Razorpay Payments count: ${pData.items?.length || 0}`);
      (pData.items || []).forEach(p => {
        const ist = new Date(p.created_at * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        console.log(`Payment: ${p.id} | ${ist} | ₹${(p.amount / 100).toFixed(2)} | Method: ${p.method} | Status: ${p.status} | OrderId: ${p.order_id} | Contact: ${p.contact} | Email: ${p.email}`);
        if (p.error_code) {
          console.log(`  Error: ${p.error_code} - ${p.error_description}`);
        }
      });

      // 10 recent orders
      console.log("\nRecent Razorpay Orders:");
      const oRes = await fetch('https://api.razorpay.com/v1/orders?count=20', {
        headers: { Authorization: authHeader }
      });
      const oData = await oRes.json();
      (oData.items || []).forEach(o => {
        const ist = new Date(o.created_at * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        console.log(`Order: ${o.id} | ${ist} | ₹${(o.amount / 100).toFixed(2)} | Status: ${o.status} | Attempts: ${o.attempts} | Receipt: ${o.receipt}`);
      });
    } catch (e) {
      console.error("Razorpay error:", e.message);
    }
  } else {
    console.log("No rzp credentials found.");
  }
}

run().catch(console.error);
