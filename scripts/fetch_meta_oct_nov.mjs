import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

async function getCampaigns() {
  const timeRange = JSON.stringify({ since: '2026-10-01', until: '2026-11-20' });
  const fields = 'campaign_id,campaign_name,spend,impressions,reach,actions';
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?fields=${fields}&level=campaign&time_range=${encodeURIComponent(timeRange)}&limit=100&access_token=${token}`;
  
  const res = await fetch(url);
  const data = await res.json();
  console.log('Campaigns count:', data.data?.length);
  data.data?.forEach(c => {
    const msgs = c.actions?.find(a => 
      a.action_type === 'onsite_conversion.messaging_conversation_started_7d' || 
      a.action_type === 'onsite_conversion.total_messaging_connection'
    )?.value || 0;
    const leads = c.actions?.find(a => a.action_type === 'lead')?.value || 0;
    console.log(`${c.campaign_name} | Spend: ₹${parseFloat(c.spend).toFixed(2)} | Msgs: ${msgs} | Leads: ${leads}`);
  });
  
  fs.writeFileSync('scripts/meta_oct_nov_campaigns.json', JSON.stringify(data.data, null, 2));
}

getCampaigns().catch(console.error);
