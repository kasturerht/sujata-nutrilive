// scripts/print-owned-accounts.mjs
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

async function check() {
  const bId1 = '1022612839410712'; // Sujata Nutrilive
  const res = await fetch(`https://graph.facebook.com/v21.0/${bId1}?fields=id,name,owned_ad_accounts{id,name,account_status}&access_token=${token}`);
  console.log(JSON.stringify(await res.json(), null, 2));
}

check().catch(console.error);
