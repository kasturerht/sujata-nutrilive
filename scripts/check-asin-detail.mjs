// scripts/check-asin-detail.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envPath = path.join(rootDir, '.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

async function checkAsin() {
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
    console.error('Failed to get token:', tData);
    return;
  }
  
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketplaceId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  
  const url = `https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/${sellerId}/AB01?marketplaceIds=${marketplaceId}&includedData=summaries,attributes,issues`;
  const res = await fetch(url, {
    headers: { 'x-amz-access-token': tData.access_token }
  });
  const data = await res.json();
  console.log('=== ISSUES FOR AB01 ===');
  console.log(JSON.stringify(data.issues, null, 2));
  console.log('=== PRODUCT TYPE ===', data.productType);
  console.log('=== ATTRIBUTES FOR AB01 ===');
  console.log(JSON.stringify(data.attributes, null, 2));
  
  // Also fetch public catalog item for ASIN B0GMQYS6M4
  const catUrl = `https://sellingpartnerapi-eu.amazon.com/catalog/2022-04-01/items/B0GMQYS6M4?marketplaceIds=${marketplaceId}&includedData=summaries,attributes,images`;
  const catRes = await fetch(catUrl, {
    headers: { 'x-amz-access-token': tData.access_token }
  });
  const catData = await catRes.json();
  console.log('=== CATALOG ITEM FOR B0GMQYS6M4 (Sujata) ===');
  console.log(JSON.stringify(catData.summaries, null, 2));

  const spiruCatUrl = `https://sellingpartnerapi-eu.amazon.com/catalog/2022-04-01/items/B0DYVKLH52?marketplaceIds=${marketplaceId}&includedData=summaries,attributes,images`;
  const spiruCatRes = await fetch(spiruCatUrl, {
    headers: { 'x-amz-access-token': tData.access_token }
  });
  const spiruCatData = await spiruCatRes.json();
  console.log('=== CATALOG ITEM FOR B0DYVKLH52 (Spiru Swastha) ===');
  console.log(JSON.stringify(spiruCatData.summaries, null, 2));
  console.log('Spiru Images:', JSON.stringify(spiruCatData.images, null, 2));
}

checkAsin().catch(console.error);
