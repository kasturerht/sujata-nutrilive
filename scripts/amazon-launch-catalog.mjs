#!/usr/bin/env node
/**
 * 🚀 SUJATA NUTRILIVE: AMAZON AUTOMATED CATALOG LAUNCH ENGINE
 * Programmatically creates and lists all missing flagship products and variants
 * directly onto Amazon.in via Selling Partner API (SP-API).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Load Environment Variables
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

const CLIENT_ID = process.env.AMAZON_LWA_CLIENT_ID;
const CLIENT_SECRET = process.env.AMAZON_LWA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.AMAZON_REFRESH_TOKEN;
const SELLER_ID = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
const MARKETPLACE_ID = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
const SP_ENDPOINT = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

// 2. Obtain LWA Access Token
async function getAccessToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

// 3. Reusable Amazon India Listing Generator
function buildListingPayload(item) {
  return {
    productType: item.productType,
    requirements: 'LISTING',
    attributes: {
      item_name: [
        { language_tag: 'en_IN', value: item.title, marketplace_id: MARKETPLACE_ID }
      ],
      brand: [
        { language_tag: 'en_IN', value: 'Sujata nutrilive agrotech', marketplace_id: MARKETPLACE_ID }
      ],
      manufacturer: [
        { language_tag: 'en_IN', value: 'Sujata Nutrilive Agrotech', marketplace_id: MARKETPLACE_ID }
      ],
      supplier_declared_has_product_identifier_exemption: [
        { value: true, marketplace_id: MARKETPLACE_ID }
      ],
      country_of_origin: [
        { value: 'IN', marketplace_id: MARKETPLACE_ID }
      ],
      supplier_declared_dg_hz_regulation: [
        { value: 'storage', marketplace_id: MARKETPLACE_ID }
      ],
      rtip_manufacturer_contact_information: [
        { value: 'support@sujatanutrilive.com\n+919834783503', marketplace_id: MARKETPLACE_ID }
      ],
      packer_contact_information: [
        {
          language_tag: 'en_IN',
          value: 'Plot No 125, Sai Niwas, ITI Ambad Link Road, Trimurti Chowk, Kamatwada, Nashik 422008, Maharashtra, India',
          marketplace_id: MARKETPLACE_ID
        }
      ],
      importer_contact_information: [
        {
          language_tag: 'en_IN',
          value: 'Plot No 125, Sai Niwas, ITI Ambad Link Road, Trimurti Chowk, Kamatwada, Nashik 422008, Maharashtra, India',
          marketplace_id: MARKETPLACE_ID
        }
      ],
      item_type_name: [
        { language_tag: 'en_IN', value: item.itemTypeName, marketplace_id: MARKETPLACE_ID }
      ],
      part_number: [
        { value: item.sku, marketplace_id: MARKETPLACE_ID }
      ],
      number_of_items: [
        { value: 1, marketplace_id: MARKETPLACE_ID }
      ],
      item_package_quantity: [
        { value: 1, marketplace_id: MARKETPLACE_ID }
      ],
      item_form: [
        { language_tag: 'en_IN', value: item.itemForm, marketplace_id: MARKETPLACE_ID }
      ],
      is_expiration_dated_product: [
        { value: true, marketplace_id: MARKETPLACE_ID }
      ],
      product_expiration_type: [
        { language_tag: 'en_IN', value: 'Expiration Date Required', marketplace_id: MARKETPLACE_ID }
      ],
      fc_shelf_life: [
        { unit: 'days', value: 730, marketplace_id: MARKETPLACE_ID }
      ],
      contains_liquid_contents: [
        { value: false, marketplace_id: MARKETPLACE_ID }
      ],
      contains_food_or_beverage: [
        { value: false, marketplace_id: MARKETPLACE_ID }
      ],
      fssai_veg_non_veg_status: [
        { value: 'vegetarian', marketplace_id: MARKETPLACE_ID }
      ],
      condition_type: [
        { value: 'new_new', marketplace_id: MARKETPLACE_ID }
      ],
      product_description: [
        { language_tag: 'en_IN', value: item.description, marketplace_id: MARKETPLACE_ID }
      ],
      bullet_point: item.bullets.map(b => ({
        language_tag: 'en_IN',
        value: b,
        marketplace_id: MARKETPLACE_ID
      })),
      generic_keyword: [
        { language_tag: 'en_IN', value: item.keywords, marketplace_id: MARKETPLACE_ID }
      ],
      unit_count: [
        {
          type: { language_tag: 'en_IN', value: item.unitCountType },
          value: item.unitCountValue,
          marketplace_id: MARKETPLACE_ID
        }
      ],
      item_weight: [
        { unit: 'grams', value: item.weightGrams, marketplace_id: MARKETPLACE_ID }
      ],
      item_package_weight: [
        { unit: 'grams', value: item.weightGrams + 50, marketplace_id: MARKETPLACE_ID }
      ],
      item_dimensions: [
        {
          height: { unit: 'centimeters', value: item.dimensions.height },
          length: { unit: 'centimeters', value: item.dimensions.length },
          width: { unit: 'centimeters', value: item.dimensions.width },
          marketplace_id: MARKETPLACE_ID
        }
      ],
      item_package_dimensions: [
        {
          height: { unit: 'centimeters', value: item.dimensions.height + 2 },
          length: { unit: 'centimeters', value: item.dimensions.length + 1 },
          width: { unit: 'centimeters', value: item.dimensions.width + 1 },
          marketplace_id: MARKETPLACE_ID
        }
      ],
      external_product_information: [
        { entity: 'HSN Code', value: item.hsnCode, marketplace_id: MARKETPLACE_ID }
      ],
      purchasable_offer: [
        {
          currency: 'INR',
          our_price: [
            { schedule: [{ value_with_tax: item.price }] }
          ],
          maximum_retail_price: [
            { schedule: [{ value_with_tax: item.mrp }] }
          ],
          marketplace_id: MARKETPLACE_ID
        }
      ]
    }
  };
}

// 4. Products Catalog Launch Suite
const CATALOG_SUITE = [
  {
    sku: 'SJT-SHIL-CAP-60',
    productType: 'HERBAL_SUPPLEMENT',
    title: 'Sujata Nutrilive Pure Himalayan Shilajit Capsules (60 Veg Capsules) | Gold Grade Extract with >70% Fulvic Acid & 84+ Minerals | Cellular Stamina & Vitality',
    itemTypeName: 'Shilajit Capsules',
    itemForm: 'Capsule',
    hsnCode: '21069099',
    unitCountType: 'count',
    unitCountValue: 60,
    weightGrams: 60,
    dimensions: { height: 10, length: 5, width: 5 },
    price: 899,
    mrp: 1299,
    description: 'Sujata Nutrilive Pure Himalayan Shilajit Capsules are prepared using gold-grade Shilajit resin harvested at high altitudes above 16,000 feet in the Himalayas. Purified via traditional Shodhana methods and standardized to contain over 70% natural Fulvic Acid along with 84+ ionic trace minerals, this ancient Rasayana promotes cellular energy, fights physical fatigue, enhances oxygen delivery, and rejuvenates overall vitality. 100% vegetarian capsule shells, zero chemical binders, heavy metal tested.',
    bullets: [
      'GOLD-GRADE HIGH ALTITUDE RESIN EXTRACT: Harvested above 16,000 feet in the pristine Himalayas and purified using traditional Ayurvedic Shodhana methods.',
      'STANDARDIZED TO >70% FULVIC ACID: Unlocks microscopic cellular mineral delivery, enhancing nutrient absorption and energy production at the mitochondrial level.',
      'PEAK PHYSICAL STAMINA & ENDURANCE: Naturally helps reduce muscle fatigue, elevates oxygen utilization, and promotes post-workout cellular recovery.',
      '84+ IONIC TRACE MINERALS: Enriches the human biological system with essential trace elements including zinc, magnesium, and iron in their most bioavailable form.',
      'HOW TO USE: Consume 1 veg capsule daily with warm milk or lukewarm water before bedtime or early morning.'
    ],
    keywords: 'shilajit capsules gold grade fulvic acid 84 trace minerals stamina energy booster ayurvedic rasayana endurance vitality men women'
  },
  {
    sku: 'SJT-B12-CAP-90',
    productType: 'HERBAL_SUPPLEMENT',
    title: 'Sujata Nutrilive Plant-Based Vitamin B12 Vegan Capsules (90 Capsules) | Active Methylcobalamin Formula | Supports Nerve Health, Brain Focus & Red Blood Cells',
    itemTypeName: 'Vitamin B12 Capsules',
    itemForm: 'Capsule',
    hsnCode: '21069099',
    unitCountType: 'count',
    unitCountValue: 90,
    weightGrams: 75,
    dimensions: { height: 10, length: 5, width: 5 },
    price: 699,
    mrp: 1099,
    description: 'Sujata Nutrilive Plant-Based Vitamin B12 delivers 100% bioavailable plant-origin Methylcobalamin, specifically developed to solve widespread vitamin B12 deficiencies in Indian vegetarian and vegan diets. Without synthetic cyanocobalamin or heavy binders, this formula actively supports healthy neurological transmission, protects the myelin nerve sheath, aids red blood cell synthesis, and eliminates daily brain fog. 90-day comprehensive bottle.',
    bullets: [
      '100% PLANT-ORIGIN BIOACTIVE METHYLCOBALAMIN: Pure, organically fermented plant Vitamin B12 that absorbs directly without requiring hepatic conversion.',
      'COGNITIVE FOCUS & NERVOUS SYSTEM SHIELD: Supports the vital myelin sheath surrounding nerve fibers, sharpening memory, focus, and mental clarity.',
      'OPTIMAL RED BLOOD CELL SYNTHESIS: Helps the body produce healthy, oxygen-rich red blood cells, actively fighting chronic daytime sluggishness.',
      'IDEAL FOR VEGETARIANS & VEGANS: Specifically formulated to address widespread nutritional deficiencies prevalent in plant-based Indian diets.',
      'RECOMMENDED INTAKE: Take 1 capsule once daily with breakfast or lunch. 90-day comprehensive supply.'
    ],
    keywords: 'vitamin b12 methylcobalamin plant based vegan vegetarian capsules nerve health brain energy red blood cells no synthetics'
  },
  {
    sku: 'SJT-CMBO-HL-1M',
    productType: 'HERBAL_SUPPLEMENT',
    title: 'Sujata Nutrilive Healthy Life 360 Synergy Combo Pack | Spirulina Tablets (60 Tabs) + Sea Buckthorn Capsules (60 Caps) | Complete Cellular Nutrition & Omega 7',
    itemTypeName: 'Herbal Supplement Combo',
    itemForm: 'Capsule',
    hsnCode: '21069099',
    unitCountType: 'count',
    unitCountValue: 120,
    weightGrams: 160,
    dimensions: { height: 12, length: 10, width: 6 },
    price: 1100,
    mrp: 1499,
    description: 'Sujata Nutrilive Healthy Life 360 Synergy Combo unites two of nature\'s most extraordinary superfoods: Pure Spirulina (65% protein, chlorophyll, phycocyanin, iron) and Wild Himalayan Sea Buckthorn (rare Omega 7, 3, 6, 9 and natural Vitamin C). Designed as an integrated 30-day holistic protocol, Spirulina energizes and detoxifies cellular metabolic pathways while Sea Buckthorn hydrates epithelial membranes, strengthens heart health, and promotes a natural skin glow.',
    bullets: [
      'THE ULTIMATE AYURVEDIC DUAL SYNERGY: Combines Spirulina (the world\'s most complete microalgae superfood) with Himalayan Sea Buckthorn (nature\'s rarest Omega 7 berry).',
      'COMPLETE SPECTRUM MICRONUTRITION: Delivers over 100+ bioavailable nutrients, complete protein, all 9 essential amino acids, and Omegas 3, 6, 7 & 9 in one master regimen.',
      'TOTAL BODY VITALITY & IMMUNITY: Spirulina fuels cellular energy and detoxification, while Sea Buckthorn restores skin radiance, gut mucous lining, and cardiovascular vigor.',
      'VALUE PACK SAVINGS: Experience premium synergistic wellness at maximum value compared to purchasing individual bottles separately.',
      'DAILY ROUTINE: Take 1 Spirulina tablet in the morning before breakfast, and 1 Sea Buckthorn capsule in the evening after dinner.'
    ],
    keywords: 'spirulina sea buckthorn combo pack superfood omega 7 multivitamin daily wellness vegan complete nutrition immunity booster kit'
  },
  {
    sku: 'SJT-SP-TAB-120',
    productType: 'HERBAL_SUPPLEMENT',
    title: 'Sujata Nutrilive 100% Vegan Spirulina Tablets (120 Tablets - 500mg Value Pack) | Zero Binders, No Fillers | High Plant Protein & Bioactive Iron for Daily Energy',
    itemTypeName: 'Spirulina Tablets',
    itemForm: 'Tablet',
    hsnCode: '12122190',
    unitCountType: 'count',
    unitCountValue: 120,
    weightGrams: 90,
    dimensions: { height: 11, length: 6, width: 6 },
    price: 550,
    mrp: 1199,
    description: 'Sujata Nutrilive 120-Tablet Value Pack provides a full 60-day supply of pure cold-pressed spirulina biomass. Harvested under natural sunlight and pressed without synthetic binders, chemical glues, or magnesium stearate, each 500mg tablet delivers highly absorbable plant protein, iron, and antioxidant phycocyanin for long-term daily health maintenance.',
    bullets: [
      '60-DAY VALUE PACK (120 TABLETS): Extended daily supply offering substantial cost savings for families and sustained daily wellness practitioners.',
      'COLD-PRESSED ZERO-BINDER TABLETS: 100% pure microalgae compressed without chalky binders, chemical glues, magnesium stearate, or artificial coatings.',
      'NATURAL IRON & HEMOGLOBIN ELEVATION: Rich in plant-based iron, vitamin B complex, and antioxidants to naturally maintain healthy energy levels and fight fatigue.',
      'SUSTAINED METABOLIC STAMINA: Supports active oxygen delivery in the bloodstream, enhancing daily endurance for busy professionals, elders, and athletes.',
      'RECOMMENDED DAILY DOSAGE: Take 1 to 2 tablets twice daily with a glass of lukewarm water before meals.'
    ],
    keywords: 'spirulina tablets 120 value pack vegan protein iron multivitamin immunity booster natural energy supplement'
  },
  {
    sku: 'SJT-MOR-PWD-100G',
    productType: 'HERBAL_SUPPLEMENT',
    title: 'Sujata Nutrilive Natural Moringa Leaf Powder (100g Pouch) | Pure Drumstick Tree Leaves | Rich in Plant Calcium, Iron & Antioxidants | Daily Detox & Vitality',
    itemTypeName: 'Moringa Powder',
    itemForm: 'Powder',
    hsnCode: '12122190',
    unitCountType: 'gram',
    unitCountValue: 100,
    weightGrams: 100,
    dimensions: { height: 18, length: 12, width: 2 },
    price: 249,
    mrp: 299,
    description: 'Sujata Nutrilive Natural Moringa Leaf Powder is shade-dried and pulverized from hand-harvested organic Moringa Oleifera (Drumstick) leaves. Renowned as the Miracle Tree, Moringa provides 7x more Vitamin C than oranges, 4x more Calcium than milk, and 3x more Potassium than bananas in pure bioavailable green food format. Supports joint flexibility, gentle digestive detox, and balanced blood sugar.',
    bullets: [
      'SHADE-DRIED ORGANIC MORINGA LEAVES: Carefully harvested and shade-dried to preserve delicate vitamins, chlorophyll, and phytonutrients without heat damage.',
      'NATURAL PLANT-BASED CALCIUM & IRON: Strengthens bones, joints, and muscular stamina naturally without synthetic calcium carbonate supplements.',
      'METABOLIC DETOX & DIGESTIVE COMFORT: Assists healthy metabolism, balances gut microbial flora, and supports natural systemic cleansing.',
      'ZERO ADDITIVES OR PRESERVATIVES: 100% single-ingredient pure leaf powder. Free from preservatives, artificial colors, flavors, and GMOs.',
      'HOW TO CONSUME: Mix 1 teaspoon (3g-5g) into warm water, dal, green smoothies, or sprinkle over daily curries.'
    ],
    keywords: 'moringa powder leaf organic drumstick miracle tree plant calcium iron green superfood detox immunity'
  }
];

// 5. Deploy All Listings
async function deployCatalog() {
  console.log('========================================================================');
  console.log('🚀 SUJATA NUTRILIVE: LAUNCHING COMPLETE PRODUCT CATALOG ON AMAZON.IN');
  console.log(`📍 Seller ID: ${SELLER_ID} | Marketplace: Amazon.in (${MARKETPLACE_ID})`);
  console.log('========================================================================\n');

  const token = await getAccessToken();

  for (const item of CATALOG_SUITE) {
    console.log(`⚡ Creating New Amazon Listing for SKU [${item.sku}]...`);
    console.log(`   Title: "${item.title.substring(0, 65)}..."`);
    console.log(`   Price: ₹${item.price} (M.R.P: ₹${item.mrp}) | Form: ${item.itemForm}`);

    const payload = buildListingPayload(item);
    const url = `${SP_ENDPOINT}/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(item.sku)}?marketplaceIds=${MARKETPLACE_ID}`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json',
          'User-Agent': 'SujataNutrilive/1.0 (Language=JavaScript)'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.status === 200 && data.status === 'ACCEPTED') {
        console.log(`   ✅ SUCCESS: Listing Created & Accepted! Submission ID: ${data.submissionId}`);
      } else {
        console.log(`   ⚠️ Response (${res.status}):`, JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error(`   ❌ Failed to create ${item.sku}:`, err.message);
    }

    console.log('------------------------------------------------------------------------');
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n🏁 Complete Catalog Launch Deployed! Amazon is indexing all new ASINs.');
}

if (process.argv[1] && process.argv[1].endsWith('amazon-launch-catalog.mjs')) {
  deployCatalog();
}
