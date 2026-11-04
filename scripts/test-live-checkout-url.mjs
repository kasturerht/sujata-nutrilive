// scripts/test-live-checkout-url.mjs
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

async function testCheckout() {
  console.log('Testing Shopify cartCreate...');
  const query = `
    mutation {
      cartCreate(input: {
        lines: [
          {
            quantity: 1,
            merchandiseId: "gid://shopify/ProductVariant/51761596793188"
          }
        ]
      }) {
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
  console.log('Response:', JSON.stringify(data, null, 2));

  const checkoutUrl = data?.data?.cartCreate?.cart?.checkoutUrl;
  if (checkoutUrl) {
    console.log('Checkout URL:', checkoutUrl);
    // Fetch checkoutUrl to check status
    const chkRes = await fetch(checkoutUrl, { redirect: 'manual' });
    console.log('Checkout URL HTTP Status:', chkRes.status);
    console.log('Checkout URL Location header:', chkRes.headers.get('location'));
  }
}

testCheckout().catch(console.error);
