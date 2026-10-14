// scripts/inspect-spiru-swastha-asin.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const env = Object.fromEntries(fs.readFileSync(path.join(rootDir, '.env'), 'utf8').split('\n').filter(l => l.includes('=')).map(l => {
  const [k, ...v] = l.split('=');
  return [k.trim(), v.join('=').trim().replace(/^["']|["']$/g, '')];
}));

async function inspectSpiru() {
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
  const url = `https://sellingpartnerapi-eu.amazon.com/catalog/2022-04-01/items/B0DYVKLH52?marketplaceIds=${env.AMAZON_MARKETPLACE_ID}&includedData=attributes,summaries,images,productTypes,relationships`;
  const res = await fetch(url, { headers: { 'x-amz-access-token': tData.access_token } });
  const data = await res.json();
  console.log('=== FULL CATALOG FOR B0DYVKLH52 ===');
  console.log(JSON.stringify(data, null, 2));
}

inspectSpiru().catch(console.error);
