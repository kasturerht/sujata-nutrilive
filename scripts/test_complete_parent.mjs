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

async function testCompleteParent() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const parentSku = 'SJT-SP-TAB-PARENT';
  const parentPayload = {
    productType: 'HERBAL_SUPPLEMENT',
    requirements: 'LISTING',
    attributes: {
      item_name: [{
        language_tag: 'en_IN',
        value: 'Sujata Nutrilive 100% Vegan Spirulina Tablets | Zero Binders, No Fillers | High Plant Protein & Bioactive Iron',
        marketplace_id: marketId
      }],
      brand: [{
        language_tag: 'en_IN',
        value: 'Sujata Nutrilive',
        marketplace_id: marketId
      }],
      parentage_level: [{
        value: 'parent',
        marketplace_id: marketId
      }],
      variation_theme: [{
        name: 'SIZE',
        marketplace_id: marketId
      }],
      country_of_origin: [{
        value: 'IN',
        marketplace_id: marketId
      }],
      supplier_declared_dg_hz_regulation: [{
        value: 'not_applicable',
        marketplace_id: marketId
      }],
      main_product_image_locator: [{
        media_location: 'https://sujata-nutrilive.vercel.app/products/sujata-spirulina-tablets-main-3d.jpg',
        marketplace_id: marketId
      }],
      bullet_point: [
        {
          language_tag: 'en_IN',
          value: 'COLD-PRESSED ZERO-BINDER FORMULA: 100% pure Arthrospira platensis microalgae compressed under high pressure without artificial binders, synthetic glues, gelatin, or chemical additives.',
          marketplace_id: marketId
        },
        {
          language_tag: 'en_IN',
          value: '65% COMPLETE PLANT PROTEIN & BIO-IRON: Packed with all 9 essential amino acids, plant-based bioavailable iron, and vitamin B12 for natural hemoglobin synthesis and daily energy.',
          marketplace_id: marketId
        },
        {
          language_tag: 'en_IN',
          value: 'ALL-DAY ENERGY & CELLULAR VITALITY: High-potency Phycocyanin and active Chlorophyll combat daily fatigue, promote natural body detox, and protect against cellular oxidative stress.',
          marketplace_id: marketId
        },
        {
          language_tag: 'en_IN',
          value: 'EASY DIGESTION WITH ZERO FISHY ODOR: Easy-to-swallow 500mg tablets with natural earthy fragrance. Naturally cell-wall-free for 95% higher bioavailability and smooth gut absorption.',
          marketplace_id: marketId
        },
        {
          language_tag: 'en_IN',
          value: 'NABL LAB TESTED & 100% VEGAN: Formulated in an ISO & GMP certified facility. 3rd-party lab tested for zero heavy metals, pesticides, or microbial contaminants. Non-GMO, gluten-free.',
          marketplace_id: marketId
        }
      ],
      product_description: [{
        language_tag: 'en_IN',
        value: 'Experience nature\'s most potent green superfood with Sujata Nutrilive Pure Spirulina Tablets. Sourced from pristine freshwater cultivation and gently dried at low temperatures, each 500mg tablet is compressed using zero-binder cold-press technology—delivering 100% pure Arthrospira platensis without magnesium stearate, silicon dioxide, or chemical fillers. Packed with over 65% complete plant protein, all 9 essential amino acids, bioavailable iron, chlorophyll, and antioxidant phycocyanin, Sujata Nutrilive Spirulina naturally supports daily energy levels, cellular defense, healthy hemoglobin production, and whole-body vitality. Formulated in a GMP-certified facility and rigorously 3rd-party lab tested for purity and heavy metals.',
        marketplace_id: marketId
      }]
    }
  };

  const previewUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(parentSku)}?marketplaceIds=${marketId}&mode=VALIDATION_PREVIEW`;
  const res = await fetch(previewUrl, {
    method: 'PUT',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(parentPayload)
  });
  const data = await res.json();
  console.log("Validation Result with image:", JSON.stringify(data, null, 2));
}

testCompleteParent();
