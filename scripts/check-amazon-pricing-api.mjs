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

async function checkPricing() {
  const token = await getAccessToken();
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const asin = 'B0DNSXGGTN';

  const url = `${endpoint}/products/pricing/v0/price?MarketplaceId=${marketId}&ItemType=Asin&Asins=${asin}`;
  const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
  const data = await res.json();
  console.log('Pricing API Response for B0DNSXGGTN:');
  console.log(JSON.stringify(data, null, 2));
}

checkPricing().catch(console.error);
