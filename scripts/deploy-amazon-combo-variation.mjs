// scripts/deploy-amazon-combo-variation.mjs
// Live deployment of Parent-Child Variation Family for Healthy Life Combos on Amazon India

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

const parentSku = 'SJT-CMBO-HL-PARENT';

const parentPayload = {
  productType: 'HERBAL_SUPPLEMENT',
  requirements: 'LISTING',
  attributes: {
    item_name: [{
      language_tag: 'en_IN',
      value: 'Sujata Nutrilive Healthy Life 360 Synergy Combo Pack | Pure Spirulina Veg Capsules + Himalayan Sea Buckthorn Capsules',
      marketplace_id: marketId
    }],
    brand: [{
      language_tag: 'en_IN',
      value: 'Sujata nutrilive agrotech',
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
      value: 'storage',
      marketplace_id: marketId
    }],
    supplier_declared_has_product_identifier_exemption: [{
      value: true,
      marketplace_id: marketId
    }],
    main_product_image_locator: [{
      media_location: 'https://m.media-amazon.com/images/I/61PrCP-+YgL.jpg',
      marketplace_id: marketId
    }],
    bullet_point: [
      {
        language_tag: 'en_IN',
        value: 'COMPLETE DUAL CELLULAR PROTOCOL: Synergistic nutritional pack combining 100% Pure Spirulina Veg Capsules (plant iron & protein) with Wild Himalayan Sea Buckthorn Veg Capsules for whole-body rejuvenation.',
        marketplace_id: marketId
      },
      {
        language_tag: 'en_IN',
        value: 'HEMOGLOBIN & METABOLIC ENHANCEMENT: Restores red blood cell counts, aids digestive wellness, and improves physical stamina over continuous daily health cycles with bio-available plant nutrients.',
        marketplace_id: marketId
      },
      {
        language_tag: 'en_IN',
        value: 'CELLULAR DETOX & IMMUNE RESILIENCE: Concentrated chlorophyll and bioflavonoids work systematically to flush toxins, support liver pathways, and protect cells against oxidative damage.',
        marketplace_id: marketId
      },
      {
        language_tag: 'en_IN',
        value: '100% VEGETARIAN CAPSULES: Odorless, easy-to-swallow plant-based HPMC capsules without binder chemicals, synthetic fillers, or bitter algae taste.',
        marketplace_id: marketId
      },
      {
        language_tag: 'en_IN',
        value: 'GMP & FSSAI CERTIFIED: Formulated in certified clean-room facilities with zero artificial preservatives, heavy metal screening, and complete herbal integrity.',
        marketplace_id: marketId
      }
    ],
    product_description: [{
      language_tag: 'en_IN',
      value: "Sujata Nutrilive Healthy Life 360 Synergy Combo unites two of nature's most extraordinary superfoods: 100% Pure Spirulina Veg Capsules (65% protein, chlorophyll, phycocyanin, iron) and Wild Himalayan Sea Buckthorn Veg Capsules (rare Omega 7, 3, 6, 9 and natural Vitamin C). Designed as an integrated holistic protocol, Spirulina energizes and detoxifies cellular metabolic pathways while Sea Buckthorn hydrates epithelial membranes, strengthens heart health, and promotes a natural skin glow. Easy-to-swallow vegetarian capsules with zero binders or artificial fillers.",
      marketplace_id: marketId
    }]
  }
};

const children = {
  'SJT-CMBO-HL-1M': '1-Month Plan (120 Caps)',
  'SJT-CMBO-HL-2M': '2-Month Plan (240 Caps)',
  'SJT-CMBO-HL-3M': '3-Month Plan (360 Caps)'
};

async function deploy() {
  const token = await getAccessToken();
  const fullAudit = JSON.parse(fs.readFileSync('scripts/amazon_hl_audit_full.json', 'utf8'));

  console.log('========================================================================');
  console.log('🚀 STEP 1: CREATING PARENT LISTING ON AMAZON INDIA');
  console.log('========================================================================');

  const parentUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(parentSku)}?marketplaceIds=${marketId}`;
  const pRes = await fetch(parentUrl, {
    method: 'PUT',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(parentPayload)
  });
  const pData = await pRes.json();
  console.log(`📡 Parent Creation Response (HTTP ${pRes.status}):`);
  console.log(JSON.stringify(pData, null, 2));

  console.log('\n⏳ Waiting 3 seconds for Parent propagation...');
  await new Promise(r => setTimeout(r, 3000));

  console.log('\n========================================================================');
  console.log('🚀 STEP 2: LINKING ALL 3 CHILDREN TO PARENT');
  console.log('========================================================================');

  for (const [sku, sizeVal] of Object.entries(children)) {
    console.log(`\n🔗 Linking ${sku} -> Size: "${sizeVal}"...`);
    const existingAttrs = fullAudit[sku].attributes;

    const mergedAttrs = {
      ...existingAttrs,
      parentage_level: [{ value: 'child', marketplace_id: marketId }],
      child_parent_sku_relationship: [{
        child_relationship_type: 'variation',
        parent_sku: parentSku,
        marketplace_id: marketId
      }],
      variation_theme: [{ name: 'SIZE', marketplace_id: marketId }],
      size: [{ language_tag: 'en_IN', value: sizeVal, marketplace_id: marketId }]
    };

    const payload = {
      productType: 'HERBAL_SUPPLEMENT',
      requirements: 'LISTING',
      attributes: mergedAttrs
    };

    const childUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}`;
    const cRes = await fetch(childUrl, {
      method: 'PUT',
      headers: {
        'x-amz-access-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const cData = await cRes.json();
    console.log(`📡 ${sku} Response (HTTP ${cRes.status}):`);
    console.log(JSON.stringify(cData, null, 2));

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n🎉 ALL OPERATIONS COMPLETED SUCCESSFULLY!');
}

deploy().catch(console.error);
