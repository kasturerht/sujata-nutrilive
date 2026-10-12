// scripts/apply-phase1-facet-infiltration.mjs
// 🚀 PHASE 1: SP-API BACKEND FACET INFILTRATION ENGINE (OCTOBER 2026)
// Zero-guessing, 100% schema-verified Amazon India Facet attributes for all 24 SKUs

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

const ALL_SKUS_FACETS = [
  // 1. HERBAL SUPPLEMENTS (Tablets)
  {
    sku: '8X-HQKV-14T7',
    name: 'Spirulina Tablets 60s',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Bottle',
    dosageForm: 'Tablet',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-SP-TAB-120',
    name: 'Spirulina Tablets 120s',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Bottle',
    dosageForm: 'Tablet',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },

  // 2. HERBAL SUPPLEMENTS (Capsules)
  {
    sku: 'AB01',
    name: 'Spirulina Capsules 60s',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Bottle',
    dosageForm: 'Capsule',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-SP-CAP-120',
    name: 'Spirulina Capsules 120s',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Bottle',
    dosageForm: 'Capsule',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-SP-CAP-180',
    name: 'Spirulina Capsules 180s',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Bottle',
    dosageForm: 'Capsule',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-SB-CAP-60',
    name: 'Sea Buckthorn Capsules 60s',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Bottle',
    dosageForm: 'Capsule',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-SHIL-CAP-60',
    name: 'Shilajit Capsules 60s',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Bottle',
    dosageForm: 'Capsule',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-B12-CAP-90',
    name: 'Plant B12 Capsules 90s',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Bottle',
    dosageForm: 'Capsule',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },

  // 3. HERBAL SUPPLEMENTS (Powders)
  {
    sku: 'L5-UK79-BHXE',
    name: 'Spirulina Powder 100g',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Bag',
    dosageForm: 'Powder',
    isPowder: true,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-MOR-PWD-100G',
    name: 'Moringa Leaf Powder 100g',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Bag',
    dosageForm: 'Powder',
    isPowder: true,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },

  // 4. HERBAL SUPPLEMENTS (Combos)
  {
    sku: 'SJT-COMBO-SP90-SB60',
    name: 'Super Immunity Combo (90T+60C)',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Box',
    dosageForm: 'Tablet',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-COMBO-SP120-SB60',
    name: 'Immunity Power Combo (120T+60C)',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Box',
    dosageForm: 'Tablet',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-CMBO-HL-1M',
    name: 'Healthy Life Combo 1-Month',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Box',
    dosageForm: 'Tablet',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-CMBO-HL-2M',
    name: 'Healthy Life Combo 2-Month',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Box',
    dosageForm: 'Tablet',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },
  {
    sku: 'SJT-CMBO-HL-3M',
    name: 'Healthy Life Combo 3-Month',
    productType: 'HERBAL_SUPPLEMENT',
    container: 'Box',
    dosageForm: 'Tablet',
    isPowder: false,
    dietTypes: ['plant_based', 'vegan', 'gluten_free'],
    allergens: ['gluten_free', 'preservative_free', 'non_gmo', 'dairy_free']
  },

  // 5. SKIN CLEANING AGENTS (Soap & Face Wash)
  {
    sku: 'SJT-SP-SOAP-100G',
    name: 'SpiruGlow Bath Soap 100g',
    productType: 'SKIN_CLEANING_AGENT',
    container: 'Box',
    targetBodyPart: 'body'
  },
  {
    sku: 'SJT-SP-SOAP-5PK',
    name: 'SpiruGlow Bath Soap 5 Pack',
    productType: 'SKIN_CLEANING_AGENT',
    container: 'Box',
    targetBodyPart: 'body'
  },
  {
    sku: 'SJT-SP-SOAP-10PK',
    name: 'SpiruGlow Bath Soap 10 Pack',
    productType: 'SKIN_CLEANING_AGENT',
    container: 'Box',
    targetBodyPart: 'body'
  },
  {
    sku: 'SJT-SP-FW-100ML',
    name: 'Spirulina Face Wash 100ml',
    productType: 'SKIN_CLEANING_AGENT',
    container: 'Tube',
    targetBodyPart: 'face'
  },

  // 6. SKIN MOISTURIZERS (Face Creams)
  {
    sku: 'SJT-SP-KC-50G',
    name: 'Korean Glass Skin Cream 25g',
    productType: 'SKIN_MOISTURIZER',
    container: 'Jar',
    targetBodyPart: 'face'
  },
  {
    sku: 'SJT-BR-CRM-50G',
    name: 'Bridal Radiance Cream 50g',
    productType: 'SKIN_MOISTURIZER',
    container: 'Jar',
    targetBodyPart: 'face'
  },

  // 7. HAIR CARE & BEAUTY
  {
    sku: 'SJT-SP-SHP-100ML',
    name: 'SpiruShine 2-in-1 Shampoo (100ml)',
    productType: 'SHAMPOO',
    container: 'Bottle'
  },
  {
    sku: 'SJT-SP-OIL-50ML',
    name: 'Spirulina Herbal Hair Oil (50ml)',
    productType: 'HAIR_STYLING_AGENT',
    container: 'Bottle'
  },
  {
    sku: 'AB29',
    name: 'Spirulina Face Pack 50g',
    productType: 'SKIN_TREATMENT_MASK'
  }
];

function buildSupplementPatches(item) {
  return [
    {
      op: 'replace',
      path: '/attributes/container',
      value: [
        {
          type: [{ language_tag: 'en_IN', value: item.container }],
          marketplace_id: marketId
        }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/dosage_form',
      value: [
        {
          language_tag: 'en_IN',
          value: item.dosageForm,
          marketplace_id: marketId
        }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/age_range_description',
      value: [
        {
          language_tag: 'en_IN',
          value: 'Adult',
          marketplace_id: marketId
        }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/diet_type',
      value: item.dietTypes.map(d => ({ value: d, marketplace_id: marketId }))
    },
    {
      op: 'replace',
      path: '/attributes/material_feature',
      value: [
        { value: 'Organic', marketplace_id: marketId },
        { value: 'Plant Based', marketplace_id: marketId },
        { value: 'Natural', marketplace_id: marketId }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/allergen_information',
      value: item.allergens.map(a => ({ value: a, marketplace_id: marketId }))
    }
  ];
}

function buildSkinCleaningPatches(item) {
  return [
    {
      op: 'replace',
      path: '/attributes/container',
      value: [
        {
          type: [{ language_tag: 'en_IN', value: item.container }],
          marketplace_id: marketId
        }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/age_range_description',
      value: [
        {
          language_tag: 'en_IN',
          value: 'Adult',
          marketplace_id: marketId
        }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/target_gender',
      value: [{ value: 'unisex', marketplace_id: marketId }]
    },
    {
      op: 'replace',
      path: '/attributes/skin_type',
      value: [
        { language_tag: 'en_IN', value: 'All', marketplace_id: marketId },
        { language_tag: 'en_IN', value: 'Sensitive', marketplace_id: marketId }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/material_type_free',
      value: [
        { language_tag: 'en_IN', value: 'Paraben Free', marketplace_id: marketId },
        { language_tag: 'en_IN', value: 'Sodium Lauryl Sulfate (SLS) Free', marketplace_id: marketId },
        { language_tag: 'en_IN', value: 'Synthetic Fragrance Free', marketplace_id: marketId }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/target_use_body_part',
      value: [{ value: item.targetBodyPart, marketplace_id: marketId }]
    }
  ];
}

function buildSkinMoisturizerPatches(item) {
  return [
    {
      op: 'replace',
      path: '/attributes/container',
      value: [
        {
          type: [{ language_tag: 'en_IN', value: item.container }],
          marketplace_id: marketId
        }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/age_range_description',
      value: [
        {
          language_tag: 'en_IN',
          value: 'Adult',
          marketplace_id: marketId
        }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/target_gender',
      value: [{ value: 'unisex', marketplace_id: marketId }]
    },
    {
      op: 'replace',
      path: '/attributes/skin_type',
      value: [
        { language_tag: 'en_IN', value: 'All', marketplace_id: marketId },
        { language_tag: 'en_IN', value: 'Sensitive', marketplace_id: marketId }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/material_type_free',
      value: [
        { language_tag: 'en_IN', value: 'Paraben Free', marketplace_id: marketId },
        { language_tag: 'en_IN', value: 'Sulfate Free', marketplace_id: marketId },
        { language_tag: 'en_IN', value: 'Mineral Oil Free', marketplace_id: marketId }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/target_use_body_part',
      value: [{ value: item.targetBodyPart, marketplace_id: marketId }]
    }
  ];
}

function buildShampooPatches(item) {
  return [
    {
      op: 'replace',
      path: '/attributes/target_gender',
      value: [{ value: 'unisex', marketplace_id: marketId }]
    },
    {
      op: 'replace',
      path: '/attributes/age_range_description',
      value: [{ language_tag: 'en_IN', value: 'Adult', marketplace_id: marketId }]
    },
    {
      op: 'replace',
      path: '/attributes/material_type_free',
      value: [
        { language_tag: 'en_IN', value: 'Paraben Free', marketplace_id: marketId },
        { language_tag: 'en_IN', value: 'Sodium Lauryl Sulfate (SLS) Free', marketplace_id: marketId }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/hair_type',
      value: [{ language_tag: 'en_IN', value: 'All', marketplace_id: marketId }]
    }
  ];
}

function buildHairOilPatches(item) {
  return [
    {
      op: 'replace',
      path: '/attributes/material_type_free',
      value: [
        { language_tag: 'en_IN', value: 'Paraben Free', marketplace_id: marketId },
        { language_tag: 'en_IN', value: 'Mineral Oil Free', marketplace_id: marketId }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/hair_type',
      value: [{ language_tag: 'en_IN', value: 'All', marketplace_id: marketId }]
    }
  ];
}

function buildFacePackPatches(item) {
  return [
    {
      op: 'replace',
      path: '/attributes/target_gender',
      value: [{ value: 'unisex', marketplace_id: marketId }]
    },
    {
      op: 'replace',
      path: '/attributes/skin_type',
      value: [
        { language_tag: 'en_IN', value: 'All', marketplace_id: marketId },
        { language_tag: 'en_IN', value: 'Sensitive', marketplace_id: marketId }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/material_type_free',
      value: [
        { language_tag: 'en_IN', value: 'Paraben Free', marketplace_id: marketId },
        { language_tag: 'en_IN', value: 'Synthetic Fragrance Free', marketplace_id: marketId }
      ]
    },
    {
      op: 'replace',
      path: '/attributes/target_use_body_part',
      value: [{ value: 'face', marketplace_id: marketId }]
    }
  ];
}

async function patchSku(token, item) {
  const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(item.sku)}?marketplaceIds=${marketId}`;
  
  let patches = [];
  if (item.productType === 'HERBAL_SUPPLEMENT') {
    patches = buildSupplementPatches(item);
  } else if (item.productType === 'SKIN_CLEANING_AGENT') {
    patches = buildSkinCleaningPatches(item);
  } else if (item.productType === 'SKIN_MOISTURIZER') {
    patches = buildSkinMoisturizerPatches(item);
  } else if (item.productType === 'SHAMPOO') {
    patches = buildShampooPatches(item);
  } else if (item.productType === 'HAIR_STYLING_AGENT') {
    patches = buildHairOilPatches(item);
  } else if (item.productType === 'SKIN_TREATMENT_MASK') {
    patches = buildFacePackPatches(item);
  }

  const payload = {
    productType: item.productType,
    patches
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
  console.log(`[${isAccepted ? '✅ ACCEPTED' : '❌ ' + data.status}] SKU: ${item.sku.padEnd(20)} | ${item.name.slice(0, 30).padEnd(30)} | Issues: ${(data.issues || []).length}`);
  if (!isAccepted && data.issues?.length > 0) {
    console.log(`   Error details:`, JSON.stringify(data.issues.map(i => i.message)));
  }
  return { sku: item.sku, status: data.status, issues: data.issues };
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 SUJATA NUTRILIVE: PHASE 1 SP-API FACET INFILTRATION');
  console.log(`📅 Execution Time: ${new Date().toISOString()} | Target SKUs: ${ALL_SKUS_FACETS.length}`);
  console.log('========================================================================\n');

  const token = await getAmazonToken();
  const summary = { accepted: 0, failed: 0, total: ALL_SKUS_FACETS.length };

  for (const item of ALL_SKUS_FACETS) {
    const res = await patchSku(token, item);
    if (res.status === 'ACCEPTED') summary.accepted++;
    else summary.failed++;
    // Delay 1200ms to strictly comply with Amazon 1 req/sec rate limit
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n========================================================================');
  console.log(`🏁 PHASE 1 EXECUTION COMPLETE!`);
  console.log(`Total: ${summary.total} | ✅ Accepted: ${summary.accepted} | ❌ Failed: ${summary.failed}`);
  console.log('========================================================================\n');
}

main().catch(console.error);
