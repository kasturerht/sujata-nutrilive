// scripts/fetch_all_account_campaigns_nov.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

async function run() {
  console.log("=== FETCHING ALL CAMPAIGN INSIGHTS (NOV 01 - NOV 19) ===");
  const timeRange = JSON.stringify({ since: '2026-11-01', until: '2026-11-19' });
  
  const fields = 'campaign_id,campaign_name,spend,impressions,reach,clicks,inline_link_clicks,cpc,ctr,actions,cost_per_action_type';
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?fields=${fields}&level=campaign&time_range=${encodeURIComponent(timeRange)}&access_token=${token}`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  console.log(`Found ${data.data?.length || 0} active/spending campaigns between Nov 1 and Nov 19:`);
  
  let totalAccountSpend = 0;
  data.data?.forEach(c => {
    const spend = parseFloat(c.spend || 0);
    totalAccountSpend += spend;
    
    // Check conversions / messages / leads
    const whatsappMsgs = c.actions?.find(a => 
      a.action_type === 'onsite_conversion.messaging_conversation_started_7d' || 
      a.action_type === 'onsite_conversion.total_messaging_connection'
    )?.value || 0;
    
    const leads = c.actions?.find(a => a.action_type === 'lead')?.value || 0;
    const purchases = c.actions?.find(a => a.action_type === 'purchase')?.value || 0;
    const linkClicks = c.inline_link_clicks || 0;

    console.log(`\nCampaign: ${c.campaign_name} (ID: ${c.campaign_id})`);
    console.log(`  Spend: ₹${spend.toFixed(2)} | Impressions: ${c.impressions} | Reach: ${c.reach}`);
    console.log(`  Clicks: ${c.clicks} | Link Clicks: ${linkClicks} | CPC: ₹${parseFloat(c.cpc || 0).toFixed(2)} | CTR: ${parseFloat(c.ctr || 0).toFixed(2)}%`);
    console.log(`  Messages Started: ${whatsappMsgs} | Leads: ${leads} | Website Purchases: ${purchases}`);
  });
  
  console.log(`\n==============================================`);
  console.log(`TOTAL AD ACCOUNT SPEND (NOV 1 - NOV 19): ₹${totalAccountSpend.toFixed(2)}`);
  console.log(`==============================================`);

  fs.writeFileSync(path.join(__dirname, 'all_campaigns_nov1_nov19.json'), JSON.stringify(data.data, null, 2));
}

run().catch(console.error);
