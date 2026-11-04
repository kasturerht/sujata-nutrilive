// scripts/inspect_website_ad_delivery.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';
const campaignId = '120248771569340630'; // Hero Video ASC

async function check() {
  console.log("=== INSPECTING HERO VIDEO ASC CAMPAIGN SETTINGS & ADS ===");
  // Check campaign details
  const cRes = await fetch(`https://graph.facebook.com/v21.0/${campaignId}?access_token=${token}&fields=id,name,status,effective_status,daily_budget,lifetime_budget,budget_remaining,issues_info,adsets{id,name,status,effective_status,daily_budget,bid_strategy,billing_event,optimization_goal,targeting,adset_schedule},ads{id,name,status,effective_status,creative{name,title,body}}`);
  const cData = await cRes.json();
  console.log("Campaign Details:", JSON.stringify(cData, null, 2));

  // Check hourly / daily breakdown of spend on Nov 2
  console.log("\n=== HOURLY INSIGHTS FOR HERO VIDEO ASC ON NOV 02 ===");
  const hUrl = `https://graph.facebook.com/v21.0/${campaignId}/insights?access_token=${token}&time_range={'since':'2026-11-02','until':'2026-11-02'}&breakdowns=hourly_stats_aggregated_by_audience_time_zone&fields=spend,impressions,clicks,cpc,ctr&limit=50`;
  const hRes = await fetch(hUrl);
  const hData = await hRes.json();
  if (hData.data) {
    hData.data.forEach(h => {
      console.log(`Hour: ${h.hourly_stats_aggregated_by_audience_time_zone} | Spend: ₹${h.spend} | Impr: ${h.impressions} | Clicks: ${h.clicks}`);
    });
  } else {
    console.log("Hourly data not available or error:", hData);
  }
}

check().catch(console.error);
