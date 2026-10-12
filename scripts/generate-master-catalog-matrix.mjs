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

const shopifyDomain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const shopifyToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function getShopifyCatalog() {
  const query = `
    query {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            status
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  compareAtPrice
                  availableForSale
                  inventoryQuantity
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${shopifyDomain}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': shopifyToken
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  const map = {};
  if (data.data?.products?.edges) {
    for (const p of data.data.products.edges) {
      for (const v of p.node.variants.edges) {
        const sku = v.node.sku;
        if (sku) {
          map[sku] = {
            productTitle: p.node.title,
            variantTitle: v.node.title,
            handle: p.node.handle,
            price: parseFloat(v.node.price),
            compareAtPrice: v.node.compareAtPrice ? parseFloat(v.node.compareAtPrice) : null,
            status: p.node.status,
            available: v.node.availableForSale,
            inventory: v.node.inventoryQuantity
          };
        }
      }
    }
  }
  return map;
}

async function main() {
  const shopifyMap = await getShopifyCatalog();
  const amazonAuditPath = path.join(rootDir, 'data', 'amazon-deep-audit-results.json');
  let amazonList = [];
  if (fs.existsSync(amazonAuditPath)) {
    amazonList = JSON.parse(fs.readFileSync(amazonAuditPath, 'utf8'));
  }

  console.log(`Loaded ${Object.keys(shopifyMap).length} Shopify SKUs and ${amazonList.length} Amazon items.`);
  
  // Output a structured summary json
  fs.writeFileSync(path.join(rootDir, 'data', 'master-catalog-dump.json'), JSON.stringify({
    shopify: shopifyMap,
    amazon: amazonList
  }, null, 2));
  console.log('Saved master-catalog-dump.json');
}

main();
