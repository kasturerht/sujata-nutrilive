// scripts/october-forensic-full.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env
const envPath = path.resolve(__dirname, '..', '.env');
let envContent = fs.readFileSync(envPath, 'utf8');
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

async function main() {
  console.log('================================================================');
  console.log('🔍 FULL OCT 1 - OCT 13 MULTI-CHANNEL FORENSIC EXTRACTION');
  console.log('================================================================');

  const report = {};

  // -------------------------------------------------------------
  // 1. SHOPIFY ORDERS SINCE OCT 1
  // -------------------------------------------------------------
  console.log('\n--- FETCHING ALL SHOPIFY ORDERS SINCE OCT 1 ---');
  let shopifyToken = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';

  const sinceDate = '2026-10-01T00:00:00Z';
  const ordersUrl = `https://${domain}/admin/api/2024-04/orders.json?status=any&created_at_min=${sinceDate}&limit=250`;
  const ordersRes = await fetch(ordersUrl, {
    headers: { 'X-Shopify-Access-Token': shopifyToken }
  });
  const ordersData = await ordersRes.json();
  const allOrders = ordersData.orders || [];

  report.shopify = {
    total_orders: allOrders.length,
    orders: allOrders.map(o => ({
      name: o.name,
      id: o.id,
      created_at: o.created_at,
      total_price: o.total_price,
      financial_status: o.financial_status,
      fulfillment_status: o.fulfillment_status,
      source_name: o.source_name,
      gateway: o.payment_gateway_names?.join(', ') || o.gateway,
      customer: `${o.customer?.first_name || ''} ${o.customer?.last_name || ''}`.trim(),
      items: o.line_items?.map(i => `${i.title} (${i.variant_title || 'default'} x${i.quantity}) - ₹${i.price}`).join('; '),
      landing_site: o.landing_site,
      referring_site: o.referring_site
    }))
  };

  // Group Shopify orders by date (YYYY-MM-DD in IST)
  const ordersByDate = {};
  allOrders.forEach(o => {
    // Convert to IST (UTC+5:30)
    const dateObj = new Date(o.created_at);
    const istDate = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0];
    if (!ordersByDate[istDate]) ordersByDate[istDate] = [];
    ordersByDate[istDate].push(o);
  });
  report.shopifyByDate = ordersByDate;

  console.log(`Found ${allOrders.length} orders since Oct 1.`);
  Object.keys(ordersByDate).sort().forEach(d => {
    const list = ordersByDate[d];
    const totalRev = list.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
    console.log(`📅 ${d}: ${list.length} orders | Total Rev: ₹${totalRev.toFixed(2)} | Orders: ${list.map(o => `${o.name} (₹${o.total_price})`).join(', ')}`);
  });

  // Check checkouts since Oct 1
  const checkoutsUrl = `https://${domain}/admin/api/2024-04/checkouts.json?created_at_min=${sinceDate}&limit=250`;
  const checkoutsRes = await fetch(checkoutsUrl, {
    headers: { 'X-Shopify-Access-Token': shopifyToken }
  });
  const checkoutsData = await checkoutsRes.json();
  const allCheckouts = checkoutsData.checkouts || [];
  report.abandonedCheckouts = allCheckouts.map(c => ({
    created_at: c.created_at,
    total_price: c.total_price,
    email: c.email,
    phone: c.phone || c.shipping_address?.phone,
    name: `${c.shipping_address?.first_name || ''} ${c.shipping_address?.last_name || ''}`.trim(),
    items: c.line_items?.map(i => `${i.title} x${i.quantity}`).join(', ')
  }));
  console.log(`Abandoned checkouts since Oct 1: ${allCheckouts.length}`);

  // -------------------------------------------------------------
  // 2. META ADS DATA (OCT 1 - OCT 13)
  // -------------------------------------------------------------
  console.log('\n--- FETCHING META ADS DATA (OCT 1 - OCT 13) ---');
  const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

  // Fetch campaign-level daily insights from 2026-10-01 to 2026-10-13
  const metaUrl = `https://graph.facebook.com/v19.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-01','until':'2026-10-13'}&time_increment=1&level=campaign&fields=campaign_id,campaign_name,spend,impressions,clicks,cpc,actions&limit=500`;
  const metaRes = await fetch(metaUrl);
  const metaData = await metaRes.json();

  report.metaCampaignDaily = metaData.data || [];
  console.log(`Retrieved ${report.metaCampaignDaily.length} campaign daily records from Meta.`);

  // Aggregate by campaign
  const campaignSummary = {};
  (metaData.data || []).forEach(row => {
    const cid = row.campaign_id;
    const cname = row.campaign_name;
    if (!campaignSummary[cid]) {
      campaignSummary[cid] = {
        name: cname,
        total_spend: 0,
        total_clicks: 0,
        total_impressions: 0,
        total_purchases: 0,
        total_atc: 0,
        total_ic: 0,
        total_leads_chats: 0,
        daily: {}
      };
    }
    const spend = parseFloat(row.spend || 0);
    const clicks = parseInt(row.clicks || 0);
    const imp = parseInt(row.impressions || 0);
    let pur = 0, atc = 0, ic = 0, chats = 0;
    (row.actions || []).forEach(a => {
      if (a.action_type === 'purchase' || a.action_type === 'omni_purchase') pur += parseInt(a.value || 0);
      if (a.action_type === 'add_to_cart') atc += parseInt(a.value || 0);
      if (a.action_type === 'initiate_checkout') ic += parseInt(a.value || 0);
      if (a.action_type.includes('messaging_conversation_started') || a.action_type.includes('onsite_conversion.messaging_first_reply')) chats += parseInt(a.value || 0);
    });

    campaignSummary[cid].total_spend += spend;
    campaignSummary[cid].total_clicks += clicks;
    campaignSummary[cid].total_impressions += imp;
    campaignSummary[cid].total_purchases += pur;
    campaignSummary[cid].total_atc += atc;
    campaignSummary[cid].total_ic += ic;
    campaignSummary[cid].total_leads_chats += chats;

    campaignSummary[cid].daily[row.date_start] = {
      spend, clicks, imp, pur, atc, ic, chats
    };
  });

  report.metaSummary = campaignSummary;
  console.log('\n--- CAMPAIGN TOTALS (OCT 1 - OCT 13) ---');
  Object.keys(campaignSummary).forEach(cid => {
    const c = campaignSummary[cid];
    console.log(`Campaign: "${c.name}" (ID: ${cid})`);
    console.log(`  Spend: ₹${c.total_spend.toFixed(2)} | Clicks: ${c.total_clicks} | Purchases: ${c.total_purchases} | ATC: ${c.total_atc} | IC: ${c.total_ic} | WhatsApp Chats: ${c.total_leads_chats}`);
  });

  // -------------------------------------------------------------
  // 3. GOOGLE SEARCH CONSOLE (OCT 1 - OCT 13)
  // -------------------------------------------------------------
  console.log('\n--- FETCHING GOOGLE SEARCH CONSOLE DATA (OCT 1 - OCT 13) ---');
  try {
    const keyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
    const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };
    const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const signInput = b64(header) + '.' + b64(payload);
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signInput);
    const assertion = signInput + '.' + signer.sign(key.private_key, 'base64url');

    const gRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion
      })
    });
    const gAuth = await gRes.json();

    if (gAuth.access_token) {
      const gscRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fwww.sujatanutrilive.com%2F/searchAnalytics/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gAuth.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: '2026-10-01',
          endDate: '2026-10-13',
          dimensions: ['date']
        })
      });
      const gscData = await gscRes.json();
      report.gscDaily = gscData.rows || [];
      console.log(`GSC rows (${report.gscDaily.length} days):`);
      report.gscDaily.forEach(r => {
        console.log(`  ${r.keys[0]}: Clicks: ${r.clicks} | Impressions: ${r.impressions} | CTR: ${(r.ctr * 100).toFixed(2)}% | Pos: ${r.position.toFixed(1)}`);
      });
    }
  } catch(e) {
    console.log('GSC Error:', e.message);
  }

  // Write full report
  fs.writeFileSync(path.join(__dirname, 'october_full_forensic_report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log('\n✅ Report written to scripts/october_full_forensic_report.json');
}

main().catch(console.error);
