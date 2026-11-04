// scripts/verify-amazon-variation-live.mjs
// Verifies live variation structure on Amazon SP-API

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

const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

const allSkus = [
  'SJT-CMBO-HL-PARENT',
  'SJT-CMBO-HL-1M',
  'SJT-CMBO-HL-2M',
  'SJT-CMBO-HL-3M'
];

async function verify() {
  const token = await getAccessToken();

  console.log('========================================================================');
  console.log('🔍 LIVE AMAZON SP-API AUDIT: PARENT-CHILD VARIATION FAMILY');
  console.log('========================================================================');

  for (const sku of allSkus) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues`;
    const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
    const data = await res.json();

    console.log(`\n------------------------------------------------------------`);
    console.log(`📦 SKU: ${sku} | ASIN: ${data.summaries?.[0]?.asin || 'PENDING'}`);
    console.log(`   🏷️ Status: [${data.summaries?.[0]?.status?.join(', ') || 'N/A'}]`);
    console.log(`   👑 Parentage: ${data.attributes?.parentage_level?.[0]?.value || 'NONE'}`);
    console.log(`   🔗 Relationship: ${JSON.stringify(data.attributes?.child_parent_sku_relationship?.[0] || 'NONE')}`);
    console.log(`   🎨 Variation Theme: ${data.attributes?.variation_theme?.[0]?.name || 'NONE'}`);
    console.log(`   📏 Size: ${data.attributes?.size?.[0]?.value || 'N/A'}`);
    console.log(`   📸 Main Image: ${data.attributes?.main_product_image_locator?.[0]?.media_location || 'N/A'}`);
    console.log(`   ⚠️ Issues (${data.issues?.length || 0}):`, data.issues || []);

    await new Promise(r => setTimeout(r, 400));
  }
}

verify().catch(console.error);
