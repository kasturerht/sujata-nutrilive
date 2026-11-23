import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function check() {
  const url = `https://${domain}/admin/api/2024-07/orders.json?status=any&created_at_min=2026-11-19T00:00:00Z&limit=20`;
  const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': token } });
  const data = await res.json();
  console.log('Shopify orders since Nov 19:', (data.orders || []).length);
  for (const o of (data.orders || [])) {
    console.log(o.order_number, o.created_at, o.customer?.first_name, o.customer?.last_name, o.customer?.phone, o.total_price, o.line_items?.map(l => l.title));
  }
}
check();
