// scripts/meta-ads-brain.mjs
// 🎯 SUJATA NUTRILIVE: AUTONOMOUS META ADS INTELLIGENCE & AUDIT ENGINE
// Programmatic Management for Meta Marketing API (Campaigns, AdSets, ROAS & Insights)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env
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
const AD_ACCOUNT_ID = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

if (!TOKEN) {
  console.error('❌ Error: META_ADS_ACCESS_TOKEN not found in .env');
  process.exit(1);
}

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

async function runAudit() {
  console.log('=============================================================');
  console.log('🎯 SUJATA NUTRILIVE: META ADS EXECUTIVE INTELLIGENCE REPORT');
  console.log('=============================================================');

  // 1. Account Info
  const act = await fetchGraph(AD_ACCOUNT_ID, {
    fields: 'name,account_status,currency,amount_spent,balance,spend_cap'
  });

  if (act.error) {
    console.error('❌ Error fetching Ad Account:', act.error.message);
    process.exit(1);
  }

  const totalSpentFormatted = (parseInt(act.amount_spent || '0', 10) / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: act.currency || 'INR'
  });

  console.log(`\n🏢 AD ACCOUNT: ${act.name} (${act.id})`);
  console.log(`🟢 Status: ${act.account_status === 1 ? 'ACTIVE' : 'DISABLED/PENDING'}`);
  console.log(`💰 Lifetime Spent: ${totalSpentFormatted}`);
  console.log(`💳 Current Balance / Pending: ₹${((parseInt(act.balance || '0', 10)) / 100).toFixed(2)}`);

  // 2. Active & Key Campaigns
  const campData = await fetchGraph(`${AD_ACCOUNT_ID}/campaigns`, {
    fields: 'id,name,status,objective,daily_budget,lifetime_budget,updated_time',
    limit: '25'
  });

  const campaigns = campData.data || [];
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
  const pausedCampaigns = campaigns.filter(c => c.status === 'PAUSED');

  console.log(`\n📢 CAMPAIGNS SUMMARY: ${activeCampaigns.length} Active | ${pausedCampaigns.length} Paused`);
  console.log('\n--- ACTIVE CAMPAIGNS ---');
  activeCampaigns.forEach((c, idx) => {
    const budget = c.daily_budget ? `₹${parseInt(c.daily_budget, 10) / 100}/day` : 'Using Adset Budget';
    console.log(`  ${idx + 1}. [${c.status}] ${c.name}`);
    console.log(`     🎯 Objective: ${c.objective} | 💵 Budget: ${budget} (ID: ${c.id})`);
  });

  // 3. Last 7 Days Performance Insights
  const insightsData = await fetchGraph(`${AD_ACCOUNT_ID}/insights`, {
    date_preset: 'last_7d',
    fields: 'spend,impressions,reach,clicks,cpc,ctr,actions,cost_per_action_type,purchase_roas'
  });

  if (insightsData.data && insightsData.data.length > 0) {
    const ins = insightsData.data[0];
    const actions = ins.actions || [];
    const costPerAction = ins.cost_per_action_type || [];

    const getActionCount = (type) => actions.find(a => a.action_type === type)?.value || '0';
    const getActionCost = (type) => {
      const c = costPerAction.find(a => a.action_type === type)?.value;
      return c ? `₹${parseFloat(c).toFixed(2)}` : 'N/A';
    };

    console.log(`\n📊 LAST 7 DAYS PERFORMANCE (${ins.date_start} to ${ins.date_stop}):`);
    console.log(`  💸 Total Ad Spend: ₹${parseFloat(ins.spend || 0).toLocaleString('en-IN')}`);
    console.log(`  👀 Impressions: ${parseInt(ins.impressions || 0, 10).toLocaleString('en-IN')}`);
    console.log(`  👥 Reach: ${parseInt(ins.reach || 0, 10).toLocaleString('en-IN')}`);
    console.log(`  🖱️ Link Clicks: ${parseInt(ins.clicks || 0, 10).toLocaleString('en-IN')} (CTR: ${parseFloat(ins.ctr || 0).toFixed(2)}% | CPC: ₹${parseFloat(ins.cpc || 0).toFixed(2)})`);

    const msgStarted = getActionCount('onsite_conversion.messaging_conversation_started_7d');
    const msgCost = getActionCost('onsite_conversion.messaging_conversation_started_7d');
    const purchases = getActionCount('onsite_web_purchase') || getActionCount('purchase');
    const checkouts = getActionCount('initiate_checkout') || getActionCount('onsite_web_initiate_checkout');
    const addToCart = getActionCount('add_to_cart') || getActionCount('onsite_web_add_to_cart');

    console.log('\n🎯 KEY RESULTS:');
    console.log(`  💬 WhatsApp/Messenger Chats: ${msgStarted} (Cost/Chat: ${msgCost})`);
    console.log(`  🛒 Add to Cart: ${addToCart}`);
    console.log(`  💳 Initiated Checkouts: ${checkouts}`);
    console.log(`  📦 Website Purchases: ${purchases}`);
  }

  console.log('\n=============================================================');
  console.log('✅ META MARKETING API 100% OPERATIONAL & READY FOR COMMANDS');
  console.log('=============================================================\n');
}

runAudit();
