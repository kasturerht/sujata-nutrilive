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

const TARGETS = [
  {
    amazonSku: '8X-HQKV-14T7',
    shopifySku: 'SJT-SP-TAB-60',
    shopifyVariantId: 'gid://shopify/ProductVariant/52738357887108',
    productType: 'HERBAL_SUPPLEMENT',
    name: 'Spirulina 60 Tablets',
    price: 350,
    mrp: 400
  },
  {
    amazonSku: 'L5-UK79-BHXE',
    shopifySku: 'SJT-SP-PWD-100G',
    shopifyVariantId: 'gid://shopify/ProductVariant/52738357854340',
    productType: 'NUTRITIONAL_SUPPLEMENT',
    name: 'Spirulina Powder 100g',
    price: 350,
    mrp: 499
  },
  {
    amazonSku: 'AB01',
    shopifySku: 'SJT-SP-CAP-60',
    shopifyVariantId: 'gid://shopify/ProductVariant/52738357985412',
    productType: 'NUTRITIONAL_SUPPLEMENT',
    name: 'Spirulina 60 Capsules',
    price: 499,
    mrp: 550
  },
  {
    amazonSku: 'SJT-SP-SOAP-100G',
    shopifySku: 'SJT-SP-SOAP-100G',
    shopifyVariantId: 'gid://shopify/ProductVariant/52738358247556',
    productType: 'SKIN_CLEANING_AGENT',
    name: 'SpiruGlow Bath Soap 100g',
    price: 60,
    mrp: 60
  },
  {
    amazonSku: 'SJT-SP-TAB-120',
    shopifySku: 'SJT-SP-TAB-120',
    shopifyVariantId: 'gid://shopify/ProductVariant/52738357952644',
    productType: 'HERBAL_SUPPLEMENT',
    name: 'Spirulina 120 Tablets',
    price: 550,
    mrp: 699
  },
  {
    amazonSku: 'SJT-SB-CAP-60',
    shopifySku: 'SJT-SB-CAP-60',
    shopifyVariantId: 'gid://shopify/ProductVariant/52738358018180',
    productType: 'HERBAL_SUPPLEMENT',
    name: 'Sea Buckthorn 60 Capsules',
    price: 649,
    mrp: 799
  },
  {
    amazonSku: 'SJT-BR-CRM-50G',
    shopifySku: 'SJT-BR-CRM-50G',
    shopifyVariantId: 'gid://shopify/ProductVariant/52738358345860',
    productType: 'SKIN_MOISTURIZER',
    name: 'Bridal Luxury Cream 50g',
    price: 1199,
    mrp: 1499
  },
  {
    amazonSku: 'SJT-SP-OIL-50ML',
    shopifySku: 'SJT-SP-OIL-50ML',
    shopifyVariantId: 'gid://shopify/ProductVariant/52738358378628',
    productType: 'HAIR_STYLING_AGENT',
    name: 'Spirulina Hair Oil 50ml',
    price: 250,
    mrp: 349
  },
  {
    amazonSku: 'SJT-SP-SHP-100ML',
    shopifySku: 'SJT-SP-SHP-100ML',
    shopifyVariantId: 'gid://shopify/ProductVariant/52738358411396',
    productType: 'SHAMPOO',
    name: 'Spirulina 2-in-1 Shampoo 100ml',
    price: 250,
    mrp: 399
  },
  {
    amazonSku: 'SJT-COMBO-SP120-SB60',
    shopifySku: 'SJT-COMBO-SP120-SB60',
    shopifyVariantId: 'gid://shopify/ProductVariant/52738358476932',
    productType: 'HERBAL_SUPPLEMENT',
    name: 'Combo (Spirulina 120T + Sea Buckthorn 60C)',
    price: 1099,
    mrp: 1498
  }
];

async function updateAmazon(token) {
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  console.log('\n======================================================');
  console.log('📦 1. UPDATING AMAZON SP-API (PRICE & MRP)');
  console.log('======================================================');

  for (const item of TARGETS) {
    console.log(`\nPushing Amazon SKU [${item.amazonSku}]: Price: ₹${item.price} | MRP: ₹${item.mrp}`);
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(item.amazonSku)}?marketplaceIds=${marketId}`;
    const payload = {
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
        headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`   HTTP ${res.status} | Status: ${data.status} | Submission: ${data.submissionId}`);
    } catch (e) {
      console.error(`   Error on ${item.amazonSku}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 1200));
  }
}

async function updateShopify() {
  const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  console.log('\n======================================================');
  console.log('🛍️ 2. UPDATING SHOPIFY STOREFRONT (PRICE & COMPARE-AT-PRICE)');
  console.log('======================================================');

  for (const item of TARGETS) {
    if (!item.shopifyVariantId) continue;
    const numericId = item.shopifyVariantId.split('/').pop();
    console.log(`\nUpdating Shopify SKU [${item.shopifySku}] (ID: ${numericId}): Price: ₹${item.price} | MRP: ₹${item.mrp}`);

    const url = `https://${domain}/admin/api/2024-01/variants/${numericId}.json`;
    const payload = {
      variant: {
        id: parseInt(numericId),
        price: item.price.toFixed(2),
        compare_at_price: item.mrp.toFixed(2)
      }
    };

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token
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
  await updateAmazon(amzToken);
  await updateShopify();
  console.log('\n🎉 ALL TARGET PRICES & MRPS SUCCESSFULLY SYNCHRONIZED ACROSS AMAZON & SHOPIFY!');
}

main();
