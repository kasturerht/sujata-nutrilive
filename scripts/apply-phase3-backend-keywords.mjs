// scripts/apply-phase3-backend-keywords.mjs
// 🚀 PHASE 3: 250-BYTE BACKEND SEARCH TERMS INFILTRATION (OCTOBER 2026)
// Zero-guessing, space-delimited, strictly <= 250 bytes for all 24 SKUs

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

// -------------------------------------------------------------
// EXACT VETTED 250-BYTE KEYWORDS (Space-Delimited, Zero Commas)
// -------------------------------------------------------------

const KW_SPIRULINA_SUPPLEMENTS = "goli capsules tablets hemoglobin booster fatigue stamina blood purifier hair skin glow detox immunity cold pressed microalgae multivitamin women men b12 gym ayurvedic natural metabolism gut health khoon ki kami iron deficiency weakness";
const KW_SPIRULINA_POWDER = "raw algae superfood protein powder green shake smoothie mix chlorophyll phycocyanin post workout muscle recovery detox cleanse immunity energy vitality vegan organic weight management digestion athletic endurance nutrition";
const KW_MORINGA_POWDER = "sahjan leaf powder drumstick leaves superfood green juice joint pain calcium iron vitamins immunity booster natural multivitamin metabolism digestion organic herbal churna diabetes blood sugar support lactation energy";
const KW_SEA_BUCKTHORN = "himalayan berry oil omega 7 3 6 9 palmitoleic acid vegetarian capsules glowing skin collagen booster anti aging wrinkles hydration dry eyes gastric mucosal lining heart health immunity natural vitamin c cellular repair";
const KW_SHILAJIT = "original himalayan resin extract gold grade shilajeet 84 trace minerals fulvic acid stamina endurance vitality vigor muscle recovery gym workout testosterone boost ayurvedic rasayana strength men energy fatigue power";
const KW_B12 = "plant based methylcobalamin vegan vitamin b12 capsules nerve health brain memory energy metabolism red blood cell rbc synthesis fatigue weakness neuropathy vegetarian organic spirulina daily supplement tiredness";
const KW_COMBOS = "superfood daily wellness pack family health immunity booster hemoglobin energy stamina sea buckthorn spirulina combo tablets capsules vitamins minerals chronic fatigue blood purification vitality supplement defense";
const KW_SOAP = "handmade cold process bathing bar bath soap organic coconut oil shea butter chemical free sensitive dry skin pimple acne dark spots glow whitening herbal vegan natural body cleanser rich lather itching rash relief";
const KW_FACE_WASH = "deep pore cleansing gel face wash foaming acne pimple control oil clear sebum pollution defense gentle tea tree neem brightening dark spots sensitive skin daily cleanser men women blackhead whitehead removal";
const KW_KOREAN_CREAM = "dewy glass skin moisturizer niacinamide marine peptides anti aging dark spot pigmentation removal wrinkle smoothing daily day night face cream lightweight non greasy hydrating glow skin barrier repair collagen";
const KW_BRIDAL_CREAM = "wedding bridal glow face cream saffron almond oil pigmentation removal dark spots tanning skin brightening radiant fairness glowing skin even tone night moisturiser herbal ubtan care bridal prep dewy glow";
const KW_FACE_PACK = "clay mask kaolin facial mud pack tan removal blackhead whitehead pore tightening skin brightening glowing anti acne blemish oil control detox herbal weekly facial treatment dead skin exfoliation glow";
const KW_SHAMPOO = "sulfate free shampoo 2 in 1 conditioner plant keratin hair fall anti dandruff dry itchy scalp frizz control smooth silky hair follicle growth strengthening unisex daily gentle wash hair thinning repair";
const KW_HAIR_OIL = "cold pressed herbal hair growth oil anti hair fall control root strengthening dandruff scalp therapy sesame coconut oil non sticky fast absorbing split ends repair volume density jadibuti head massage";

const ALL_SKU_KEYWORDS = [
  // 1. Herbal Supplements - Tablets
  { sku: '8X-HQKV-14T7', name: 'Spirulina Tablets 60s', productType: 'HERBAL_SUPPLEMENT', keywords: KW_SPIRULINA_SUPPLEMENTS },
  { sku: 'SJT-SP-TAB-120', name: 'Spirulina Tablets 120s', productType: 'HERBAL_SUPPLEMENT', keywords: KW_SPIRULINA_SUPPLEMENTS },

  // 2. Herbal Supplements - Capsules
  { sku: 'AB01', name: 'Spirulina Capsules 60s', productType: 'HERBAL_SUPPLEMENT', keywords: KW_SPIRULINA_SUPPLEMENTS },
  { sku: 'SJT-SP-CAP-120', name: 'Spirulina Capsules 120s', productType: 'HERBAL_SUPPLEMENT', keywords: KW_SPIRULINA_SUPPLEMENTS },
  { sku: 'SJT-SP-CAP-180', name: 'Spirulina Capsules 180s', productType: 'HERBAL_SUPPLEMENT', keywords: KW_SPIRULINA_SUPPLEMENTS },
  { sku: 'SJT-SB-CAP-60', name: 'Sea Buckthorn Capsules 60s', productType: 'HERBAL_SUPPLEMENT', keywords: KW_SEA_BUCKTHORN },
  { sku: 'SJT-SHIL-CAP-60', name: 'Shilajit Capsules 60s', productType: 'HERBAL_SUPPLEMENT', keywords: KW_SHILAJIT },
  { sku: 'SJT-B12-CAP-90', name: 'Plant B12 Capsules 90s', productType: 'HERBAL_SUPPLEMENT', keywords: KW_B12 },

  // 3. Herbal Supplements - Powders
  { sku: 'L5-UK79-BHXE', name: 'Spirulina Powder 100g', productType: 'HERBAL_SUPPLEMENT', keywords: KW_SPIRULINA_POWDER },
  { sku: 'SJT-MOR-PWD-100G', name: 'Moringa Leaf Powder 100g', productType: 'HERBAL_SUPPLEMENT', keywords: KW_MORINGA_POWDER },

  // 4. Herbal Supplements - Combos
  { sku: 'SJT-COMBO-SP90-SB60', name: 'Super Immunity Combo (90T+60C)', productType: 'HERBAL_SUPPLEMENT', keywords: KW_COMBOS },
  { sku: 'SJT-COMBO-SP120-SB60', name: 'Immunity Power Combo (120T+60C)', productType: 'HERBAL_SUPPLEMENT', keywords: KW_COMBOS },
  { sku: 'SJT-CMBO-HL-1M', name: 'Healthy Life Combo 1-Month', productType: 'HERBAL_SUPPLEMENT', keywords: KW_COMBOS },
  { sku: 'SJT-CMBO-HL-2M', name: 'Healthy Life Combo 2-Month', productType: 'HERBAL_SUPPLEMENT', keywords: KW_COMBOS },
  { sku: 'SJT-CMBO-HL-3M', name: 'Healthy Life Combo 3-Month', productType: 'HERBAL_SUPPLEMENT', keywords: KW_COMBOS },

  // 5. Skin Cleaning - Soaps & Face Wash
  { sku: 'SJT-SP-SOAP-100G', name: 'SpiruGlow Bath Soap 100g', productType: 'SKIN_CLEANING_AGENT', keywords: KW_SOAP },
  { sku: 'SJT-SP-SOAP-5PK', name: 'SpiruGlow Bath Soap 5 Pack', productType: 'SKIN_CLEANING_AGENT', keywords: KW_SOAP },
  { sku: 'SJT-SP-SOAP-10PK', name: 'SpiruGlow Bath Soap 10 Pack', productType: 'SKIN_CLEANING_AGENT', keywords: KW_SOAP },
  { sku: 'SJT-SP-FW-100ML', name: 'Spirulina Face Wash 100ml', productType: 'SKIN_CLEANING_AGENT', keywords: KW_FACE_WASH },

  // 6. Skin Moisturizers - Face Creams
  { sku: 'SJT-SP-KC-50G', name: 'Korean Glass Skin Cream 25g', productType: 'SKIN_MOISTURIZER', keywords: KW_KOREAN_CREAM },
  { sku: 'SJT-BR-CRM-50G', name: 'Bridal Radiance Cream 50g', productType: 'SKIN_MOISTURIZER', keywords: KW_BRIDAL_CREAM },

  // 7. Hair Care & Treatments
  { sku: 'SJT-SP-SHP-100ML', name: 'SpiruShine 2-in-1 Shampoo (100ml)', productType: 'SHAMPOO', keywords: KW_SHAMPOO },
  { sku: 'SJT-SP-OIL-50ML', name: 'Spirulina Herbal Hair Oil (50ml)', productType: 'HAIR_STYLING_AGENT', keywords: KW_HAIR_OIL },
  { sku: 'AB29', name: 'Spirulina Face Pack 50g', productType: 'SKIN_TREATMENT_MASK', keywords: KW_FACE_PACK }
];

async function patchSkuKeywords(token, item) {
  const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(item.sku)}?marketplaceIds=${marketId}`;

  const payload = {
    productType: item.productType,
    patches: [
      {
        op: 'replace',
        path: '/attributes/generic_keyword',
        value: [
          {
            language_tag: 'en_IN',
            value: item.keywords,
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
  const byteCount = Buffer.byteLength(item.keywords, 'utf8');
  console.log(`[${isAccepted ? '✅ ACCEPTED' : '❌ ' + data.status}] SKU: ${item.sku.padEnd(20)} | ${item.name.slice(0, 26).padEnd(26)} | Bytes: ${byteCount}/250 | Issues: ${(data.issues || []).length}`);
  if (!isAccepted && data.issues?.length > 0) {
    console.log(`   Error details:`, JSON.stringify(data.issues.map(i => i.message)));
  }
  return { sku: item.sku, status: data.status, issues: data.issues };
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 SUJATA NUTRILIVE: PHASE 3 BACKEND 250-BYTE SEARCH TERMS INFILTRATION');
  console.log(`📅 Execution Time: ${new Date().toISOString()} | Target SKUs: ${ALL_SKU_KEYWORDS.length}`);
  console.log('========================================================================\n');

  const token = await getAmazonToken();
  const summary = { accepted: 0, failed: 0, total: ALL_SKU_KEYWORDS.length };

  for (const item of ALL_SKU_KEYWORDS) {
    const res = await patchSkuKeywords(token, item);
    if (res.status === 'ACCEPTED') summary.accepted++;
    else summary.failed++;
    // Delay 1200ms to strictly comply with Amazon 1 req/sec rate limit
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n========================================================================');
  console.log(`🏁 PHASE 3 KEYWORD INFILTRATION COMPLETE!`);
  console.log(`Total: ${summary.total} | ✅ Accepted: ${summary.accepted} | ❌ Failed: ${summary.failed}`);
  console.log('========================================================================\n');
}

main().catch(console.error);
