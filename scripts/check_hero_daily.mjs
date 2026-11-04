import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const dateRange = JSON.stringify({ since: '2026-10-01', until: '2026-10-30' });

async function run() {
  const res = await fetch(`https://graph.facebook.com/v21.0/120248771569340630/insights?time_increment=1&time_range=${encodeURIComponent(dateRange)}&fields=spend,impressions,clicks,reach,date_start,actions&access_token=${token}`);
  const data = await res.json();
  console.log('Daily Insights for Hero Video ASC:');
  (data.data || []).forEach(d => {
    let p = 0;
    (d.actions || []).forEach(a => {
      if (a.action_type === 'purchase' || a.action_type === 'omni_purchase') p += parseInt(a.value);
    });
    console.log(`${d.date_start} | Spend: ₹${parseFloat(d.spend).toFixed(2)} | Impr: ${d.impressions} | Clicks: ${d.clicks} | Purchases: ${p}`);
  });
}

run().catch(console.error);
