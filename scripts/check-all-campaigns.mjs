import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const act = env.META_AD_ACCOUNT_ID;

async function checkAllCampaigns() {
  const url = `https://graph.facebook.com/v21.0/${act}/campaigns?access_token=${token}&fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,updated_time&limit=50`;
  const res = await fetch(url);
  const json = await res.json();
  const list = (json.data || []).map(c => ({
    name: c.name,
    status: c.status,
    effective: c.effective_status,
    daily_budget: c.daily_budget ? '₹' + (c.daily_budget/100) : 'None',
    updated: c.updated_time
  }));
  console.table(list);
}

checkAllCampaigns().catch(console.error);
