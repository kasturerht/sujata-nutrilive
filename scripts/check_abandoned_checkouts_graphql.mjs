// scripts/check_abandoned_checkouts_graphql.mjs
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

async function checkAbandoned() {
  const token = await getAccessToken();

  const query = `
    query {
      abandonedCheckouts(first: 10, reverse: true) {
        edges {
          node {
            id
            createdAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            customer {
              displayName
              phone
              email
            }
            shippingAddress {
              name
              phone
              formatted
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${shopifyDomain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query }),
  });

  const resJson = await response.json();
  console.log('Abandoned Checkouts:', JSON.stringify(resJson, null, 2));
}

checkAbandoned();
