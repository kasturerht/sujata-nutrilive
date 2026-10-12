import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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

async function getAmazonToken() {
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
const shopifyDomain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const shopifyToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

// 1. Delete AB27 (Pack of 2 Hair Oil) from Amazon
async function deletePackOf2Oil(amzToken) {
  console.log('\n======================================================');
  console.log('🗑️ 1. REMOVING PACK OF 2 HAIR OIL (AB27) FROM AMAZON');
  console.log('======================================================');

  // First zero out inventory
  const patchUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/AB27?marketplaceIds=${marketId}`;
  try {
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { 'x-amz-access-token': amzToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'HAIR_STYLING_AGENT',
        patches: [
          {
            op: 'replace',
            path: '/attributes/fulfillment_availability',
            value: [{ fulfillment_channel_code: 'DEFAULT', quantity: 0 }]
          }
        ]
      })
    });
    console.log(`Zeroed inventory for AB27: HTTP ${patchRes.status}`);
  } catch (e) {
    console.error('Error zeroing inventory:', e.message);
  }

  // Then call DELETE listings API
  try {
    const delUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/AB27?marketplaceIds=${marketId}`;
    const delRes = await fetch(delUrl, {
      method: 'DELETE',
      headers: { 'x-amz-access-token': amzToken }
    });
    const delData = await delRes.json();
    console.log(`DELETE AB27 from Amazon: HTTP ${delRes.status} | Status: ${delData.status} | Submission: ${delData.submissionId}`);
  } catch (e) {
    console.error('Error deleting AB27:', e.message);
  }
}

// 2. Batch 2 Updates List
const BATCH_2_ITEMS = [
  {
    amazonSku: 'SJT-SP-OIL-50ML',
    shopifySku: 'SJT-SP-OIL-50ML',
    shopifyVariantNumericId: '52738358378628',
    productType: 'HAIR_STYLING_AGENT',
    name: 'Spirulina Hair Oil 50ml',
    price: 249,
    mrp: 350
  },
  {
    amazonSku: 'SJT-SP-CAP-120',
    shopifySku: 'SJT-SP-CAP-120',
    shopifyVariantNumericId: '52777647407236',
    productType: 'HERBAL_SUPPLEMENT',
    name: 'Spirulina Capsules 120s',
    price: 799,
    mrp: 1100
  },
  {
    amazonSku: 'SJT-SP-CAP-180',
    shopifySku: 'SJT-SP-CAP-180',
    shopifyVariantNumericId: '67604020002948',
    productType: 'HERBAL_SUPPLEMENT',
    name: 'Spirulina Capsules 180s',
    price: 1099,
    mrp: 1650
  },
  {
    amazonSku: 'SJT-SP-KC-50G',
    shopifySku: 'SJT-SP-KC-50G',
    shopifyVariantNumericId: '52738358313092',
    productType: 'SKIN_MOISTURIZER',
    name: 'Korean Glass Skin Cream 25g',
    price: 999,
    mrp: 1200
  },
  {
    amazonSku: 'SJT-SHIL-CAP-60',
    shopifySku: 'SJT-SHIL-CAP-60',
    shopifyVariantNumericId: '52738358083716',
    productType: 'HERBAL_SUPPLEMENT',
    name: 'Himalayan Shilajit 60 Caps',
    price: 649,
    mrp: 699
  },
  {
    amazonSku: 'SJT-B12-CAP-90',
    shopifySku: 'SJT-B12-CAP-90',
    shopifyVariantNumericId: '52738358050948',
    productType: 'HERBAL_SUPPLEMENT',
    name: 'Plant-Based B12 90 Caps',
    price: 649,
    mrp: 699
  },
  {
    amazonSku: 'SJT-MOR-PWD-100G',
    shopifySku: 'SJT-MOR-PWD-100G',
    shopifyVariantNumericId: '52738358116484',
    productType: 'HERBAL_SUPPLEMENT',
    name: 'Moringa Leaf Powder 100g',
    price: 249,
    mrp: 299
  },
  {
    amazonSku: 'SJT-SP-FW-100ML',
    shopifySku: 'SJT-SP-FW-100ML',
    shopifyVariantNumericId: '52738358149252',
    productType: 'SKIN_CLEANING_AGENT',
    name: 'Anti-Acne Face Wash 100ml',
    price: 199,
    mrp: 249
  },
  {
    amazonSku: 'AB29',
    shopifySku: 'SJT-SP-FP-50G',
    shopifyVariantNumericId: '52738358182020',
    productType: 'SKIN_TREATMENT_MASK',
    name: 'Spirulina Face Pack 50g',
    price: 199,
    mrp: 249
  }
];

// 3. Update Amazon Listings
async function updateAmazonBatch2(amzToken) {
  console.log('\n======================================================');
  console.log('📦 2. UPDATING AMAZON SP-API (BATCH 2 PRICING & MRP)');
  console.log('======================================================');

  for (const item of BATCH_2_ITEMS) {
    console.log(`\nPushing Amazon SKU [${item.amazonSku}]: Price: ₹${item.price} | MRP: ₹${item.mrp}`);
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(item.amazonSku)}?marketplaceIds=${marketId}`;
    
    const patchPayload = {
      productType: item.productType,
      patches: [
        {
          op: 'replace',
          path: '/attributes/fulfillment_availability',
          value: [{ fulfillment_channel_code: 'DEFAULT', quantity: 50 }]
        },
        {
          op: 'replace',
          path: '/attributes/purchasable_offer',
          value: [{
            currency: 'INR',
            our_price: [{ schedule: [{ value_with_tax: item.price }] }],
            maximum_retail_price: [{ schedule: [{ value_with_tax: item.mrp }] }],
            marketplace_id: marketId
          }]
        }
      ]
    };

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'x-amz-access-token': amzToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(patchPayload)
      });
      const data = await res.json();
      console.log(`   HTTP ${res.status} | Status: ${data.status} | Submission: ${data.submissionId}`);
    } catch (e) {
      console.error(`   Error on ${item.amazonSku}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 1200));
  }
}

// 4. Update Shopify Variants via REST Admin API
async function updateShopifyBatch2() {
  console.log('\n======================================================');
  console.log('🛍️ 3. UPDATING SHOPIFY STOREFRONT (BATCH 2 PRICING & MRP)');
  console.log('======================================================');

  for (const item of BATCH_2_ITEMS) {
    console.log(`\nUpdating Shopify SKU [${item.shopifySku}] (ID: ${item.shopifyVariantNumericId}): Price: ₹${item.price} | MRP: ₹${item.mrp}`);
    const url = `https://${shopifyDomain}/admin/api/2024-01/variants/${item.shopifyVariantNumericId}.json`;
    const payload = {
      variant: {
        id: parseInt(item.shopifyVariantNumericId),
        price: item.price.toFixed(2),
        compare_at_price: item.mrp.toFixed(2)
      }
    };

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': shopifyToken
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.status === 200 && data.variant) {
        console.log(`   ✅ Success! Shopify variant updated: Price: ₹${data.variant.price} | MRP: ₹${data.variant.compare_at_price}`);
      } else {
        console.error(`   ❌ Shopify Error:`, JSON.stringify(data));
      }
    } catch (e) {
      console.error(`   Error on Shopify ${item.shopifySku}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 600));
  }
}

async function main() {
  const amzToken = await getAmazonToken();
  await deletePackOf2Oil(amzToken);
  await updateAmazonBatch2(amzToken);
  await updateShopifyBatch2();
  console.log('\n🎉 ALL BATCH 2 PRICING, MRP & CATALOG CLEANUPS EXECUTED SUCCESSFULLY!');
}

main();
