// scripts/verify_gokwik_graphql.mjs
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
const clientId = env.SHOPIFY_CLIENT_ID;
const clientSecret = env.SHOPIFY_CLIENT_SECRET;

async function getAccessToken() {
  const oRes = await fetch(`https://${shopifyDomain}/admin/oauth/access_token`, {
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

async function verifyGraphQL() {
  const token = await getAccessToken();

  // Check application charges (one-time or usage)
  const resCharges = await fetch(`https://${shopifyDomain}/admin/api/2024-04/application_charges.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  console.log("Application Charges (One-time):", await resCharges.json());

  // Check orders or checkout creation with Storefront API to see what payment methods are returned
  const storefrontToken = env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '7e0a0176aede63ce4c6b199e18684018';
  
  // Create a dummy cart and get checkout URL
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
            lines: [{ quantity: 1, merchandiseId: "gid://shopify/ProductVariant/47900767224036" }]
          }) {
            cart {
              id
              checkoutUrl
            }
          }
        }
      `
    })
  });
  const cartData = await cartRes.json();
  const checkoutUrl = cartData?.data?.cartCreate?.cart?.checkoutUrl;
  console.log("Cart Checkout URL:", checkoutUrl);

  if (checkoutUrl) {
    const cPageRes = await fetch(checkoutUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log("Checkout page status:", cPageRes.status);
    const cHtml = await cPageRes.text();
    const hasGokwik = cHtml.toLowerCase().includes('gokwik') || cHtml.toLowerCase().includes('kwik');
    console.log("Checkout HTML has gokwik:", hasGokwik);
  }
}

verifyGraphQL();
