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

async function fetchMetaCampaignsAndAds() {
  console.log(`Checking Meta Ad Account: ${adAccountId} from 2026-10-01 to 2026-10-25...`);

  // 1. Fetch Insights at the Ad / AdSet Level for 1 Oct to 25 Oct 2026
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-01','until':'2026-10-25'}&level=ad&fields=campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks,actions&limit=100`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error('Meta API Error:', data.error);
    return;
  }

  console.log(`Received ${data.data ? data.data.length : 0} ad insight rows.`);

  const adBreakdown = (data.data || []).map(row => {
    let whatsappChats = 0;
    let leads = 0;
    let onFacebookLeads = 0;

    (row.actions || []).forEach(a => {
      if (a.action_type.includes('messaging_conversation_started') || a.action_type.includes('messaging_first_reply')) {
        whatsappChats = Math.max(whatsappChats, parseInt(a.value || 0));
      }
      if (a.action_type === 'lead') {
        leads += parseInt(a.value || 0);
      }
      if (a.action_type === 'onsite_conversion.lead_grouped') {
        onFacebookLeads += parseInt(a.value || 0);
      }
    });

    return {
      campaign: row.campaign_name,
      adset: row.adset_name,
      ad: row.ad_name,
      spend: '₹' + parseFloat(row.spend || 0).toFixed(2),
      clicks: parseInt(row.clicks || 0),
      whatsappChats,
      leads,
      onFacebookLeads,
      actions: row.actions
    };
  });

  fs.writeFileSync('scripts/meta_ads_oct_1_to_25_raw.json', JSON.stringify({ data: data.data, breakdown: adBreakdown }, null, 2));

  console.log('\n--- ADS / AD SETS BREAKDOWN (OCT 1 - OCT 25) ---');
  adBreakdown.forEach(b => {
    console.log(`Campaign: ${b.campaign}`);
    console.log(`  AdSet: ${b.adset}`);
    console.log(`  Ad: ${b.ad}`);
    console.log(`  Spend: ${b.spend} | Clicks: ${b.clicks} | WhatsApp Chats: ${b.whatsappChats} | Leads: ${b.leads}`);
    console.log('----------------------------------------------------');
  });

  // Also fetch Ad Creatives to see the phone numbers / WhatsApp links configured!
  const adsUrl = `https://graph.facebook.com/v21.0/${adAccountId}/ads?access_token=${metaToken}&fields=id,name,creative{id,name,asset_feed_spec,object_story_spec}&limit=50`;
  const adsRes = await fetch(adsUrl);
  const adsData = await adsRes.json();
  fs.writeFileSync('scripts/meta_ads_creatives.json', JSON.stringify(adsData, null, 2));
  console.log('Saved ads creatives details.');
}

fetchMetaCampaignsAndAds().catch(console.error);
