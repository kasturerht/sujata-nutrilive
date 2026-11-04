// scripts/patch-amazon-combo-images.mjs
// Pushes authentic 3D studio images for 2-Month (4 bottles) and 3-Month (6 bottles) to Amazon SP-API.

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

const imagePatches = {
  'SJT-CMBO-HL-2M': {
    name: '2-Month Plan (4 Bottles)',
    url: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-combo-capsules-2month-4bottles-pro3d.jpg'
  },
  'SJT-CMBO-HL-3M': {
    name: '3-Month Plan (6 Bottles - Dual Triangle)',
    url: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-combo-capsules-3month-6bottles-pro3d.jpg'
  }
};

async function patchImages() {
  console.log('🔑 Authenticating with Amazon SP-API...');
  const token = await getAccessToken();

  for (const [sku, config] of Object.entries(imagePatches)) {
    console.log(`\n============================================================`);
    console.log(`🚀 Patching Main Product Image for ${sku} [${config.name}]...`);
    console.log(`📸 Image URL: ${config.url}`);

    const patchPayload = {
      productType: 'HERBAL_SUPPLEMENT',
      patches: [
        {
          op: 'replace',
          path: '/attributes/main_product_image_locator',
          value: [
            {
              media_location: config.url,
              marketplace_id: marketId
            }
          ]
        }
      ]
    };

    const res = await fetch(`${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}`, {
      method: 'PATCH',
      headers: {
        'x-amz-access-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patchPayload)
    });

    const respData = await res.json();
    console.log(`📡 Response for ${sku} (HTTP ${res.status}):`);
    console.log(JSON.stringify(respData, null, 2));

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n🎉 Image patches submitted successfully to Amazon SP-API!');
}

patchImages().catch(console.error);
