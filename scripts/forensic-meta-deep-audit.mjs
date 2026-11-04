// scripts/forensic-meta-deep-audit.mjs
// 🔬 DEEP FORENSIC AUDIT OF ACTIVE META ADS FOR SUJATA NUTRILIVE (OCTOBER 2026)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.substring(0, idx).trim()] = val;
    }
  }
  return env;
}

const env = loadEnv();
const TOKEN = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const ACT_ID = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

const GRAPH_BASE = 'https://graph.facebook.com/v19.0';

async function fetchGraph(endpoint, params = {}) {
  const url = new URL(`${GRAPH_BASE}/${endpoint}`);
  url.searchParams.set('access_token', TOKEN);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  return await res.json();
}

async function runDeepAudit() {
  console.log('🚀 Starting Deep Forensic Audit on Meta Ad Account:', ACT_ID);

  // 1. Account Details
  const accountInfo = await fetchGraph(ACT_ID, {
    fields: 'name,account_status,currency,spend_cap,amount_spent,balance,created_time'
  });

  // 2. Active Campaigns
  const campaigns = await fetchGraph(`${ACT_ID}/campaigns`, {
    fields: 'id,name,status,objective,daily_budget,lifetime_budget,budget_remaining,bid_strategy',
    effective_status: JSON.stringify(['ACTIVE']),
    limit: 50
  });

  // 3. Active Ad Sets
  const adsets = await fetchGraph(`${ACT_ID}/adsets`, {
    fields: 'id,name,campaign_id,status,daily_budget,lifetime_budget,optimization_goal,billing_event,bid_strategy,targeting',
    effective_status: JSON.stringify(['ACTIVE']),
    limit: 50
  });

  // 4. Active Ads with Creative Details
  const ads = await fetchGraph(`${ACT_ID}/ads`, {
    fields: 'id,name,campaign_id,adset_id,status,creative{id,name,title,body,image_url,video_id,call_to_action_type},tracking_specs',
    effective_status: JSON.stringify(['ACTIVE']),
    limit: 50
  });

  // 5. Granular Insights (Last 7 Days)
  const insights7d = await fetchGraph(`${ACT_ID}/insights`, {
    date_preset: 'last_7d',
    level: 'campaign',
    fields: 'campaign_id,campaign_name,spend,impressions,reach,frequency,clicks,cpc,cpm,ctr,actions,cost_per_action_type,cost_per_unique_click'
  });

  // 6. Granular Insights (Last 30 Days)
  const insights30d = await fetchGraph(`${ACT_ID}/insights`, {
    date_preset: 'last_30d',
    level: 'campaign',
    fields: 'campaign_id,campaign_name,spend,impressions,reach,frequency,clicks,cpc,cpm,ctr,actions,cost_per_action_type'
  });

  // 7. Ad-Level Insights (Last 7 Days) to see which creative is winning/losing
  const adInsights = await fetchGraph(`${ACT_ID}/insights`, {
    date_preset: 'last_7d',
    level: 'ad',
    fields: 'ad_id,ad_name,campaign_name,spend,impressions,clicks,cpc,ctr,actions,cost_per_action_type'
  });

  const fullReport = {
    timestamp: new Date().toISOString(),
    accountInfo,
    campaigns: campaigns.data || [],
    adsets: adsets.data || [],
    ads: ads.data || [],
    insights7d: insights7d.data || [],
    insights30d: insights30d.data || [],
    adInsights: adInsights.data || []
  };

  fs.mkdirSync(path.resolve(__dirname, '..', 'data'), { recursive: true });
  fs.writeFileSync(path.resolve(__dirname, '..', 'data', 'meta-deep-audit.json'), JSON.stringify(fullReport, null, 2), 'utf8');

  console.log('✅ Audit data saved to data/meta-deep-audit.json');
  console.log('📊 Active Campaigns Count:', fullReport.campaigns.length);
  console.log('📊 Active AdSets Count:', fullReport.adsets.length);
  console.log('📊 Active Ads Count:', fullReport.ads.length);
}

runDeepAudit().catch(err => {
  console.error('❌ Error during audit:', err);
});
