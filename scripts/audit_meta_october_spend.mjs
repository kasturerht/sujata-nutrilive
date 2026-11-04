import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const adAccounts = [
  { id: 'act_1045791637117525', name: 'Sujata Nutrilive Main Ad Account' },
  { id: 'act_706658852401103', name: 'Sujata SD' }
];

async function run() {
  const dateRange = JSON.stringify({ since: '2026-10-01', until: '2026-10-30' });
  const allResults = [];

  for (const acct of adAccounts) {
    console.log(`\n========================================`);
    console.log(`Checking Account: ${acct.name} (${acct.id})`);
    console.log(`========================================`);

    // 1. Fetch all campaigns in account (regardless of status: ACTIVE, PAUSED, ARCHIVED)
    const cUrl = `https://graph.facebook.com/v21.0/${acct.id}/campaigns?fields=id,name,status,effective_status,objective,created_time,start_time,stop_time&limit=100&access_token=${adsToken}`;
    const cRes = await fetch(cUrl);
    const cData = await cRes.json();
    const campaigns = cData.data || [];
    console.log(`Total campaigns found in account: ${campaigns.length}`);

    // 2. Fetch insights for all campaigns for Oct 1 to Oct 30
    const iUrl = `https://graph.facebook.com/v21.0/${acct.id}/insights?level=campaign&time_range=${encodeURIComponent(dateRange)}&fields=campaign_id,campaign_name,spend,impressions,clicks,reach,actions,cost_per_action_type&limit=100&access_token=${adsToken}`;
    const iRes = await fetch(iUrl);
    const iData = await iRes.json();
    const insights = iData.data || [];
    console.log(`Campaigns with spend/insights in October: ${insights.length}`);

    // Map insights by campaign_id
    const insightMap = {};
    insights.forEach(i => {
      insightMap[i.campaign_id] = i;
    });

    for (const c of campaigns) {
      const ins = insightMap[c.id];
      const spend = ins ? parseFloat(ins.spend || '0') : 0;
      const impressions = ins ? parseInt(ins.impressions || '0') : 0;
      const clicks = ins ? parseInt(ins.clicks || '0') : 0;

      // Extract actions (purchases, leads, link clicks)
      let purchases = 0;
      let purchaseVal = 0;
      let leads = 0;
      let linkClicks = 0;

      if (ins?.actions) {
        ins.actions.forEach(a => {
          if (a.action_type === 'purchase' || a.action_type === 'omni_purchase') {
            purchases += parseInt(a.value || '0');
          }
          if (a.action_type === 'lead' || a.action_type === 'on_facebook_lead') {
            leads += parseInt(a.value || '0');
          }
          if (a.action_type === 'link_click') {
            linkClicks += parseInt(a.value || '0');
          }
        });
      }

      allResults.push({
        accountId: acct.id,
        accountName: acct.name,
        campaignId: c.id,
        campaignName: c.name,
        status: c.status,
        effectiveStatus: c.effective_status,
        objective: c.objective,
        spendOct: spend,
        impressions,
        clicks,
        linkClicks,
        purchases,
        leads
      });
    }

    // Also check account-level overall total spend for Oct 1 - Oct 30
    const acctTotalUrl = `https://graph.facebook.com/v21.0/${acct.id}/insights?time_range=${encodeURIComponent(dateRange)}&fields=spend,impressions,clicks,reach&access_token=${adsToken}`;
    const acctTotalRes = await fetch(acctTotalUrl);
    const acctTotalData = await acctTotalRes.json();
    console.log(`Account ${acct.name} total spend in Oct:`, acctTotalData.data?.[0]?.spend || '0');
  }

  fs.writeFileSync('scripts/meta_october_audit_raw.json', JSON.stringify(allResults, null, 2), 'utf8');

  console.log('\n========================================');
  console.log('--- ALL CAMPAIGNS WITH SPEND IN OCT 2026 ---');
  console.log('========================================');

  const campaignsWithSpend = allResults.filter(r => r.spendOct > 0);
  campaignsWithSpend.sort((a, b) => b.spendOct - a.spendOct);

  let totalWebsiteSpend = 0;
  let totalLeadGenSpend = 0;
  let totalAllSpend = 0;

  campaignsWithSpend.forEach(c => {
    totalAllSpend += c.spendOct;
    const nameLower = c.campaignName.toLowerCase();
    const isWebsite = nameLower.includes('website') || nameLower.includes('sales') || nameLower.includes('combo') || nameLower.includes('purchase') || c.objective === 'OUTCOME_SALES' || nameLower.includes('store');
    const isLeadGen = nameLower.includes('lead') || nameLower.includes('nexa') || nameLower.includes('form') || c.objective === 'OUTCOME_LEADS';

    let category = 'Other';
    if (isWebsite && !isLeadGen) {
      category = 'Website Campaign';
      totalWebsiteSpend += c.spendOct;
    } else if (isLeadGen) {
      category = 'Lead Generation Campaign';
      totalLeadGenSpend += c.spendOct;
    } else {
      category = 'General / Website';
      totalWebsiteSpend += c.spendOct;
    }

    console.log(`[${c.accountName}] ${c.campaignName}`);
    console.log(`  - Category: ${category} | Objective: ${c.objective} | Status: ${c.status} (${c.effectiveStatus})`);
    console.log(`  - Spend: ₹${c.spendOct.toFixed(2)} | Impressions: ${c.impressions} | Clicks: ${c.clicks} | Link Clicks: ${c.linkClicks} | Purchases: ${c.purchases} | Leads: ${c.leads}`);
  });

  console.log('\n========================================');
  console.log('--- TOTAL SPEND SUMMARY (OCTOBER 2026) ---');
  console.log('========================================');
  console.log(`Total Spend on Website Campaigns: ₹${totalWebsiteSpend.toFixed(2)}`);
  console.log(`Total Spend on Lead Generation Campaigns: ₹${totalLeadGenSpend.toFixed(2)}`);
  console.log(`Total Overall Meta Ads Spend: ₹${totalAllSpend.toFixed(2)}`);
}

run().catch(console.error);
