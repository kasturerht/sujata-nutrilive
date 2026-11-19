// scripts/analyze_meta_nov1_to_nov19.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'meta_nov1_to_nov19_audit.json'), 'utf8'));

console.log("=================================================================");
console.log("       META ADS DEEP AUDIT REPORT (NOV 01 - NOV 19, 2026)        ");
console.log("=================================================================\n");

// 1. Current Live Status
console.log("--- 1. CURRENT LIVE STATUS ---");
console.log(`Ad ID: ${raw.liveStatus.id} | Name: ${raw.liveStatus.name}`);
console.log(`Ad Status: ${raw.liveStatus.status} | Effective Status: ${raw.liveStatus.effective_status}`);
console.log(`AdSet Name: ${raw.liveStatus.adset?.name} | Effective Status: ${raw.liveStatus.adset?.effective_status}`);
console.log(`Daily Budget: ₹${(raw.liveStatus.adset?.daily_budget / 100).toFixed(2)}`);
console.log(`Optimization Goal: ${raw.liveStatus.adset?.optimization_goal}`);
console.log(`Learning Stage Info:`, JSON.stringify(raw.liveStatus.adset?.learning_stage_info));
console.log(`Campaign Name: ${raw.liveStatus.campaign?.name} | Effective Status: ${raw.liveStatus.campaign?.effective_status}`);

// 2. Aggregate Performance (Nov 1 - Nov 19)
console.log("\n--- 2. AGGREGATE PERFORMANCE (NOV 01 - NOV 19) ---");
const agg = raw.aggregate;
if (agg) {
  const purchases = agg.actions?.find(a => a.action_type === 'purchase')?.value || 0;
  const purValue = agg.action_values?.find(a => a.action_type === 'purchase')?.value || 0;
  const atc = agg.actions?.find(a => a.action_type === 'add_to_cart')?.value || 0;
  const ic = agg.actions?.find(a => a.action_type === 'initiate_checkout')?.value || 0;
  const lpv = agg.actions?.find(a => a.action_type === 'landing_page_view')?.value || 0;
  const roas = agg.purchase_roas?.[0]?.value || 0;

  console.log(`Total Spend: ₹${parseFloat(agg.spend).toFixed(2)}`);
  console.log(`Impressions: ${agg.impressions} | Reach: ${agg.reach} | Frequency: ${parseFloat(agg.frequency).toFixed(2)}`);
  console.log(`CPM: ₹${parseFloat(agg.cpm).toFixed(2)}`);
  console.log(`Total Clicks: ${agg.clicks} | Inline Link Clicks: ${agg.inline_link_clicks}`);
  console.log(`Overall CTR: ${parseFloat(agg.ctr).toFixed(2)}% | Inline Link CTR: ${parseFloat(agg.inline_link_click_ctr).toFixed(2)}%`);
  console.log(`CPC (All): ₹${parseFloat(agg.cpc).toFixed(2)} | Cost Per Link Click: ₹${parseFloat(agg.cost_per_inline_link_click).toFixed(2)}`);
  console.log(`Landing Page Views: ${lpv} | Add to Cart: ${atc} | Initiate Checkout: ${ic}`);
  console.log(`Purchases (Meta Attributed): ${purchases} | Purchase Value: ₹${purValue} | ROAS: ${roas}x`);
  console.log(`Rankings: Quality = ${agg.quality_ranking || 'N/A'} | Engagement = ${agg.engagement_rate_ranking || 'N/A'} | Conversion = ${agg.conversion_rate_ranking || 'N/A'}`);
} else {
  console.log("No aggregate data found for this period!");
}

// 3. Day by Day Performance
console.log("\n--- 3. DAY-BY-DAY PERFORMANCE (NOV 01 - NOV 19) ---");
console.log("Date       | Spend    | Impr  | Reach | Clicks | LinkClicks | CTR(%) | CPC(₹) | Cost/L.Click | LPV | ATC | IC | Orders | Revenue");
console.log("-----------|----------|-------|-------|--------|------------|--------|--------|--------------|-----|-----|----|--------|--------");
raw.daily.forEach(d => {
  const p = d.actions?.find(a => a.action_type === 'purchase')?.value || 0;
  const rev = d.action_values?.find(a => a.action_type === 'purchase')?.value || 0;
  const atc = d.actions?.find(a => a.action_type === 'add_to_cart')?.value || 0;
  const ic = d.actions?.find(a => a.action_type === 'initiate_checkout')?.value || 0;
  const lpv = d.actions?.find(a => a.action_type === 'landing_page_view')?.value || 0;

  console.log(
    `${d.date_start} | ` +
    `₹${parseFloat(d.spend).toFixed(0).padStart(6)} | ` +
    `${String(d.impressions).padStart(5)} | ` +
    `${String(d.reach).padStart(5)} | ` +
    `${String(d.clicks).padStart(6)} | ` +
    `${String(d.inline_link_clicks).padStart(10)} | ` +
    `${parseFloat(d.ctr).toFixed(2).padStart(6)} | ` +
    `${parseFloat(d.cpc).toFixed(1).padStart(6)} | ` +
    `₹${parseFloat(d.cost_per_inline_link_click || 0).toFixed(1).padStart(10)} | ` +
    `${String(lpv).padStart(3)} | ` +
    `${String(atc).padStart(3)} | ` +
    `${String(ic).padStart(2)} | ` +
    `${String(p).padStart(6)} | ` +
    `₹${parseFloat(rev).toFixed(0)}`
  );
});

// 4. Placements Breakdown
console.log("\n--- 4. PLACEMENT BREAKDOWN ---");
console.log("Platform     | Position             | Spend    | Impr  | LinkClicks | CPC(₹) | Purchases");
console.log("-------------|----------------------|----------|-------|------------|--------|----------");
raw.placements.forEach(pl => {
  const p = pl.actions?.find(a => a.action_type === 'purchase')?.value || 0;
  console.log(
    `${pl.publisher_platform.padEnd(12)} | ` +
    `${pl.platform_position.padEnd(20)} | ` +
    `₹${parseFloat(pl.spend).toFixed(0).padStart(6)} | ` +
    `${String(pl.impressions).padStart(5)} | ` +
    `${String(pl.inline_link_clicks).padStart(10)} | ` +
    `${parseFloat(pl.cpc || 0).toFixed(1).padStart(6)} | ` +
    `${String(p).padStart(9)}`
  );
});

// 5. Demographics Breakdown
console.log("\n--- 5. AGE & GENDER DEMOGRAPHICS ---");
console.log("Age Group    | Gender | Spend    | Impr  | Clicks | LinkClicks | Purchases");
console.log("-------------|--------|----------|-------|--------|------------|----------");
raw.demographics.forEach(dm => {
  const p = dm.actions?.find(a => a.action_type === 'purchase')?.value || 0;
  console.log(
    `${dm.age.padEnd(12)} | ` +
    `${dm.gender.padEnd(6)} | ` +
    `₹${parseFloat(dm.spend).toFixed(0).padStart(6)} | ` +
    `${String(dm.impressions).padStart(5)} | ` +
    `${String(dm.clicks).padStart(6)} | ` +
    `${String(dm.inline_link_clicks).padStart(10)} | ` +
    `${String(p).padStart(9)}`
  );
});

// 6. Other Campaigns in Ad Account
console.log("\n--- 6. ALL CAMPAIGNS IN ACCOUNT ---");
raw.campaigns.forEach(c => {
  console.log(`Campaign: ${c.name} (ID: ${c.id}) | Status: ${c.status} | Effective: ${c.effective_status} | Updated: ${c.updated_time}`);
});
