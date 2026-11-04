// scripts/check-image-status.mjs
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

async function check() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  console.log('--- Checking 8X-HQKV-14T7 ---');
  const res8X = await fetch(`${endpoint}/listings/2021-08-01/items/${sellerId}/8X-HQKV-14T7?marketplaceIds=${marketId}&includedData=attributes,issues,summaries`, {
    headers: { 'x-amz-access-token': token }
  });
  const data8X = await res8X.json();
  console.log('8X Main Image:', JSON.stringify(data8X.attributes?.main_product_image_locator));

  console.log('\n--- Checking Product Type Definition for HERBAL_SUPPLEMENT image attributes ---');
  const ptdRes = await fetch(`${endpoint}/definitions/2020-09-01/productTypes/HERBAL_SUPPLEMENT?marketplaceIds=${marketId}&sellerId=${sellerId}&requirements=LISTING_IMAGE`, {
    headers: { 'x-amz-access-token': token }
  });
  console.log('PTD status:', ptdRes.status);
  const ptdData = await ptdRes.json();
  const imageProps = Object.keys(ptdData.schema?.properties || {}).filter(k => k.includes('image'));
  console.log('Image related properties in schema:', imageProps);
  if (ptdData.schema?.properties?.main_product_image_locator) {
    console.log('main_product_image_locator schema:', JSON.stringify(ptdData.schema.properties.main_product_image_locator, null, 2));
  }
}

check().catch(console.error);
