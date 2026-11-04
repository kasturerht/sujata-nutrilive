// scripts/inspect-amazon-live-pages.mjs
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

const asins = [
  { sku: 'SJT-CMBO-HL-PARENT', asin: 'B0HNKT4Z3N', name: 'PARENT' },
  { sku: 'SJT-CMBO-HL-1M', asin: 'B0HMJNHVNH', name: 'Child 1M' },
  { sku: 'SJT-CMBO-HL-2M', asin: 'B0HMJRLX2C', name: 'Child 2M' },
  { sku: 'SJT-CMBO-HL-3M', asin: 'B0HMJD6LYN', name: 'Child 3M' }
];

async function checkCatalog() {
  const token = await getAccessToken();

  for (const item of asins) {
    console.log(`\n============================================================`);
    console.log(`Checking Catalog for ${item.name} (${item.sku} - ${item.asin})...`);
    
    // Catalog Items API 2022-04-01
    const catUrl = `${endpoint}/catalog/2022-04-01/items/${item.asin}?marketplaceIds=${marketId}&includedData=attributes,images,summaries,relationships,productTypes`;
    const res = await fetch(catUrl, { headers: { 'x-amz-access-token': token } });
    const data = await res.json();
    console.log(`Catalog Status: ${res.status}`);
    if (res.status === 200) {
      console.log('Title:', data.summaries?.[0]?.itemName);
      console.log('Images:', JSON.stringify(data.images?.[0]?.images?.map(i => ({ variant: i.variant, link: i.link }))));
      console.log('Relationships:', JSON.stringify(data.relationships));
      console.log('Attributes:', JSON.stringify({
        item_name: data.attributes?.item_name?.[0]?.value,
        size: data.attributes?.size?.[0]?.value
      }));
    } else {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  }
}

checkCatalog().catch(console.error);
