// scripts/check-ad-accounts.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;

async function checkMe() {
  const url = `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,account_id,name,account_status,currency,timezone_name,business&access_token=${adsToken}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("=== AD ACCOUNTS ACCESSIBLE WITH TOKEN ===");
  console.log(JSON.stringify(data, null, 2));

  // Also check businesses
  const bUrl = `https://graph.facebook.com/v21.0/me/businesses?fields=id,name&access_token=${adsToken}`;
  const bRes = await fetch(bUrl);
  const bData = await bRes.json();
  console.log("\n=== BUSINESSES ACCESSIBLE ===");
  console.log(JSON.stringify(bData, null, 2));
}

checkMe().catch(console.error);
