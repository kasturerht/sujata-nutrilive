import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});
const token = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

async function run() {
  for (const date of ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03']) {
    const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${token}&time_range={'since':'${date}','until':'${date}'}&level=campaign&fields=campaign_id,campaign_name,objective,spend,impressions,clicks,cpc,ctr,actions&limit=50`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`\n=== DATE: ${date} ===`);
    let totalSpend = 0;
    let websiteSpend = 0;
    if (data.data && data.data.length > 0) {
      data.data.forEach(c => {
        const spend = parseFloat(c.spend || 0);
        totalSpend += spend;
        const isWebsite = c.campaign_name.toLowerCase().includes('website') || c.campaign_name.toLowerCase().includes('hero') || c.objective === 'OUTCOME_SALES';
        if (isWebsite) websiteSpend += spend;
        console.log(`Campaign: "${c.campaign_name}" (${c.objective})`);
        console.log(`  Spend: ₹${c.spend} | Impr: ${c.impressions} | Clicks: ${c.clicks} | CTR: ${c.ctr}% | CPC: ₹${c.cpc}`);
        if (c.actions) {
          const acts = c.actions.filter(a => ['link_click', 'landing_page_view', 'purchase', 'add_to_cart', 'initiate_checkout', 'onsite_conversion.total_messaging_connection', 'lead'].includes(a.action_type));
          console.log(`  Actions: ${acts.map(a => `${a.action_type}: ${a.value}`).join(' | ')}`);
        }
      });
      console.log(`-> SUMMARY ${date}: Total Meta Spend = ₹${totalSpend.toFixed(2)} | Website/Sales Spend = ₹${websiteSpend.toFixed(2)}`);
    } else {
      console.log(`No data for ${date}:`, data);
    }
  }

  // Active campaigns check
  const campUrl = `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?access_token=${token}&fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget&limit=50`;
  const campRes = await fetch(campUrl);
  const campData = await campRes.json();
  console.log('\n=== CURRENT ACTIVE CAMPAIGNS IN META ===');
  (campData.data || []).forEach(c => {
    if (c.effective_status === 'ACTIVE') {
      console.log(`Active: [${c.id}] "${c.name}" | Status: ${c.status}/${c.effective_status} | Budget: ₹${(c.daily_budget ? c.daily_budget/100 : 'N/A')}`);
    }
  });
}

run().catch(console.error);
