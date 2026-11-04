import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const adId = '120249010265760630';
const campaignId = '120248771569340630';
const adsetId = '120248771569360630';

async function fetchMriData() {
  console.log("=== 1. FETCHING AD DETAILS & STATUS ===");
  const adUrl = `https://graph.facebook.com/v21.0/${adId}?fields=id,name,status,effective_status,created_time,updated_time,ad_review_feedback,issues_info,creative{id,name,title,body,video_id,image_url,call_to_action_type,object_story_spec,effective_object_story_id},tracking_specs&access_token=${adsToken}`;
  const adRes = await fetch(adUrl);
  const adData = await adRes.json();

  console.log("=== 2. FETCHING ADSET LEARNING & TARGETING ===");
  const adsetUrl = `https://graph.facebook.com/v21.0/${adsetId}?fields=id,name,status,effective_status,daily_budget,optimization_goal,billing_event,promoted_object,targeting,learning_stage_info&access_token=${adsToken}`;
  const adsetRes = await fetch(adsetUrl);
  const adsetData = await adsetRes.json();

  console.log("=== 3. FETCHING LIFETIME AD INSIGHTS ===");
  const fields = [
    'spend', 'impressions', 'reach', 'frequency', 'cpm', 'clicks', 'inline_link_clicks',
    'ctr', 'inline_link_click_ctr', 'cpc', 'cost_per_inline_link_click',
    'quality_ranking', 'engagement_rate_ranking', 'conversion_rate_ranking',
    'video_30_sec_watched_actions', 'video_avg_time_watched_actions', 'video_p25_watched_actions',
    'video_p50_watched_actions', 'video_p75_watched_actions', 'video_p100_watched_actions',
    'actions', 'action_values', 'cost_per_action_type', 'purchase_roas'
  ].join(',');

  const lifetimeUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=${fields}&date_preset=maximum&access_token=${adsToken}`;
  const lifetimeRes = await fetch(lifetimeUrl);
  const lifetimeData = await lifetimeRes.json();

  console.log("=== 4. FETCHING DAY-BY-DAY INSIGHTS (OCT 24 - OCT 31) ===");
  const dailyUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=${fields}&time_increment=1&time_range=${encodeURIComponent(JSON.stringify({ since: '2026-10-24', until: '2026-10-31' }))}&access_token=${adsToken}`;
  const dailyRes = await fetch(dailyUrl);
  const dailyData = await dailyRes.json();

  console.log("=== 5. FETCHING TODAY ONLY INSIGHTS (OCT 31) ===");
  const todayUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=${fields}&date_preset=today&access_token=${adsToken}`;
  const todayRes = await fetch(todayUrl);
  const todayData = await todayRes.json();

  // Save everything to a structured file
  const fullReport = {
    ad: adData,
    adset: adsetData,
    lifetime: lifetimeData.data ? lifetimeData.data[0] : null,
    daily: dailyData.data || [],
    today: todayData.data ? todayData.data[0] : null,
    fetchedAt: new Date().toISOString()
  };

  fs.writeFileSync('scripts/website_ad_mri_raw.json', JSON.stringify(fullReport, null, 2));
  console.log("Saved full raw data to scripts/website_ad_mri_raw.json");
}

fetchMriData().catch(console.error);
