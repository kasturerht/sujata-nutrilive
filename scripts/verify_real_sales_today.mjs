// scripts/verify_real_sales_today.mjs
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
const TODAY = '2026-10-27';

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
  return oData.access_token || env.SHOPIFY_ADMIN_ACCESS_TOKEN;
}

async function verifyRealSales() {
  console.log("=== 1. VERIFYING REAL SHOPIFY ORDERS (GROUND TRUTH) ===");
  const token = await getShopifyToken();

  const query = `
    query {
      orders(first: 20, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFinancialStatus
            displayFulfillmentStatus
            cancelledAt
            cancelReason
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            subtotalPriceSet {
              shopMoney {
                amount
              }
            }
            totalDiscountsSet {
              shopMoney {
                amount
              }
            }
            paymentGatewayNames
            customer {
              firstName
              lastName
              email
              phone
            }
            shippingAddress {
              name
              city
              province
              zip
              phone
              address1
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                    }
                  }
                  discountedUnitPriceSet {
                    shopMoney {
                      amount
                    }
                  }
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
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const allOrders = (data.data?.orders?.edges || []).map(e => e.node);
  const todayOrders = allOrders.filter(o => o.createdAt.startsWith(TODAY));

  console.log(`Found ${todayOrders.length} orders created today (${TODAY}) on Shopify:`);
  todayOrders.forEach(o => {
    console.log(`\n-----------------------------------------`);
    console.log(`Order: ${o.name} | CreatedAt: ${o.createdAt}`);
    console.log(`Customer: ${o.shippingAddress?.name || o.customer?.firstName + ' ' + (o.customer?.lastName || '')}`);
    console.log(`Phone: ${o.shippingAddress?.phone || o.customer?.phone || 'N/A'}`);
    console.log(`Location: ${o.shippingAddress?.city}, ${o.shippingAddress?.province} - ${o.shippingAddress?.zip}`);
    console.log(`Financial Status: ${o.displayFinancialStatus} | Gateways: ${JSON.stringify(o.paymentGatewayNames)}`);
    console.log(`Total: ₹${o.totalPriceSet?.shopMoney?.amount} (Subtotal: ₹${o.subtotalPriceSet?.shopMoney?.amount}, Discount: ₹${o.totalDiscountsSet?.shopMoney?.amount || 0})`);
    console.log(`Items:`);
    o.lineItems.edges.forEach(li => {
      console.log(` - ${li.node.title} x ${li.node.quantity} @ ₹${li.node.discountedUnitPriceSet?.shopMoney?.amount || li.node.originalUnitPriceSet?.shopMoney?.amount}`);
    });
  });

  // 2. Query Razorpay API
  console.log(`\n=== 2. VERIFYING RAZORPAY PAYMENT GATEWAY TRANSACTIONS ===`);
  if (rzpKey && rzpSecret) {
    try {
      const auth = Buffer.from(`${rzpKey}:${rzpSecret}`).toString('base64');
      // Fetch payments for today
      // 2026-10-27 00:00:00 IST is 2026-10-26 18:30:00 UTC
      const fromTimestamp = Math.floor(new Date('2026-10-26T18:30:00Z').getTime() / 1000);
      const toTimestamp = Math.floor(Date.now() / 1000);

      const rzpRes = await fetch(`https://api.razorpay.com/v1/payments?from=${fromTimestamp}&to=${toTimestamp}&count=50`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });
      const rzpData = await rzpRes.json();
      console.log(`Razorpay Payments Count today: ${rzpData.items ? rzpData.items.length : 0}`);
      if (rzpData.items) {
        rzpData.items.forEach(p => {
          console.log(`- Payment ID: ${p.id} | ₹${p.amount / 100} | Status: ${p.status} | Method: ${p.method} | Description: ${p.description} | Email: ${p.email} | Contact: ${p.contact}`);
        });
      }
    } catch (e) {
      console.log("Razorpay fetch error:", e.message);
    }
  } else {
    console.log("No Razorpay credentials found.");
  }
}

verifyRealSales().catch(console.error);
