import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function checkPastOrders() {
  const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
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
  const token = oData.access_token;

  const res = await fetch(`https://${domain}/admin/api/2024-04/orders.json?limit=5&status=any`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log("=== LAST 5 ORDERS COMPARISON ===");
  (data.orders || []).forEach(o => {
    console.log(`\nOrder: ${o.name} | Created: ${o.created_at}`);
    console.log(`Payment Gateway:`, o.payment_gateway_names);
    console.log(`Source Name:`, o.source_name);
    console.log(`Tags:`, o.tags);
    console.log(`Customer Email:`, o.email);
    console.log(`Note attributes:`, o.note_attributes);
  });
}

checkPastOrders();
