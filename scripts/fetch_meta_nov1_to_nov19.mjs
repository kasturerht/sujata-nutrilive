// scripts/fetch_meta_nov1_to_nov19.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';
const adId = '120249010265760630';
const campaignId = '120248771569340630';
const adsetId = '120248771569360630';

console.log("=== FETCHING META ADS DEEP AUDIT: 2026-11-01 TO 2026-11-19 ===");
console.log(`Ad Account: ${adAccountId}`);
console.log(`Token present: ${!!token}`);

async function run() {
  const fields = [
    'spend', 'impressions', 'reach', 'frequency', 'cpm', 'clicks', 'inline_link_clicks',
    'ctr', 'inline_link_click_ctr', 'cpc', 'cost_per_inline_link_click',
    'quality_ranking', 'engagement_rate_ranking', 'conversion_rate_ranking',
    'video_30_sec_watched_actions', 'video_avg_time_watched_actions', 'video_p25_watched_actions',
    'video_p50_watched_actions', 'video_p75_watched_actions', 'video_p100_watched_actions',
    'actions', 'action_values', 'cost_per_action_type', 'purchase_roas'
  ].join(',');

  const timeRange = JSON.stringify({ since: '2026-11-01', until: '2026-11-19' });

  // 1. Check Current Status of Ad, AdSet, Campaign
  console.log("--> 1. Fetching current live status of Campaign, AdSet, Ad...");
  const statusRes = await fetch(
    `https://graph.facebook.com/v21.0/${adId}?fields=id,name,status,effective_status,adset{id,name,status,effective_status,daily_budget,optimization_goal,learning_stage_info},campaign{id,name,status,effective_status}&access_token=${token}`
  );
  const statusData = await statusRes.json();

  // 2. Aggregate Insights for the whole period (Nov 1 - Nov 19)
  console.log("--> 2. Fetching Aggregate Insights for Nov 1 to Nov 19...");
  const aggUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=${fields}&time_range=${encodeURIComponent(timeRange)}&access_token=${token}`;
  const aggRes = await fetch(aggUrl);
  const aggData = await aggRes.json();

  // 3. Day-by-Day breakdown
  console.log("--> 3. Fetching Day-by-Day breakdown...");
  const dailyUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=${fields}&time_increment=1&time_range=${encodeURIComponent(timeRange)}&access_token=${token}`;
  const dailyRes = await fetch(dailyUrl);
  const dailyData = await dailyRes.json();

  // 4. Placement breakdown (FB Reels vs IG Reels vs Feed)
  console.log("--> 4. Fetching Placement breakdown...");
  const plUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=spend,impressions,reach,clicks,inline_link_clicks,cpc,ctr,actions&breakdowns=publisher_platform,platform_position&time_range=${encodeURIComponent(timeRange)}&access_token=${token}`;
  const plRes = await fetch(plUrl);
  const plData = await plRes.json();

  // 5. Demographics (Age & Gender)
  console.log("--> 5. Fetching Demographic breakdown...");
  const demoUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=spend,impressions,clicks,inline_link_clicks,actions&breakdowns=age,gender&time_range=${encodeURIComponent(timeRange)}&access_token=${token}`;
  const demoRes = await fetch(demoUrl);
  const demoData = await demoRes.json();

  // 6. Account level campaigns (to see if any other campaign was run)
  console.log("--> 6. Checking all campaigns in ad account...");
  const campUrl = `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?fields=id,name,status,effective_status,daily_budget,lifetime_budget,created_time,updated_time&access_token=${token}`;
  const campRes = await fetch(campUrl);
  const campData = await campRes.json();

  const report = {
    timestamp: new Date().toISOString(),
    liveStatus: statusData,
    aggregate: aggData.data?.[0] || null,
    daily: dailyData.data || [],
    placements: plData.data || [],
    demographics: demoData.data || [],
    campaigns: campData.data || []
  };

  fs.writeFileSync(path.join(__dirname, 'meta_nov1_to_nov19_audit.json'), JSON.stringify(report, null, 2));
  console.log("--> Successfully saved to scripts/meta_nov1_to_nov19_audit.json");
}

run().catch(console.error);
