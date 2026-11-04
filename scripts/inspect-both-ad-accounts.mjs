// scripts/inspect-both-ad-accounts.mjs
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
const accounts = [
  { id: 'act_1045791637117525', name: 'Main Ad Account' },
  { id: 'act_706658852401103', name: 'Sujata SD' }
];

async function check() {
  for (const acc of accounts) {
    console.log(`\n========================================`);
    console.log(`Account: ${acc.name} (${acc.id})`);
    console.log(`========================================`);
    
    // Check campaigns
    const cUrl = `https://graph.facebook.com/v21.0/${acc.id}/campaigns?fields=id,name,status,effective_status&limit=10&access_token=${token}`;
    const cRes = await fetch(cUrl);
    const cData = await cRes.json();
    console.log(`Active/Recent Campaigns:`);
    (cData.data || []).forEach(c => {
      console.log(` - [${c.id}] ${c.name} | Status: ${c.status} (${c.effective_status})`);
    });

    // Check adsets
    const aUrl = `https://graph.facebook.com/v21.0/${acc.id}/adsets?fields=id,name,status,effective_status,targeting&limit=10&access_token=${token}`;
    const aRes = await fetch(aUrl);
    const aData = await aRes.json();
    console.log(`Active/Recent Ad Sets:`);
    (aData.data || []).forEach(a => {
      const customAuds = a.targeting?.custom_audiences || [];
      console.log(` - [${a.id}] ${a.name} | Status: ${a.status} (${a.effective_status}) | CustomAudiences: ${customAuds.map(x => x.name).join(', ') || 'None (Broad/Geo)'}`);
    });
  }
}

check().catch(console.error);
