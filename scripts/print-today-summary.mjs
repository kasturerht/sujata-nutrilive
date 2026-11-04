import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const act = env.META_AD_ACCOUNT_ID;

async function run() {
  const url = `https://graph.facebook.com/v21.0/${act}/insights?access_token=${token}&time_range={'since':'2026-10-26','until':'2026-10-26'}&level=campaign&fields=campaign_id,campaign_name,objective,spend,impressions,clicks,cpc,ctr,actions&limit=50`;
  const res = await fetch(url);
  const json = await res.json();
  const summary = (json.data || []).map(c => {
    let purchases = 0;
    let landingPageViews = 0;
    let linkClicks = 0;
    let initiatedCheckout = 0;
    let addToCart = 0;
    let whatsapp = 0;
    (c.actions || []).forEach(a => {
      if (a.action_type.includes('purchase')) purchases = Math.max(purchases, parseInt(a.value));
      if (a.action_type === 'landing_page_view') landingPageViews = parseInt(a.value);
      if (a.action_type === 'link_click') linkClicks = parseInt(a.value);
      if (a.action_type === 'initiate_checkout' || a.action_type.includes('checkout')) initiatedCheckout = Math.max(initiatedCheckout, parseInt(a.value));
      if (a.action_type === 'add_to_cart' || a.action_type.includes('add_to_cart')) addToCart = Math.max(addToCart, parseInt(a.value));
      if (a.action_type.includes('messaging_conversation_started')) whatsapp = Math.max(whatsapp, parseInt(a.value));
    });
    return {
      'Campaign Name': c.campaign_name,
      'Objective': c.objective,
      'Spend (₹)': parseFloat(c.spend || 0).toFixed(2),
      'Clicks': c.clicks,
      'Link Clicks': linkClicks,
      'Landing Views': landingPageViews,
      'Add To Cart': addToCart,
      'Checkouts': initiatedCheckout,
      'Purchases': purchases,
      'WhatsApp': whatsapp
    };
  });
  console.log('\n=== TODAY (26 OCT 2026) META ADS PERFORMANCE ===');
  console.table(summary);
}

run().catch(console.error);
