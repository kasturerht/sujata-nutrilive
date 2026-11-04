import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';
const campaignId = '120248771569340630';

async function checkAds() {
  const url = `https://graph.facebook.com/v21.0/${campaignId}/ads?access_token=${token}&fields=id,name,status,effective_status,creative{id,name,title,body,link_url,call_to_action}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Ads in campaign:", JSON.stringify(data, null, 2));
}

checkAds().catch(console.error);
