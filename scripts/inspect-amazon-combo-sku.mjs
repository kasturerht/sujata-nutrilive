// scripts/inspect-amazon-combo-sku.mjs
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

async function getAmazonToken() {
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

async function inspectSku() {
  const token = await getAmazonToken();
  const sellerId = process.env.AMAZON_SELLER_ID;
  const marketId = process.env.AMAZON_MARKETPLACE_ID;
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT;

  const skus = ['SJT-CMBO-HL-1M', 'SJT-COMBO-SP90-SB60', 'SJT-COMBO-SP120-SB60'];
  for (const sku of skus) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues,offers`;

    const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
    const data = await res.json();

    console.log(`\n--- SKU: ${sku} ---`);
    console.log('ASIN:', data.summaries?.[0]?.asin);
    console.log('Item Name:', data.summaries?.[0]?.itemName);
    console.log('Status:', data.summaries?.[0]?.status);
    console.log('Item Form:', data.attributes?.item_form?.[0]?.value);
    console.log('Main Image:', data.attributes?.main_product_image_locator?.[0]?.media_location);
  }
}

inspectSku();
