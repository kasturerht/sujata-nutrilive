// scripts/check_nov1_placements.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function run() {
  const token = env.META_ADS_ACCESS_TOKEN;
  const adId = '120249010265760630';

  const timeRange = JSON.stringify({ since: '2026-11-01', until: '2026-11-01' });
  const plUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=spend,impressions,clicks,inline_link_clicks,actions&breakdowns=publisher_platform,platform_position&time_range=${encodeURIComponent(timeRange)}&access_token=${token}`;
  const plRes = await fetch(plUrl);
  const plData = await plRes.json();
  
  console.log("=== PLACEMENTS NOV 01 ===");
  plData.data.forEach(p => {
    const lpv = p.actions?.find(a => a.action_type === 'landing_page_view')?.value || 0;
    console.log(`${p.publisher_platform} - ${p.platform_position}: Spend ₹${p.spend}, Impr: ${p.impressions}, LinkClicks: ${p.inline_link_clicks}, LPV: ${lpv}`);
  });
}

run();
