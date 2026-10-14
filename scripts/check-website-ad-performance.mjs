// scripts/check-website-ad-performance.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    env[trimmed.slice(0, idx).trim()] = val;
  }
});

const token = env.META_ADS_ACCESS_TOKEN;
const campaignId = '120248771569340630'; // Sujata - Spirulina + SeaBuckthorn Hero Video - ASC

async function checkCampaign() {
  const url = `https://graph.facebook.com/v19.0/${campaignId}/insights?access_token=${token}&date_preset=last_7d&time_increment=1&fields=spend,impressions,clicks,cpc,cpm,actions`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('=== DAILY BREAKDOWN FOR WEBSITE SALES CAMPAIGN (ASC) ===');
  data.data?.forEach(d => {
    const atc = d.actions?.find(a => a.action_type === 'add_to_cart')?.value || 0;
    const pur = d.actions?.find(a => a.action_type === 'purchase')?.value || 0;
    const ic = d.actions?.find(a => a.action_type === 'initiate_checkout')?.value || 0;
    console.log(`${d.date_start} | Spend: ₹${parseFloat(d.spend).toFixed(2)} | Impressions: ${d.impressions} | Clicks: ${d.clicks} | CPC: ₹${d.cpc || 'N/A'} | ATC: ${atc} | IC: ${ic} | Purchases: ${pur}`);
  });

  // Check Ad Creative & Landing Page URL
  const adsRes = await fetch(`https://graph.facebook.com/v19.0/${campaignId}/ads?access_token=${token}&fields=name,status,creative{name,object_story_spec}`);
  const adsData = await adsRes.json();
  console.log('\n=== ADS IN THIS CAMPAIGN ===');
  adsData.data?.forEach(ad => {
    console.log(`Ad: ${ad.name} | Status: ${ad.status}`);
    const link = ad.creative?.object_story_spec?.video_data?.call_to_action?.value?.link || ad.creative?.object_story_spec?.link_data?.link;
    console.log(`Landing URL: ${link || 'N/A'}`);
  });
}
checkCampaign();
