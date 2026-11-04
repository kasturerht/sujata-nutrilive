// scripts/fetch-yesterday-leads.mjs
import fs from 'fs';
import path from 'path';

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
const YESTERDAY = '2026-10-26';

async function run() {
  console.log(`📡 Fetching Meta Ad Insights for YESTERDAY: ${YESTERDAY}...`);

  // 1. Fetch Insights at the Ad Level for yesterday
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'${YESTERDAY}','until':'${YESTERDAY}'}&level=ad&fields=campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks,actions,action_values,cost_per_action_type&limit=100`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error('❌ Meta API Error:', data.error);
    return;
  }

  console.log(`Received ${data.data ? data.data.length : 0} ad rows for ${YESTERDAY}.`);
  fs.writeFileSync('scripts/meta_yesterday_raw.json', JSON.stringify(data, null, 2));

  // 2. Also fetch creatives for these ads to extract phone numbers / WhatsApp links
  const adIds = (data.data || []).map(r => r.ad_id);
  console.log('Ad IDs active yesterday:', adIds);

  const creativesMap = {};
  for (const adId of adIds) {
    const adRes = await fetch(`https://graph.facebook.com/v21.0/${adId}?access_token=${metaToken}&fields=id,name,adset{id,name},creative{id,name,asset_feed_spec,object_story_spec,effective_object_story_id}`);
    const adData = await adRes.json();
    creativesMap[adId] = adData;
  }

  fs.writeFileSync('scripts/meta_yesterday_creatives.json', JSON.stringify(creativesMap, null, 2));

  console.log('\n--- DETAILED AD BREAKDOWN FOR YESTERDAY ---');
  let totalSpend = 0;
  let totalWhatsappLeads = 0;

  for (const row of (data.data || [])) {
    const spend = parseFloat(row.spend || 0);
    totalSpend += spend;

    let whatsappStarted = 0;
    let firstReply = 0;
    let leadsGrouped = 0;

    (row.actions || []).forEach(a => {
      if (a.action_type === 'onsite_conversion.messaging_conversation_started_7d') {
        whatsappStarted = parseInt(a.value || 0);
      }
      if (a.action_type === 'onsite_conversion.messaging_first_reply') {
        firstReply = parseInt(a.value || 0);
      }
      if (a.action_type === 'onsite_conversion.lead_grouped') {
        leadsGrouped = parseInt(a.value || 0);
      }
    });

    const creativeInfo = creativesMap[row.ad_id]?.creative;
    console.log(`Campaign: ${row.campaign_name}`);
    console.log(`  AdSet: ${row.adset_name}`);
    console.log(`  Ad: ${row.ad_name} (${row.ad_id})`);
    console.log(`  Spend: ₹${spend.toFixed(2)} | Clicks: ${row.clicks}`);
    console.log(`  WhatsApp Conversations Started: ${whatsappStarted}`);
    console.log(`  Messaging First Reply: ${firstReply}`);
    console.log(`  Leads Grouped: ${leadsGrouped}`);
    console.log(`  All Actions:`, JSON.stringify(row.actions || [], null, 2));
    console.log('----------------------------------------------------');
  }

  console.log(`\n💰 Total Spend Yesterday: ₹${totalSpend.toFixed(2)}`);
}

run();
