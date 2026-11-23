import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function fetchAllShopifyOrders() {
  const url = `https://${domain}/admin/api/2024-07/orders.json?status=any&created_at_min=2026-10-01T00:00:00Z&limit=250`;
  const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': token } });
  const data = await res.json();
  const orders = data.orders || [];
  console.log(`Total Shopify Orders fetched since 01 Oct 2026: ${orders.length}`);
  fs.writeFileSync('scripts/shopify_orders_oct_nov.json', JSON.stringify(orders, null, 2));

  let totalRev = 0;
  let statusCounts = {};
  for (const o of orders) {
    statusCounts[o.financial_status] = (statusCounts[o.financial_status] || 0) + 1;
    if (o.financial_status !== 'voided') {
      const amt = parseFloat(o.total_price || 0);
      totalRev += amt;
    }
  }
  console.log('Financial status counts:', statusCounts);
  console.log(`Total Shopify Revenue: ₹${totalRev.toFixed(2)}`);
  for (const o of orders) {
    console.log(`Order #${o.order_number} (${o.name}): ${o.created_at} | Customer: ${o.customer?.first_name} ${o.customer?.last_name || ''} | Phone: ${o.customer?.phone || o.phone} | Total: ₹${o.total_price} | Pay: ${o.gateway} / ${o.financial_status}`);
  }
}

fetchAllShopifyOrders();
