import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/meta-deep-audit.json', 'utf8'));

console.log('=== ACCOUNT OVERVIEW ===');
console.log('Name:', data.accountInfo.name);
console.log('Lifetime Spent: ₹' + parseFloat(data.accountInfo.amount_spent).toLocaleString('en-IN'));
console.log('Active Campaigns Count:', data.campaigns.length);

console.log('\n=== ACTIVE CAMPAIGNS & BUDGETS ===');
data.campaigns.forEach(c => {
  console.log(`\n• Campaign: ${c.name} [ID: ${c.id}]`);
  console.log(`  Objective: ${c.objective} | Bid Strategy: ${c.bid_strategy || 'Default'}`);
});

console.log('\n=== ADSETS & TARGETING ===');
data.adsets.forEach(a => {
  const geo = a.targeting?.geo_locations;
  const regions = geo?.regions ? geo.regions.map(r => r.name).join(', ') : (geo?.countries ? geo.countries.join(', ') : 'All');
  console.log(`\n• AdSet: ${a.name} [ID: ${a.id}]`);
  console.log(`  Daily Budget: ₹${(a.daily_budget / 100).toFixed(2)} | Optimization Goal: ${a.optimization_goal}`);
  console.log(`  Targeting -> Geo: ${regions} | Age: ${a.targeting?.age_min || 18}-${a.targeting?.age_max || 65}+ | Genders: ${JSON.stringify(a.targeting?.genders || 'All')}`);
  if (a.targeting?.flexible_spec) {
    console.log(`  Interests:`, JSON.stringify(a.targeting.flexible_spec));
  } else {
    console.log(`  Interests: Broad (Advantage+ / Open Audience)`);
  }
});

console.log('\n=== ADS & CREATIVE DETAILS ===');
data.ads.forEach(ad => {
  console.log(`\n• Ad: ${ad.name} [ID: ${ad.id}]`);
  console.log(`  CTA: ${ad.creative?.call_to_action_type || 'None'}`);
  console.log(`  Title: ${ad.creative?.title || 'None'}`);
  console.log(`  Creative Name: ${ad.creative?.name || 'None'}`);
  console.log(`  Body (Text): ${(ad.creative?.body || '').slice(0, 120)}...`);
});

console.log('\n=== LAST 7 DAYS METRICS BY CAMPAIGN (2026-10-08 to 2026-10-14) ===');
let totalSpend7d = 0;
data.insights7d.forEach(ins => {
  const spend = parseFloat(ins.spend);
  totalSpend7d += spend;
  console.log(`\n📌 ${ins.campaign_name}`);
  console.log(`   Spend: ₹${spend.toFixed(2)} | Reach: ${ins.reach} | Impr: ${ins.impressions} | Freq: ${parseFloat(ins.frequency).toFixed(2)}`);
  console.log(`   Clicks: ${ins.clicks} | CTR: ${parseFloat(ins.ctr).toFixed(2)}% | CPC: ₹${parseFloat(ins.cpc).toFixed(2)} | CPM: ₹${parseFloat(ins.cpm).toFixed(2)}`);
  
  const chats = ins.actions?.find(a => a.action_type.includes('messaging_conversation_started_7d') || a.action_type.includes('onsite_conversion.messaging_first_reply'));
  const purchases = ins.actions?.find(a => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
  const addCart = ins.actions?.find(a => a.action_type === 'add_to_cart' || a.action_type === 'omni_add_to_cart');
  const checkouts = ins.actions?.find(a => a.action_type === 'initiate_checkout' || a.action_type === 'omni_initiated_checkout');
  
  console.log(`   Conversions -> Chats: ${chats ? chats.value : '0'} | AddToCart: ${addCart ? addCart.value : '0'} | Checkouts: ${checkouts ? checkouts.value : '0'} | Purchases: ${purchases ? purchases.value : '0'}`);
});
console.log(`\n💰 TOTAL SPEND LAST 7 DAYS: ₹${totalSpend7d.toFixed(2)}`);
