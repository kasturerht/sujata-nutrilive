// scripts/inspect_shopify_recent_orders_detailed.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function check() {
  const url = `https://${domain}/admin/api/2024-07/orders.json?status=any&limit=25`;
  const res = await fetch(url, {
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  const orders = data.orders || [];
  console.log(`Found ${orders.length} latest orders in Shopify:`);
  orders.forEach(o => {
    const ist = new Date(o.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`#${o.order_number} (${o.name}) | Date: ${ist} | ₹${o.total_price} | Gateway: ${o.gateway} | Payment: ${o.financial_status}`);
    console.log(`  Source: ${o.source_name} | Referring: ${o.referring_site || 'Direct'}`);
    console.log(`  Items: ${o.line_items.map(i => i.title + ' (x' + i.quantity + ')').join(', ')}`);
    console.log(`  Customer: ${o.customer ? o.customer.first_name + ' ' + (o.customer.last_name || '') + ' (' + (o.customer.phone || o.email) + ')' : 'Guest'}`);
    console.log('----------------------------------------------------');
  });
}

check().catch(console.error);
