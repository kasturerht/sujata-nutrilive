// scripts/deep-amazon-combos-audit.mjs
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      process.env[trimmed.substring(0, idx).trim()] = val;
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

const COMBO_SKUS = [
  'SJT-CMBO-HL-1M',
  'SJT-CMBO-HL-2M',
  'SJT-CMBO-HL-3M',
  'SJT-COMBO-SP90-SB60',
  'SJT-COMBO-SP120-SB60'
];

async function runAudit() {
  const token = await getAmazonToken();
  const sellerId = process.env.AMAZON_SELLER_ID;
  const marketId = process.env.AMAZON_MARKETPLACE_ID;
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT;

  console.log('========================================================================');
  console.log('🔬 DEEP AUDIT: ALL 5 SPIRULINA + SEA BUCKTHORN COMBOS ON AMAZON INDIA');
  console.log('========================================================================\n');

  const results = [];

  for (const sku of COMBO_SKUS) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues,offers,fulfillmentAvailability`;
    try {
      const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
      const data = await res.json();

      if (res.status === 200) {
        const summary = data.summaries?.[0] || {};
        const attrs = data.attributes || {};
        const offers = data.offers || [];
        const avail = data.fulfillmentAvailability?.[0]?.quantity;

        const info = {
          sku,
          asin: summary.asin,
          status: summary.status,
          title: summary.itemName,
          productType: summary.productType,
          itemForm: attrs.item_form?.[0]?.value,
          unitCount: attrs.unit_count?.[0]?.value,
          unitCountType: attrs.unit_count?.[0]?.type,
          price: offers[0]?.price?.amount || 'N/A',
          currency: offers[0]?.price?.currencyCode || 'INR',
          fulfillmentQty: avail !== undefined ? avail : 'N/A',
          mainImage: attrs.main_product_image_locator?.[0]?.media_location,
          otherImages: attrs.other_product_image_locator_1?.map(i => i.media_location) || [],
          variationTheme: attrs.variation_theme?.[0]?.value || 'NONE',
          parentAsin: summary.parentAsin || 'NONE',
          issuesCount: data.issues?.length || 0,
          issues: data.issues?.map(i => `${i.attributeName}: ${i.message}`) || []
        };
        results.push(info);

        console.log(`------------------------------------------------------------------------`);
        console.log(`📦 SKU: ${sku} | ASIN: ${info.asin}`);
        console.log(`   🏷️ Status: [${info.status.join(', ')}]`);
        console.log(`   📝 Title: ${info.title}`);
        console.log(`   💊 Item Form: ${info.itemForm || 'N/A'}`);
        console.log(`   💰 Price: ₹${info.price} | Qty: ${info.fulfillmentQty}`);
        console.log(`   🖼️ Main Image: ${info.mainImage || 'N/A'}`);
        console.log(`   🔗 Parent ASIN: ${info.parentAsin} | Variation Theme: ${info.variationTheme}`);
        if (info.issuesCount > 0) {
          console.log(`   ⚠️ Issues (${info.issuesCount}):`, info.issues);
        }
      } else {
        console.log(`❌ SKU: ${sku} | HTTP ${res.status}: ${JSON.stringify(data)}`);
      }

      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.log(`💥 SKU: ${sku} Exception: ${e.message}`);
    }
  }

  fs.writeFileSync('scripts/amazon_combos_deep_audit.json', JSON.stringify(results, null, 2));
}

runAudit();
