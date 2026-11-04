import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';
const campaignId = '120248771569340630';

async function checkFrequency() {
  const url = `https://graph.facebook.com/v21.0/${campaignId}/insights?access_token=${token}&date_preset=last_7d&fields=spend,impressions,reach,frequency,clicks,cpc,ctr,cpm&limit=10`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Last 7 Days Campaign Insights:", JSON.stringify(data.data, null, 2));
}

checkFrequency().catch(console.error);
