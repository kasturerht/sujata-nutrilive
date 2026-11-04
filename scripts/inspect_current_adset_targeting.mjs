import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const adsetId = '120248771569360630';

async function check() {
  const url = `https://graph.facebook.com/v21.0/${adsetId}?access_token=${token}&fields=id,name,status,effective_status,daily_budget,targeting`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Current AdSet Config:", JSON.stringify(data, null, 2));
}

check().catch(console.error);
