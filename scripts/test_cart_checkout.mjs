import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
}
const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

async function check() {
  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({
      query: `{ products(first: 1) { edges { node { variants(first: 1) { edges { node { id title } } } } } } }`
    })
  });
  const data = await res.json();
  const variantId = data?.data?.products?.edges[0]?.node?.variants?.edges[0]?.node?.id;
  console.log('Valid variant ID:', variantId);

  const cartRes = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({
      query: `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: { input: { lines: [{ quantity: 1, merchandiseId: variantId }] } }
    })
  });
  const cartData = await cartRes.json();
  const checkoutUrl = cartData?.data?.cartCreate?.cart?.checkoutUrl;
  console.log('Cart Checkout URL:', checkoutUrl);

  if (checkoutUrl) {
    const pageRes = await fetch(checkoutUrl);
    const html = await pageRes.text();
    console.log('Does checkout HTML contain gokwik?', html.toLowerCase().includes('gokwik'));
    console.log('Does checkout HTML contain kwik?', html.toLowerCase().includes('kwik'));
  }
}
check();
