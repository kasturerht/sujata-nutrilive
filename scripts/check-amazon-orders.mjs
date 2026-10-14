// scripts/check-amazon-orders.mjs
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
  try {
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
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.log('Amazon Token Error:', tokenData);
      return;
    }
    const token = tokenData.access_token;
    console.log('✅ Amazon Access Token Acquired!');

    // Query Amazon Orders API for last 7 days
    const createdAfter = new Date(Date.now() - 7 * 86400000).toISOString();
    const ordersUrl = 'https://sellingpartnerapi-eu.amazon.com/orders/v0/orders?MarketplaceIds=A21TJRUUN4KGV&CreatedAfter=' + encodeURIComponent(createdAfter);
    const ordRes = await fetch(ordersUrl, {
      headers: {
        'x-amz-access-token': token,
        'Content-Type': 'application/json'
      }
    });
    const ordData = await ordRes.json();
    console.log('Amazon Orders HTTP Status:', ordRes.status);
    const orders = ordData.payload?.Orders || [];
    console.log(`📦 Found ${orders.length} Amazon Orders in the last 7 days.`);
    orders.forEach(o => {
      console.log(`  - Amazon Order #${o.AmazonOrderId} | Status: ${o.OrderStatus} | Date: ${o.PurchaseDate} | Total: ${o.OrderTotal?.CurrencyCode} ${o.OrderTotal?.Amount} | Items: ${o.NumberOfItemsShipped + o.NumberOfItemsUnshipped}`);
    });
  } catch(e) {
    console.error('Amazon error:', e.message);
  }
}
checkAmazon();
