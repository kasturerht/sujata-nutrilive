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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[trimmed.substring(0, idx).trim()] = val;
    }
  }
}
loadEnv();

async function run() {
  const domain = 'tvczdq-nu.myshopify.com';
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

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
  const token = oData.access_token;
  console.log('🔑 Scopes:', oData.scope);

  // 1. Shop details
  const shopRes = await fetch(`https://${domain}/admin/api/2024-04/shop.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const shopData = await shopRes.json();
  console.log('🏬 Shop:', shopData.shop?.name, '|', shopData.shop?.email, '|', shopData.shop?.domain);

  // 2. Payment Customizations via GraphQL
  const gqlQuery = {
    query: `
      query {
        paymentCustomizations(first: 10) {
          edges {
            node {
              id
              title
              enabled
              functionId
              metafields(first: 5) {
                edges {
                  node {
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `
  };
  const gRes = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify(gqlQuery)
  });
  const gData = await gRes.json();
  console.log('💳 Payment Customizations:', JSON.stringify(gData, null, 2));

  // 3. Check App Installations
  const appQuery = {
    query: `
      query {
        appInstallations(first: 20) {
          edges {
            node {
              app {
                title
                handle
              }
            }
          }
        }
      }
    `
  };
  const aRes = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify(appQuery)
  });
  const aData = await aRes.json();
  console.log('📦 Installed Apps:', JSON.stringify(aData, null, 2));
}

run();
