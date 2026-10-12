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

async function lookupEnums(productType, props) {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const url = `${endpoint}/definitions/2020-09-01/productTypes/${productType}?marketplaceIds=${marketId}&sellerId=${sellerId}&requirements=LISTING`;
  const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
  const data = await res.json();
  if (data.schema?.link?.resource) {
    const sRes = await fetch(data.schema.link.resource);
    const schema = await sRes.json();
    console.log(`\n================== ${productType} ==================`);
    props.forEach(p => {
      const prop = schema.properties[p];
      if (prop) {
        console.log(`\n--- Property: ${p} ---`);
        const itemProp = prop.items?.properties?.value || prop.items?.properties?.unit || prop.items;
        console.log('Type:', itemProp?.type);
        if (itemProp?.enum) console.log('Enums:', itemProp.enum.slice(0, 15));
        if (itemProp?.examples) console.log('Examples:', itemProp.examples);
        if (prop.items?.properties?.unit) console.log('Unit enums:', prop.items.properties.unit.enum);
      }
    });
  }
}

async function main() {
  await lookupEnums('SKIN_CLEANING_AGENT', ['lifestyle', 'skin_type', 'target_audience_keyword', 'batteries_required', 'is_heat_sensitive', 'safety_warning']);
  await lookupEnums('SHAMPOO', ['target_gender', 'hair_type', 'item_volume']);
}

main().catch(console.error);
