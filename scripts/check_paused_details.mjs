import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const dateRange = JSON.stringify({ since: '2026-10-01', until: '2026-10-30' });

const pausedIds = [
  { id: '120248960265380630', name: 'sale web 21/10' },
  { id: '120248960983410630', name: 'sale web 21/10 - 2 Spirulina tab' },
  { id: '120248771753950630', name: 'Sale camp 1 08/10' }
];

async function run() {
  for (const c of pausedIds) {
    const res = await fetch(`https://graph.facebook.com/v21.0/${c.id}/insights?time_range=${encodeURIComponent(dateRange)}&fields=spend,impressions,clicks,reach,actions&access_token=${token}`);
    const data = await res.json();
    console.log(`Campaign: ${c.name} (${c.id})`);
    console.log(JSON.stringify(data.data?.[0] || 'No Data', null, 2));
  }
}

run().catch(console.error);
