import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.substring(0, idx).trim()] = val;
    }
  }
  return env;
}
const env = loadEnv();

const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const clientId = env.SHOPIFY_CLIENT_ID;
const clientSecret = env.SHOPIFY_CLIENT_SECRET;

async function getAdminToken() {
  const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    })
  });
  const oData = await oRes.json();
  return oData.access_token;
}

async function run() {
  const token = await getAdminToken();

  const mutation = `
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          title
          price
          compareAtPrice
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    productId: "gid://shopify/Product/10473731162244",
    variants: [
      {
        id: "gid://shopify/ProductVariant/52759081779332",
        price: "1050.00",
        compareAtPrice: "1598.00",
        optionValues: [
          {
            optionId: "gid://shopify/ProductOption/13058691072132",
            name: "1-Month Pack"
          }
        ]
      },
      {
        id: "gid://shopify/ProductVariant/52759081812100",
        price: "1700.00",
        compareAtPrice: "3196.00",
        optionValues: [
          {
            optionId: "gid://shopify/ProductOption/13058691072132",
            name: "2-Month Pack (+ 2 Free Soaps)"
          }
        ]
      },
      {
        id: "gid://shopify/ProductVariant/52759081844868",
        price: "2400.00",
        compareAtPrice: "4794.00",
        optionValues: [
          {
            optionId: "gid://shopify/ProductOption/13058691072132",
            name: "3-Month Mega Pack (+ Free Chikki)"
          }
        ]
      }
    ]
  };

  const res = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query: mutation, variables })
  });
  const data = await res.json();
  console.log('Update Result:');
  console.log(JSON.stringify(data, null, 2));
}

run().catch(console.error);
