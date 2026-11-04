import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const adId = '120249258273640630'; // Active ad in the campaign

async function checkCreative() {
  const url = `https://graph.facebook.com/v21.0/${adId}?access_token=${token}&fields=id,name,status,creative{id,name,title,body,object_story_spec,asset_feed_spec}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Ad Creative Spec:", JSON.stringify(data, null, 2));
}

checkCreative().catch(console.error);
