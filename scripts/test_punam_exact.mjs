import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const dateRange = JSON.stringify({ since: '2026-10-27', until: '2026-10-29' });

async function run() {
  const cId = '120247944916240630'; // Spirulina MH- Marathi 9922500344
  const url = `https://graph.facebook.com/v21.0/${cId}/insights?time_increment=1&time_range=${encodeURIComponent(dateRange)}&fields=spend,impressions,clicks,reach,date_start,date_stop,actions&access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Spirulina MH- Marathi 9922500344 (Punam Kasture) for Oct 27, 28, 29:');
  (data.data || []).forEach(d => {
    let msgs = 0;
    let leads = 0;
    let linkClicks = 0;
    (d.actions || []).forEach(a => {
      if (a.action_type === 'onsite_conversion.messaging_conversation_started_7d') msgs += parseInt(a.value);
      if (a.action_type === 'lead') leads += parseInt(a.value);
      if (a.action_type === 'link_click') linkClicks += parseInt(a.value);
    });
    console.log(`${d.date_start}: Spend: ₹${parseFloat(d.spend).toFixed(2)} | Clicks: ${d.clicks} | Link Clicks: ${linkClicks} | WhatsApp msgs: ${msgs} | Leads: ${leads}`);
  });
}

run().catch(console.error);
