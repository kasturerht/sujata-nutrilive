import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

async function checkCampaigns() {
  const metaToken = env.META_ADS_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-28','until':'2026-10-29'}&time_increment=1&fields=campaign_name,campaign_id,date_start,spend,impressions,reach,clicks,cpc,ctr,cpm,actions&level=campaign`;
  const res = await fetch(url);
  const data = await res.json();

  console.log("=== CAMPAIGN-WISE BREAKDOWN ===");
  data.data?.forEach(r => {
    console.log(`\n[${r.date_start}] Campaign: ${r.campaign_name} (${r.campaign_id})`);
    console.log(`Spend: ₹${r.spend} | Impr: ${r.impressions} | Reach: ${r.reach} | Clicks: ${r.clicks} | CPC: ₹${r.cpc} | CTR: ${parseFloat(r.ctr).toFixed(2)}% | CPM: ₹${parseFloat(r.cpm).toFixed(2)}`);
    const keyActions = (r.actions || []).filter(a => ['link_click', 'landing_page_view', 'add_to_cart', 'initiate_checkout', 'purchase', 'lead'].includes(a.action_type));
    console.log(`Key Actions:`, keyActions.map(a => `${a.action_type}: ${a.value}`).join(', '));
  });
}
checkCampaigns();