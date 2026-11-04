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

  const orders = JSON.parse(fs.readFileSync('scripts/october_orders_raw.json', 'utf8'));
  const paidOrders = orders.filter(o => o.financial_status === 'paid');

  console.log(`Checking transactions for ${paidOrders.length} paid orders...`);

  for (const o of paidOrders) {
    const res = await fetch(`https://${domain}/admin/api/2024-04/orders/${o.id}/transactions.json`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const data = await res.json();
    console.log(`\nOrder #${o.order_number} (${o.total_price}):`);
    for (const t of (data.transactions || [])) {
      console.log(`  - Tx ID: ${t.id} | Kind: ${t.kind} | Status: ${t.status} | Amount: ${t.amount} | Gateway: ${t.gateway}`);
      if (t.receipt) {
        console.log(`    Receipt keys:`, Object.keys(t.receipt));
        if (t.receipt.payment_id || t.receipt.razorpay_payment_id) {
          console.log(`    Razorpay Payment ID:`, t.receipt.payment_id || t.receipt.razorpay_payment_id);
        }
        if (t.receipt.fee || t.receipt.tax || t.receipt.charges) {
          console.log(`    Fees:`, t.receipt.fee, t.receipt.tax);
        }
      }
    }
  }
}

run();
