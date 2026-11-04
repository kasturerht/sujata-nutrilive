// scripts/check_meta_daily.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function checkMeta() {
  const token = env.META_ADS_ACCESS_TOKEN;
  const adId = '120249010265760630';
  console.log('Token present:', !!token);
  
  const fields = [
    'spend', 'impressions', 'reach', 'cpm', 'clicks', 'inline_link_clicks',
    'ctr', 'inline_link_click_ctr', 'cpc', 'cost_per_inline_link_click',
    'actions', 'action_values', 'purchase_roas'
  ].join(',');

  const timeRange = JSON.stringify({ since: '2026-10-30', until: '2026-11-01' });
  const url = `https://graph.facebook.com/v21.0/${adId}/insights?fields=${fields}&time_increment=1&time_range=${encodeURIComponent(timeRange)}&access_token=${token}`;
  
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));

  // Also check placements for Nov 01
  const placementUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=spend,impressions,clicks,inline_link_clicks,actions&breakdowns=publisher_platform,platform_position&time_range=${encodeURIComponent(JSON.stringify({ since: '2026-11-01', until: '2026-11-01' }))}&access_token=${token}`;
  const plRes = await fetch(placementUrl);
  const plData = await plRes.json();
  console.log("=== PLACEMENTS NOV 01 ===");
  console.log(JSON.stringify(plData, null, 2));
}

checkMeta().catch(console.error);
