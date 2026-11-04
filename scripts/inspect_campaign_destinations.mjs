import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const act = 'act_1045791637117525';

async function inspectCampaignDestinations() {
  const url = `https://graph.facebook.com/v21.0/${act}/ads?fields=id,name,campaign{id,name,objective},adset{id,name,destination_type,optimization_goal},creative{id,name,link_url,call_to_action_type}&limit=100&access_token=${adsToken}`;
  const res = await fetch(url);
  const data = await res.json();
  const ads = data.data || [];

  console.log(`Total Ads inspected: ${ads.length}`);
  const campaignDestMap = {};

  ads.forEach(ad => {
    const cName = ad.campaign?.name || 'Unknown';
    const cId = ad.campaign?.id;
    const dest = ad.adset?.destination_type || 'Unknown';
    const goal = ad.adset?.optimization_goal || 'Unknown';
    const link = ad.creative?.link_url || 'No Link';
    const cta = ad.creative?.call_to_action_type || 'No CTA';

    if (!campaignDestMap[cName]) {
      campaignDestMap[cName] = {
        campaignId: cId,
        destination_types: new Set(),
        optimization_goals: new Set(),
        links: new Set(),
        cta: new Set(),
        ads: []
      };
    }
    campaignDestMap[cName].destination_types.add(dest);
    campaignDestMap[cName].optimization_goals.add(goal);
    campaignDestMap[cName].links.add(link);
    campaignDestMap[cName].cta.add(cta);
    campaignDestMap[cName].ads.push({
      adName: ad.name,
      dest,
      goal,
      link,
      cta
    });
  });

  for (const [cName, info] of Object.entries(campaignDestMap)) {
    console.log(`\n========================================`);
    console.log(`Campaign: ${cName}`);
    console.log(`  Destination Types:`, Array.from(info.destination_types));
    console.log(`  Optimization Goals:`, Array.from(info.optimization_goals));
    console.log(`  CTAs:`, Array.from(info.cta));
    console.log(`  Links:`, Array.from(info.links));
  }
}

inspectCampaignDestinations().catch(console.error);
