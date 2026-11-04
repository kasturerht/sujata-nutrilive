// scripts/inspect-both-payment-methods.mjs
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
  const acc1 = 'act_1045791637117525';
  const acc2 = 'act_706658852401103';

  const res1 = await fetch(`https://graph.facebook.com/v21.0/${acc1}?fields=id,name,balance,currency,account_status,funding_source_details&access_token=${token}`);
  console.log("Main Ad Account:", await res1.json());

  const res2 = await fetch(`https://graph.facebook.com/v21.0/${acc2}?fields=id,name,balance,currency,account_status,funding_source_details&access_token=${token}`);
  console.log("\nSujata SD:", await res2.json());
}

check().catch(console.error);
