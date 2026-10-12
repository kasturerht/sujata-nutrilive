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

async function fixListing() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const sku = '8X-HQKV-14T7';

  const patchUrl = `https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}`;

  const payload = {
    productType: 'HERBAL_SUPPLEMENT',
    patches: [
      {
        op: 'replace',
        path: '/attributes/fulfillment_availability',
        value: [{ fulfillment_channel_code: 'DEFAULT', quantity: 50 }]
      },
      {
        op: 'replace',
        path: '/attributes/purchasable_offer',
        value: [
          {
            currency: 'INR',
            audience: 'ALL',
            minimum_seller_allowed_price: [
              {
                schedule: [{ value_with_tax: 200 }]
              }
            ],
            maximum_seller_allowed_price: [
              {
                schedule: [{ value_with_tax: 400 }]
              }
            ],
            maximum_retail_price: [
              {
                schedule: [{ value_with_tax: 400 }]
              }
            ],
            our_price: [
              {
                schedule: [{ value_with_tax: 350 }]
              }
            ],
            marketplace_id: marketId
          }
        ]
      }
    ]
  };

  const res = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log(`Fix 8X-HQKV-14T7: HTTP ${res.status} | Status: ${data.status} | Submission: ${data.submissionId}`);
}

fixListing();
