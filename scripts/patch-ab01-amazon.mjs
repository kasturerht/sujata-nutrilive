// scripts/patch-ab01-amazon.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const env = Object.fromEntries(fs.readFileSync(path.join(rootDir, '.env'), 'utf8').split('\n').filter(l => l.includes('=')).map(l => {
  const [k, ...v] = l.split('=');
  return [k.trim(), v.join('=').trim().replace(/^["']|["']$/g, '')];
}));

async function patchAB01() {
  const tokenRes = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.AMAZON_REFRESH_TOKEN,
      client_id: env.AMAZON_LWA_CLIENT_ID,
      client_secret: env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const tData = await tokenRes.json();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketplaceId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';

  // Let's test PATCHing generic_keyword and bullet_point first
  const patchUrl = `https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/${sellerId}/AB01?marketplaceIds=${marketplaceId}`;
  
  const patchBody = {
    productType: 'NUTRITIONAL_SUPPLEMENT',
    patches: [
      {
        op: 'replace',
        path: '/attributes/generic_keyword',
        value: [
          {
            language_tag: 'en_IN',
            value: 'sujata premium spirulina capsules sujata nutrilive spirulina 60 veg capsules 500mg pure natural phycocyanin plant protein chlorophyll original sujata spirulina',
            marketplace_id: marketplaceId
          }
        ]
      }
    ]
  };

  console.log('Sending patch to Amazon SP-API...');
  const res = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'x-amz-access-token': tData.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patchBody)
  });

  const resData = await res.json();
  console.log('Patch response:', JSON.stringify(resData, null, 2));
}

patchAB01().catch(console.error);
