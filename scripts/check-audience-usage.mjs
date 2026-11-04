// scripts/check-audience-usage.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const audienceId = '120250704911380554';

async function checkUsage() {
  const accounts = ['act_706658852401103', 'act_1045791637117525'];
  for (const acc of accounts) {
    const url = `https://graph.facebook.com/v21.0/${acc}/adsets?fields=id,name,status,effective_status,targeting&limit=50&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Checking ad sets in ${acc}...`);
    (data.data || []).forEach(adset => {
      const customAudiences = adset.targeting?.custom_audiences || [];
      const match = customAudiences.some(ca => ca.id === audienceId || ca.name?.includes('Sujata_Master'));
      if (match) {
        console.log(`🎯 MATCH! Adset "${adset.name}" (${adset.id}) is using this audience! Status: ${adset.effective_status}`);
      }
    });
  }
}

checkUsage().catch(console.error);
