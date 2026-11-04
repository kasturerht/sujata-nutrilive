// scripts/inspect-business-details.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;

async function checkBusiness() {
  const bId = '1022612839410712'; // Sujata Nutrilive
  console.log(`Checking Business Manager: ${bId}...`);

  const url = `https://graph.facebook.com/v21.0/${bId}?fields=id,name,verification_status,sharing_eligibility_status,owned_ad_accounts{id,name,account_status},client_ad_accounts{id,name}&access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Business details:", JSON.stringify(data, null, 2));

  // Check Main Ad Account status & owner
  const mainAcc = 'act_1045791637117525';
  const aUrl = `https://graph.facebook.com/v21.0/${mainAcc}?fields=id,name,owner,business,business_name,is_personal,funding_source_details&access_token=${token}`;
  const aRes = await fetch(aUrl);
  const aData = await aRes.json();
  console.log("\nMain Ad Account details:", JSON.stringify(aData, null, 2));
}

checkBusiness().catch(console.error);
