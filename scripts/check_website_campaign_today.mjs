import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function checkWebsiteCampaign() {
  const metaToken = env.META_ADS_ACCESS_TOKEN;
  const campaignId = '120248771569340630';
  const url = `https://graph.facebook.com/v21.0/${campaignId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-29','until':'2026-10-30'}&time_increment=1&fields=date_start,spend,impressions,reach,clicks,cpc,ctr,actions`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Website Campaign (Hero Video):');
  (data.data || []).forEach(d => {
    console.log(`Date: ${d.date_start} | Spend: ₹${d.spend} | Reach: ${d.reach} | Impr: ${d.impressions} | Clicks: ${d.clicks} | CTR: ${d.ctr}% | CPC: ₹${d.cpc}`);
    console.log('Actions:', JSON.stringify(d.actions?.filter(a => a.action_type.includes('purchase') || a.action_type.includes('cart') || a.action_type.includes('checkout') || a.action_type.includes('click')), null, 2));
  });
}

checkWebsiteCampaign();
