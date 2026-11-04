// scripts/verify_gokwik_active_status.mjs
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

async function verifyStatus() {
  console.log("=== CHECKING GOKWIK STATUS VIA REAL-TIME API ===");
  const token = await getAccessToken();

  // 1. Check Recurring Application Charges (Subscription Approval status)
  try {
    const cRes = await fetch(`https://${shopifyDomain}/admin/api/2024-04/recurring_application_charges.json`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    console.log("1. Recurring Application Charges HTTP:", cRes.status);
    const cData = await cRes.json();
    console.log("Recurring Charges Data:", JSON.stringify(cData, null, 2));
  } catch (e) {
    console.error("Error fetching charges:", e.message);
  }

  // 2. Check Script Tags (to see if Gokwik injects any scripts)
  try {
    const sRes = await fetch(`https://${shopifyDomain}/admin/api/2024-04/script_tags.json`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    console.log("2. Script Tags HTTP:", sRes.status);
    const sData = await sRes.json();
    console.log("Script Tags Data:", JSON.stringify(sData, null, 2));
  } catch (e) {
    console.error("Error fetching script tags:", e.message);
  }

  // 3. Check Live Storefront HTML for Gokwik scripts / SDK
  try {
    const pRes = await fetch(`https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack`);
    const pHtml = await pRes.text();
    const hasGokwik = pHtml.toLowerCase().includes('gokwik') || pHtml.toLowerCase().includes('kwik');
    console.log("3. SujataNutrilive Live HTML contains 'gokwik'/'kwik':", hasGokwik);
    if (hasGokwik) {
      const matches = pHtml.match(/([^\n]*gokwik[^\n]*)/gi);
      console.log("Matches found:", matches?.slice(0, 5));
    }
  } catch (e) {
    console.error("Error fetching live PDP:", e.message);
  }

  // 4. Check Shopify Themes and Theme Assets for Gokwik
  try {
    const tRes = await fetch(`https://${shopifyDomain}/admin/api/2024-04/themes.json`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    console.log("4. Themes HTTP:", tRes.status);
    const tData = await tRes.json();
    const mainTheme = tData.themes?.find(t => t.role === 'main');
    console.log("Main theme:", mainTheme?.id, mainTheme?.name);

    if (mainTheme) {
      // Check settings_data.json to see if app embeds (Gokwik) are enabled
      const aRes = await fetch(`https://${shopifyDomain}/admin/api/2024-04/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`, {
        headers: { 'X-Shopify-Access-Token': token }
      });
      console.log("Theme settings_data.json HTTP:", aRes.status);
      if (aRes.status === 200) {
        const aData = await aRes.json();
        const settings = JSON.parse(aData.asset?.value || '{}');
        const blocks = settings.current?.blocks || {};
        console.log("Enabled App Embed Blocks in Theme:");
        let gokwikBlocks = [];
        for (const [key, block] of Object.entries(blocks)) {
          if (JSON.stringify(block).toLowerCase().includes('kwik') || JSON.stringify(block).toLowerCase().includes('gokwik')) {
            gokwikBlocks.push({ key, block });
          }
        }
        console.log("Gokwik blocks in theme:", JSON.stringify(gokwikBlocks, null, 2));
      }
    }
  } catch (e) {
    console.error("Error checking theme:", e.message);
  }
}

verifyStatus();
