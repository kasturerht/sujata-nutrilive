// scripts/inspect-relationship-full.mjs
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

async function inspectRelationship() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const url = `${endpoint}/definitions/2020-09-01/productTypes/HERBAL_SUPPLEMENT?marketplaceIds=${marketId}&sellerId=${sellerId}&requirements=LISTING`;
  const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
  const data = await res.json();
  const sRes = await fetch(data.schema.link.resource);
  const schema = await sRes.json();

  console.log('=== child_parent_sku_relationship ===');
  console.log(JSON.stringify(schema.properties.child_parent_sku_relationship, null, 2));

  console.log('=== parentage_level ===');
  console.log(JSON.stringify(schema.properties.parentage_level, null, 2));
}

inspectRelationship().catch(console.error);
