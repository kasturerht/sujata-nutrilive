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

async function getAccessToken() {
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

const ALL_SKUS = [
  // 1. Flagship Supplements
  { sku: 'L5-UK79-BHXE', name: 'Spirulina Powder 100g' },
  { sku: '8X-HQKV-14T7', name: 'Spirulina Tablets 60s' },
  { sku: 'SJT-SP-TAB-120', name: 'Spirulina Tablets 120s' },
  { sku: 'AB01', name: 'Spirulina Capsules 60s' },
  { sku: 'SJT-SP-CAP-120', name: 'Spirulina Capsules 120s' },
  { sku: 'SJT-SP-CAP-180', name: 'Spirulina Capsules 180s' },
  { sku: 'SJT-SB-CAP-60', name: 'Sea Buckthorn Capsules 60s' },
  { sku: 'SJT-SHIL-CAP-60', name: 'Shilajit Capsules 60s' },
  { sku: 'SJT-B12-CAP-90', name: 'Plant B12 Capsules 90s' },
  { sku: 'SJT-MOR-PWD-100G', name: 'Moringa Leaf Powder 100g' },
  
  // 2. Personal Care & Cosmetics
  { sku: 'SJT-SP-FW-100ML', name: 'Spirulina Face Wash 100ml' },
  { sku: 'AB29', name: 'Spirulina Face Pack 50g' },
  { sku: 'SJT-SP-SOAP-100G', name: 'SpiruGlow Bath Soap 100g' },
  { sku: 'SJT-SP-SOAP-5PK', name: 'SpiruGlow Bath Soap Pack of 5' },
  { sku: 'SJT-SP-SOAP-10PK', name: 'SpiruGlow Bath Soap Pack of 10' },
  { sku: 'SJT-SP-KC-50G', name: 'Korean Glass Skin Cream 50g' },
  { sku: 'SJT-BR-CRM-50G', name: 'Bridal Radiance Cream 50g' },
  { sku: 'SJT-SP-OIL-50ML', name: 'Herbal Hair Oil 50ml' },
  { sku: 'SJT-SP-SHP-100ML', name: '2-in-1 Shampoo Conditioner 100ml' },
  
  // 3. Synergistic Combos
  { sku: 'SJT-COMBO-SP90-SB60', name: 'Super Immunity Combo (90T+60C)' },
  { sku: 'SJT-COMBO-SP120-SB60', name: 'Immunity Power Combo (120T+60C)' },
  { sku: 'SJT-CMBO-HL-1M', name: 'Healthy Life Combo 1-Month' },
  { sku: 'SJT-CMBO-HL-2M', name: 'Healthy Life Combo 2-Month' },
  { sku: 'SJT-CMBO-HL-3M', name: 'Healthy Life Combo 3-Month' }
];

async function deepAudit() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  console.log('========================================================================');
  console.log(`🔬 SUJATA NUTRILIVE: 100% DEEP ACCURACY AUDIT ON AMAZON INDIA`);
  console.log(`📍 Time: ${new Date().toISOString()} | Total Catalog: ${ALL_SKUS.length} SKUs`);
  console.log('========================================================================\n');

  const auditResults = [];

  for (const item of ALL_SKUS) {
    const sku = item.sku;
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues,offers,fulfillmentAvailability`;
    
    try {
      const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
      const data = await res.json();
      
      if (res.status === 200) {
        const summary = data.summaries?.[0] || {};
        const attrs = data.attributes || {};
        const issues = data.issues || [];
        const offers = data.offers || [];
        const avail = data.fulfillmentAvailability || [];

        const asin = summary.asin || 'N/A';
        const statuses = summary.status || [];
        const itemName = summary.itemName || attrs.item_name?.[0]?.value || item.name;
        
        // Price detection
        const configuredPrice = attrs.purchasable_offer?.[0]?.our_price?.[0]?.schedule?.[0]?.value_with_tax;
        const configuredMrp = attrs.purchasable_offer?.[0]?.maximum_retail_price?.[0]?.schedule?.[0]?.value_with_tax;
        const offerPrice = configuredPrice || offers[0]?.price?.amount;
        const mrp = configuredMrp || offers[0]?.regularPrice?.amount;

        // Stock quantity
        const quantity = avail[0]?.quantity ?? 'N/A';

        // Image check
        const mainImage = attrs.main_product_image_locator?.[0]?.media_location || summary.mainImage?.link;
        let otherImagesCount = 0;
        for (let i = 1; i <= 8; i++) {
          if (attrs[`other_product_image_locator_${i}`]) otherImagesCount++;
        }

        const criticalIssues = issues.filter(i => i.severity === 'ERROR');
        const warningIssues = issues.filter(i => i.severity === 'WARNING');

        auditResults.push({
          sku,
          name: item.name,
          asin,
          statuses: Array.isArray(statuses) ? statuses.join(', ') : statuses,
          price: offerPrice || 'N/A',
          mrp: mrp || 'N/A',
          quantity,
          hasMainImage: !!mainImage,
          otherImagesCount,
          criticalErrors: criticalIssues.length,
          criticalDetails: criticalIssues.map(i => `${i.code}: ${i.message}`).join('; '),
          warnings: warningIssues.length,
          title: itemName
        });

        console.log(`[${sku}] ASIN: ${asin} | Status: ${Array.isArray(statuses) ? statuses.join(', ') : statuses} | ₹${offerPrice} (MRP: ₹${mrp}) | Stock: ${quantity}`);
        if (criticalIssues.length > 0) {
          console.log(`   ❌ Critical Issues (${criticalIssues.length}): ${criticalIssues.map(i => i.code).join(', ')}`);
        } else {
          console.log(`   ✅ Clean / Healthy Listing!`);
        }
      } else {
        console.log(`[${sku}] ❌ HTTP ${res.status}: ${JSON.stringify(data.errors || data.message)}`);
        auditResults.push({
          sku,
          name: item.name,
          asin: 'ERROR',
          statuses: `HTTP_${res.status}`,
          criticalErrors: 1,
          criticalDetails: JSON.stringify(data.errors || data.message)
        });
      }
    } catch (err) {
      console.error(`[${sku}] Exception:`, err.message);
    }

    await new Promise(r => setTimeout(r, 600));
  }

  // Save full audit report
  fs.writeFileSync('data/amazon-deep-audit-results.json', JSON.stringify(auditResults, null, 2));
  console.log('\n========================================================================');
  console.log(`Audit complete! Saved to data/amazon-deep-audit-results.json`);
  console.log('========================================================================');
}

deepAudit().catch(console.error);
