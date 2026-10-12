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

async function inspectAll() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const skus = [
    'L5-UK79-BHXE',
    '8X-HQKV-14T7',
    'SJT-SP-TAB-120',
    'AB01',
    'SJT-SP-CAP-120',
    'SJT-SP-CAP-180',
    'SJT-SB-CAP-60',
    'SJT-SHIL-CAP-60',
    'SJT-B12-CAP-90',
    'SJT-MOR-PWD-100G',
    'SJT-SP-FW-100ML',
    'AB29',
    'SJT-SP-SOAP-100G',
    'SJT-SP-KC-50G',
    'SJT-BR-CRM-50G',
    'SJT-SP-OIL-50ML',
    'AB27',
    'SJT-SP-SHP-100ML',
    'SJT-COMBO-SP90-SB60',
    'SJT-CMBO-HL-1M',
    'SJT-CMBO-HL-2M',
    'SJT-CMBO-HL-3M'
  ];

  console.log('========================================================================');
  console.log(`🔍 SUJATA NUTRILIVE: AMAZON INDIA CATALOG AUDIT (${skus.length} PRODUCTS)`);
  console.log('========================================================================\n');

  let activeCount = 0;
  let reviewingCount = 0;

  for (const sku of skus) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues`;
    const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
    const data = await res.json();
    
    if (res.status === 200) {
      const summary = data.summaries?.[0] || {};
      const status = summary.status || 'INDEXING';
      const asin = summary.asin || 'PENDING';
      const title = summary.itemName || data.attributes?.item_name?.[0]?.value || 'N/A';
      const hasIssues = data.issues && data.issues.length > 0;
      
      console.log(`📦 [${sku}] ASIN: ${asin} | Status: ${status}`);
      console.log(`   Title: "${title.substring(0, 70)}..."`);
      if (hasIssues) {
        const issuesSummary = data.issues.map(i => `[${i.severity}] ${i.code}: ${i.message}`).join(' | ');
        console.log(`   Notice: ${issuesSummary.substring(0, 120)}...`);
        if (issuesSummary.includes('reviewing')) reviewingCount++;
      } else {
        console.log(`   Quality: 100% Clean Listing (Zero Issues)`);
        activeCount++;
      }
      console.log('------------------------------------------------------------------------');
    } else {
      console.log(`❌ [${sku}] Error (${res.status}):`, JSON.stringify(data.errors || data));
      console.log('------------------------------------------------------------------------');
    }

    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\n🏁 AUDIT SUMMARY: Processed ${skus.length} listings.`);
}

inspectAll().catch(console.error);
