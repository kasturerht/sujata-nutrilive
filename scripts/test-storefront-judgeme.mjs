import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      process.env[trimmed.substring(0, idx).trim()] = val;
    }
  }
}
loadEnv();

const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const storefrontAccessToken = process.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '7e0a0176aede63ce4c6b199e18684018';

async function testStorefrontMetafields() {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        judgemeBadge: metafield(namespace: "judgeme", key: "badge") { value }
        judgemeWidget: metafield(namespace: "judgeme", key: "widget") { value }
        reviewsRating: metafield(namespace: "reviews", key: "rating") { value }
        reviewsCount: metafield(namespace: "reviews", key: "rating_count") { value }
      }
    }
  `;
  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken
    },
    body: JSON.stringify({ query, variables: { handle: 'sujata-spirulina-tablets' } })
  });
  const data = await res.json();
  console.log('Storefront response:');
  console.log(JSON.stringify(data, null, 2));
}
testStorefrontMetafields().catch(console.error);
