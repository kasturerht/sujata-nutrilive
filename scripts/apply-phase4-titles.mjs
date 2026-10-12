// scripts/apply-phase4-titles.mjs
// 🚀 PHASE 4: HIGH-CTR COSMO TITLE REFINEMENT (OCTOBER 2026)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.substring(0, idx).trim()] = val;
    }
  }
  return env;
}

const env = loadEnv();
const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

async function getAmazonToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.AMAZON_REFRESH_TOKEN,
      client_id: env.AMAZON_LWA_CLIENT_ID,
      client_secret: env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const data = await res.json();
  return data.access_token;
}

const TARGET_TITLES = [
  {
    sku: 'AB29',
    name: 'Spirulina Face Pack 50g',
    productType: 'SKIN_TREATMENT_MASK',
    newTitle: 'Sujata Nutrilive Spirulina Herbal Face Pack (50g) | Clay Detox Mask for Glowing Skin, Tan Removal & Blemish Control | 100% Vegan'
  },
  {
    sku: 'SJT-SP-SOAP-10PK',
    name: 'SpiruGlow Bath Soap 10 Pack',
    productType: 'SKIN_CLEANING_AGENT',
    newTitle: 'Sujata Nutrilive SpiruGlow Handmade Bath Soap (Family Pack of 10 - 1kg Mega Pack) | Pure Spirulina & Shea Butter | Deep Moisture & Glowing Skin'
  }
];

async function updateTitle(token, item) {
  const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(item.sku)}?marketplaceIds=${marketId}`;

  const payload = {
    productType: item.productType,
    patches: [
      {
        op: 'replace',
        path: '/attributes/item_name',
        value: [
          {
            language_tag: 'en_IN',
            value: item.newTitle,
            marketplace_id: marketId
          }
        ]
      }
    ]
  };

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
  const isAccepted = data.status === 'ACCEPTED';
  console.log(`[${isAccepted ? '✅ ACCEPTED' : '❌ ' + data.status}] SKU: ${item.sku.padEnd(20)} | Issues: ${(data.issues || []).length}`);
  console.log(`   New Title: ${item.newTitle}`);
  if (!isAccepted && data.issues?.length > 0) {
    console.log(`   Error details:`, JSON.stringify(data.issues.map(i => i.message)));
  }
  return { sku: item.sku, status: data.status, issues: data.issues };
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 SUJATA NUTRILIVE: PHASE 4 TITLE OPTIMIZATION');
  console.log('========================================================================\n');

  const token = await getAmazonToken();
  for (const item of TARGET_TITLES) {
    await updateTitle(token, item);
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n========================================================================');
  console.log('🏁 PHASE 4 TITLE OPTIMIZATION COMPLETE!');
  console.log('========================================================================\n');
}

main().catch(console.error);
