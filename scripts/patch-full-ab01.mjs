// scripts/patch-full-ab01.mjs
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

async function patchFull() {
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

  const patchUrl = `https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/${sellerId}/AB01?marketplaceIds=${marketplaceId}`;
  
  const patches = [
    {
      op: 'replace',
      path: '/attributes/main_product_image_locator',
      value: [
        {
          media_location: 'https://www.sujatanutrilive.com/products/sujata-spirulina-capsules-bottle.jpg',
          marketplace_id: marketplaceId
        }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/generic_keyword',
      value: [
        {
          language_tag: 'en_IN',
          value: 'sujata premium spirulina capsules sujata nutrilive spirulina capsules original 60 veg capsules 500mg pure biomass sub-40 cryo phycocyanin cellular energy plant iron immunity',
          marketplace_id: marketplaceId
        }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/bullet_point',
      value: [
        {
          language_tag: 'en_IN',
          value: 'OFFICIAL SUJATA NUTRILIVE FORMULATION: 100% pure single-herb organic Spirulina (Arthrospira platensis) biomass cultivated in closed bio-secure hydro-domes in Maharashtra.',
          marketplace_id: marketplaceId
        },
        {
          language_tag: 'en_IN',
          value: 'HIGH BIOAVAILABLE C-PHYCOCYANIN & PLANT IRON: Preserves 21.4% active C-Phycocyanin and 290.89 mg/kg elemental iron via sub-40°C gentle low-thermal drying.',
          marketplace_id: marketplaceId
        },
        {
          language_tag: 'en_IN',
          value: '100% PLANT-DERIVED VEGETARIAN CAPSULES: Encased in vegetarian HPMC cellulose shells with 0% synthetic binders, 0% magnesium stearate, and 0% INS 551 silicon dioxide.',
          marketplace_id: marketplaceId
        },
        {
          language_tag: 'en_IN',
          value: 'BATCH LAB TESTED FOR HEAVY METALS: Certified Lead < 0.01 ppm, Mercury BDL, and Arsenic BDL under independent NABL ISO/IEC 17025 accredited laboratory testing.',
          marketplace_id: marketplaceId
        },
        {
          language_tag: 'en_IN',
          value: 'AUTHENTICITY GUARANTEE: Marketed exclusively by Sujata Nutrilive Agrotech, Nashik. Backed by our 40-Day Evaluation Guarantee.',
          marketplace_id: marketplaceId
        }
      ]
    }
  ];

  console.log('Sending full patch for AB01 to Amazon SP-API...');
  const res = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'x-amz-access-token': tData.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productType: 'NUTRITIONAL_SUPPLEMENT', patches })
  });

  const resData = await res.json();
  console.log('Patch response:', JSON.stringify(resData, null, 2));
}

patchFull().catch(console.error);
