import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
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

const WORKING_SKUS = ['8X-HQKV-14T7', 'SJT-SB-CAP-60', 'L5-UK79-BHXE', 'SJT-SP-TAB-120', 'SJT-SP-CAP-120'];
const UNAVAIL_SKUS = ['SJT-SP-CAP-180', 'SJT-B12-CAP-90', 'SJT-MOR-PWD-100G', 'SJT-COMBO-SP90-SB60', 'SJT-SP-SOAP-5PK', 'SJT-SP-SOAP-10PK', 'SJT-SP-SHP-100ML'];

async function deepCompare() {
  const token = await getAmazonToken();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  async function fetchItem(sku) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=attributes,issues,offers,fulfillmentAvailability,summaries`;
    const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
    return await res.json();
  }

  console.log("=== CHECKING WORKING ITEMS ===");
  for (const sku of WORKING_SKUS) {
    const d = await fetchItem(sku);
    console.log(`SKU: ${sku}, ProductType: ${d.summaries?.[0]?.productType}, Status: ${d.summaries?.[0]?.status}, Issues: ${d.issues?.length || 0}`);
  }

  console.log("\n=== CHECKING UNAVAILABLE ITEMS ===");
  for (const sku of UNAVAIL_SKUS) {
    const d = await fetchItem(sku);
    console.log(`SKU: ${sku}, ProductType: ${d.summaries?.[0]?.productType}, Status: ${d.summaries?.[0]?.status}, Issues: ${d.issues?.length || 0}`);
    if (d.issues && d.issues.length > 0) {
      console.log(`   Issues:`, JSON.stringify(d.issues));
    }
  }
}

deepCompare();
