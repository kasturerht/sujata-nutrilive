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

async function testShopifyAuth() {
  const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  console.log("1. Testing current shpat token on /shop.json...");
  const sRes = await fetch(`https://${domain}/admin/api/2024-04/shop.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  console.log("shop.json HTTP Status:", sRes.status);
  const sText = await sRes.text();
  console.log("shop.json Response:", sText.substring(0, 150));

  console.log("\n2. Testing client credentials grant...");
  try {
    const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });
    console.log("OAuth HTTP Status:", oRes.status);
    const oText = await oRes.text();
    console.log("OAuth Response:", oText.substring(0, 150));
  } catch(e) {
    console.error("OAuth error:", e.message);
  }
}

testShopifyAuth();
