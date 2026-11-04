// scripts/check-today-website-funnel.mjs
import fs from 'fs';
import path from 'path';

// 1. Load .env
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
const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const shopifyAdminToken = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const TODAY = '2026-10-27';

async function checkMetaToday() {
  console.log(`\n📡 1. CHECKING META ADS FOR TODAY (${TODAY})...`);
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'${TODAY}','until':'${TODAY}'}&level=ad&fields=campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks,cpc,ctr,actions,action_values,cost_per_action_type&limit=100`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error('Meta API Error:', data.error);
    return null;
  }

  console.log(`Found ${data.data ? data.data.length : 0} active ads reporting data today.`);
  return data.data || [];
}

async function checkShopifyOrdersToday() {
  console.log(`\n🛍️ 2. CHECKING SHOPIFY ORDERS & CHECKOUTS FOR TODAY (${TODAY})...`);

  // Check orders via admin API if token exists
  if (shopifyAdminToken) {
    try {
      const ordersUrl = `https://${shopifyDomain}/admin/api/2024-01/orders.json?status=any&created_at_min=${TODAY}T00:00:00+05:30&limit=50`;
      const res = await fetch(ordersUrl, {
        headers: { 'X-Shopify-Access-Token': shopifyAdminToken }
      });
      const data = await res.json();
      console.log(`Shopify Orders count today: ${data.orders ? data.orders.length : 0}`);
      if (data.orders) {
        data.orders.forEach(o => {
          console.log(`- Order #${o.order_number}: ₹${o.total_price} (${o.financial_status}, ${o.fulfillment_status}) - Customer: ${o.customer?.first_name} ${o.customer?.last_name}`);
        });
      }

      // Check abandoned checkouts
      const checkoutsUrl = `https://${shopifyDomain}/admin/api/2024-01/checkouts.json?created_at_min=${TODAY}T00:00:00+05:30&limit=50`;
      const chkRes = await fetch(checkoutsUrl, {
        headers: { 'X-Shopify-Access-Token': shopifyAdminToken }
      });
      const chkData = await chkRes.json();
      console.log(`Abandoned checkouts today: ${chkData.checkouts ? chkData.checkouts.length : 0}`);
    } catch (e) {
      console.log('Shopify Admin fetch error:', e.message);
    }
  } else {
    console.log('No SHOPIFY_ADMIN_ACCESS_TOKEN found in .env, checking other store files.');
  }
}

async function run() {
  const metaAds = await checkMetaToday();
  if (metaAds) {
    fs.writeFileSync('scripts/meta_today_raw.json', JSON.stringify(metaAds, null, 2));

    console.log('\n--- TODAY META ADS BREAKDOWN ---');
    metaAds.forEach(row => {
      console.log(`\nCampaign: ${row.campaign_name}`);
      console.log(`  Ad: ${row.ad_name}`);
      console.log(`  Spend so far today: ₹${parseFloat(row.spend || 0).toFixed(2)}`);
      console.log(`  Impressions: ${row.impressions} | Clicks: ${row.clicks}`);

      // Filter actions for website funnel
      const funnel = {};
      (row.actions || []).forEach(a => {
        funnel[a.action_type] = a.value;
      });

      console.log(`  Website Funnel Metrics:`);
      console.log(`   - Link Clicks: ${funnel['link_click'] || 0}`);
      console.log(`   - Landing Page Views: ${funnel['landing_page_view'] || 0}`);
      console.log(`   - Content Views (ViewContent): ${funnel['view_content'] || funnel['omni_view_content'] || 0}`);
      console.log(`   - Add to Cart: ${funnel['add_to_cart'] || funnel['omni_add_to_cart'] || 0}`);
      console.log(`   - Initiate Checkout: ${funnel['initiate_checkout'] || funnel['omni_initiated_checkout'] || 0}`);
      console.log(`   - Add Payment Info: ${funnel['add_payment_info'] || 0}`);
      console.log(`   - Purchases (Sales): ${funnel['purchase'] || funnel['omni_purchase'] || 0}`);
      console.log(`   - WhatsApp Conversations: ${funnel['onsite_conversion.messaging_conversation_started_7d'] || 0}`);
    });
  }

  await checkShopifyOrdersToday();
}

run().catch(console.error);
