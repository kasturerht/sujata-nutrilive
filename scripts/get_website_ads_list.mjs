import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const campaignId = '120248771569340630';

async function getAdsList() {
  const aUrl = `https://graph.facebook.com/v21.0/${campaignId}/ads?fields=id,name,status,effective_status,created_time,creative{id,name,title,body,video_id,image_url,call_to_action_type}&access_token=${adsToken}`;
  const aRes = await fetch(aUrl);
  const aData = await aRes.json();
  
  (aData.data || []).forEach(a => {
    console.log(`Ad ID: ${a.id} | Status: ${a.status} | Effective: ${a.effective_status} | Name: ${a.name} | Created: ${a.created_time}`);
  });
}

getAdsList().catch(console.error);
