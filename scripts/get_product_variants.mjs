// scripts/get_product_variants.mjs
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

const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const storefrontToken = env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '7e0a0176aede63ce4c6b199e18684018';

async function getVariants() {
  const query = `
    query {
      product(handle: "sujata-spirulina-sea-buckthorn-combo-pack") {
        id
        title
        handle
        availableForSale
        variants(first: 10) {
          edges {
            node {
              id
              title
              price {
                amount
              }
              availableForSale
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
  console.log('Product data:', JSON.stringify(data, null, 2));

  // Now test checkout with the REAL variant ID
  const variantId = data?.data?.product?.variants?.edges?.[0]?.node?.id;
  if (variantId) {
    console.log('Testing cartCreate with real variant ID:', variantId);
    const cartRes = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken
      },
      body: JSON.stringify({
        query: `
          mutation {
            cartCreate(input: {
              lines: [{ quantity: 1, merchandiseId: "${variantId}" }]
            }) {
              cart { id checkoutUrl }
              userErrors { field message }
            }
          }
        `
      })
    });
    const cartData = await cartRes.json();
    console.log('Cart create result:', JSON.stringify(cartData, null, 2));
    const chkUrl = cartData?.data?.cartCreate?.cart?.checkoutUrl;
    if (chkUrl) {
      console.log('Checkout URL is:', chkUrl);
      const testRes = await fetch(chkUrl, { redirect: 'manual' });
      console.log('Checkout URL status:', testRes.status);
      console.log('Checkout Location:', testRes.headers.get('location'));
    }
  }
}

getVariants().catch(console.error);
