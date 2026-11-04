import fs from 'fs';

const data = JSON.parse(fs.readFileSync('reports/today_forensic_funnel_oct29.json', 'utf8'));
const checkouts = data.shopify.open_checkouts?.checkouts || [];

console.log(`Total checkouts in Shopify response: ${checkouts.length}`);

// Filter checkouts created today (2026-10-29)
const todayCheckouts = checkouts.filter(c => c.created_at?.startsWith('2026-10-29'));
console.log(`Checkouts created TODAY (2026-10-29): ${todayCheckouts.length}`);

todayCheckouts.forEach((c, idx) => {
  console.log(`\n--- Checkout #${idx + 1} ---`);
  console.log(`ID: ${c.id}`);
  console.log(`Created At: ${c.created_at} (${new Date(c.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST)`);
  console.log(`Completed At: ${c.completed_at || 'NOT COMPLETED (ABANDONED)'}`);
  console.log(`Customer Phone: ${c.phone || c.customer?.phone || 'N/A'}`);
  console.log(`Customer Email: ${c.email || c.customer?.email || 'N/A'}`);
  console.log(`Customer Name: ${c.customer?.first_name || ''} ${c.customer?.last_name || ''}`);
  console.log(`Total Price: ₹${c.total_price}`);
  console.log(`Discount Code: ${c.discount_codes?.map(d => d.code).join(', ') || 'None'}`);
  console.log(`Items: ${c.line_items?.map(i => `${i.title} (${i.quantity}x)`).join(', ')}`);
  console.log(`Shipping Address: ${c.shipping_address ? `${c.shipping_address.city}, ${c.shipping_address.province} (${c.shipping_address.zip})` : 'No address entered'}`);
  console.log(`Abandoned URL: ${c.abandoned_checkout_url}`);
});
