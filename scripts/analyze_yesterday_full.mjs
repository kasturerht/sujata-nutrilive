// scripts/analyze_yesterday_full.mjs
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/meta_yesterday_raw.json', 'utf8'));

console.log('Total rows yesterday:', data.data?.length);

const results = [];

for (const row of (data.data || [])) {
  let whatsappStarted = 0;
  let firstReply = 0;
  let leadsGrouped = 0;
  let linkClicks = 0;

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
    if (a.action_type === 'link_click') {
      linkClicks = parseInt(a.value || 0);
    }
  });

  results.push({
    campaign: row.campaign_name,
    adset: row.adset_name,
    ad: row.ad_name,
    spend: parseFloat(row.spend || 0),
    whatsappStarted,
    firstReply,
    leadsGrouped,
    linkClicks,
    actions: row.actions
  });
}

console.log(JSON.stringify(results, null, 2));
