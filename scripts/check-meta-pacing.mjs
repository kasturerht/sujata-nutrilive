// scripts/check-meta-pacing.mjs
import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
});

const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

async function checkPacing() {
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/campaigns?access_token=${metaToken}&fields=id,name,status,daily_budget,lifetime_budget,effective_status,budget_remaining,issues_info&limit=20`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("=== META CAMPAIGNS STATUS & BUDGET ===");
  data.data?.forEach(c => {
    console.log(`- ${c.name} | Status: ${c.status} (${c.effective_status}) | DailyBudget: ₹${c.daily_budget ? c.daily_budget / 100 : 'N/A'}`);
  });

  const adsetUrl = `https://graph.facebook.com/v21.0/${adAccountId}/adsets?access_token=${metaToken}&fields=id,name,status,effective_status,daily_budget,optimization_goal,billing_event&limit=20`;
  const aRes = await fetch(adsetUrl);
  const aData = await aRes.json();
  console.log("\n=== META ADSETS STATUS & BUDGET ===");
  aData.data?.forEach(a => {
    console.log(`- ${a.name} | Status: ${a.status} (${a.effective_status}) | DailyBudget: ₹${a.daily_budget ? a.daily_budget / 100 : 'CBO'} | Goal: ${a.optimization_goal}`);
  });
}

checkPacing().catch(console.error);
