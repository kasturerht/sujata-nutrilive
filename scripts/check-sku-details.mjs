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

const skusToCheck = [
  'SJT-BR-CRM-50G',
  'SJT-SP-OIL-50ML',
  'SJT-SP-SHP-100ML',
  'SJT-SP-SOAP-5PK',
  'SJT-SP-SOAP-10PK',
  'SJT-COMBO-SP120-SB60'
];

async function run() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  for (const sku of skusToCheck) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues,offers,fulfillmentAvailability`;
    const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
    const data = await res.json();
    console.log(`\n================== SKU: ${sku} (HTTP ${res.status}) ==================`);
    if (res.status === 200) {
      console.log('Summaries:', JSON.stringify(data.summaries, null, 2));
      console.log('Offers:', JSON.stringify(data.offers, null, 2));
      console.log('Purchasable Offer Attribute:', JSON.stringify(data.attributes?.purchasable_offer, null, 2));
      console.log('Issues:', JSON.stringify(data.issues, null, 2));
    } else {
      console.log('Error data:', JSON.stringify(data, null, 2));
    }
  }
}

run();
