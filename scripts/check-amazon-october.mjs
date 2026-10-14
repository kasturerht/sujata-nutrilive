// scripts/check-amazon-october.mjs
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

async function checkAmazon() {
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
    console.log('Amazon auth error:', tData);
    return;
  }
  const createdAfter = '2026-10-01T00:00:00Z';
  const ordersUrl = 'https://sellingpartnerapi-eu.amazon.com/orders/v0/orders?MarketplaceIds=A21TJRUUN4KGV&CreatedAfter=' + encodeURIComponent(createdAfter);
  const oRes = await fetch(ordersUrl, {
    headers: { 'x-amz-access-token': tData.access_token }
  });
  const oData = await oRes.json();
  const orders = oData.payload?.Orders || [];
  console.log('=== AMAZON ORDERS SINCE OCT 1 ===');
  console.log(`Total Orders: ${orders.length}`);
  orders.forEach(o => {
    console.log(`${o.AmazonOrderId} | Date: ${o.PurchaseDate} | Status: ${o.OrderStatus} | Total: ₹${o.OrderTotal?.Amount || '0'} | Items: ${o.NumberOfItemsShipped + o.NumberOfItemsUnshipped}`);
  });
}

checkAmazon().catch(console.error);
