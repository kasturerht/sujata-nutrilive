import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const postFullId = '356279144243520_122224882352447084';

async function run() {
  const res = await fetch(`https://graph.facebook.com/v21.0/${postFullId}/comments?fields=id,from,message,created_time,like_count&access_token=${adsToken}`);
  const data = await res.json();
  console.log("Comments:", JSON.stringify(data, null, 2));
}

run().catch(console.error);
