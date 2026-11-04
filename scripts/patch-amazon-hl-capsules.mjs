// scripts/patch-amazon-hl-capsules.mjs
// Updates Amazon SP-API listings for SJT-CMBO-HL-1M, SJT-CMBO-HL-2M, SJT-CMBO-HL-3M
// Completely aligns Title, Dosage Form, Generic Keywords, Product Description, and Bullets to pure VEG CAPSULES.

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

const patches = {
  'SJT-CMBO-HL-1M': {
    title: 'Sujata Nutrilive Healthy Life 360 Synergy Combo Pack | Spirulina Veg Capsules (60 Caps) + Sea Buckthorn Capsules (60 Caps) | Complete Cellular Nutrition & Omega 7',
    description: "Sujata Nutrilive Healthy Life 360 Synergy Combo unites two of nature's most extraordinary superfoods: 100% Pure Spirulina Veg Capsules (65% protein, chlorophyll, phycocyanin, iron) and Wild Himalayan Sea Buckthorn Veg Capsules (rare Omega 7, 3, 6, 9 and natural Vitamin C). Designed as an integrated 30-day holistic protocol, Spirulina energizes and detoxifies cellular metabolic pathways while Sea Buckthorn hydrates epithelial membranes, strengthens heart health, and promotes a natural skin glow. Easy-to-swallow vegetarian capsules with zero binders or artificial fillers.",
    bullets: [
      'COMPLETE DUAL CELLULAR PROTOCOL: Synergistic 30-day nutritional pack combining 100% Pure Spirulina Veg Capsules (plant iron & protein) with Wild Himalayan Sea Buckthorn Veg Capsules for whole-body rejuvenation.',
      'HEMOGLOBIN & METABOLIC ENHANCEMENT: Restores red blood cell counts, aids digestive wellness, and improves physical stamina over continuous daily health cycles with bio-available plant nutrients.',
      'CELLULAR DETOX & IMMUNE RESILIENCE: Concentrated chlorophyll and bioflavonoids work systematically to flush toxins, support liver pathways, and protect cells against oxidative damage.',
      '100% VEGETARIAN CAPSULES: Odorless, easy-to-swallow plant-based HPMC capsules without binder chemicals, synthetic fillers, or bitter algae taste.',
      'GMP & FSSAI CERTIFIED: Formulated in certified clean-room facilities with zero artificial preservatives, heavy metal screening, and complete herbal integrity.'
    ]
  },
  'SJT-CMBO-HL-2M': {
    title: 'Sujata Nutrilive Healthy Life 360 Synergy Combo (2-Month Plan) | 2x Spirulina Veg Capsules + 2x Sea Buckthorn Capsules | 60-Day Total Cellular Rejuvenation',
    description: 'Sujata Nutrilive Healthy Life 360 2-Month Comprehensive Regimen includes 2 bottles of Pure Spirulina Veg Capsules (120 Caps total) and 2 bottles of Wild Himalayan Sea Buckthorn Veg Capsules (120 Caps total). Ideal for continuous metabolic rejuvenation, joint comfort, and glowing skin. Easy to swallow plant capsules with zero chemical binders.',
    bullets: [
      'EXTENDED 60-DAY CELLULAR PROTOCOL: 2 full bottles of Spirulina Veg Capsules + 2 full bottles of Sea Buckthorn Veg Capsules for progressive cellular renewal and sustained vitality.',
      'HEMOGLOBIN & METABOLIC ENHANCEMENT: Restores red blood cell counts, aids digestive wellness, and improves physical stamina over continuous daily health cycles with bio-available plant nutrients.',
      'CELLULAR DETOX & IMMUNE RESILIENCE: Concentrated chlorophyll and bioflavonoids work systematically to flush toxins, support liver pathways, and protect cells against oxidative damage.',
      '100% VEGETARIAN CAPSULES: Odorless, easy-to-swallow plant-based HPMC capsules without binder chemicals, synthetic fillers, or bitter algae taste.',
      'GMP & FSSAI CERTIFIED: Formulated in certified clean-room facilities with zero artificial preservatives, heavy metal screening, and complete herbal integrity.'
    ]
  },
  'SJT-CMBO-HL-3M': {
    title: 'Sujata Nutrilive Healthy Life 360 Synergy Combo (3-Month Protocol) | 3x Spirulina Veg Capsules + 3x Sea Buckthorn Capsules | 90-Day Complete Metabolic Transformation',
    description: 'Sujata Nutrilive Healthy Life 360 3-Month Protocol is the definitive holistic transformation package. Includes 3 bottles of Pure Spirulina Veg Capsules (180 Caps total) and 3 bottles of Himalayan Sea Buckthorn Veg Capsules (180 Caps total) to support long-term cellular renewal, gut mucosal lining, and immune defense. Easy to swallow plant capsules with zero chemical binders.',
    bullets: [
      'COMPLETE 90-DAY METABOLIC TRANSFORMATION: 3 bottles of Pure Spirulina Veg Capsules + 3 bottles of Himalayan Sea Buckthorn Veg Capsules for lasting wellness and cellular rebuilding.',
      'HEMOGLOBIN & METABOLIC ENHANCEMENT: Restores red blood cell counts, aids digestive wellness, and improves physical stamina over continuous daily health cycles with bio-available plant nutrients.',
      'CELLULAR DETOX & IMMUNE RESILIENCE: Concentrated chlorophyll and bioflavonoids work systematically to flush toxins, support liver pathways, and protect cells against oxidative damage.',
      '100% VEGETARIAN CAPSULES: Odorless, easy-to-swallow plant-based HPMC capsules without binder chemicals, synthetic fillers, or bitter algae taste.',
      'GMP & FSSAI CERTIFIED: Formulated in certified clean-room facilities with zero artificial preservatives, heavy metal screening, and complete herbal integrity.'
    ]
  }
};

const genericKeywordValue = 'superfood daily wellness pack family health immunity booster hemoglobin energy stamina sea buckthorn spirulina veg capsules vitamins minerals chronic fatigue blood purification vitality supplement defense';

async function runPatch() {
  const token = await getAccessToken();

  for (const [sku, itemData] of Object.entries(patches)) {
    console.log(`\n============================================================`);
    console.log(`🚀 Patching Amazon SKU: ${sku}...`);

    const patchPayload = {
      productType: 'HERBAL_SUPPLEMENT',
      patches: [
        {
          op: 'replace',
          path: '/attributes/item_name',
          value: [{ language_tag: 'en_IN', value: itemData.title, marketplace_id: marketId }]
        },
        {
          op: 'replace',
          path: '/attributes/dosage_form',
          value: [{ language_tag: 'en_IN', value: 'Capsule', marketplace_id: marketId }]
        },
        {
          op: 'replace',
          path: '/attributes/product_description',
          value: [{ language_tag: 'en_IN', value: itemData.description, marketplace_id: marketId }]
        },
        {
          op: 'replace',
          path: '/attributes/bullet_point',
          value: itemData.bullets.map(b => ({ language_tag: 'en_IN', value: b, marketplace_id: marketId }))
        },
        {
          op: 'replace',
          path: '/attributes/generic_keyword',
          value: [{ language_tag: 'en_IN', value: genericKeywordValue, marketplace_id: marketId }]
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

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n🎉 Amazon patch operations complete!');
}

runPatch().catch(console.error);
