// scripts/parse_meta_and_ga4_comparison.mjs
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

async function compare() {
  const token = env.META_ADS_ACCESS_TOKEN;
  const adId = '120249010265760630';

  const fields = [
    'spend', 'impressions', 'reach', 'cpm', 'clicks', 'inline_link_clicks',
    'ctr', 'inline_link_click_ctr', 'cpc', 'cost_per_inline_link_click',
    'actions', 'action_values', 'purchase_roas'
  ].join(',');

  const timeRange = JSON.stringify({ since: '2026-10-31', until: '2026-11-01' });
  const url = `https://graph.facebook.com/v21.0/${adId}/insights?fields=${fields}&time_increment=1&time_range=${encodeURIComponent(timeRange)}&access_token=${token}`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  console.log("=== META DAILY COMPARISON (OCT 31 vs NOV 01) ===");
  data.data.forEach(d => {
    const purchases = d.actions?.find(a => a.action_type === 'purchase')?.value || 0;
    const atc = d.actions?.find(a => a.action_type === 'add_to_cart')?.value || 0;
    const ic = d.actions?.find(a => a.action_type === 'initiate_checkout')?.value || 0;
    const lpv = d.actions?.find(a => a.action_type === 'landing_page_view')?.value || 0;
    console.log(`Date: ${d.date_start}`);
    console.log(`  Spend: ₹${d.spend} | Impressions: ${d.impressions} | Reach: ${d.reach}`);
    console.log(`  Clicks: ${d.clicks} | Inline Link Clicks: ${d.inline_link_clicks}`);
    console.log(`  CTR: ${d.ctr}% | Inline CTR: ${d.inline_link_click_ctr}%`);
    console.log(`  CPC: ₹${d.cpc} | Cost Per Link Click: ₹${d.cost_per_inline_link_click}`);
    console.log(`  Landing Page Views: ${lpv} | ATC: ${atc} | IC: ${ic} | Purchases: ${purchases}`);
  });

  // Placements comparison
  const plUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=spend,impressions,clicks,inline_link_clicks,actions&breakdowns=publisher_platform,platform_position&time_range=${encodeURIComponent(timeRange)}&access_token=${token}`;
  const plRes = await fetch(plUrl);
  const plData = await plRes.json();
  
  console.log("\n=== PLACEMENTS (OCT 31 vs NOV 01) ===");
  plData.data.forEach(p => {
    const lpv = p.actions?.find(a => a.action_type === 'landing_page_view')?.value || 0;
    console.log(`${p.date_start} | ${p.publisher_platform} - ${p.platform_position}: Spend ₹${p.spend}, Impr: ${p.impressions}, LinkClicks: ${p.inline_link_clicks}, LPV: ${lpv}`);
  });
}

compare().catch(console.error);
