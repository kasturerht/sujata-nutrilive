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

async function testShopify() {
  const query = `
    query getCatalog {
      products(first: 30) {
        edges {
          node {
            id
            title
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  compareAtPrice
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({ query })
    });

    const data = await res.json();
    if (data.data?.products) {
      console.log('✅ Shopify Admin API Connected successfully!\n');
      for (const p of data.data.products.edges) {
        for (const v of p.node.variants.edges) {
          console.log(`[${v.node.sku || 'NO-SKU'}] (ID: ${v.node.id}) ${p.node.title} - ${v.node.title} | Price: ₹${v.node.price} | MRP: ₹${v.node.compareAtPrice || 'N/A'}`);
        }
      }
    } else {
      console.error('Error response:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testShopify();
