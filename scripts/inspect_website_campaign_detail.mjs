import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const campaignId = '120248771569340630';

async function inspectWebsiteCampaign() {
  console.log("=== INSPECTING WEBSITE SALES CAMPAIGN ===");
  const cUrl = `https://graph.facebook.com/v21.0/${campaignId}?fields=id,name,status,effective_status,objective,created_time,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining,special_ad_categories&access_token=${adsToken}`;
  const cRes = await fetch(cUrl);
  console.log("Campaign Details:", await cRes.json());

  console.log("\n=== ADSETS IN CAMPAIGN ===");
  const asUrl = `https://graph.facebook.com/v21.0/${campaignId}/adsets?fields=id,name,status,effective_status,daily_budget,lifetime_budget,optimization_goal,billing_event,promoted_object,targeting,learning_stage_info&access_token=${adsToken}`;
  const asRes = await fetch(asUrl);
  const asData = await asRes.json();
  console.log("Adsets:", JSON.stringify(asData, null, 2));

  console.log("\n=== ADS IN CAMPAIGN ===");
  const aUrl = `https://graph.facebook.com/v21.0/${campaignId}/ads?fields=id,name,status,effective_status,created_time,updated_time,creative{id,name,title,body,object_story_spec,video_id,image_url,call_to_action_type},tracking_specs&access_token=${adsToken}`;
  const aRes = await fetch(aUrl);
  const aData = await aRes.json();
  console.log("Ads:", JSON.stringify(aData, null, 2));
}

inspectWebsiteCampaign().catch(console.error);
