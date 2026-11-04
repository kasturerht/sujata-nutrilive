import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const act = 'act_1045791637117525';

async function investigatePunam() {
  console.log('=== INVESTIGATING ALL CAMPAIGNS FOR PUNAM / 9922500344 ===');
  
  // 1. Fetch ALL campaigns in account matching 00344 or Punam
  const url = `https://graph.facebook.com/v21.0/${act}/campaigns?fields=id,name,status,effective_status,objective,created_time,start_time,stop_time,daily_budget,lifetime_budget&limit=150&access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();
  const allCampaigns = data.data || [];

  const matchedCampaigns = allCampaigns.filter(c => 
    c.name.toLowerCase().includes('00344') || 
    c.name.toLowerCase().includes('punam') || 
    c.name.toLowerCase().includes('shirsath')
  );

  console.log(`Found ${matchedCampaigns.length} campaigns matching 00344 or Punam:`);
  matchedCampaigns.forEach(c => {
    console.log(`- ID: ${c.id} | Name: ${c.name} | Status: ${c.status} (${c.effective_status}) | Budget: ${c.daily_budget}`);
  });

  // 2. For each matched campaign, pull day-by-day insights for the entire month of October 2026!
  const dateRange = JSON.stringify({ since: '2026-10-01', until: '2026-10-30' });
  for (const c of matchedCampaigns) {
    console.log(`\nInsights for [${c.name}] (${c.id}):`);
    const iUrl = `https://graph.facebook.com/v21.0/${c.id}/insights?time_increment=1&time_range=${encodeURIComponent(dateRange)}&fields=spend,impressions,clicks,reach,date_start,actions&access_token=${token}`;
    const iRes = await fetch(iUrl);
    const iData = await iRes.json();
    const days = iData.data || [];
    if (days.length === 0) {
      console.log('  No insights returned for Oct 1 - Oct 30');
    } else {
      days.forEach(d => {
        let msgs = 0;
        let leads = 0;
        (d.actions || []).forEach(a => {
          if (a.action_type === 'onsite_conversion.messaging_conversation_started_7d') msgs += parseInt(a.value);
          if (a.action_type === 'lead') leads += parseInt(a.value);
        });
        console.log(`  ${d.date_start}: Spend: ₹${parseFloat(d.spend).toFixed(2)} | Clicks: ${d.clicks} | WhatsApp msgs: ${msgs} | Leads: ${leads}`);
      });
    }
  }

  // 3. Let's also check if ANY other campaign was active on 27, 28, 29, 30 Oct!
  console.log('\n=== CHECKING ALL CAMPAIGNS WITH SPEND ON OCT 27, 28, 29, 30 ===');
  const recentRange = JSON.stringify({ since: '2026-10-27', until: '2026-10-30' });
  const recentUrl = `https://graph.facebook.com/v21.0/${act}/insights?level=campaign&time_range=${encodeURIComponent(recentRange)}&fields=campaign_id,campaign_name,spend,actions&limit=100&access_token=${token}`;
  const rRes = await fetch(recentUrl);
  const rData = await rRes.json();
  (rData.data || []).forEach(r => {
    console.log(`- Campaign: ${r.campaign_name} (${r.campaign_id}) | Spend: ₹${r.spend}`);
  });
}

investigatePunam().catch(console.error);
