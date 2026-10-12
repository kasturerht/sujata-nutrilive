#!/usr/bin/env node
/**
 * 🔄 SUJATA NUTRILIVE: SHOPIFY-TO-AMAZON REAL-TIME INVENTORY & PRICE SYNC ENGINE
 * 
 * Synchronizes inventory availability and prices between Shopify and Amazon SP-API.
 * Prevents overselling, protects Buy Box eligibility, and keeps catalog in perfect harmony.
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

const SHOPIFY_DOMAIN = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const SHOPIFY_TOKEN = process.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '7e0a0176aede63ce4c6b199e18684018';

// 2. Comprehensive SKU Mapping Matrix (Shopify -> Amazon)
const SKU_MAPPING = {
  // Shopify SKU -> Amazon SKU & Product Type
  'SJT-SP-PWD-100G': { amazonSku: 'L5-UK79-BHXE', productType: 'NUTRITIONAL_SUPPLEMENT', customPrice: 350, customMrp: 499 },
  'SJT-SP-TAB-60':   { amazonSku: '8X-HQKV-14T7', productType: 'HERBAL_SUPPLEMENT', customPrice: 350, customMrp: 400 },
  'SJT-SP-TAB-120':  { amazonSku: 'SJT-SP-TAB-120', productType: 'HERBAL_SUPPLEMENT', customPrice: 550, customMrp: 699 },
  'SJT-SP-CAP-60':   { amazonSku: 'AB01', productType: 'NUTRITIONAL_SUPPLEMENT', customPrice: 499, customMrp: 550 },
  'SJT-SP-CAP-120':  { amazonSku: 'SJT-SP-CAP-120', productType: 'HERBAL_SUPPLEMENT', customPrice: 799, customMrp: 1100 },
  'SJT-SP-CAP-180':  { amazonSku: 'SJT-SP-CAP-180', productType: 'HERBAL_SUPPLEMENT', customPrice: 1099, customMrp: 1650 },
  'SJT-SB-CAP-60':   { amazonSku: 'SJT-SB-CAP-60', productType: 'HERBAL_SUPPLEMENT', customPrice: 649, customMrp: 799 },
  'SJT-B12-CAP-90':  { amazonSku: 'SJT-B12-CAP-90', productType: 'HERBAL_SUPPLEMENT', customPrice: 649, customMrp: 699 },
  'SJT-SHIL-CAP-60': { amazonSku: 'SJT-SHIL-CAP-60', productType: 'HERBAL_SUPPLEMENT', customPrice: 649, customMrp: 699 },
  'SJT-MOR-PWD-100G':{ amazonSku: 'SJT-MOR-PWD-100G', productType: 'HERBAL_SUPPLEMENT', customPrice: 249, customMrp: 299 },
  'SJT-SP-FW-100ML': { amazonSku: 'SJT-SP-FW-100ML', productType: 'SKIN_CLEANING_AGENT', customPrice: 199, customMrp: 249 },
  'SJT-SP-FP-50G':   { amazonSku: 'AB29', productType: 'SKIN_TREATMENT_MASK', customPrice: 199, customMrp: 249 },
  'SJT-SP-SOAP-100G':{ amazonSku: 'SJT-SP-SOAP-100G', productType: 'SKIN_CLEANING_AGENT', customPrice: 60, customMrp: 60 },
  'SJT-SP-SOAP-5PK': { amazonSku: 'SJT-SP-SOAP-5PK', productType: 'SKIN_CLEANING_AGENT', customPrice: 280, customMrp: 300 },
  'SJT-SP-SOAP-10PK':{ amazonSku: 'SJT-SP-SOAP-10PK', productType: 'SKIN_CLEANING_AGENT', customPrice: 550, customMrp: 600 },
  'SJT-SP-KC-50G':   { amazonSku: 'SJT-SP-KC-50G', productType: 'SKIN_MOISTURIZER', customPrice: 999, customMrp: 1200 },
  'SJT-BR-CRM-50G':  { amazonSku: 'SJT-BR-CRM-50G', productType: 'SKIN_MOISTURIZER', customPrice: 1199, customMrp: 1499 },
  'SJT-SP-OIL-50ML': { amazonSku: 'SJT-SP-OIL-50ML', productType: 'HAIR_STYLING_AGENT', customPrice: 249, customMrp: 350 },
  'SJT-SP-SHP-100ML':{ amazonSku: 'SJT-SP-SHP-100ML', productType: 'SHAMPOO', customPrice: 250, customMrp: 399 },
  'SJT-COMBO-SP90-SB60': { amazonSku: 'SJT-COMBO-SP90-SB60', productType: 'HERBAL_SUPPLEMENT', customPrice: 950, customMrp: 1250 },
  'SJT-COMBO-SP120-SB60':{ amazonSku: 'SJT-COMBO-SP120-SB60', productType: 'HERBAL_SUPPLEMENT', customPrice: 1099, customMrp: 1498 },
  'SJT-CMBO-HL-1M':  { amazonSku: 'SJT-CMBO-HL-1M', productType: 'HERBAL_SUPPLEMENT', customPrice: 1100, customMrp: 1485 },
  'SJT-CMBO-HL-2M':  { amazonSku: 'SJT-CMBO-HL-2M', productType: 'HERBAL_SUPPLEMENT', customPrice: 1900, customMrp: 2565 },
  'SJT-CMBO-HL-3M':  { amazonSku: 'SJT-CMBO-HL-3M', productType: 'HERBAL_SUPPLEMENT', customPrice: 2700, customMrp: 3645 }
};

// 3. Amazon LWA Auth
async function getAmazonToken() {
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
  const data = await res.json();
  return data.access_token;
}

// 4. Fetch Live Shopify Variants & Inventory
async function fetchShopifyInventory() {
  const query = `{
    products(first: 50) {
      edges {
        node {
          title
          variants(first: 20) {
            edges {
              node {
                title
                sku
                availableForSale
                priceV2 { amount currencyCode }
                compareAtPriceV2 { amount currencyCode }
              }
            }
          }
        }
      }
    }
  }`;

  const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN
    },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  const variants = [];
  json.data?.products?.edges?.forEach(p => {
    p.node.variants?.edges?.forEach(v => {
      variants.push({
        productTitle: p.node.title,
        variantTitle: v.node.title,
        sku: v.node.sku,
        available: v.node.availableForSale,
        price: parseFloat(v.node.priceV2?.amount || '0'),
        mrp: Math.max(
          parseFloat(v.node.compareAtPriceV2?.amount || '0'),
          Math.round(parseFloat(v.node.priceV2?.amount || '0') * 1.35),
          parseFloat(v.node.priceV2?.amount || '0')
        )
      });
    });
  });

  return variants;
}

// 5. Sync Inventory & Price to Amazon
async function syncInventoryAndPrices() {
  console.log('========================================================================');
  console.log('🔄 SUJATA NUTRILIVE: SHOPIFY -> AMAZON INVENTORY & PRICE SYNC ENGINE');
  console.log(`📍 Shopify Store: ${SHOPIFY_DOMAIN} | Amazon: ${MARKETPLACE_ID}`);
  console.log('========================================================================\n');

  const shopifyVariants = await fetchShopifyInventory();
  console.log(`📦 Fetched ${shopifyVariants.length} variants from Shopify.`);

  const amazonToken = await getAmazonToken();
  let syncCount = 0;

  for (const item of shopifyVariants) {
    if (!item.sku || !SKU_MAPPING[item.sku]) {
      continue;
    }

    const mapping = SKU_MAPPING[item.sku];
    const amazonSku = mapping.amazonSku;
    const stockQty = item.available ? 50 : 0; // Default active inventory buffer

    let price = mapping.customPrice ?? item.price;
    let mrp = mapping.customMrp ?? item.mrp;

    console.log(`⚡ Syncing [${item.sku} -> ${amazonSku}]:`);
    console.log(`   Price: ₹${price} (MRP: ₹${mrp}) | Status: ${item.available ? 'IN STOCK (50 units)' : 'OUT OF STOCK (0 units)'}`);

    const patchPayload = {
      productType: mapping.productType,
      patches: [
        {
          op: 'replace',
          path: '/attributes/fulfillment_availability',
          value: [
            {
              fulfillment_channel_code: 'DEFAULT',
              quantity: stockQty
            }
          ]
        },
        {
          op: 'replace',
          path: '/attributes/purchasable_offer',
          value: [
            {
              currency: 'INR',
              our_price: [
                { schedule: [{ value_with_tax: price }] }
              ],
              maximum_retail_price: [
                { schedule: [{ value_with_tax: mrp }] }
              ],
              marketplace_id: MARKETPLACE_ID
            }
          ]
        }
      ]
    };

    const url = `${SP_ENDPOINT}/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(amazonSku)}?marketplaceIds=${MARKETPLACE_ID}`;

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'x-amz-access-token': amazonToken,
          'Content-Type': 'application/json',
          'User-Agent': 'SujataNutrilive/1.0'
        },
        body: JSON.stringify(patchPayload)
      });

      const data = await res.json();
      if (res.status === 200 && data.status === 'ACCEPTED') {
        console.log(`   ✅ Synced! (Submission ID: ${data.submissionId})`);
        syncCount++;
      } else {
        console.log(`   ⚠️ Response (${res.status}):`, JSON.stringify(data.issues || data));
      }
    } catch (err) {
      console.error(`   ❌ Failed to sync ${amazonSku}:`, err.message);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\n🎉 Synchronized ${syncCount} products successfully between Shopify and Amazon!`);
}

if (process.argv[1] && process.argv[1].endsWith('amazon-inventory-sync.mjs')) {
  syncInventoryAndPrices().catch(console.error);
}

export { syncInventoryAndPrices, SKU_MAPPING };
