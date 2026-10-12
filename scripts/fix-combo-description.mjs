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

async function fixCombo() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const sku = 'SJT-COMBO-SP120-SB60';

  const patchUrl = `https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}`;

  const cleanDescription = 'Sujata Nutrilive Mega Synergy Wellness Combo pairs 120 pure Spirulina Tablets with 60 wild Himalayan Sea Buckthorn Capsules to provide a comprehensive 60-day cellular nutrition regimen. Spirulina delivers 65% bioavailable plant protein, iron, and antioxidant phycocyanin, while Sea Buckthorn provides essential Omegas 3, 6, 7, and 9 to support immunity, radiant skin, and sustained vitality without synthetic additives.';

  const cleanBullets = [
    { language_tag: 'en_IN', value: 'DUAL NUTRITIONAL SYNERGY: Combines 120 pure Spirulina Tablets (500mg) and 60 Himalayan Sea Buckthorn Capsules for comprehensive daily vitality.', marketplace_id: marketId },
    { language_tag: 'en_IN', value: 'RICH IN PHYCOCYANIN & OMEGA 7: Provides complete vegetable protein, bioactive iron, and rare Omegas 3, 6, 7 & 9 for immune and skin health.', marketplace_id: marketId },
    { language_tag: 'en_IN', value: 'EXTENDED 60-DAY SUPPLY: Complete 2-month regimen designed to support sustained stamina, cellular defense, and natural metabolic function.', marketplace_id: marketId },
    { language_tag: 'en_IN', value: '100% VEGAN & PURE AYURVEDIC FORMULA: Formulated without artificial binders, animal gelatin, chemical fillers, or synthetic additives.', marketplace_id: marketId },
    { language_tag: 'en_IN', value: 'EASY DAILY ROUTINE: Take 1-2 Spirulina tablets with morning water and 1 Sea Buckthorn capsule following your evening meal.', marketplace_id: marketId }
  ];

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
        path: '/attributes/product_description',
        value: [{ language_tag: 'en_IN', value: cleanDescription, marketplace_id: marketId }]
      },
      {
        op: 'replace',
        path: '/attributes/bullet_point',
        value: cleanBullets
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
  console.log(`Fix Combo 99300: HTTP ${res.status} | Status: ${data.status} | Submission: ${data.submissionId}`);
}

fixCombo();
