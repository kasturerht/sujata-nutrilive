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

async function testPatch() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const sku = '8X-HQKV-14T7';
  const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}`;

  const payload = {
    productType: 'HERBAL_SUPPLEMENT',
    patches: [
      {
        op: 'replace',
        path: '/attributes/main_product_image_locator',
        value: [
          {
            media_location: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-tablets-bottle.jpg',
            marketplace_id: marketId
          }
        ]
      },
      {
        op: 'replace',
        path: '/attributes/other_product_image_locator_1',
        value: [
          {
            media_location: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-tablets-benefits.jpg',
            marketplace_id: marketId
          }
        ]
      },
      {
        op: 'replace',
        path: '/attributes/other_product_image_locator_2',
        value: [
          {
            media_location: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-tablets-how-to-take.jpg',
            marketplace_id: marketId
          }
        ]
      },
      {
        op: 'replace',
        path: '/attributes/flavor',
        value: [
          {
            language_tag: 'en_IN',
            value: 'Unflavoured',
            marketplace_id: marketId
          }
        ]
      },
      {
        op: 'replace',
        path: '/attributes/primary_supplement_type',
        value: [
          {
            language_tag: 'en_IN',
            value: 'Spirulina',
            marketplace_id: marketId
          }
        ]
      }
    ]
  };

  console.log(`Sending PATCH with images and attributes to SKU [${sku}]...`);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json',
      'User-Agent': 'SujataNutrilive/1.0'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log(`Status: ${res.status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
}

testPatch().catch(console.error);
