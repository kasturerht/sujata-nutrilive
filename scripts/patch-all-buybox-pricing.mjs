// scripts/patch-all-buybox-pricing.mjs
// =========================================================================================
// 🚀 SUJATA NUTRILIVE — ENTERPRISE BUY BOX AUTO-PRICING HARMONIZER (OCTOBER 2026)
// =========================================================================================
// Binds every active SKU to the Amazon Competitive Buy Box Rule (952757734802-COMPETITIVE_BUYBOX),
// establishes strict Min/Max allowed price guards, and eliminates Buy Box Suppression across
// the entire Amazon India catalog.
// =========================================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[trimmed.slice(0, idx).trim()] = val;
      }
    });
  }
  return env;
}
const env = loadEnv();

async function getAccessToken() {
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
  if (!data.access_token) throw new Error('Failed to get SP-API access token');
  return data.access_token;
}

const SKU_PRICING_CONFIGS = [
  // 1. Core Supplements
  { sku: 'SJT-SP-TAB-120', name: 'Spirulina Tablets 120s', pt: 'HERBAL_SUPPLEMENT', price: 550, mrp: 699, minPrice: 450, maxPrice: 699 },
  { sku: 'SJT-SB-CAP-60', name: 'Himalayan Sea Buckthorn 60s', pt: 'HERBAL_SUPPLEMENT', price: 649, mrp: 899, minPrice: 550, maxPrice: 899 },
  { sku: 'SJT-SP-CAP-120', name: 'Spirulina Capsules 120s', pt: 'HERBAL_SUPPLEMENT', price: 799, mrp: 1100, minPrice: 699, maxPrice: 1100 },
  { sku: 'SJT-SP-CAP-180', name: 'Spirulina Capsules 180s', pt: 'HERBAL_SUPPLEMENT', price: 1099, mrp: 1550, minPrice: 899, maxPrice: 1550 },
  { sku: 'SJT-SHIL-CAP-60', name: 'Pure Himalayan Shilajit 60s', pt: 'HERBAL_SUPPLEMENT', price: 649, mrp: 999, minPrice: 550, maxPrice: 999 },
  { sku: 'SJT-B12-CAP-90', name: 'Plant-Based Vitamin B12 90s', pt: 'HERBAL_SUPPLEMENT', price: 649, mrp: 899, minPrice: 550, maxPrice: 899 },
  { sku: 'SJT-MOR-PWD-100G', name: 'Natural Moringa Leaf Powder 100g', pt: 'HERBAL_SUPPLEMENT', price: 249, mrp: 349, minPrice: 199, maxPrice: 349 },
  
  // 2. High-Ticket Synergy Combos
  { sku: 'SJT-COMBO-SP90-SB60', name: 'Super Immunity Combo (90T+60C)', pt: 'HERBAL_SUPPLEMENT', price: 950, mrp: 1299, minPrice: 799, maxPrice: 1299 },
  { sku: 'SJT-COMBO-SP120-SB60', name: 'Mega Synergy Combo (120T+60C)', pt: 'HERBAL_SUPPLEMENT', price: 1099, mrp: 1549, minPrice: 899, maxPrice: 1549 },
  { sku: 'SJT-CMBO-HL-1M', name: 'Healthy Life Combo 1-Month', pt: 'HERBAL_SUPPLEMENT', price: 1100, mrp: 1485, minPrice: 899, maxPrice: 1485 },
  { sku: 'SJT-CMBO-HL-2M', name: 'Healthy Life Combo 2-Month', pt: 'HERBAL_SUPPLEMENT', price: 1900, mrp: 2565, minPrice: 1500, maxPrice: 2565 },
  { sku: 'SJT-CMBO-HL-3M', name: 'Healthy Life Combo 3-Month', pt: 'HERBAL_SUPPLEMENT', price: 2700, mrp: 3645, minPrice: 2200, maxPrice: 3645 },

  // 3. Personal Care & Soaps
  { sku: 'SJT-SP-SOAP-100G', name: 'SpiruGlow Handmade Bath Soap 100g', pt: 'SKIN_CLEANING_AGENT', price: 60, mrp: 99, minPrice: 50, maxPrice: 99 },
  { sku: 'SJT-SP-SOAP-5PK', name: 'SpiruGlow Soap Pack of 5', pt: 'SKIN_CLEANING_AGENT', price: 280, mrp: 450, minPrice: 220, maxPrice: 450 },
  { sku: 'SJT-SP-SOAP-10PK', name: 'SpiruGlow Soap Pack of 10', pt: 'SKIN_CLEANING_AGENT', price: 550, mrp: 900, minPrice: 450, maxPrice: 900 },
  { sku: 'SJT-SP-FW-100ML', name: 'Spirulina Anti-Acne Face Wash 100ml', pt: 'SKIN_CLEANING_AGENT', price: 199, mrp: 299, minPrice: 160, maxPrice: 299 },
  { sku: 'AB29', name: 'Spirulina Herbal Face Pack 50g', pt: 'SKIN_TREATMENT_MASK', price: 199, mrp: 299, minPrice: 160, maxPrice: 299 },
  { sku: 'SJT-SP-KC-50G', name: 'Spirulina Korean Glass Skin Cream 25g', pt: 'SKIN_MOISTURIZER', price: 999, mrp: 1499, minPrice: 799, maxPrice: 1499 },
  { sku: 'SJT-BR-CRM-50G', name: 'Bridal Luxury Radiance Cream 50g', pt: 'SKIN_MOISTURIZER', price: 1199, mrp: 1899, minPrice: 899, maxPrice: 1899 },
  { sku: 'SJT-SP-OIL-50ML', name: 'Spirulina & Coconut Hair Oil 50ml', pt: 'HAIR_STYLING_AGENT', price: 249, mrp: 349, minPrice: 199, maxPrice: 349 },
  { sku: 'SJT-SP-SHP-100ML', name: 'SpiruShine 2-in-1 Shampoo 100ml', pt: 'SHAMPOO', price: 250, mrp: 349, minPrice: 199, maxPrice: 349 }
];

async function patchCatalogBuyBox() {
  console.log('========================================================================');
  console.log(`🚀 HARMONIZING BUY BOX & PRICING RULES ACROSS ${SKU_PRICING_CONFIGS.length} SKUs`);
  console.log('========================================================================\n');

  const token = await getAccessToken();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const results = [];

  for (const item of SKU_PRICING_CONFIGS) {
    const sku = item.sku;
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}`;

    const purchasableOffer = {
      currency: 'INR',
      start_at: {
        value: '2024-11-18T00:00:00.000Z'
      },
      end_at: {
        value: null
      },
      audience: 'ALL',
      minimum_seller_allowed_price: [
        {
          schedule: [
            {
              value_with_tax: item.minPrice
            }
          ]
        }
      ],
      maximum_retail_price: [
        {
          schedule: [
            {
              value_with_tax: item.mrp
            }
          ]
        }
      ],
      maximum_seller_allowed_price: [
        {
          schedule: [
            {
              value_with_tax: item.maxPrice
            }
          ]
        }
      ],
      our_price: [
        {
          schedule: [
            {
              value_with_tax: item.price
            }
          ]
        }
      ],
      automated_pricing_merchandising_rule_plan: [
        {
          merchandising_rule: {
            rule_id: '952757734802-COMPETITIVE_BUYBOX'
          }
        }
      ],
      marketplace_id: marketId
    };

    const payload = {
      productType: item.pt,
      patches: [
        {
          op: 'replace',
          path: '/attributes/purchasable_offer',
          value: [purchasableOffer]
        }
      ]
    };

    try {
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
      const status = data.status || (res.status === 200 ? 'ACCEPTED' : 'FAILED');
      const issues = data.issues || [];

      results.push({
        sku,
        name: item.name,
        price: `₹${item.price}`,
        minMax: `₹${item.minPrice} - ₹${item.maxPrice}`,
        status,
        issues: issues.length
      });

      console.log(`[${status}] SKU: ${sku} (${item.name}) | Price: ₹${item.price} (Min: ₹${item.minPrice}, Max: ₹${item.maxPrice})`);
      if (issues.length > 0) {
        issues.forEach(iss => console.log(`   ⚠️ Issue: [${iss.severity}] ${iss.code} - ${iss.message}`));
      }
    } catch (e) {
      console.error(`❌ Error on ${sku}:`, e.message);
      results.push({ sku, name: item.name, status: 'ERROR', detail: e.message });
    }

    // Gentle pacing for Amazon rate limit
    await new Promise(r => setTimeout(r, 600));
  }

  console.log('\n========================================================================');
  console.log('✅ BUY BOX HARMONIZATION COMPLETE! SUMMARY TABLE:');
  console.log('========================================================================');
  console.table(results);
}

patchCatalogBuyBox().catch(console.error);
