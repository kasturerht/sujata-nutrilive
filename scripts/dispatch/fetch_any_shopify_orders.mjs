import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function fetchAnyShopifyOrders() {
  const url = `https://${domain}/admin/api/2024-07/orders.json?status=any&limit=50`;
  const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': token } });
  const data = await res.json();
  const orders = data.orders || [];
  console.log(`Total Shopify Orders fetched (no date filter): ${orders.length}`);
  for (const o of orders) {
    console.log(o.order_number, o.name, o.created_at, o.total_price, o.financial_status);
  }
}

fetchAnyShopifyOrders();
