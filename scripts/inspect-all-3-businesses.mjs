// scripts/inspect-all-3-businesses.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) {
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[m[1]] = val;
  }
});

const token = env.META_ADS_ACCESS_TOKEN;

async function checkAllBusinesses() {
  console.log("=== INSPECTING META BUSINESSES ===");

  // Check what business managers the token or user has access to
  const meRes = await fetch(`https://graph.facebook.com/v21.0/me/businesses?fields=id,name,verification_status,created_time,primary_page{id,name}&access_token=${token}`);
  const meData = await meRes.json();
  console.log("me/businesses:", JSON.stringify(meData, null, 2));

  // Also query Main Ad Account's business fields
  const aRes = await fetch(`https://graph.facebook.com/v21.0/act_1045791637117525?fields=id,name,business,business_name,owner,created_time,timezone_name&access_token=${token}`);
  const aData = await aRes.json();
  console.log("\nact_1045791637117525 metadata:", JSON.stringify(aData, null, 2));

  // Let's also check user me/accounts (pages)
  const pRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=id,name,business&access_token=${token}`);
  const pData = await pRes.json();
  console.log("\nPages & their associated business:", JSON.stringify(pData, null, 2));
}

checkAllBusinesses().catch(console.error);
