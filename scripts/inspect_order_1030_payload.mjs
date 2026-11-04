import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function run() {
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

  const res = await fetch(`https://${domain}/admin/api/2024-04/orders/18964958904452.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  const o = data.order;
  console.log('Order #1030:');
  console.log('line_items:', JSON.stringify(o.line_items, null, 2));
  console.log('discount_applications:', JSON.stringify(o.discount_applications, null, 2));
  console.log('total_discounts:', o.total_discounts);
  console.log('tax_lines:', JSON.stringify(o.tax_lines, null, 2));
  console.log('shipping_lines:', JSON.stringify(o.shipping_lines, null, 2));
  console.log('payment_gateway_names:', o.payment_gateway_names);
  console.log('gateway:', o.gateway);
  console.log('order_status_url:', o.order_status_url);
}

run();
