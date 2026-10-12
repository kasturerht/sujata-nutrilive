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

async function inspect() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const skus = [
    'L5-UK79-BHXE',
    '8X-HQKV-14T7',
    'AB01',
    'AB27',
    'AB29',
    'Q5-0V1R-OMZI',
    'SJT-SB-CAP-60',
    'SJT-SHIL-CAP-60',
    'SJT-B12-CAP-90',
    'SJT-CMBO-HL-1M',
    'SJT-SP-TAB-120',
    'SJT-MOR-PWD-100G'
  ];

  console.log('Inspecting SKUs on Amazon India...');
  for (const sku of skus) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues`;
    const res = await fetch(url, {
      headers: {
        'x-amz-access-token': token,
        'User-Agent': 'SujataNutrilive/1.0'
      }
    });

    const data = await res.json();
    console.log(`\n------------------------------------------------------------`);
    console.log(`SKU: ${sku} (HTTP ${res.status})`);
    if (res.status === 200) {
      const summary = data.summaries?.[0] || {};
      console.log(`  ASIN: ${summary.asin || 'N/A'}`);
      console.log(`  Status: ${summary.status || 'N/A'}`);
      console.log(`  ProductType: ${summary.productType || 'N/A'}`);
      console.log(`  Title: ${summary.itemName || data.attributes?.item_name?.[0]?.value || 'N/A'}`);
      if (data.issues && data.issues.length > 0) {
        console.log(`  Issues: ${JSON.stringify(data.issues.map(i => ({ code: i.code, msg: i.message, severity: i.severity })))}`);
      } else {
        console.log(`  Issues: None (Clean listing)`);
      }
    } else {
      console.log(`  Response:`, JSON.stringify(data.errors || data.message || data));
    }
  }
}

inspect().catch(console.error);
