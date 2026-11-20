import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

// Map campaign IDs to Telecallers
const campaignMap = {
  '120211116231360662': { name: 'Punam Kasture', phone: '9922500344' },
  '120211116231350662': { name: 'Manjushree Kasture', phone: '9272471529' },
  '120211116231340662': { name: 'Vaishnavi Diwate', phone: '9922534443' },
  '120211116231330662': { name: 'Monu', phone: '9503434653' },
  '120211116231320662': { name: 'Karishma Patil', phone: '9922577344' }
};

async function fetchDaywise() {
  const timeRange = JSON.stringify({ since: '2026-10-01', until: '2026-11-20' });
  const fields = 'campaign_id,campaign_name,spend,impressions,reach,clicks,actions';
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?fields=${fields}&level=campaign&time_increment=1&time_range=${encodeURIComponent(timeRange)}&limit=1000&access_token=${token}`;
  
  console.log("Fetching day-wise insights from Meta API...");
  const res = await fetch(url);
  const data = await res.json();
  
  console.log(`Fetched ${data.data?.length || 0} daily campaign records!`);
  fs.writeFileSync('scripts/meta_oct_nov_daywise.json', JSON.stringify(data.data, null, 2));
}

fetchDaywise().catch(console.error);
