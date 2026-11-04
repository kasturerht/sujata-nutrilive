// scripts/check-audience-sharing.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const audienceId = '120250704911380554'; // LAL
const customAudId = '120250704896800554'; // Custom

async function checkSharing() {
  console.log("Checking audience sharing details...");
  const url1 = `https://graph.facebook.com/v21.0/${audienceId}?fields=id,name,sharing_status,account_id&access_token=${token}`;
  const res1 = await fetch(url1);
  console.log("Lookalike details:", await res1.json());

  const url2 = `https://graph.facebook.com/v21.0/${customAudId}?fields=id,name,sharing_status,account_id&access_token=${token}`;
  const res2 = await fetch(url2);
  console.log("Custom audience details:", await res2.json());
}

checkSharing().catch(console.error);
