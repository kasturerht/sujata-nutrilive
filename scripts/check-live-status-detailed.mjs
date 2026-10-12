import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[trimmed.substring(0, idx).trim()] = val;
      }
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

  const checkSkus = [
    '8X-HQKV-14T7',
    'L5-UK79-BHXE',
    'AB01',
    'AB27',
    'AB29',
    'SJT-SB-CAP-60',
    'SJT-SHIL-CAP-60',
    'SJT-B12-CAP-90',
    'SJT-SP-TAB-120',
    'SJT-MOR-PWD-100G',
    'SJT-CMBO-HL-1M',
    'SJT-COMBO-SP90-SB60'
  ];

  console.log('--- DETAILED STATUS AUDIT ---');
  for (const sku of checkSkus) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues,offers,fulfillmentAvailability`;
    const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
    const data = await res.json();
    console.log(`\n======================================================`);
    console.log(`SKU: ${sku} (HTTP ${res.status})`);
    if (res.status === 200) {
      console.log('Status:', data.summaries?.[0]?.status);
      console.log('ASIN:', data.summaries?.[0]?.asin);
      console.log('Title:', data.summaries?.[0]?.itemName || data.attributes?.item_name?.[0]?.value);
      console.log('Quantity:', data.fulfillmentAvailability?.[0]?.quantity ?? 'N/A');
      console.log('Price:', data.offers?.[0]?.price?.amount ?? data.attributes?.purchasable_offer?.[0]?.our_price?.[0]?.schedule?.[0]?.value_with_tax ?? 'N/A');
      console.log('Issues:', JSON.stringify(data.issues || []));
    } else {
      console.log('Error:', data);
    }
  }
}

checkDetails().catch(console.error);
