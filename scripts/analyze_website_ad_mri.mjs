import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('scripts/website_ad_mri_raw.json', 'utf8'));

console.log("==================================================================");
console.log("            META WEBSITE AD - FULL MRI DIAGNOSTIC SCAN            ");
console.log("==================================================================");

const ad = raw.ad;
const adset = raw.adset;
const lt = raw.lifetime || {};
const daily = raw.daily || [];
const today = raw.today || {};

console.log(`\n1. AD IDENTIFICATION & STATUS:`);
console.log(`   Ad Name: ${ad.name}`);
console.log(`   Ad ID: ${ad.id}`);
console.log(`   Status: ${ad.status} (Effective: ${ad.effective_status})`);
console.log(`   Created: ${ad.created_time}`);
console.log(`   Issues/Feedback: ${JSON.stringify(ad.issues_info || ad.ad_review_feedback || 'None')}`);
console.log(`   Learning Stage: ${JSON.stringify(adset.learning_stage_info || {})}`);
console.log(`   Daily Budget: ₹${(parseFloat(adset.daily_budget || '0') / 100).toFixed(2)}`);

console.log(`\n2. LIFETIME PERFORMANCE OVERVIEW (From Launch to Today):`);
console.log(`   Total Spend: ₹${parseFloat(lt.spend || '0').toFixed(2)}`);
console.log(`   Impressions: ${lt.impressions}`);
console.log(`   Reach: ${lt.reach} unique users`);
console.log(`   Frequency: ${lt.frequency}`);
console.log(`   CPM (Cost Per 1,000 Impressions): ₹${parseFloat(lt.cpm || '0').toFixed(2)}`);
console.log(`   Total Clicks: ${lt.clicks}`);
console.log(`   CTR (All): ${parseFloat(lt.ctr || '0').toFixed(2)}%`);
console.log(`   Link Clicks: ${lt.inline_link_clicks}`);
console.log(`   Link CTR: ${parseFloat(lt.inline_link_click_ctr || '0').toFixed(2)}%`);
console.log(`   CPC (Cost per Link Click): ₹${parseFloat(lt.cost_per_inline_link_click || '0').toFixed(2)}`);

console.log(`\n3. AD QUALITY & RELEVANCE RANKINGS:`);
console.log(`   Quality Ranking: ${lt.quality_ranking || 'N/A'}`);
console.log(`   Engagement Rate Ranking: ${lt.engagement_rate_ranking || 'N/A'}`);
console.log(`   Conversion Rate Ranking: ${lt.conversion_rate_ranking || 'N/A'}`);

console.log(`\n4. VIDEO ENGAGEMENT METRICS (Hook & Hold Rate):`);
const p25 = (lt.video_p25_watched_actions || []).find(a => a.action_type === 'video_view')?.value || 0;
const p50 = (lt.video_p50_watched_actions || []).find(a => a.action_type === 'video_view')?.value || 0;
const p75 = (lt.video_p75_watched_actions || []).find(a => a.action_type === 'video_view')?.value || 0;
const p100 = (lt.video_p100_watched_actions || []).find(a => a.action_type === 'video_view')?.value || 0;
const avgWatch = (lt.video_avg_time_watched_actions || []).find(a => a.action_type === 'video_view')?.value || 0;

console.log(`   Average Watch Time: ${avgWatch} seconds`);
console.log(`   25% Watched: ${p25} viewers`);
console.log(`   50% Watched: ${p50} viewers`);
console.log(`   75% Watched: ${p75} viewers`);
console.log(`   100% Watched (Complete): ${p100} viewers`);

console.log(`\n5. ACTIONS & FUNNEL CONVERSION METRICS:`);
const actions = lt.actions || [];
actions.forEach(a => {
  console.log(`   - ${a.action_type}: ${a.value}`);
});

console.log(`\n6. ACTION VALUES / REVENUE / ROAS:`);
const values = lt.action_values || [];
values.forEach(v => {
  console.log(`   - ${v.action_type}: ₹${v.value}`);
});
console.log(`   Purchase ROAS: ${JSON.stringify(lt.purchase_roas || 'N/A')}`);

console.log(`\n7. DAY-BY-DAY TRAJECTORY:`);
daily.forEach(d => {
  const dSpend = parseFloat(d.spend || '0').toFixed(2);
  const dImp = d.impressions;
  const dReach = d.reach;
  const dClicks = d.inline_link_clicks || 0;
  const dCpc = parseFloat(d.cost_per_inline_link_click || '0').toFixed(2);
  const dLpv = (d.actions || []).find(a => a.action_type === 'landing_page_view')?.value || 0;
  const dAtc = (d.actions || []).find(a => a.action_type === 'add_to_cart')?.value || 0;
  const dIc = (d.actions || []).find(a => a.action_type === 'initiate_checkout')?.value || 0;
  const dPur = (d.actions || []).find(a => a.action_type === 'purchase')?.value || 0;
  const dPurVal = (d.action_values || []).find(a => a.action_type === 'purchase')?.value || 0;

  console.log(`   ${d.date_start}: Spend: ₹${dSpend.padStart(7)} | Imp: ${String(dImp).padStart(5)} | Clicks: ${String(dClicks).padStart(3)} (₹${dCpc}) | LPV: ${String(dLpv).padStart(2)} | ATC: ${String(dAtc).padStart(2)} | IC: ${String(dIc).padStart(2)} | Purchases: ${dPur} (₹${dPurVal})`);
});

console.log(`\n8. TODAY'S REAL-TIME SNAPSHOT (31 OCT 2026):`);
console.log(`   Spend today so far: ₹${parseFloat(today.spend || '0').toFixed(2)}`);
console.log(`   Impressions today: ${today.impressions || 0}`);
console.log(`   Link clicks today: ${today.inline_link_clicks || 0}`);
console.log(`   Actions today: ${JSON.stringify(today.actions || [])}`);
