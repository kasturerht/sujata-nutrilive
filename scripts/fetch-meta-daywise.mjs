// scripts/fetch-meta-daywise.mjs
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

async function fetchDayWiseMeta() {
  console.log('Fetching Meta Day-wise data for account:', adAccountId);
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-07','until':'2026-10-16'}&time_increment=1&fields=date_start,spend,impressions,clicks,cpc,cpm,ctr,actions,cost_per_action_type&limit=50`;
  
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error('Meta API Error:', data.error);
    return;
  }

  const days = (data.data || []).map(row => {
    const spend = parseFloat(row.spend || 0);
    const imp = parseInt(row.impressions || 0);
    const clicks = parseInt(row.clicks || 0);
    const ctr = parseFloat(row.ctr || 0);
    const cpc = parseFloat(row.cpc || 0);
    const cpm = parseFloat(row.cpm || 0);

    let whatsappChats = 0;
    let leads = 0;
    let purchases = 0;

    (row.actions || []).forEach(a => {
      if (a.action_type.includes('messaging_conversation_started') || a.action_type.includes('onsite_conversion.messaging_first_reply')) {
        whatsappChats = Math.max(whatsappChats, parseInt(a.value || 0));
      }
      if (a.action_type === 'lead' || a.action_type.includes('lead')) {
        leads += parseInt(a.value || 0);
      }
      if (a.action_type === 'purchase' || a.action_type === 'omni_purchase') {
        purchases += parseInt(a.value || 0);
      }
    });

    const costPerChat = whatsappChats > 0 ? (spend / whatsappChats).toFixed(2) : 'N/A';

    return {
      date: row.date_start,
      spend: spend.toFixed(2),
      impressions: imp,
      clicks: clicks,
      ctr: ctr.toFixed(2) + '%',
      cpc: '₹' + cpc.toFixed(2),
      cpm: '₹' + cpm.toFixed(2),
      whatsappChats,
      costPerChat: costPerChat !== 'N/A' ? '₹' + costPerChat : 'N/A',
      purchases
    };
  });

  console.log('\n--- DAY WISE META ADS SUMMARY (OCT 7 - OCT 16) ---');
  console.table(days);

  // Write to json
  fs.writeFileSync('scripts/meta_daywise_october.json', JSON.stringify(days, null, 2), 'utf8');
}

fetchDayWiseMeta().catch(console.error);
