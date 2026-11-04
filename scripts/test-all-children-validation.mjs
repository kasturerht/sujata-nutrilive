// scripts/test-all-children-validation.mjs
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

const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

const sizes = {
  'SJT-CMBO-HL-1M': '1-Month Plan (120 Caps)',
  'SJT-CMBO-HL-2M': '2-Month Plan (240 Caps)',
  'SJT-CMBO-HL-3M': '3-Month Plan (360 Caps)'
};

async function testAllChildren() {
  const token = await getAccessToken();
  const fullAudit = JSON.parse(fs.readFileSync('scripts/amazon_hl_audit_full.json', 'utf8'));

  for (const [sku, sizeVal] of Object.entries(sizes)) {
    console.log(`\n🧪 Testing Child PUT for ${sku} (${sizeVal}) with mode=VALIDATION_PREVIEW...`);
    const existingAttrs = fullAudit[sku].attributes;

    const mergedAttrs = {
      ...existingAttrs,
      parentage_level: [{ value: 'child', marketplace_id: marketId }],
      child_parent_sku_relationship: [{
        child_relationship_type: 'variation',
        parent_sku: 'SJT-CMBO-HL-PARENT',
        marketplace_id: marketId
      }],
      variation_theme: [{ name: 'SIZE', marketplace_id: marketId }],
      size: [{ language_tag: 'en_IN', value: sizeVal, marketplace_id: marketId }]
    };

    const payload = {
      productType: 'HERBAL_SUPPLEMENT',
      requirements: 'LISTING',
      attributes: mergedAttrs
    };

    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&mode=VALIDATION_PREVIEW`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'x-amz-access-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(`Result for ${sku} (HTTP ${res.status}):`);
    console.log(`Status: ${data.status} | Issues: ${data.issues?.length || 0}`);
    if (data.issues?.length > 0) {
      console.log('Issues:', JSON.stringify(data.issues, null, 2));
    }
    await new Promise(r => setTimeout(r, 500));
  }
}

testAllChildren().catch(console.error);
