import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    env[trimmed.slice(0, idx).trim()] = val;
  }
});

async function run() {
  const tokenRes = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.AMAZON_REFRESH_TOKEN,
      client_id: env.AMAZON_LWA_CLIENT_ID,
      client_secret: env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const tData = await tokenRes.json();
  if (!tData.access_token) {
    console.error('Amazon auth error:', tData);
    return;
  }
  const token = tData.access_token;

  // Fetch all orders since 2026-10-01T00:00:00Z (Asia/Kolkata 05:30 -> 2026-09-30T18:30:00Z)
  const createdAfter = '2026-09-30T18:30:00Z';
  let url = 'https://sellingpartnerapi-eu.amazon.com/orders/v0/orders?MarketplaceIds=A21TJRUUN4KGV&CreatedAfter=' + encodeURIComponent(createdAfter);
  
  let allOrders = [];

  while (url) {
    console.log('Fetching Amazon orders:', url);
    const oRes = await fetch(url, {
      headers: { 'x-amz-access-token': token }
    });
    const oData = await oRes.json();
    const orders = oData.payload?.Orders || [];
    allOrders = allOrders.concat(orders);

    if (oData.payload?.NextToken) {
      url = 'https://sellingpartnerapi-eu.amazon.com/orders/v0/orders?MarketplaceIds=A21TJRUUN4KGV&NextToken=' + encodeURIComponent(oData.payload.NextToken);
    } else {
      url = null;
    }
  }

  console.log(`\n=== TOTAL AMAZON ORDERS FETCHED: ${allOrders.length} ===\n`);
  fs.writeFileSync('scripts/amazon_october_orders_raw.json', JSON.stringify(allOrders, null, 2), 'utf8');

  // Let's fetch order items for each order to identify the exact products
  const detailedOrders = [];

  for (const o of allOrders) {
    const orderId = o.AmazonOrderId;
    const itemsUrl = `https://sellingpartnerapi-eu.amazon.com/orders/v0/orders/${orderId}/orderItems`;
    
    // Add small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 400));
    
    let items = [];
    try {
      const itRes = await fetch(itemsUrl, {
        headers: { 'x-amz-access-token': token }
      });
      const itData = await itRes.json();
      items = itData.payload?.OrderItems || [];
    } catch(e) {
      console.error(`Error fetching items for ${orderId}:`, e.message);
    }

    const itemsSummary = items.map(it => ({
      title: it.Title,
      asin: it.ASIN,
      sku: it.SellerSKU,
      qty: it.QuantityOrdered,
      price: it.ItemPrice?.Amount,
      shipping: it.ShippingPrice?.Amount,
      discount: it.PromotionDiscount?.Amount
    }));

    detailedOrders.push({
      orderId: o.AmazonOrderId,
      purchaseDate: o.PurchaseDate,
      purchaseDateIST: new Date(o.PurchaseDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      status: o.OrderStatus,
      fulfillmentChannel: o.FulfillmentChannel, // MFN or AFN
      shipServiceLevel: o.ShipServiceLevel,
      paymentMethod: o.PaymentMethodDetails?.join(', ') || o.PaymentMethod || 'Standard',
      totalAmount: parseFloat(o.OrderTotal?.Amount || '0'),
      items: itemsSummary
    });
  }

  fs.writeFileSync('scripts/amazon_october_detailed.json', JSON.stringify(detailedOrders, null, 2), 'utf8');

  // Let's summarize
  let totalSales = 0;
  let shippedCount = 0;
  let shippedTotal = 0;
  let canceledCount = 0;
  let canceledTotal = 0;
  let pendingCount = 0;
  let pendingTotal = 0;

  const productBreakdown = {};

  for (const d of detailedOrders) {
    if (d.status === 'Canceled') {
      canceledCount++;
      canceledTotal += d.totalAmount;
    } else if (d.status === 'Shipped') {
      shippedCount++;
      shippedTotal += d.totalAmount;
      totalSales += d.totalAmount;
      d.items.forEach(it => {
        const key = it.title || it.sku || it.asin || 'Unknown';
        productBreakdown[key] = (productBreakdown[key] || 0) + (it.qty || 1);
      });
    } else {
      pendingCount++;
      pendingTotal += d.totalAmount;
      totalSales += d.totalAmount;
    }
  }

  console.log('--- AMAZON OCTOBER 2026 SUMMARY ---');
  console.log(`Total Orders Received: ${detailedOrders.length}`);
  console.log(`  - Shipped / Delivered Orders: ${shippedCount} orders = ₹${shippedTotal.toFixed(2)}`);
  console.log(`  - Canceled Orders: ${canceledCount} orders = ₹${canceledTotal.toFixed(2)}`);
  if (pendingCount > 0) {
    console.log(`  - Pending / Unshipped Orders: ${pendingCount} orders = ₹${pendingTotal.toFixed(2)}`);
  }
  console.log(`Net Amazon Sales (Excluding Canceled): ₹${totalSales.toFixed(2)}`);
  console.log(`\nProducts Sold Breakdown:`, productBreakdown);

  console.log('\n--- DETAILED AMAZON ORDER REGISTER ---');
  detailedOrders.forEach(d => {
    const itemTitles = d.items.map(i => `${i.title || i.sku} (${i.qty}x)`).join('; ') || 'No item details';
    console.log(`${d.orderId} | ${d.purchaseDateIST} | Status: ${d.status} | Total: ₹${d.totalAmount} | ${d.paymentMethod} | ${itemTitles}`);
  });
}

run().catch(console.error);
