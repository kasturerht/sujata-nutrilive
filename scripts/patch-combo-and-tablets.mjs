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

async function fixTwo() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  // 1. Fix 8X-HQKV-14T7 pricing
  console.log('Fixing 8X-HQKV-14T7 pricing...');
  const res1 = await fetch(`${endpoint}/listings/2021-08-01/items/${sellerId}/8X-HQKV-14T7?marketplaceIds=${marketId}`, {
    method: 'PATCH',
    headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productType: 'HERBAL_SUPPLEMENT',
      patches: [
        {
          op: 'replace',
          path: '/attributes/purchasable_offer',
          value: [{
            currency: 'INR',
            our_price: [{ schedule: [{ value_with_tax: 249 }] }],
            maximum_retail_price: [{ schedule: [{ value_with_tax: 299 }] }],
            marketplace_id: marketId
          }]
        }
      ]
    })
  });
  console.log('8X-HQKV-14T7 status:', res1.status, await res1.json());

  // 2. Fix SJT-COMBO-SP90-SB60 bullet points
  console.log('Fixing SJT-COMBO-SP90-SB60 bullet points...');
  const res2 = await fetch(`${endpoint}/listings/2021-08-01/items/${sellerId}/SJT-COMBO-SP90-SB60?marketplaceIds=${marketId}`, {
    method: 'PATCH',
    headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productType: 'HERBAL_SUPPLEMENT',
      patches: [
        {
          op: 'replace',
          path: '/attributes/bullet_point',
          value: [
            'IMMUNITY & RADIANCE SYNERGY: Spirulina powers cellular vitality while Sea Buckthorn provides essential Omegas and Vitamin C for glowing skin.',
            '90 SPIRULINA TABLETS + 60 SEA BUCKTHORN CAPSULES: Complete balanced daily supply designed for active professionals.',
            'NO SYNTHETIC ADDITIVES: Pure wholefood plant formulations with zero chemical glues or animal gelatins.',
            'DAILY SYNERGISTIC WELLNESS: An integrated two-bottle regimen providing comprehensive antioxidant, vitamin, and trace mineral balance.',
            'DAILY USE: Take 1-2 Spirulina tablets in morning, and 1 Sea Buckthorn capsule at night.'
          ].map(b => ({ language_tag: 'en_IN', value: b, marketplace_id: marketId }))
        }
      ]
    })
  });
  console.log('SJT-COMBO-SP90-SB60 status:', res2.status, await res2.json());
}

fixTwo().catch(console.error);
