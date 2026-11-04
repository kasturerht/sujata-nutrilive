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

const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

async function checkThemeAssets() {
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

  // Find active theme ID
  const themesRes = await fetch(`https://${domain}/admin/api/2024-04/themes.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const themesData = await themesRes.json();
  const activeTheme = (themesData.themes || []).find(t => t.role === 'main');
  console.log("Active theme:", activeTheme?.id, activeTheme?.name);

  if (!activeTheme) return;

  // List theme assets matching judgeme
  const assetsRes = await fetch(`https://${domain}/admin/api/2024-04/themes/${activeTheme.id}/assets.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const assetsData = await assetsRes.json();
  const assets = assetsData.assets || [];
  const jmAssets = assets.filter(a => a.key.includes('judgeme') || a.key.includes('review') || a.key.includes('settings_data'));
  console.log("Matching Assets:");
  jmAssets.forEach(a => console.log(`- ${a.key}`));

  // Check config/settings_data.json
  const settingsAsset = await fetch(`https://${domain}/admin/api/2024-04/themes/${activeTheme.id}/assets.json?asset[key]=config/settings_data.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const sd = await settingsAsset.json();
  if (sd.asset?.value) {
    const val = sd.asset.value;
    const idx = val.indexOf('judgeme');
    if (idx !== -1) {
      console.log("Snippet around judgeme in settings_data.json:");
      console.log(val.slice(Math.max(0, idx - 100), idx + 300));
    }
  }
}

checkThemeAssets().catch(console.error);
