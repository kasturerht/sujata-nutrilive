import fs from 'fs';
import path from 'path';

// Load .env
const envPath = path.resolve('.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
}

const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

async function checkTodayMeta() {
  console.log(`Checking Meta Ads for TODAY: 2026-10-26...`);
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-26','until':'2026-10-26'}&level=campaign&fields=campaign_id,campaign_name,objective,spend,impressions,clicks,cpc,ctr,actions,cost_per_action_type&limit=50`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error('Meta API Error:', data.error);
    return;
  }

  console.log('Today Insights count:', data.data ? data.data.length : 0);
  console.log(JSON.stringify(data.data, null, 2));

  // Also check active campaigns status
  const campUrl = `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?access_token=${metaToken}&fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget&limit=50`;
  const campRes = await fetch(campUrl);
  const campData = await campRes.json();
  
  const activeCampaigns = (campData.data || []).filter(c => c.effective_status === 'ACTIVE');
  console.log('\n--- ACTIVE CAMPAIGNS RIGHT NOW ---');
  console.table(activeCampaigns);
}

checkTodayMeta().catch(console.error);
