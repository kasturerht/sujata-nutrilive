// scripts/check-all-seller-listings.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envPath = path.join(rootDir, '.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

async function checkAll() {
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
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketplaceId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';

  // Search catalog items for seller or search catalog items for "Spirulina"
  const catUrl = `https://sellingpartnerapi-eu.amazon.com/catalog/2022-04-01/items?marketplaceIds=${marketplaceId}&keywords=Sujata+Spirulina&includedData=summaries,images`;
  const res = await fetch(catUrl, {
    headers: { 'x-amz-access-token': tData.access_token }
  });
  const data = await res.json();
  console.log('=== CATALOG SEARCH RESULTS FOR "Sujata Spirulina" ===');
  console.log(`Found: ${data.items?.length || 0} items`);
  (data.items || []).forEach(it => {
    console.log(`ASIN: ${it.asin}`);
    console.log(`  Brand: ${it.summaries?.[0]?.brand}`);
    console.log(`  Title: ${it.summaries?.[0]?.itemName}`);
    console.log(`  Main Image: ${it.images?.[0]?.images?.find(i => i.variant === 'MAIN')?.link}`);
  });

  // Also search for "Spiru Swastha"
  const spiruUrl = `https://sellingpartnerapi-eu.amazon.com/catalog/2022-04-01/items?marketplaceIds=${marketplaceId}&keywords=Spiru+Swastha&includedData=summaries,images`;
  const spiruRes = await fetch(spiruUrl, {
    headers: { 'x-amz-access-token': tData.access_token }
  });
  const spiruData = await spiruRes.json();
  console.log('\n=== CATALOG SEARCH RESULTS FOR "Spiru Swastha" ===');
  console.log(`Found: ${spiruData.items?.length || 0} items`);
  (spiruData.items || []).forEach(it => {
    console.log(`ASIN: ${it.asin}`);
    console.log(`  Brand: ${it.summaries?.[0]?.brand}`);
    console.log(`  Title: ${it.summaries?.[0]?.itemName}`);
    console.log(`  Main Image: ${it.images?.[0]?.images?.find(i => i.variant === 'MAIN')?.link}`);
  });
}

checkAll().catch(console.error);
