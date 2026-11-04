import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const act = 'act_1045791637117525';
const dateRange = JSON.stringify({ since: '2026-10-01', until: '2026-10-30' });

async function getDailyWebsiteSpend() {
  const websiteCampaignIds = [
    '120239241454690554', // Hero Video ASC
    '120238805626810554', // sale web 21/10
    '120238808093150554', // sale web 21/10 - 2 tab
    '120237937326640554'  // Sale camp 1 08/10
  ];

  const url = `https://graph.facebook.com/v21.0/${act}/insights?level=campaign&time_increment=1&time_range=${encodeURIComponent(dateRange)}&fields=campaign_id,campaign_name,spend,date_start,date_stop,impressions,clicks&filtering=[{"field":"campaign.id","operator":"IN","value":["120239241454690554","120238805626810554","120238808093150554","120237937326640554"]}]&limit=200&access_token=${adsToken}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`Daily data points:`, (data.data || []).length);
  
  const dailySpend = {};
  (data.data || []).forEach(d => {
    const date = d.date_start;
    dailySpend[date] = (dailySpend[date] || 0) + parseFloat(d.spend || '0');
  });

  console.log('Daily Website Ad Spend in October:');
  Object.keys(dailySpend).sort().forEach(date => {
    console.log(`${date}: ₹${dailySpend[date].toFixed(2)}`);
  });
}

getDailyWebsiteSpend().catch(console.error);
