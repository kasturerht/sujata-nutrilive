// scripts/check-1m-detail.mjs
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

async function check1M() {
  const token = await getAccessToken();
  const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/SJT-CMBO-HL-1M?marketplaceIds=${marketId}&includedData=attributes,issues,summaries,procurement`;
  const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
  const data = await res.json();
  console.log('--- SJT-CMBO-HL-1M Listings API ---');
  console.log('Status:', data.summaries?.[0]?.status);
  console.log('Title in Listings API:', data.attributes?.item_name?.[0]?.value);
  console.log('Issues:', data.issues);

  // Check Catalog Items API for B0HMJNHVNH
  const catUrl = `${endpoint}/catalog/2022-04-01/items/B0HMJNHVNH?marketplaceIds=${marketId}&includedData=attributes,summaries`;
  const catRes = await fetch(catUrl, { headers: { 'x-amz-access-token': token } });
  const catData = await catRes.json();
  console.log('\n--- B0HMJNHVNH Catalog API ---');
  console.log('Catalog Title:', catData.summaries?.[0]?.itemName);
}

check1M().catch(console.error);
