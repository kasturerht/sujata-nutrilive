// scripts/check-prices.mjs
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

async function getPrice() {
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
  const url = `https://sellingpartnerapi-eu.amazon.com/products/pricing/v0/price?MarketplaceId=${env.AMAZON_MARKETPLACE_ID}&ItemType=Asin&Asins=B0DYVKLH52,B0GMQYS6M4`;
  const res = await fetch(url, { headers: { 'x-amz-access-token': tData.access_token } });
  const data = await res.json();
  console.log('Prices:', JSON.stringify(data.payload, null, 2));
}

getPrice().catch(console.error);
