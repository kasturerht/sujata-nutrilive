import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function getAccessToken() {
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
  return { domain, token: oData.access_token };
}

async function fetchAllOctoberOrders() {
  const { domain, token } = await getAccessToken();

  // Oct 1, 2026 00:00:00 IST is 2026-09-30T18:30:00Z
  const createdAtMin = '2026-09-30T18:30:00Z';
  let url = `https://${domain}/admin/api/2024-04/orders.json?status=any&created_at_min=${createdAtMin}&limit=250`;
  
  let allOrders = [];

  while (url) {
    console.log('Fetching:', url);
    const res = await fetch(url, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    
    if (!res.ok) {
      console.error('Fetch error:', res.status, await res.text());
      break;
    }

    const data = await res.json();
    const orders = data.orders || [];
    allOrders = allOrders.concat(orders);

    // Check pagination Link header
    const linkHeader = res.headers.get('link') || res.headers.get('Link');
    if (linkHeader && linkHeader.includes('rel="next"')) {
      const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      url = match ? match[1] : null;
    } else {
      url = null;
    }
  }

  console.log(`\n=== TOTAL ORDERS FETCHED FOR OCTOBER 2026: ${allOrders.length} ===\n`);

  fs.writeFileSync('scripts/october_orders_raw.json', JSON.stringify(allOrders, null, 2), 'utf8');

  // Let's summarize the orders
  let grossSales = 0;
  let totalDiscounts = 0;
  let totalTax = 0;
  let totalShipping = 0;
  let totalOrdersValue = 0; // total_price
  let totalRefunds = 0;

  let paidCount = 0;
  let paidTotal = 0;
  let codCount = 0;
  let codTotal = 0;
  let cancelledCount = 0;
  let cancelledTotal = 0;

  const ordersList = [];

  for (const o of allOrders) {
    const isCancelled = !!o.cancelled_at;
    const finStatus = o.financial_status; // paid, pending, refunded, voided
    const orderNum = o.order_number || o.name;
    const createdAt = o.created_at;
    const totalPrice = parseFloat(o.total_price || '0');
    const subtotal = parseFloat(o.subtotal_price || '0');
    const discounts = parseFloat(o.total_discounts || '0');
    const tax = parseFloat(o.total_tax || '0');
    const shipping = parseFloat(o.total_shipping_price_set?.shop_money?.amount || '0');
    
    // Calculate refunds if any
    let refunds = 0;
    if (o.refunds && o.refunds.length > 0) {
      for (const r of o.refunds) {
        for (const t of (r.transactions || [])) {
          refunds += parseFloat(t.amount || '0');
        }
      }
    }

    const gateways = (o.payment_gateway_names || []).join(', ') || o.gateway || 'Unknown';
    const isCod = finStatus === 'pending' || gateways.toLowerCase().includes('cod') || gateways.toLowerCase().includes('cash');

    ordersList.push({
      order_number: orderNum,
      date_ist: new Date(createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      customer: `${o.customer?.first_name || ''} ${o.customer?.last_name || ''}`.trim() || 'Guest',
      financial_status: finStatus,
      is_cancelled: isCancelled,
      cancelled_at: o.cancelled_at,
      payment_method: gateways,
      total_price: totalPrice,
      subtotal: subtotal,
      discounts: discounts,
      refunds: refunds,
      items: (o.line_items || []).map(i => `${i.title} (${i.quantity}x)`).join('; ')
    });

    if (isCancelled) {
      cancelledCount++;
      cancelledTotal += totalPrice;
    } else {
      totalOrdersValue += totalPrice;
      grossSales += subtotal;
      totalDiscounts += discounts;
      totalTax += tax;
      totalShipping += shipping;
      totalRefunds += refunds;

      if (finStatus === 'paid') {
        paidCount++;
        paidTotal += totalPrice;
      } else if (isCod) {
        codCount++;
        codTotal += totalPrice;
      }
    }
  }

  console.log('--- SUMMARY STATS ---');
  console.log(`Active (Non-Cancelled) Orders: ${allOrders.length - cancelledCount}`);
  console.log(`Total Sales Value (total_price): ₹${totalOrdersValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  console.log(`  - Paid (Prepaid/Online): ${paidCount} orders = ₹${paidTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  console.log(`  - Pending (Cash on Delivery): ${codCount} orders = ₹${codTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  if (cancelledCount > 0) {
    console.log(`Cancelled Orders: ${cancelledCount} orders = ₹${cancelledTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  }
  if (totalRefunds > 0) {
    console.log(`Refunds: ₹${totalRefunds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  }

  console.log('\n--- DETAILED ORDERS LIST (Chronological) ---');
  ordersList.sort((a, b) => a.order_number - b.order_number);
  ordersList.forEach(o => {
    console.log(`#${o.order_number} | ${o.date_ist} | ${o.customer} | ₹${o.total_price} | ${o.financial_status}${o.is_cancelled ? ' [CANCELLED]' : ''} | ${o.payment_method} | ${o.items}`);
  });
}

fetchAllOctoberOrders();
