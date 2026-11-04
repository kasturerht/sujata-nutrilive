import fs from 'fs';
import path from 'path';

// 1. Load .env
const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

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

const ALL_AMAZON_SKUS = [
  { sku: 'L5-UK79-BHXE', name: 'Spirulina Powder 100g' },
  { sku: '8X-HQKV-14T7', name: 'Spirulina Tablets 60' },
  { sku: 'SJT-SP-TAB-120', name: 'Spirulina Tablets 120' },
  { sku: 'AB01', name: 'Spirulina Capsules 60' },
  { sku: 'SJT-SP-CAP-120', name: 'Spirulina Capsules 120' },
  { sku: 'SJT-SP-CAP-180', name: 'Spirulina Capsules 180' },
  { sku: 'SJT-SB-CAP-60', name: 'Sea Buckthorn Capsules 60' },
  { sku: 'SJT-B12-CAP-90', name: 'Vitamin B12 Capsules 90' },
  { sku: 'SJT-SHIL-CAP-60', name: 'Shilajit Capsules 60' },
  { sku: 'SJT-MOR-PWD-100G', name: 'Moringa Powder 100g' },
  { sku: 'SJT-CMBO-HL-1M', name: 'Healthy Life Combo 1 Month' },
  { sku: 'SJT-CMBO-HL-2M', name: 'Healthy Life Combo 2 Month' },
  { sku: 'SJT-CMBO-HL-3M', name: 'Healthy Life Combo 3 Month' },
  { sku: 'SJT-COMBO-SP90-SB60', name: 'Spirulina 90 + SeaBuckthorn 60' },
  { sku: 'SJT-COMBO-SP120-SB60', name: 'Spirulina 120 + SeaBuckthorn 60' },
  { sku: 'SJT-SP-SOAP-100G', name: 'Spirulina Soap 100g' },
  { sku: 'SJT-SP-SOAP-5PK', name: 'Spirulina Soap 5-Pack' },
  { sku: 'SJT-SP-SOAP-10PK', name: 'Spirulina Soap 10-Pack' },
  { sku: 'SJT-SP-KC-50G', name: 'Spirulina Cream 50g' },
  { sku: 'SJT-SP-OIL-50ML', name: 'Spirulina Hair Oil 50ml' },
  { sku: 'SJT-SP-SHP-100ML', name: 'Spirulina Shampoo 100ml' }
];

async function auditAllAmazon() {
  console.log("=== 🔍 FORENSIC AUDIT OF ALL AMAZON PRODUCTS ===");
  const token = await getAmazonToken();
  if (!token) {
    console.error("❌ Failed to obtain Amazon SP-API token");
    return;
  }

  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const results = [];

  for (const item of ALL_AMAZON_SKUS) {
    try {
      const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(item.sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues,offers`;
      const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
      
      if (res.status === 200) {
        const data = await res.json();
        const summary = data.summaries?.[0] || {};
        const asin = summary.asin || 'N/A';
        const status = summary.status || [];
        const itemName = summary.itemName || data.attributes?.item_name?.[0]?.value || item.name;
        const mainImage = data.attributes?.main_product_image_locator?.[0]?.media_location ? 'YES' : 'NO';
        const fulfillmentAvail = data.attributes?.fulfillment_availability?.[0]?.quantity;
        const issues = (data.issues || []).map(i => `[${i.severity}] ${i.message}`);

        // Offer price
        const price = data.offers?.[0]?.price?.amount || data.attributes?.purchasable_offer?.[0]?.currency_amount?.value || 'N/A';

        results.push({
          sku: item.sku,
          name: itemName,
          asin: asin,
          status: status.join(', '),
          isDiscoverable: status.includes('DISCOVERABLE'),
          isBuyable: status.includes('BUYABLE'),
          stock: fulfillmentAvail !== undefined ? fulfillmentAvail : 'Unspecified',
          price: price,
          hasMainImage: mainImage,
          issuesCount: issues.length,
          issues: issues
        });
      } else if (res.status === 404) {
        results.push({
          sku: item.sku,
          name: item.name,
          asin: 'NOT_FOUND',
          status: '404 Not Listed on Seller Account',
          isDiscoverable: false,
          isBuyable: false,
          issuesCount: 0,
          issues: []
        });
      } else {
        const text = await res.text();
        results.push({
          sku: item.sku,
          name: item.name,
          asin: 'ERROR',
          status: `HTTP ${res.status}`,
          error: text.substring(0, 100),
          isDiscoverable: false,
          isBuyable: false,
          issuesCount: 0,
          issues: []
        });
      }
      await new Promise(r => setTimeout(r, 250));
    } catch (err) {
      results.push({
        sku: item.sku,
        name: item.name,
        asin: 'EXCEPTION',
        status: err.message,
        isDiscoverable: false,
        isBuyable: false,
        issuesCount: 0,
        issues: []
      });
    }
  }

  console.log("\n=========================================================================================");
  console.log("📊 FORENSIC AUDIT TABLE: AMAZON CATALOG (REAL-TIME SP-API)");
  console.log("=========================================================================================");
  
  let buyableCount = 0;
  let issueCount = 0;

  results.forEach(r => {
    const buyableFlag = r.isBuyable ? "✅ BUYABLE" : "❌ NOT BUYABLE";
    if (r.isBuyable) buyableCount++;
    if (r.issuesCount > 0) issueCount++;

    console.log(`SKU: ${r.sku.padEnd(22)} | ASIN: ${(r.asin || '').padEnd(12)} | Status: ${buyableFlag} (${r.status}) | Stock: ${String(r.stock).padEnd(5)} | Price: ₹${r.price}`);
    if (r.issuesCount > 0) {
      console.log(`   ⚠️ ISSUES (${r.issuesCount}):`);
      r.issues.forEach(iss => console.log(`      - ${iss}`));
    }
  });

  console.log("=========================================================================================");
  console.log(`Total SKUs Checked: ${results.length} | Buyable: ${buyableCount} | Issues Detected: ${issueCount}`);

  fs.writeFileSync('reports/amazon_catalog_deep_audit.json', JSON.stringify(results, null, 2), 'utf8');
}

auditAllAmazon().catch(console.error);
