import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const act = 'act_1045791637117525';

async function listAllCampaignsAndAds() {
  console.log("Fetching all campaigns from Meta...");
  const cUrl = `https://graph.facebook.com/v21.0/${act}/campaigns?fields=id,name,status,objective,effective_status,created_time,start_time,stop_time,daily_budget,lifetime_budget&limit=50&access_token=${adsToken}`;
  const cRes = await fetch(cUrl);
  const cData = await cRes.json();
  
  console.log("Campaigns found:", (cData.data || []).length);
  (cData.data || []).forEach(c => {
    console.log(`[${c.effective_status}] ID: ${c.id} | Name: ${c.name} | Objective: ${c.objective} | Start: ${c.start_time}`);
  });

  console.log("\nFetching all currently ACTIVE or recently ACTIVE Ads...");
  const aUrl = `https://graph.facebook.com/v21.0/${act}/ads?fields=id,name,status,effective_status,campaign_id,adset_id,created_time,creative{id,name,title,body,video_id,image_url}&limit=50&access_token=${adsToken}`;
  const aRes = await fetch(aUrl);
  const aData = await aRes.json();
  
  console.log("Ads found:", (aData.data || []).length);
  (aData.data || []).forEach(a => {
    console.log(`Ad [${a.effective_status}] ID: ${a.id} | Name: ${a.name} | Campaign ID: ${a.campaign_id}`);
  });
}

listAllCampaignsAndAds().catch(console.error);
