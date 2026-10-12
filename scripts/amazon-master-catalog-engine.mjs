#!/usr/bin/env node
/**
 * 👑 SUJATA NUTRILIVE: AMAZON MASTER CATALOG DEPLOYMENT & SYNCHRONIZATION ENGINE
 * 
 * Executes full ecosystem sync:
 * 1. Patches high-res Shopify CDN studio images & LQD quality attributes to existing Amazon SKUs.
 * 2. Patches images to newly launched supplement SKUs.
 * 3. Launches all missing personal care/beauty flagships (Face Wash, Korean Cream, Bridal Cream, Soap, Shampoo, Hair Oil).
 * 4. Launches all missing multi-pack variants & combo plans (Spirulina Capsules 120s/180s, Combos 2M/3M).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Load Environment
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

// 2. Token Generator
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

// Helper sleep
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 3. Existing Listings Image & LQD Optimization Suite
const EXISTING_UPDATES = [
  {
    sku: 'L5-UK79-BHXE',
    productType: 'NUTRITIONAL_SUPPLEMENT',
    flavor: 'Unflavoured',
    primarySupplementType: 'Spirulina',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-powder-pouch.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-powder-nutrition-powerhouse.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-powder-energy-vitality.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-powder-how-to-use.jpg'
    ]
  },
  {
    sku: 'AB01',
    productType: 'NUTRITIONAL_SUPPLEMENT',
    flavor: 'Unflavoured',
    primarySupplementType: 'Spirulina',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-bottle-transparent.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-benefits.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-fuel-body.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-how-to-use.jpg'
    ]
  },
  {
    sku: 'AB27',
    productType: 'HAIR_STYLING_AGENT',
    scent: 'Herbal, Coconut & Hibiscus',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-hair-oil-bottle.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-hair-oil-ingredients.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-hair-oil-frizz.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-hair-oil-scalp.jpg'
    ]
  },
  {
    sku: 'AB29',
    productType: 'SKIN_TREATMENT_MASK',
    scent: 'Natural Neem & Spirulina',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facepack-pouch.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facepack-glow.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facepack-acne.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facepack-how-to-use.jpg'
    ]
  },
  {
    sku: 'SJT-SB-CAP-60',
    productType: 'HERBAL_SUPPLEMENT',
    flavor: 'Unflavoured',
    primarySupplementType: 'Sea Buckthorn',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-sea-buckthorn-capsules-bottle.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-sea-buckthorn-capsules-benefits.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-sea-buckthorn-capsules-rustic.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-sea-buckthorn-capsules-poster.jpg'
    ]
  },
  {
    sku: 'SJT-SHIL-CAP-60',
    productType: 'HERBAL_SUPPLEMENT',
    flavor: 'Unflavoured',
    primarySupplementType: 'Shilajit',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_mo34cpmo34cpmo34.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-himalayan-shilajit-bottle.jpg'
    ]
  },
  {
    sku: 'SJT-B12-CAP-90',
    productType: 'HERBAL_SUPPLEMENT',
    flavor: 'Unflavoured',
    primarySupplementType: 'Vitamin B12',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_ak4xf2ak4xf2ak4x.png'
    ]
  },
  {
    sku: 'SJT-CMBO-HL-1M',
    productType: 'HERBAL_SUPPLEMENT',
    flavor: 'Unflavoured',
    primarySupplementType: 'Spirulina',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_yruxb3yruxb3yrux.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-combo-product-showcase.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-bottle.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-sea-buckthorn-capsules-bottle.jpg'
    ]
  },
  {
    sku: 'SJT-SP-TAB-120',
    productType: 'HERBAL_SUPPLEMENT',
    flavor: 'Unflavoured',
    primarySupplementType: 'Spirulina',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-tablets-bottle.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-tablets-benefits.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-tablets-how-to-take.jpg'
    ]
  },
  {
    sku: 'SJT-MOR-PWD-100G',
    productType: 'HERBAL_SUPPLEMENT',
    flavor: 'Unflavoured',
    primarySupplementType: 'Moringa',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_u22nm9u22nm9u22n.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-moringa-powder-pouch.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-moringa-powder-label-nutrition.jpg'
    ]
  }
];

// 4. New Listings Suite (Beauty, Skincare, Haircare, Multi-Packs, and Extended Combos)
const NEW_CATALOG_LISTINGS = [
  // A. Personal Care & Skincare
  {
    sku: 'SJT-SP-FW-100ML',
    productType: 'SKIN_CLEANING_AGENT',
    title: 'Sujata Nutrilive Spirulina Anti-Acne Face Wash (100ml) | Infused with Neem & Green Tea | Gentle Pore Detox, Deep Cleansing & Blemish Control | Sulfate-Free',
    itemTypeName: 'Anti Acne Face Wash',
    itemForm: 'Gel',
    hsnCode: '33049990',
    unitCountType: 'millilitre',
    unitCountValue: 100,
    weightGrams: 120,
    dimensions: { height: 14, length: 4, width: 4 },
    price: 249,
    mrp: 349,
    description: 'Sujata Nutrilive Spirulina Anti-Acne Face Wash blends antioxidant-rich spirulina microalgae with bioactive neem and green tea extract. Its sulfate-free formula deeply cleanses clogged pores, balances facial sebum production, gently sloughs dead cells, and shields delicate facial skin against oxidative environmental pollution.',
    bullets: [
      'BIOACTIVE SPIRULINA & NEEM DETOX: Combines microalgae antioxidants with neem extracts to actively soothe irritated, acne-prone skin and prevent breakouts.',
      'SULFATE-FREE GENTLE PORE PURIFICATION: Cleanses deep seated dirt, grime, and excess oil without stripping away the natural skin moisture barrier.',
      'GREEN TEA ANTIOXIDANT MOAT: Neutralizes urban pollutants and free radicals, refreshing tired skin with a cooling revitalizing cleanse.',
      'SUITABLE FOR ALL SKIN TYPES: PH-balanced, dermatologically gentle formula crafted for daily morning and evening skincare regimens.',
      'HOW TO USE: Apply a small pump onto damp face, gently massage in circular motions for 60 seconds, and rinse thoroughly with cool water.'
    ],
    keywords: 'spirulina face wash anti acne cleanser neem green tea pore detox vegan sulfate free oily sensitive skin',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facewash-bottle.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facewash-benefits.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facewash-exfoliation.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facewash-antioxidant.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facewash-how-to-use.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facewash-lifestyle.jpg'
    ]
  },
  {
    sku: 'SJT-SP-SOAP-100G',
    productType: 'SKIN_CLEANING_AGENT',
    title: 'Sujata Nutrilive SpiruGlow Handmade Organic Bath Soap (100g) | Pure Spirulina, Cold-Pressed Coconut Oil & Shea Butter | Gentle Nourishing & Hydrating Bar',
    itemTypeName: 'Handmade Bath Soap',
    itemForm: 'Bar',
    hsnCode: '34011110',
    unitCountType: 'gram',
    unitCountValue: 100,
    weightGrams: 100,
    dimensions: { height: 7, length: 7, width: 3 },
    price: 149,
    mrp: 199,
    description: 'Sujata Nutrilive SpiruGlow Handmade Soap is slow-cured using pure spirulina biomass, virgin cold-pressed coconut oil, and rich shea butter. Free from chemical parabens, harsh sulfates, and synthetic foaming agents, this creamy bath bar deeply hydrates dry skin while supplying essential micronutrients for a healthy glow.',
    bullets: [
      'HANDCRAFTED COLD-PROCESSED LUXURY: Hand-poured in small batches and cured naturally to preserve the rich glycerin and natural nutrient integrity.',
      'INFUSED WITH ORGANIC SPIRULINA: Infuses epidermal cells with chlorophyll and carotenoids, leaving skin rejuvenated, smooth, and supple.',
      'VIRGIN COCONUT OIL & SHEA BUTTER: Delivers intense emollient moisture, preventing post-bath dryness and reinforcing skin elasticity.',
      '100% VEGAN & CHEMICAL FREE: No parabens, no SLS/SLES, no synthetic dyes, and no animal cruelty.',
      'USAGE: Work into a rich creamy lather between wet palms, apply over the entire body, and rinse off thoroughly.'
    ],
    keywords: 'spirulina soap handmade organic bath bar natural cold pressed coconut oil shea butter moisturising herbal vegan',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spiruglow-bath-soap-box.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spiruglow-bath-soap-ingredients.jpg'
    ]
  },
  {
    sku: 'SJT-SP-KC-50G',
    productType: 'SKIN_MOISTURIZER',
    title: 'Sujata Nutrilive Spirulina Korean Glass Skin Face Cream (50g) | Niacinamide & Multi-Peptides Formula | Dark Spot Corrector, Collagen Boosting & Radiance',
    itemTypeName: 'Glass Skin Face Cream',
    itemForm: 'Cream',
    hsnCode: '33049990',
    unitCountType: 'gram',
    unitCountValue: 50,
    weightGrams: 90,
    dimensions: { height: 6, length: 6, width: 6 },
    price: 999,
    mrp: 1499,
    description: 'Sujata Nutrilive Spirulina Korean Glass Skin Cream marries ancient bio-marine phytonutrients with advanced K-beauty active peptides and Niacinamide. Designed to melt seamlessly into the skin, it diminishes hyperpigmentation, tightens pores, accelerates nocturnal cellular repair, and leaves a translucent luminous finish.',
    bullets: [
      'KOREAN GLASS SKIN LUMINESCENCE: Formulated with micro-penetrating marine peptides that create an ultra-hydrated, dewy glass-skin glow.',
      'POTENT NIACINAMIDE SPOT CORRECTION: Fades stubborn dark spots, sun tan, and post-acne blemishes while evening out skin discoloration.',
      'COLLAGEN BOOSTING PHYCOCYANIN: Spirulina antioxidants stimulate collagen synthesis, smoothing out fine smile lines and early wrinkles.',
      'LIGHTWEIGHT NON-GREASY TEXTURE: Rapidly absorbs into deep dermal layers without leaving a sticky or greasy residue.',
      'APPLICATION: Smooth a pearl-sized amount over clean face and neck every morning and night after cleansing.'
    ],
    keywords: 'korean glass skin cream spirulina face moisturizer niacinamide peptides dark spot corrector anti aging whitening glow',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-korean-cream-jar.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-korean-cream-spots-tan.jpg'
    ]
  },
  {
    sku: 'SJT-BR-CRM-50G',
    productType: 'SKIN_MOISTURIZER',
    title: 'Sujata Nutrilive Bridal Luxury Radiance Cream (50g) | Kashmiri Saffron, Spirulina & Kumkumadi Tailam | Instant Glow, Even Skin Tone & Pigmentation Repair',
    itemTypeName: 'Bridal Radiance Cream',
    itemForm: 'Cream',
    hsnCode: '33049990',
    unitCountType: 'gram',
    unitCountValue: 50,
    weightGrams: 90,
    dimensions: { height: 6, length: 6, width: 6 },
    price: 699,
    mrp: 999,
    description: 'Sujata Nutrilive Bridal Luxury Radiance Cream is an Ayurvedic wedding-glow elixir crafted with hand-picked Kashmiri saffron, spirulina phycocyanin, and authentic Kumkumadi Tailam. Infuses bridal skin with intense nourishment, fades chronic pigmentation, and delivers an instant natural golden radiance.',
    bullets: [
      'AUTHENTIC KASHMIRI SAFFRON & KUMKUMADI: Traditional royal Ayurvedic botanicals that illuminate dull skin tone and bestow an incandescent bridal glow.',
      'SPIRULINA ANTIOXIDANT PROTECTION: Shields fragile facial capillaries and locks in deep hydration against environmental stress.',
      'FADES BLEMISHES & ACNE MARKS: Gently reduces stubborn hyperpigmentation, uneven skin texture, and stress-induced dullness.',
      'VELVETY RICH HYDRATION: Non-comedogenic formulation deeply rejuvenates dry skin without clogging pores.',
      'HOW TO APPLY: Massage gently in upward circular motions on face and neck twice daily for wedding-ready luminous skin.'
    ],
    keywords: 'bridal cream face whitening saffron kumkumadi spirulina instant glow bridal makeup base pigmentation day cream',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-bridal-whitening-cream-jar.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-bridal-whitening-cream-roses.jpg'
    ]
  },
  {
    sku: 'SJT-SP-SHP-100ML',
    productType: 'SHAMPOO',
    title: 'Sujata Nutrilive SpiruShine 2-in-1 Herbal Shampoo with Conditioner (100ml) | Pure Spirulina, Bhringraj & Keratin Protein | Anti-Hair Fall & Frizz Control',
    itemTypeName: 'Herbal Shampoo Conditioner',
    itemForm: 'Liquid',
    hsnCode: '33051090',
    unitCountType: 'millilitre',
    unitCountValue: 100,
    weightGrams: 120,
    dimensions: { height: 14, length: 4, width: 4 },
    price: 349,
    mrp: 449,
    description: 'Sujata Nutrilive SpiruShine 2-in-1 Shampoo with Conditioner combines organic spirulina algae with Ayurvedic Bhringraj, Shikakai, and plant keratin protein. Cleanses hair shafts without stripping natural scalp moisture while deeply conditioning strands to prevent breakage, split ends, and unmanageable frizz.',
    bullets: [
      'DUAL-ACTION 2-IN-1 CLEANSING & CONDITIONING: Saves shower time by gently lifting impurities while coating hair cuticles in silky softness.',
      'KERATIN & SPIRULINA ROOT STRENGTHENING: Fortifies fragile hair follicles with bioavailable plant amino acids, visibly reducing breakage.',
      'BHRINGRAJ & SHIKAKAI AYURVEDIC COMPLEX: Rejuvenates stagnant roots, soothing dry itchy scalp and encouraging natural hair density.',
      'SULFATE & PARABEN FREE: Gentle for daily wash, color-treated hair, chemically straightened strands, and curly textures.',
      'USAGE: Massage onto wet scalp until a rich lather forms, let rest for 2 minutes, and rinse thoroughly.'
    ],
    keywords: 'spirulina shampoo conditioner 2 in 1 herbal hair fall control bhringraj keratin anti frizz sulfate free',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirushine-shampoo-bottle.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirushine-shampoo-formula.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirushine-shampoo-benefits.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirushine-shampoo-how-to-use.jpg'
    ]
  },
  {
    sku: 'SJT-SP-OIL-50ML',
    productType: 'HAIR_STYLING_AGENT',
    title: 'Sujata Nutrilive Spirulina & Coconut Herbal Hair Oil (50ml) | Cold Pressed Virgin Coconut Oil with Hibiscus, Bhringraj & Almond | Deep Scalp & Follicle Therapy',
    itemTypeName: 'Herbal Hair Oil',
    itemForm: 'Oil',
    hsnCode: '33059011',
    unitCountType: 'millilitre',
    unitCountValue: 50,
    weightGrams: 70,
    dimensions: { height: 11, length: 4, width: 4 },
    price: 299,
    mrp: 399,
    description: 'Sujata Nutrilive Spirulina Herbal Hair Oil is formulated with virgin cold-pressed coconut oil, hibiscus flower extract, Bhringraj, and sweet almond oil, infused with pure spirulina microalgae. Stimulates dormant hair roots, calms scalp redness, controls stubborn dandruff flakes, and leaves hair silky smooth.',
    bullets: [
      'MICROALGAE NUTRIENT INFUSION: Pure spirulina delivers zinc, iron, and amino acids straight into the hair root matrix.',
      'VIRGIN COLD-PRESSED COCONUT & ALMOND: Penetrates deep into the cortex rather than sitting on top, reducing moisture loss and split ends.',
      'HIBISCUS & BHRINGRAJ SCALP REVITALIZATION: Calms scalp irritation, reduces chronic hair fall, and supports thicker hair growth.',
      'LIGHTWEIGHT NON-STICKY TEXTURE: Washes out easily without leaving a greasy build-up on pillows or scalp.',
      'APPLICATION: Warm oil gently, massage into scalp using fingertips for 10 minutes, and leave overnight or 1 hour before shampoo.'
    ],
    keywords: 'spirulina hair oil coconut oil hibiscus bhringraj hair fall anti dandruff scalp nourishment herbal hair growth',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-hair-oil-bottle.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-hair-oil-ingredients.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-hair-oil-frizz.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-hair-oil-scalp.jpg'
    ]
  },

  // B. Extended Multi-Pack & Combo Flagships
  {
    sku: 'SJT-SP-CAP-120',
    productType: 'HERBAL_SUPPLEMENT',
    title: 'Sujata Nutrilive Premium Spirulina Capsules (120 Veg Capsules - 500mg Value Pack) | Pure Phycocyanin & Chlorophyll | 60-Day Cellular Stamina & Immunity',
    itemTypeName: 'Spirulina Capsules',
    itemForm: 'Capsule',
    hsnCode: '21069099',
    unitCountType: 'count',
    unitCountValue: 120,
    weightGrams: 110,
    dimensions: { height: 12, length: 6, width: 6 },
    price: 799,
    mrp: 1199,
    description: 'Sujata Nutrilive 120-Capsule Value Pack delivers pure cold-pressed spirulina biomass enclosed within 100% vegetarian cellulose capsules. Rich in bioavailable iron, Phycocyanin, and complete amino acids for sustained daily stamina and immune support.',
    bullets: [
      '60-DAY VALUE PACK (120 VEG CAPSULES): Substantial daily savings for prolonged vitality and metabolic wellness.',
      'POTENT PHYCOCYANIN & ANTIOXIDANT MOAT: Scavenges free radicals, protecting cells from premature oxidative aging.',
      'IMMUNE DEFENSE & NATURAL IRON: Fortifies red blood cell synthesis and elevates daily oxygen carrying capacity.',
      'PURE & LAB TESTED: Heavy metal tested, zero microcystins, and completely free from chemical binders.',
      'RECOMMENDED INTAKE: Swallow 1 capsule twice daily with warm water 30 minutes before meals.'
    ],
    keywords: 'spirulina capsules 120 veg capsules vegan protein iron multivitamin immunity booster natural energy supplement',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-bottle-transparent.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-benefits.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-fuel-body.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-how-to-use.jpg'
    ]
  },
  {
    sku: 'SJT-SP-CAP-180',
    productType: 'HERBAL_SUPPLEMENT',
    title: 'Sujata Nutrilive Premium Spirulina Capsules (180 Veg Capsules - 500mg Family Mega Pack) | Pure Superfood Algae | 90-Day Cellular Nutrition Regimen',
    itemTypeName: 'Spirulina Capsules',
    itemForm: 'Capsule',
    hsnCode: '21069099',
    unitCountType: 'count',
    unitCountValue: 180,
    weightGrams: 160,
    dimensions: { height: 13, length: 7, width: 7 },
    price: 1099,
    mrp: 1699,
    description: 'Sujata Nutrilive 180-Capsule Mega Pack provides a comprehensive 3-month wellness regimen for active individuals and families. 100% vegetarian capsule shells packed with fresh green microalgae nutrients.',
    bullets: [
      '90-DAY COMPREHENSIVE FAMILY PACK (180 CAPSULES): Maximum economy and uninterrupted daily superfood nourishment.',
      'CELLULAR ENERGY WITHOUT CRASHES: Steady organic micronutrients that support mitochondrial ATP production naturally.',
      'COMPLETE VEGAN PROTEIN & VITAMINS: Over 100 vital vitamins, trace minerals, and essential amino acids in single plant source.',
      'ZERO ARTIFICIAL BINDERS: Pure sun-grown algae with zero chalky excipients or synthetic lubricants.',
      'RECOMMENDED INTAKE: Take 1 capsule twice daily with meals or as advised by your healthcare practitioner.'
    ],
    keywords: 'spirulina capsules 180 mega pack 3 months family pack natural multivitamin vegan organic iron immunity supplement',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-bottle-transparent.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-benefits.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-fuel-body.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-how-to-use.jpg'
    ]
  },
  {
    sku: 'SJT-COMBO-SP90-SB60',
    productType: 'HERBAL_SUPPLEMENT',
    title: 'Sujata Nutrilive Super Immunity Power Combo | Spirulina Tablets (90 Tabs) + Sea Buckthorn Capsules (60 Caps) | Omega 7 & 65% Plant Protein Vitality Kit',
    itemTypeName: 'Superfood Combo Kit',
    itemForm: 'Tablet',
    hsnCode: '21069099',
    unitCountType: 'count',
    unitCountValue: 150,
    weightGrams: 180,
    dimensions: { height: 12, length: 11, width: 6 },
    price: 950,
    mrp: 1399,
    description: 'Sujata Nutrilive Super Immunity Combo combines 90 pure Spirulina Tablets with 60 wild Himalayan Sea Buckthorn Capsules. Together, they provide unmatched antioxidant protection, natural Vitamin C, Omegas 3, 6, 7 & 9, and essential minerals.',
    bullets: [
      'IMMUNITY & RADIANCE SYNERGY: Spirulina powers cellular vitality while Sea Buckthorn provides essential Omegas and Vitamin C for glowing skin.',
      '90 SPIRULINA TABLETS + 60 SEA BUCKTHORN CAPSULES: Complete balanced daily supply designed for active professionals.',
      'NO SYNTHETIC ADDITIVES: Pure wholefood plant formulations with zero chemical glues or animal gelatins.',
      'DAILY SYNERGISTIC WELLNESS: An integrated two-bottle regimen providing comprehensive antioxidant, vitamin, and trace mineral balance.',
      'DAILY USE: Take 1-2 Spirulina tablets in morning, and 1 Sea Buckthorn capsule at night.'
    ],
    keywords: 'spirulina sea buckthorn combo pack immunity booster omega 7 multivitamin daily wellness vegan superfood bundle',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-combo-spirulina-sea-buckthorn.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-combo-synergy-infographic-hindi.jpg'
    ]
  },
  {
    sku: 'SJT-CMBO-HL-2M',
    productType: 'HERBAL_SUPPLEMENT',
    title: 'Sujata Nutrilive Healthy Life 360 Synergy Combo (2-Month Plan) | 2x Spirulina Tablets + 2x Sea Buckthorn Capsules | 60-Day Total Cellular Rejuvenation',
    itemTypeName: 'Herbal Supplement Combo',
    itemForm: 'Capsule',
    hsnCode: '21069099',
    unitCountType: 'count',
    unitCountValue: 240,
    weightGrams: 320,
    dimensions: { height: 14, length: 14, width: 7 },
    price: 1900,
    mrp: 2800,
    description: 'Sujata Nutrilive Healthy Life 360 2-Month Comprehensive Regimen includes 2 bottles of pure Spirulina Tablets and 2 bottles of wild Himalayan Sea Buckthorn Capsules. Ideal for continuous metabolic rejuvenation, joint comfort, and glowing skin.',
    bullets: [
      '60-DAY CONTINUOUS WELLNESS PROTOCOL: Extended regimen delivers cumulative biological benefits for skin, heart, and immunity.',
      'OMEGA 7 + 100+ MICRONUTRIENTS: Combines complete plant protein, active chlorophyll, and the rarest essential fatty acids.',
      'MAXIMUM COST SAVINGS: Best value combo bundle for sustained vitality.',
      '100% VEGAN & NATURAL: Plant-derived formulations tested for purity and potency.',
      'DAILY ROUTINE: 1 Spirulina tablet in the morning, 1 Sea Buckthorn capsule after dinner.'
    ],
    keywords: 'spirulina sea buckthorn 2 month combo pack superfood omega 7 multivitamin daily wellness vegan complete nutrition',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_yruxb3yruxb3yrux.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-combo-product-showcase.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-bottle.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-sea-buckthorn-capsules-bottle.jpg'
    ]
  },
  {
    sku: 'SJT-CMBO-HL-3M',
    productType: 'HERBAL_SUPPLEMENT',
    title: 'Sujata Nutrilive Healthy Life 360 Synergy Combo (3-Month Protocol) | 3x Spirulina Tablets + 3x Sea Buckthorn Capsules | 90-Day Complete Metabolic Transformation',
    itemTypeName: 'Herbal Supplement Combo',
    itemForm: 'Capsule',
    hsnCode: '21069099',
    unitCountType: 'count',
    unitCountValue: 360,
    weightGrams: 480,
    dimensions: { height: 16, length: 16, width: 8 },
    price: 2700,
    mrp: 4200,
    description: 'Sujata Nutrilive Healthy Life 360 3-Month Protocol is the definitive holistic transformation package. Includes 3 bottles of pure Spirulina Tablets and 3 bottles of Himalayan Sea Buckthorn Capsules to support long-term cellular renewal, gut mucosal lining, and immune defense.',
    bullets: [
      '90-DAY COMPLETE METABOLIC TRANSFORMATION: Formulated for practitioners seeking deep holistic health rejuvenation and sustained results.',
      'DEEP CELLULAR NOURISHMENT: Microalgae phycocyanin synergizes with cold-pressed Sea Buckthorn oil to shield cells from oxidative decay.',
      'HIGHEST DISCOUNTED BUNDLE: Maximum savings on our flagship Ayurvedic nutritional superfoods.',
      'ZERO PRESERVATIVES OR ADDITIVES: Clean-label, 100% vegetarian, non-GMO, and third-party laboratory tested.',
      'DAILY PROTOCOL: Take consistently for 90 days for peak physical endurance and radiant health.'
    ],
    keywords: 'spirulina sea buckthorn 3 month combo pack superfood omega 7 multivitamin 90 days complete nutrition kit',
    images: [
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_yruxb3yruxb3yrux.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-combo-product-showcase.png',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-capsules-bottle.jpg',
      'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-sea-buckthorn-capsules-bottle.jpg'
    ]
  }
];

// 5. Build PUT payload for new listing
function buildNewListingPayload(item) {
  const payload = {
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
        { unit: 'grams', value: item.weightGrams + 40, marketplace_id: MARKETPLACE_ID }
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

  // Attach images
  if (item.images && item.images.length > 0) {
    payload.attributes.main_product_image_locator = [
      { media_location: item.images[0], marketplace_id: MARKETPLACE_ID }
    ];
    for (let i = 1; i < Math.min(item.images.length, 7); i++) {
      payload.attributes[`other_product_image_locator_${i}`] = [
        { media_location: item.images[i], marketplace_id: MARKETPLACE_ID }
      ];
    }
  }

  // Dietary attributes for supplements
  if (item.productType === 'HERBAL_SUPPLEMENT' || item.productType === 'NUTRITIONAL_SUPPLEMENT') {
    payload.attributes.fssai_veg_non_veg_status = [
      { value: 'vegetarian', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.flavor = [
      { language_tag: 'en_IN', value: 'Unflavoured', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.contains_liquid_contents = [
      { value: false, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.contains_food_or_beverage = [
      { value: false, marketplace_id: MARKETPLACE_ID }
    ];
  }

  // Skincare / Face Wash & Soap
  if (item.productType === 'SKIN_CLEANING_AGENT') {
    const isLiquid = item.itemForm === 'Gel' || item.itemForm === 'Liquid';
    payload.attributes.contains_liquid_contents = [
      { value: isLiquid, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.is_heat_sensitive = [
      { value: false, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.lifestyle = [
      { value: 'Premium Beauty', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.skin_type = [
      { language_tag: 'en_IN', value: 'All', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.batteries_required = [
      { value: false, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.target_audience_keyword = [
      { language_tag: 'en_IN', value: 'Unisex Adult', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.safety_warning = [
      { language_tag: 'en_IN', value: 'For external use only. Avoid direct contact with eyes.', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.scent = [
      { language_tag: 'en_IN', value: isLiquid ? 'Neem & Green Tea' : 'Organic Coconut', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.product_benefit = [
      { language_tag: 'en_IN', value: isLiquid ? 'Acne Prevention' : 'Moisturizing', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.specific_uses_for_product = [
      { language_tag: 'en_IN', value: isLiquid ? 'Pore Cleansing, Acne Control, Oil Balance' : 'Daily Bathing, Deep Moisture, Skin Softening', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.short_product_description = [
      { language_tag: 'en_IN', value: item.description.substring(0, 200), marketplace_id: MARKETPLACE_ID }
    ];
    if (isLiquid) {
      payload.attributes.liquid_volume = [
        { unit: 'milliliters', value: 100, marketplace_id: MARKETPLACE_ID }
      ];
      payload.attributes.is_liquid_double_sealed = [
        { value: true, marketplace_id: MARKETPLACE_ID }
      ];
    }
  }

  // Face Moisturizer / Creams
  if (item.productType === 'SKIN_MOISTURIZER') {
    delete payload.attributes.supplier_declared_dg_hz_regulation;
    payload.attributes.contains_liquid_contents = [
      { value: false, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.is_heat_sensitive = [
      { value: false, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.lifestyle = [
      { value: 'Premium Beauty', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.skin_type = [
      { language_tag: 'en_IN', value: 'All', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.batteries_required = [
      { value: false, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.target_audience_keyword = [
      { language_tag: 'en_IN', value: 'Women', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.safety_warning = [
      { language_tag: 'en_IN', value: 'For external cosmetic use only. Perform a patch test before first use.', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.product_benefit = [
      { language_tag: 'en_IN', value: item.sku.includes('BR') ? 'Even Toning' : 'Brightening', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.specific_uses_for_product = [
      { language_tag: 'en_IN', value: item.sku.includes('BR') ? 'Bridal Glow, Pigmentation Repair, Radiance' : 'Glass Skin Glow, Dark Spots, Hydration', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.short_product_description = [
      { language_tag: 'en_IN', value: item.description.substring(0, 200), marketplace_id: MARKETPLACE_ID }
    ];
  }

  // Shampoo
  if (item.productType === 'SHAMPOO') {
    payload.attributes.contains_liquid_contents = [
      { value: true, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.batteries_required = [
      { value: false, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.target_audience_keyword = [
      { language_tag: 'en_IN', value: 'Unisex Adult', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.target_gender = [
      { value: 'unisex', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.scent = [
      { language_tag: 'en_IN', value: 'Herbal Fresh', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.ingredients = [
      { language_tag: 'en_IN', value: 'Pure Spirulina Extract, Bhringraj, Shikakai, Plant Keratin, Aqua', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.hair_type = [
      { language_tag: 'en_IN', value: 'All Hair Types', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.lifestyle = [
      { value: 'Premium Beauty', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.item_volume = [
      { unit: 'milliliters', value: 100, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.liquid_volume = [
      { unit: 'milliliters', value: 100, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.is_liquid_double_sealed = [
      { value: true, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.product_benefit = [
      { language_tag: 'en_IN', value: 'Conditioning', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.specific_uses_for_product = [
      { language_tag: 'en_IN', value: 'Hair Fall Control, Deep Conditioning, Anti-Frizz', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.short_product_description = [
      { language_tag: 'en_IN', value: item.description.substring(0, 200), marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.safety_warning = [
      { language_tag: 'en_IN', value: 'For external use only. In case of contact with eyes, rinse immediately with clean water.', marketplace_id: MARKETPLACE_ID }
    ];
  }

  // Hair Styling / Oil
  if (item.productType === 'HAIR_STYLING_AGENT') {
    payload.attributes.contains_liquid_contents = [
      { value: true, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.batteries_required = [
      { value: false, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.target_audience_keyword = [
      { language_tag: 'en_IN', value: 'Unisex Adult', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.lifestyle = [
      { value: 'Premium Beauty', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.hair_type = [
      { language_tag: 'en_IN', value: 'All Hair Types', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.safety_warning = [
      { language_tag: 'en_IN', value: 'For external use only. Store in a cool dry place.', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.color = [
      { language_tag: 'en_IN', value: 'Natural Green', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.scent = [
      { language_tag: 'en_IN', value: 'Herbal Coconut', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.item_volume = [
      { unit: 'milliliters', value: 50, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.liquid_volume = [
      { unit: 'milliliters', value: 50, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.is_liquid_double_sealed = [
      { value: true, marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.product_benefit = [
      { language_tag: 'en_IN', value: 'Nourishing', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.specific_uses_for_product = [
      { language_tag: 'en_IN', value: 'Scalp Therapy, Hair Strengthening, Anti Dandruff', marketplace_id: MARKETPLACE_ID }
    ];
    payload.attributes.short_product_description = [
      { language_tag: 'en_IN', value: item.description.substring(0, 200), marketplace_id: MARKETPLACE_ID }
    ];
  }

  return payload;
}

// 6. Master Runner
async function runMasterEngine() {
  console.log('========================================================================');
  console.log('👑 SUJATA NUTRILIVE: MASTER AMAZON CATALOG SYNCHRONIZATION ENGINE');
  console.log(`📍 Seller ID: ${SELLER_ID} | Marketplace: Amazon India (${MARKETPLACE_ID})`);
  console.log('========================================================================\n');

  const token = await getAccessToken();
  const phase2Only = process.argv.includes('--phase2-only');

  // STEP 1: Patch High-Res Images & Attributes to Existing / Ingested Listings
  if (!phase2Only) {
    console.log('📸 [PHASE 1] PATCHING HIGH-RES STUDIO PACKSHOTS & LQD ATTRIBUTES...');
    for (const item of EXISTING_UPDATES) {
    console.log(`⚡ Updating SKU [${item.sku}]...`);
    const patches = [];

    if (item.images && item.images.length > 0) {
      patches.push({
        op: 'replace',
        path: '/attributes/main_product_image_locator',
        value: [{ media_location: item.images[0], marketplace_id: MARKETPLACE_ID }]
      });
      for (let i = 1; i < Math.min(item.images.length, 7); i++) {
        patches.push({
          op: 'replace',
          path: `/attributes/other_product_image_locator_${i}`,
          value: [{ media_location: item.images[i], marketplace_id: MARKETPLACE_ID }]
        });
      }
    }

    if (item.flavor) {
      patches.push({
        op: 'replace',
        path: '/attributes/flavor',
        value: [{ language_tag: 'en_IN', value: item.flavor, marketplace_id: MARKETPLACE_ID }]
      });
    }

    if (item.primarySupplementType) {
      patches.push({
        op: 'replace',
        path: '/attributes/primary_supplement_type',
        value: [{ language_tag: 'en_IN', value: item.primarySupplementType, marketplace_id: MARKETPLACE_ID }]
      });
    }

    if (item.scent) {
      patches.push({
        op: 'replace',
        path: '/attributes/scent',
        value: [{ language_tag: 'en_IN', value: item.scent, marketplace_id: MARKETPLACE_ID }]
      });
    }

    const url = `${SP_ENDPOINT}/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(item.sku)}?marketplaceIds=${MARKETPLACE_ID}`;
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json',
          'User-Agent': 'SujataNutrilive/1.0'
        },
        body: JSON.stringify({ productType: item.productType, patches })
      });
      const data = await res.json();
      if (res.status === 200 && data.status === 'ACCEPTED') {
        console.log(`   ✅ SUCCESS: Images & attributes accepted! (Submission: ${data.submissionId})`);
      } else {
        console.log(`   ⚠️ Response (${res.status}):`, JSON.stringify(data.issues || data));
      }
    } catch (err) {
      console.error(`   ❌ Failed to patch ${item.sku}:`, err.message);
    }

    await sleep(1500);
  }
}

  // STEP 2: Deploy New Listings
  console.log('\n🚀 [PHASE 2] LAUNCHING REMAINING CATALOG PRODUCTS & VARIANTS...');
  for (const item of NEW_CATALOG_LISTINGS) {
    console.log(`⚡ Creating New Amazon Listing for SKU [${item.sku}]...`);
    console.log(`   Title: "${item.title.substring(0, 65)}..."`);
    console.log(`   Price: ₹${item.price} (M.R.P: ₹${item.mrp}) | Form: ${item.itemForm} | Images: ${item.images.length}`);

    const payload = buildNewListingPayload(item);
    const url = `${SP_ENDPOINT}/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(item.sku)}?marketplaceIds=${MARKETPLACE_ID}`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json',
          'User-Agent': 'SujataNutrilive/1.0'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.status === 200 && data.status === 'ACCEPTED') {
        console.log(`   ✅ SUCCESS: Listing Created & Accepted! (Submission: ${data.submissionId})`);
      } else {
        console.log(`   ⚠️ Response (${res.status}):`, JSON.stringify(data.issues || data));
      }
    } catch (err) {
      console.error(`   ❌ Failed to create ${item.sku}:`, err.message);
    }

    console.log('------------------------------------------------------------------------');
    await sleep(1800);
  }

  console.log('\n🎉 ALL CATALOG PRODUCTS, PACKSHOTS, VARIANTS & ATTRIBUTES PROCESSED!');
}

runMasterEngine().catch(console.error);
