// scripts/generate-gmb-csv.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.substring(0, idx).trim()] = val;
    }
  }
  return env;
}

const env = loadEnv();
const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const storefrontToken = env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '7e0a0176aede63ce4c6b199e18684018';
const siteUrl = (env.PUBLIC_SITE_URL || 'https://www.sujatanutrilive.com').replace(/\/$/, '');

function cleanText(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').replace(/"/g, '""').trim();
}

async function run() {
  const query = `
    query GoogleProducts {
      products(first: 50) {
        edges {
          node {
            id
            handle
            title
            description
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  sku
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  const products = data?.data?.products?.edges || [];

  console.log(`Fetched ${products.length} products from Shopify.`);

  // 1. Generate CSV Headers
  const csvHeaders = ['id', 'title', 'description', 'link', 'image_link', 'availability', 'price', 'brand', 'condition', 'google_product_category'];
  const csvRows = [csvHeaders.join(',')];

  const jsonProducts = [];

  for (const edge of products) {
    const p = edge.node;
    if (!p || !p.handle) continue;

    const variant = p.variants?.edges?.[0]?.node;
    const rawPrice = variant?.price?.amount || p.priceRange?.minVariantPrice?.amount || '499.00';
    const price = `${parseFloat(rawPrice).toFixed(2)} INR`;
    const link = `${siteUrl}/product/${p.handle}`;
    const rawImg = p.featuredImage?.url || `${siteUrl}/products/sujata-spirulina-powder-pouch.jpg`;
    const imageLink = rawImg.startsWith('http') ? rawImg : `${siteUrl}${rawImg}`;
    const id = variant?.id?.replace('gid://shopify/ProductVariant/', '') || p.handle;
    const title = p.title.replace(/"/g, '""');
    const desc = cleanText(p.description) || `Authentic ${title} from Sujata Nutrilive. 100% natural, lab tested with fast express shipping.`;

    // CSV Row
    csvRows.push(`"${id}","${title}","${desc}","${link}","${imageLink}","in_stock","${price}","Sujata Nutrilive","new","Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements"`);

    // JSON Object
    jsonProducts.push({
      id,
      title: p.title,
      description: cleanText(p.description),
      link,
      image_link: imageLink,
      availability: 'in_stock',
      price,
      brand: 'Sujata Nutrilive',
      condition: 'new',
      category: 'Health & Beauty > Health Care > Fitness & Nutrition > Vitamins & Supplements'
    });
  }

  // Save CSV to public/
  const csvPath = path.resolve(__dirname, '..', 'public', 'sujata-products-gmb-gmc.csv');
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
  console.log(`✅ Saved CSV feed to: ${csvPath}`);

  // Save JSON to public/
  const jsonPath = path.resolve(__dirname, '..', 'public', 'sujata-products-gmb.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonProducts, null, 2), 'utf8');
  console.log(`✅ Saved JSON feed to: ${jsonPath}`);
}

run().catch(console.error);
