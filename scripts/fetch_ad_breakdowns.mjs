import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const adId = '120249010265760630';

async function fetchBreakdowns() {
  console.log("=== FETCHING PLATFORM & PLACEMENT BREAKDOWN ===");
  const pUrl = `https://graph.facebook.com/v21.0/${adId}/insights?breakdowns=publisher_platform,platform_position&fields=spend,impressions,inline_link_clicks,actions,action_values&date_preset=maximum&access_token=${adsToken}`;
  const pRes = await fetch(pUrl);
  const pData = await pRes.json();

  console.log("=== FETCHING AGE & GENDER BREAKDOWN ===");
  const aUrl = `https://graph.facebook.com/v21.0/${adId}/insights?breakdowns=age,gender&fields=spend,impressions,inline_link_clicks,actions,action_values&date_preset=maximum&access_token=${adsToken}`;
  const aRes = await fetch(aUrl);
  const aData = await aRes.json();

  fs.writeFileSync('scripts/website_ad_breakdowns.json', JSON.stringify({ placement: pData.data, demographics: aData.data }, null, 2));
  console.log("Saved breakdowns to scripts/website_ad_breakdowns.json");
}

fetchBreakdowns().catch(console.error);
