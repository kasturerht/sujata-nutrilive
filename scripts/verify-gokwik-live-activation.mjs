// scripts/verify-gokwik-live-activation.mjs
import fs from 'fs';
import path from 'path';

// 1. Load GoKwik config
const gkConfig = JSON.parse(fs.readFileSync('src/config/gokwik.json', 'utf8'));
console.log("=== GOKWIK CONFIG CREDENTIALS ===");
console.log(gkConfig);

async function testEndpoints() {
  console.log("\n=== 1. TESTING GOKWIK CHECKOUT SCRIPTS ===");
  
  // Test SDKs
  const urls = [
    'https://checkout.gokwik.co',
    'https://checkout.gokwik.co/v1/gokwik.js',
    'https://pdp.gokwik.co/pdp.js',
    `https://api.gokwik.co/v1/merchant/config?merchantId=${gkConfig.merchantId}`,
    `https://api.gokwik.co/v1/merchants/${gkConfig.merchantId}`,
    `https://analytics.gokwik.co`
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: {
          'app_id': gkConfig.appId,
          'app_secret': gkConfig.appSecret,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log(`- ${u} -> Status: ${res.status}`);
      if (res.status === 200) {
        const text = await res.text();
        console.log(`  Length: ${text.length} | Preview: ${text.slice(0, 100)}...`);
      }
    } catch(e) {
      console.log(`- ${u} -> Error: ${e.message}`);
    }
  }

  // 2. Check Shopify Theme Assets for GoKwik
  console.log("\n=== 2. CHECKING SHOPIFY GOKWIK APP & THEME EMBED ===");
  const env = {};
  fs.readFileSync('.env', 'utf8').split('\n').forEach(l => {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  });

  const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const clientId = env.SHOPIFY_CLIENT_ID;
  const clientSecret = env.SHOPIFY_CLIENT_SECRET;

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

  if (token) {
    // Check recurring charges (App subscription)
    const cRes = await fetch(`https://${domain}/admin/api/2024-04/recurring_application_charges.json`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const cData = await cRes.json();
    console.log("Recurring Charges in Shopify:", JSON.stringify(cData));

    // Check themes
    const tRes = await fetch(`https://${domain}/admin/api/2024-04/themes.json`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const tData = await tRes.json();
    const mainTheme = tData.themes?.find(t => t.role === 'main');
    console.log("Main theme:", mainTheme?.id, mainTheme?.name);

    if (mainTheme) {
      const aRes = await fetch(`https://${domain}/admin/api/2024-04/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`, {
        headers: { 'X-Shopify-Access-Token': token }
      });
      const aData = await aRes.json();
      const settings = JSON.parse(aData.asset?.value || '{}');
      const blocks = settings.current?.blocks || {};
      console.log("Theme App Embeds containing kwik/gokwik:");
      for (const [k, v] of Object.entries(blocks)) {
        if (JSON.stringify(v).toLowerCase().includes('kwik')) {
          console.log(`- Block ${k}:`, JSON.stringify(v));
        }
      }
    }
  }
}

testEndpoints().catch(console.error);
