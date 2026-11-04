// scripts/debug-amazon-live-sku.mjs
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      process.env[trimmed.substring(0, idx).trim()] = val;
    }
  }
}
loadEnv();

async function getAccessToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.AMAZON_REFRESH_TOKEN,
      client_id: process.env.AMAZON_LWA_CLIENT_ID,
      client_secret: process.env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const data = await res.json();
  return data.access_token;
}

async function checkDetails() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const skus = ['SJT-CMBO-HL-PARENT', 'SJT-CMBO-HL-1M', 'SJT-CMBO-HL-2M', 'SJT-CMBO-HL-3M'];

  for (const sku of skus) {
    console.log('\n============================================================');
    console.log('SKU:', sku);
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues,offers`;
    const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
    const data = await res.json();
    console.log('Status code:', res.status);
    console.log('ASIN:', data.summaries?.[0]?.asin);
    console.log('Item Name:', data.attributes?.item_name?.[0]?.value);
    console.log('Main Image Locator:', JSON.stringify(data.attributes?.main_product_image_locator));
    console.log('Other Images:', JSON.stringify(data.attributes?.other_product_image_locator_1));
    console.log('Issues:', JSON.stringify(data.issues));
  }
}

checkDetails().catch(console.error);
