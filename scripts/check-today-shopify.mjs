import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function checkTodayShopify() {
  console.log(`Checking Shopify Orders & Checkouts for domain: ${domain}...`);

  // Check Orders
  const ordersUrl = `https://${domain}/admin/api/2024-07/orders.json?status=any&created_at_min=2026-10-25T18:30:00Z&limit=50`;
  const ordersRes = await fetch(ordersUrl, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    }
  });
  const ordersData = await ordersRes.json();
  const orders = ordersData.orders || [];
  console.log(`\n--- SHOPIFY ORDERS TODAY (26 OCT 2026) --- (Total: ${orders.length})`);
  orders.forEach(o => {
    console.log(`Order #${o.order_number} (${o.name}):`);
    console.log(`  Created: ${o.created_at} (IST: ${new Date(o.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })})`);
    console.log(`  Customer: ${o.customer ? o.customer.first_name + ' ' + (o.customer.last_name || '') : 'Guest'} (${o.email || o.phone || 'No phone'})`);
    console.log(`  Total: ₹${o.total_price} | Gateway: ${o.gateway} | Financial Status: ${o.financial_status}`);
    console.log(`  Source: ${o.source_name} | Referring Site: ${o.referring_site || 'Direct'}`);
    console.log(`  Items: ${o.line_items.map(li => li.title + ' (x' + li.quantity + ')').join(', ')}`);
    console.log('----------------------------------------------------');
  });

  // Check Abandoned Checkouts Today
  const checkoutsUrl = `https://${domain}/admin/api/2024-07/checkouts.json?created_at_min=2026-10-25T18:30:00Z&limit=50`;
  const checkoutsRes = await fetch(checkoutsUrl, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    }
  });
  const checkoutsData = await checkoutsRes.json();
  const checkouts = checkoutsData.checkouts || [];
  console.log(`\n--- ABANDONED CHECKOUTS TODAY (26 OCT 2026) --- (Total: ${checkouts.length})`);
  checkouts.forEach(c => {
    console.log(`Checkout #${c.id}:`);
    console.log(`  Created: ${c.created_at} (IST: ${new Date(c.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })})`);
    console.log(`  Customer: ${c.email || c.phone || 'Anonymous'}`);
    console.log(`  Total: ₹${c.total_price} | Subtotal: ₹${c.subtotal_price}`);
    console.log(`  Abandonment Source: ${c.referring_site || 'Direct'}`);
    console.log(`  Items: ${c.line_items.map(li => li.title + ' (x' + li.quantity + ')').join(', ')}`);
    console.log('----------------------------------------------------');
  });
}

checkTodayShopify().catch(console.error);
