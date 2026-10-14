// scripts/test-amazon-search.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const env = Object.fromEntries(fs.readFileSync(path.join(rootDir, '.env'), 'utf8').split('\n').filter(l => l.includes('=')).map(l => {
  const [k, ...v] = l.split('=');
  return [k.trim(), v.join('=').trim().replace(/^[\"']|[\"']$/g, '')];
}));

async function run() {
  const tokenRes = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.AMAZON_REFRESH_TOKEN,
      client_id: env.AMAZON_LWA_CLIENT_ID,
      client_secret: env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const tData = await tokenRes.json();
  const marketplaceId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';

  const queries = [
    'Sujata Premium Spirulina Capsules',
    'Sujata Spirulina Capsules',
    'Sujata Nutrilive Spirulina Capsules'
  ];

  for (const q of queries) {
    console.log(`\n=== SEARCHING: "${q}" ===`);
    const url = `https://sellingpartnerapi-eu.amazon.com/catalog/2022-04-01/items?marketplaceIds=${marketplaceId}&keywords=${encodeURIComponent(q)}&includedData=summaries,images`;
    const res = await fetch(url, { headers: { 'x-amz-access-token': tData.access_token } });
    const data = await res.json();
    console.log(`Found ${data.items?.length || 0} items:`);
    (data.items || []).slice(0, 5).forEach((it, idx) => {
      console.log(`  ${idx+1}. ASIN: ${it.asin} | Brand: ${it.summaries?.[0]?.brand} | Title: ${it.summaries?.[0]?.itemName}`);
    });
  }
}

run().catch(console.error);
