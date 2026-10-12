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

const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function testRest() {
  const variantId = '52738357887108'; // SJT-SP-TAB-60
  const url = `https://${domain}/admin/api/2024-01/variants/${variantId}.json`;
  
  const payload = {
    variant: {
      id: parseInt(variantId),
      price: '350.00',
      compare_at_price: '400.00'
    }
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log(`Status: ${res.status}`);
  console.log('Shopify REST Response:', JSON.stringify(data, null, 2));
}

testRest();
