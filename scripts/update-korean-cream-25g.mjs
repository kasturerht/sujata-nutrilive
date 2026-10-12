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
const shopifyDomain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const shopifyToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function updateKoreanCream() {
  const amzToken = await getAmazonToken();
  const sku = 'SJT-SP-KC-50G';

  // 1. Amazon Patch
  console.log('Updating Korean Cream on Amazon to 25g...');
  const patchUrl = `https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}`;
  
  const amzTitle = 'Sujata Nutrilive Spirulina Korean Glass Skin Face Cream (25g) | Niacinamide & Multi-Peptides Formula | Dark Spot Corrector, Collagen Boosting & Radiance';

  const patchPayload = {
    productType: 'SKIN_MOISTURIZER',
    patches: [
      {
        op: 'replace',
        path: '/attributes/item_name',
        value: [{ language_tag: 'en_IN', value: amzTitle, marketplace_id: marketId }]
      },
      {
        op: 'replace',
        path: '/attributes/item_weight',
        value: [{ unit: 'grams', value: 25, marketplace_id: marketId }]
      }
    ]
  };

  try {
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { 'x-amz-access-token': amzToken, 'Content-Type': 'application/json' },
      body: JSON.stringify(patchPayload)
    });
    const data = await res.json();
    console.log(`Amazon Korean Cream 25g Patch: HTTP ${res.status} | Status: ${data.status} | Submission: ${data.submissionId}`);
  } catch (e) {
    console.error('Amazon error:', e.message);
  }

  // 2. Shopify Variant Title & Product Title Update
  console.log('Updating Korean Cream on Shopify to 25g...');
  try {
    // Update variant option
    const varUrl = `https://${shopifyDomain}/admin/api/2024-01/variants/52738358313092.json`;
    const varRes = await fetch(varUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': shopifyToken },
      body: JSON.stringify({
        variant: {
          id: 52738358313092,
          title: '25g Luxury Jar',
          option1: '25g Luxury Jar',
          grams: 25,
          weight: 25,
          weight_unit: 'g'
        }
      })
    });
    const varData = await varRes.json();
    console.log(`Shopify Variant 25g: HTTP ${varRes.status} | Title: ${varData.variant?.title}`);

    // Update product title
    const prodId = varData.variant?.product_id;
    if (prodId) {
      const prodUrl = `https://${shopifyDomain}/admin/api/2024-01/products/${prodId}.json`;
      const prodRes = await fetch(prodUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': shopifyToken },
        body: JSON.stringify({
          product: {
            id: prodId,
            title: 'Sujata Spirulina Korean Cream (Glass Skin & Dark Spot Corrector - 25g)'
          }
        })
      });
      const prodData = await prodRes.json();
      console.log(`Shopify Product 25g: HTTP ${prodRes.status} | Title: ${prodData.product?.title}`);
    }
  } catch (e) {
    console.error('Shopify error:', e.message);
  }
}

updateKoreanCream();
