import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.substring(0, idx).trim()] = val;
    }
  }
  return env;
}
const env = loadEnv();
const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';

async function getAdminToken() {
  const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  const oData = await oRes.json();
  return oData.access_token;
}

async function checkRecentOrders() {
  const token = await getAdminToken();
  const res = await fetch(`https://${domain}/admin/api/2024-04/orders.json?status=any&limit=10`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log(`Total Orders returned: ${data.orders?.length || 0}`);
  data.orders?.forEach(o => {
    const dUtc = new Date(o.created_at);
    const dIst = new Date(dUtc.getTime() + 5.5 * 3600 * 1000);
    console.log(`\nOrder: ${o.name} | Total: ₹${o.total_price} | Created IST: ${dIst.toISOString().replace('T', ' ').slice(0, 19)} | Financial: ${o.financial_status} | Fulfillment: ${o.fulfillment_status} | Customer: ${o.customer?.first_name} ${o.customer?.last_name} (${o.customer?.phone || o.customer?.email || 'No phone'}) | City: ${o.shipping_address?.city || 'N/A'}`);
    o.line_items?.forEach(li => {
      console.log(`   Item: ${li.title} (x${li.quantity}) - ₹${li.price} [SKU: ${li.sku}]`);
    });
  });
}

checkRecentOrders().catch(console.error);
