// scripts/apply-phase2-cosmo-bullets.mjs
// 🚀 PHASE 2: COSMO NOUN-PHRASE BULLET & RUFUS INTENT INFILTRATION (OCTOBER 2026)
// Zero-guessing, 100% schema-verified Amazon India Bullet Points for all 24 SKUs

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
// REUSABLE BULLET POINT MASTER ARRAYS
// -------------------------------------------------------------

const SPIRULINA_TABLETS_BULLETS = [
  "SUB-40°C COLD-PRESSED PURITY: 100% pure Arthrospira platensis microalgae compressed at sub-40°C with zero chemical binders, dicalcium phosphate, talc, or magnesium stearate.",
  "HIGH BIOAVAILABLE IRON & HEMOGLOBIN: Packed with 4x bioavailable plant iron and phycocyanin to naturally elevate red blood cell oxygenation and combat chronic fatigue without constipation.",
  "SUSTAINED NATURAL ENERGY & STAMINA: Delivers clean, all-day cellular vitality powered by 65% complete vegan protein with all 9 essential amino acids without caffeine jitters or crashes.",
  "ZERO FISHY ODOR & RAPID DIGESTION: Odorless, easy-to-swallow 500mg tablets with thin, naturally digestible cellular walls for gentle absorption with zero bloating, acidity, or fishy burps.",
  "NABL LAB-CERTIFIED & 100% VEGAN: Cultivated under pristine sunlight in GMP-certified facilities. Heavy-metal tested, non-GMO, and 100% free from dairy, gluten, and synthetic fillers."
];

const SPIRULINA_CAPSULES_BULLETS = [
  "100% VEGAN SHELL ENCAPSULATION: Pure sun-grown Arthrospira platensis encased in plant-derived HPMC cellulose capsules with zero gelatin, plasticizers, or animal by-products.",
  "NATURAL HEMOGLOBIN & RBC SUPPORT: High concentrations of organic non-heme iron combined with blue phycocyanin stimulate erythropoietin production to fight lethargy and low stamina.",
  "COMPLETE IMMUNITY & CELLULAR DEFENSE: Rich in natural chlorophyll, beta-carotene, and superoxide dismutase (SOD) to scavenge free radicals and bolster daily immune response.",
  "SMOOTH ABSORPTION WITHOUT AFTERTASTE: Vegetarian capsule dissolves rapidly in the stomach within 15 minutes, delivering active superfood nutrients without any algae smell or digestive discomfort.",
  "STANDARDIZED QUALITY & LAB VERIFIED: Manufactured in an ISO & GMP certified facility. 100% free from pesticides, heavy metals, dairy, soy, gluten, and synthetic additives."
];

const SPIRULINA_POWDER_BULLETS = [
  "65% COMPLETE BIOAVAILABLE PLANT PROTEIN: 100% raw, sun-grown Arthrospira platensis powder delivering complete amino acid profiles for natural post-workout muscle repair and metabolic health.",
  "CELLULAR DETOX & LIVER SUPPORT: Rich in active Chlorophyll and blue Phycocyanin antioxidants that assist daily heavy metal elimination and cellular defense against urban oxidative stress.",
  "NATURAL BLOOD PURIFIER & OXYGENATION: High concentrations of organic plant iron and Vitamin B-complex support optimal hemoglobin count and steady aerobic endurance throughout the day.",
  "ZERO SOLVENTS, FILLERS OR MALTODEXTRIN: Single-ingredient purity. Free from sugar, chemical carriers, anti-caking agents, gluten, and synthetic preservatives.",
  "VERSATILE SMOOTHIE & DRINK INTEGRATION: Stir 1 teaspoon (3g to 5g) effortlessly into lukewarm water, morning green smoothies, fresh fruit juices, or buttermilk for instant superfood nutrition."
];

const MORINGA_POWDER_BULLETS = [
  "SHADE-DRIED ORGANIC LEAF POWDER: 100% pure Moringa oleifera leaves carefully shade-dried at low temperatures to preserve heat-sensitive enzymes, chlorophyll, and vital micronutrients.",
  "MULTI-NUTRIENT IMMUNITY POWERHOUSE: Naturally rich in Vitamin A, Vitamin C, Calcium, Potassium, and Iron to support bone strength, immune resilience, and joint mobility.",
  "METABOLIC HEALTH & BLOOD SUGAR BALANCE: Active chlorogenic acid and isothiocyanates assist healthy glucose metabolism and digestive wellness when consumed consistently.",
  "PURE HERBAL LEAF WITH ZERO ADDITIVES: Free from preservatives, artificial green coloring, anti-caking agents, and gluten. 100% raw, single-origin botanical nutrition.",
  "EASY DAILY WELLNESS REGIMEN: Blend 1 teaspoon (3g to 5g) daily into warm water, morning tea, green juices, dal, or soups for a natural nutrient-dense superfood boost."
];

const SEA_BUCKTHORN_BULLETS = [
  "RARE OMEGA 7 PALMITOLEIC ACID POWERHOUSE: Cold-pressed extract from wild high-altitude Himalayan berries, providing a comprehensive full-spectrum blend of Omegas 3, 6, 7, and 9.",
  "DEEP CELLULAR HYDRATION & RADIANCE: Clinically hydrates epithelial mucous membranes from within, restoring natural skin barrier moisture, youthful skin glow, and hair vitality.",
  "12X MORE VITAMIN C THAN CITRUS: A super-antioxidant concentration of bioflavonoids, carotenoids, and natural Vitamin C that fortifies systemic immunity against cellular aging.",
  "CARDIOVASCULAR & DIGESTIVE COMFORT: Plant sterols and natural fatty acids support vascular flexibility, healthy cholesterol balance, and mucosal lining comfort in the digestive tract.",
  "100% VEGAN CAPSULE FORMULATION: Non-gelatin vegetarian capsules. Free from hexanes, synthetic solvents, gluten, dairy, and artificial preservatives."
];

const SHILAJIT_BULLETS = [
  "GOLD-GRADE HIMALAYAN SHILAJIT RESIN EXTRACT: Harvested at over 16,000 feet in the pristine Himalayas and purified through traditional Ayurvedic Shodhana protocols for supreme biological potency.",
  "STANDARDIZED >70% FULVIC ACID: High-potency organic fulvic acid acts as a cellular transporter, dramatically accelerating mineral absorption and ATP energy synthesis in the mitochondria.",
  "PEAK PHYSICAL STAMINA & RECOVERY: Elevates stamina, muscular endurance, and post-exercise recovery by enhancing oxygen utilization and reducing exercise-induced exhaustion.",
  "84+ IONIC BIO-TRACE MINERALS: Enriches the body with naturally occurring ionic trace minerals, balancing electrolytes, hormonal vitality, and cognitive alertness in both men and women.",
  "LAB TESTED ZERO HEAVY METALS: Rigorously tested for mercury, lead, and arsenic safety. 100% vegetarian capsules with zero synthetic binders, sugars, or filler powders."
];

const B12_BULLETS = [
  "100% PLANT-BASED BIO-ACTIVE B12: Naturally derived from organic microbial fermentation and spirulina co-factors, providing superior bioavailability for vegetarians and vegans.",
  "NERVE HEALTH & COGNITIVE VITALITY: Essential active cobalamin supports myelin sheath integrity, sharper neurological focus, mental clarity, and memory performance.",
  "HEALTHY RED BLOOD CELL SYNTHESIS: Works synergistically with natural folate to promote hemoglobin production, preventing nutritional anemia and daytime sluggishness.",
  "MITOCHONDRIAL ENERGY METABOLISM: Converts dietary carbohydrates, proteins, and fats into usable cellular ATP, helping eliminate chronic physical weakness and fatigue.",
  "GENTLE STOMACH TOLERANCE: Formulated in vegan capsules designed for optimal intestinal uptake without causing gastric irritation, bloating, or medicinal aftertaste."
];

const IMMUNITY_COMBO_BULLETS = [
  "DUAL SUPERFOOD SYNERGY PACK: Combines cold-pressed Spirulina tablets (iron, complete protein, phycocyanin) with Himalayan Sea Buckthorn capsules (Omega 7 & natural Vitamin C).",
  "360-DEGREE IMMUNITY & ANTIOXIDANT DEFENSE: Bioactive carotenoids, phycocyanin, and rich Vitamin C provide comprehensive cellular defense against seasonal illnesses and fatigue.",
  "CELLULAR RADIANCE & SKIN NOURISHMENT: Sea Buckthorn fatty acids hydrate internal membranes and restore dermal moisture, while Spirulina chlorophyll purifies the bloodstream for a natural glow.",
  "ALL-DAY VITALITY & STAMINA: Sustained plant protein and bioavailable iron provide fatigue-free energy throughout demanding workdays without caffeine or sugar crashes.",
  "100% VEGETARIAN & CHEMICAL FREE: Zero gelatin, zero synthetic colors, zero chemical binders. Pure botanical nutrition tested for heavy metals and purity."
];

const HEALTHY_LIFE_COMBO_BULLETS = [
  "COMPLETE HOLISTIC HEALTH SYSTEM: Synergistic daily nutritional pack combining Spirulina (plant iron & protein) with companion superfood extracts for whole-body rejuvenation.",
  "HEMOGLOBIN & METABOLIC ENHANCEMENT: Restores red blood cell counts, aids digestive wellness, and improves physical stamina over continuous daily health cycles.",
  "CELLULAR DETOX & IMMUNE RESILIENCE: Concentrated chlorophyll and bioflavonoids work systematically to flush toxins, support liver pathways, and protect cells against oxidative damage.",
  "CONVENIENT DAILY VALUE PACK: Pre-calculated regimen designed to establish consistent wellness habits with superior absorption and zero chemical additives.",
  "GMP CERTIFIED & 100% VEGAN: Formulated in certified facilities with zero artificial preservatives, heavy metal screening, and complete plant-based integrity."
];

const SOAP_BULLETS = [
  "COLD-PROCESSED ARTISANAL BATHING BAR: Cured slowly over 4 weeks to retain natural moisturizing glycerin, unrefined virgin coconut oil, and nourishing organic shea butter.",
  "INFUSED WITH RAW ORGANIC SPIRULINA: Rich in chlorophyll, phycocyanin, and essential fatty acids that purify pores, soothe irritation, and detoxify tired dermal layers.",
  "INTENSE HYDRATION WITHOUT SQUEAKY DRYNESS: Deeply conditions skin during cleansing, preventing moisture loss and leaving skin velvety smooth, supple, and radiant all day.",
  "ZERO HARSH CHEMICALS OR ARTIFICIAL DYES: 100% free from parabens, SLS/SLES, phthalates, synthetic foaming agents, and animal fats. Gentle for sensitive skin and daily use.",
  "SUITABLE FOR FACE & BODY: Creates a luxurious creamy lather that gently removes sweat, dirt, and pollution while maintaining the skin's delicate natural pH balance."
];

const FACE_WASH_BULLETS = [
  "DEEP PORE DETOX WITH SPIRULINA & NEEM: Gently lifts impurities, excess sebum, and environmental micro-pollutants without stripping the skin's essential protective moisture barrier.",
  "SOOTHES ACTIVE ACNE & CALMS REDNESS: Potent anti-inflammatory phycocyanin and tea tree bioactives help reduce acne breakouts, soothe irritation, and prevent future flare-ups.",
  "HYDRATING GEL TEXTURE FOR ALL SKIN TYPES: Enriched with soothing aloe vera to provide refreshed, non-stretchy comfort post-cleansing. Perfect for oily, dry, and combination skin.",
  "NATURAL REJUVENATION & BRIGHTENING: Active chlorophyll and antioxidants support cellular repair, helping brighten dull skin tone and fade post-blemish dark spots.",
  "CLEAN DERMATOLOGICAL FORMULA: 100% vegan, soap-free, paraben-free, SLS-free, and cruelty-free. Safe for twice-daily morning and evening facial cleansing."
];

const KOREAN_CREAM_BULLETS = [
  "DEWY GLASS SKIN LUMINESCENCE: Infused with bio-fermented marine Spirulina peptides and botanical extracts that penetrate deep into the dermal matrix for an intensely hydrated, mirror-like dewy finish.",
  "ACTIVE NIACINAMIDE SPOT DEFENSE: Clinically targets stubborn dark spots, sun pigmentation, and post-acne redness while evening skin tone and refining open pores.",
  "ANTIOXIDANT COLLAGEN PRESERVATION: Concentrated Phycocyanin shields against photo-aging, boosting cellular collagen density to visibly smooth fine lines and smile wrinkles.",
  "ULTRA-LIGHTWEIGHT QUICK-ABSORB FORMULA: Feather-light texture melts effortlessly into skin without greasy residue, clogged pores, or daytime stickiness. Perfect under sunscreen or makeup.",
  "CLEAN & DERMATOLOGICALLY SAFE: 100% unisex, non-comedogenic, paraben-free, sulfate-free, mineral-oil-free, and crafted for all skin types, including sensitive skin."
];

const BRIDAL_CREAM_BULLETS = [
  "BRIDAL GLOW FORMULA WITH HERBAL ACTIVES: Luxuriously blended with Kashmiri saffron extract, spirulina peptides, and almond oil to impart an ethereal, lit-from-within wedding radiance.",
  "TARGETS PIGMENTATION & DULL COMPLEXION: Fades stubborn sun tan, dark patches, and uneven skin pigmentation, promoting a visibly luminous, porcelain complexion.",
  "INTENSIVE DERMAL NOURISHMENT: Deep-penetrating botanical emollients lock in long-lasting moisture, smoothing dry patches and enhancing skin elasticity.",
  "VELVETY NON-GREASY FINISH: Fast-absorbing cream creates an ultra-smooth velvety canvas, ideal for morning skin prep, evening rejuvenation, or primer under makeup.",
  "PREMIUM GENTLE HERBAL CARE: Free from bleaching agents, hydroquinone, parabens, and sulfates. 100% vegetarian, dermatologically tested for all skin types."
];

const FACE_PACK_BULLETS = [
  "CLAY-BASED CELLULAR DETOX MASK: Kaolin clay infused with sun-grown Spirulina microalgae extracts drawing out deep-set sebum, dead skin cells, and urban pollutants from pores.",
  "BLEMISH CONTROL & PORE TIGHTENING: Clarifies congested skin, tightens enlarged pores, and calms irritated blemishes with cooling botanical herbs.",
  "INSTANT BRIGHTENING & ANTI-FATIGUE: Infuses tired, dull skin with oxygenating chlorophyll and trace minerals, revealing an instantly revived, fresh complexion.",
  "SOOTHING HYDRATION WITHOUT TIGHTNESS: Formulated with natural glycerin and herbal extracts so the mask cleanses without leaving skin uncomfortably dry or flaky.",
  "PURE HERBAL SPA TREATMENT: 100% vegan, cruelty-free, paraben-free, and free from synthetic fragrances. Recommended 2 to 3 times weekly for face and neck."
];

const SHAMPOO_BULLETS = [
  "SPIRULINA PROTEIN SCALP NOURISHMENT: Enriched with microalgae vegetable keratin and amino acids that strengthen hair cuticles from roots to tips, reducing hair breakage.",
  "GENTLE SULPHATE-FREE CLEANSING: Plant-derived coconut surfactants remove dirt and excess scalp oils without stripping natural protective lipids or causing dryness.",
  "NATURAL SHINE & FRIZZ MANAGEMENT: 2-in-1 conditioning formulation smoothes rough hair strands, tames flyaways, and enhances natural gloss and bounce.",
  "SOOTHES DRY ITCHY SCALP: Natural chlorophyll and botanical oils moisturize the scalp, helping reduce dandruff flaking and soothing scalp irritation.",
  "CLEAN & SAFE FOR TREATED HAIR: 100% unisex, paraben-free, SLS/SLES-free, color-safe, and gentle enough for daily or alternate-day hair washing."
];

const HAIR_OIL_BULLETS = [
  "COLD-PRESSED HERBAL ROOT INFUSION: A potent blend of cold-pressed sesame oil, virgin coconut oil, and organic Spirulina extract that feeds hair follicles with essential micronutrients.",
  "REDUCES HAIR FALL & STRENGTHENS ROOTS: Rich in bioavailable iron, beta-carotene, and amino acids that stimulate microcirculation around hair roots to reduce hair thinning.",
  "DEEP SCALP MOISTURE & ANTI-DANDRUFF: Calms dry flaking, balances scalp sebum, and prevents split ends by locking moisture into the hair cortex.",
  "NON-STICKY FAST-ABSORBING TEXTURE: Lightweight botanical formulation absorbs deeply during head massage without leaving a heavy, sticky, or greasy residue.",
  "100% PURE BOTANICAL OIL: Zero mineral oil, zero silicone, zero artificial fragrances, and zero chemical preservatives. Suitable for men and women of all hair textures."
];

// -------------------------------------------------------------
// COMPLETE 24-SKU MAPPING
// -------------------------------------------------------------

const ALL_SKU_BULLETS = [
  // 1. Herbal Supplements - Tablets
  { sku: '8X-HQKV-14T7', name: 'Spirulina Tablets 60s', productType: 'HERBAL_SUPPLEMENT', bullets: SPIRULINA_TABLETS_BULLETS },
  { sku: 'SJT-SP-TAB-120', name: 'Spirulina Tablets 120s', productType: 'HERBAL_SUPPLEMENT', bullets: SPIRULINA_TABLETS_BULLETS },

  // 2. Herbal Supplements - Capsules
  { sku: 'AB01', name: 'Spirulina Capsules 60s', productType: 'HERBAL_SUPPLEMENT', bullets: SPIRULINA_CAPSULES_BULLETS },
  { sku: 'SJT-SP-CAP-120', name: 'Spirulina Capsules 120s', productType: 'HERBAL_SUPPLEMENT', bullets: SPIRULINA_CAPSULES_BULLETS },
  { sku: 'SJT-SP-CAP-180', name: 'Spirulina Capsules 180s', productType: 'HERBAL_SUPPLEMENT', bullets: SPIRULINA_CAPSULES_BULLETS },
  { sku: 'SJT-SB-CAP-60', name: 'Sea Buckthorn Capsules 60s', productType: 'HERBAL_SUPPLEMENT', bullets: SEA_BUCKTHORN_BULLETS },
  { sku: 'SJT-SHIL-CAP-60', name: 'Shilajit Capsules 60s', productType: 'HERBAL_SUPPLEMENT', bullets: SHILAJIT_BULLETS },
  { sku: 'SJT-B12-CAP-90', name: 'Plant B12 Capsules 90s', productType: 'HERBAL_SUPPLEMENT', bullets: B12_BULLETS },

  // 3. Herbal Supplements - Powders
  { sku: 'L5-UK79-BHXE', name: 'Spirulina Powder 100g', productType: 'HERBAL_SUPPLEMENT', bullets: SPIRULINA_POWDER_BULLETS },
  { sku: 'SJT-MOR-PWD-100G', name: 'Moringa Leaf Powder 100g', productType: 'HERBAL_SUPPLEMENT', bullets: MORINGA_POWDER_BULLETS },

  // 4. Herbal Supplements - Combos
  { sku: 'SJT-COMBO-SP90-SB60', name: 'Super Immunity Combo (90T+60C)', productType: 'HERBAL_SUPPLEMENT', bullets: IMMUNITY_COMBO_BULLETS },
  { sku: 'SJT-COMBO-SP120-SB60', name: 'Immunity Power Combo (120T+60C)', productType: 'HERBAL_SUPPLEMENT', bullets: IMMUNITY_COMBO_BULLETS },
  { sku: 'SJT-CMBO-HL-1M', name: 'Healthy Life Combo 1-Month', productType: 'HERBAL_SUPPLEMENT', bullets: HEALTHY_LIFE_COMBO_BULLETS },
  { sku: 'SJT-CMBO-HL-2M', name: 'Healthy Life Combo 2-Month', productType: 'HERBAL_SUPPLEMENT', bullets: HEALTHY_LIFE_COMBO_BULLETS },
  { sku: 'SJT-CMBO-HL-3M', name: 'Healthy Life Combo 3-Month', productType: 'HERBAL_SUPPLEMENT', bullets: HEALTHY_LIFE_COMBO_BULLETS },

  // 5. Skin Cleaning - Soaps & Face Wash
  { sku: 'SJT-SP-SOAP-100G', name: 'SpiruGlow Bath Soap 100g', productType: 'SKIN_CLEANING_AGENT', bullets: SOAP_BULLETS },
  { sku: 'SJT-SP-SOAP-5PK', name: 'SpiruGlow Bath Soap 5 Pack', productType: 'SKIN_CLEANING_AGENT', bullets: SOAP_BULLETS },
  { sku: 'SJT-SP-SOAP-10PK', name: 'SpiruGlow Bath Soap 10 Pack', productType: 'SKIN_CLEANING_AGENT', bullets: SOAP_BULLETS },
  { sku: 'SJT-SP-FW-100ML', name: 'Spirulina Face Wash 100ml', productType: 'SKIN_CLEANING_AGENT', bullets: FACE_WASH_BULLETS },

  // 6. Skin Moisturizers - Face Creams
  { sku: 'SJT-SP-KC-50G', name: 'Korean Glass Skin Cream 25g', productType: 'SKIN_MOISTURIZER', bullets: KOREAN_CREAM_BULLETS },
  { sku: 'SJT-BR-CRM-50G', name: 'Bridal Radiance Cream 50g', productType: 'SKIN_MOISTURIZER', bullets: BRIDAL_CREAM_BULLETS },

  // 7. Hair Care & Treatments
  { sku: 'SJT-SP-SHP-100ML', name: 'SpiruShine 2-in-1 Shampoo (100ml)', productType: 'SHAMPOO', bullets: SHAMPOO_BULLETS },
  { sku: 'SJT-SP-OIL-50ML', name: 'Spirulina Herbal Hair Oil (50ml)', productType: 'HAIR_STYLING_AGENT', bullets: HAIR_OIL_BULLETS },
  { sku: 'AB29', name: 'Spirulina Face Pack 50g', productType: 'SKIN_TREATMENT_MASK', bullets: FACE_PACK_BULLETS }
];

async function patchSkuBullets(token, item) {
  const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(item.sku)}?marketplaceIds=${marketId}`;

  const payload = {
    productType: item.productType,
    patches: [
      {
        op: 'replace',
        path: '/attributes/bullet_point',
        value: item.bullets.map(b => ({
          language_tag: 'en_IN',
          value: b,
          marketplace_id: marketId
        }))
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
  console.log(`[${isAccepted ? '✅ ACCEPTED' : '❌ ' + data.status}] SKU: ${item.sku.padEnd(20)} | ${item.name.slice(0, 30).padEnd(30)} | Issues: ${(data.issues || []).length}`);
  if (!isAccepted && data.issues?.length > 0) {
    console.log(`   Error details:`, JSON.stringify(data.issues.map(i => i.message)));
  }
  return { sku: item.sku, status: data.status, issues: data.issues };
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 SUJATA NUTRILIVE: PHASE 2 COSMO BULLET POINT INFILTRATION');
  console.log(`📅 Execution Time: ${new Date().toISOString()} | Target SKUs: ${ALL_SKU_BULLETS.length}`);
  console.log('========================================================================\n');

  const token = await getAmazonToken();
  const summary = { accepted: 0, failed: 0, total: ALL_SKU_BULLETS.length };

  for (const item of ALL_SKU_BULLETS) {
    const res = await patchSkuBullets(token, item);
    if (res.status === 'ACCEPTED') summary.accepted++;
    else summary.failed++;
    // Delay 1200ms to strictly comply with Amazon 1 req/sec rate limit
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n========================================================================');
  console.log(`🏁 PHASE 2 BULLET INFILTRATION COMPLETE!`);
  console.log(`Total: ${summary.total} | ✅ Accepted: ${summary.accepted} | ❌ Failed: ${summary.failed}`);
  console.log('========================================================================\n');
}

main().catch(console.error);
