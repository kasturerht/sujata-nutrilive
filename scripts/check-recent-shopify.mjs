import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function checkRecent() {
  const url = `https://${domain}/admin/api/2024-07/orders.json?status=any&limit=10`;
  const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': token } });
  const data = await res.json();
  const orders = (data.orders || []).map(o => ({
    name: o.name,
    created_at_utc: o.created_at,
    created_at_ist: new Date(o.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    total: '₹' + o.total_price,
    financial_status: o.financial_status,
    gateway: o.gateway,
    source: o.source_name
  }));
  console.log('\n--- LAST 10 SHOPIFY ORDERS ---');
  console.table(orders);
}

checkRecent().catch(console.error);
