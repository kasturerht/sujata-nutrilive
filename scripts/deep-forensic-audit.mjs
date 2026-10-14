// scripts/deep-forensic-audit.mjs
// 🔬 SUJATA NUTRILIVE: MULTI-CHANNEL FORENSIC SALES & TRAFFIC DIAGNOSTIC
// Unbiased, hard data analysis across Shopify, Meta Ads, GSC, and Amazon

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
  console.log('===============================================================');
  console.log('🔬 SUJATA NUTRILIVE — MULTI-CHANNEL SALES FORENSIC AUDIT');
  console.log('===============================================================');

  const report = {};

  // ==========================================
  // PART 1: SHOPIFY LIVE ORDERS & ABANDONMENTS
  // ==========================================
  console.log('\n--- 1. SHOPIFY ADMIN DATA FETCH ---');
  let shopifyToken = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';

  // Test token & refresh via OAuth if 401
  let testRes = await fetch(`https://${domain}/admin/api/2024-04/shop.json`, {
    headers: { 'X-Shopify-Access-Token': shopifyToken }
  });

  if (testRes.status === 401) {
    console.log('Shopify token expired, generating fresh access token via OAuth...');
    const authRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.SHOPIFY_CLIENT_ID,
        client_secret: env.SHOPIFY_CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });
    const authData = await authRes.json();
    if (authData.access_token) {
      shopifyToken = authData.access_token;
      console.log('✅ Fresh Shopify Token Acquired!');
      // Update .env file
      envContent = envContent.replace(/SHOPIFY_ADMIN_ACCESS_TOKEN=.*(\r?\n|$)/, `SHOPIFY_ADMIN_ACCESS_TOKEN="${shopifyToken}"$1`);
      fs.writeFileSync(envPath, envContent, 'utf8');
    }
  }

  // Fetch Orders
  const ordersRes = await fetch(`https://${domain}/admin/api/2024-04/orders.json?status=any&limit=25`, {
    headers: { 'X-Shopify-Access-Token': shopifyToken }
  });
  const ordersData = await ordersRes.json();
  const orders = ordersData.orders || [];
  report.shopifyOrders = orders.map(o => ({
    name: o.name,
    created_at: o.created_at,
    total: o.total_price,
    gateway: o.payment_gateway_names?.join(', ') || o.gateway || 'N/A',
    financial_status: o.financial_status,
    customer: `${o.customer?.first_name || ''} ${o.customer?.last_name || ''}`.trim(),
    city: o.shipping_address?.city || o.billing_address?.city || 'N/A',
    items: o.line_items?.map(i => `${i.title} (x${i.quantity})`).join(', ') || '',
    referring_site: o.referring_site || 'direct'
  }));

  console.log(`📦 Retrieved ${orders.length} recent Shopify orders.`);
  if (orders.length > 0) {
    console.log(`  🕒 Most Recent Order: ${report.shopifyOrders[0].name} at ${report.shopifyOrders[0].created_at} (Total: ₹${report.shopifyOrders[0].total})`);
    if (report.shopifyOrders[1]) {
      console.log(`  🕒 Second Most Recent: ${report.shopifyOrders[1].name} at ${report.shopifyOrders[1].created_at} (Total: ₹${report.shopifyOrders[1].total})`);
    }
  }

  // Fetch Abandoned Checkouts
  const checkoutsRes = await fetch(`https://${domain}/admin/api/2024-04/checkouts.json?limit=25`, {
    headers: { 'X-Shopify-Access-Token': shopifyToken }
  });
  const checkoutsData = await checkoutsRes.json();
  const checkouts = checkoutsData.checkouts || [];
  report.abandonedCheckouts = checkouts.map(c => ({
    id: c.id,
    created_at: c.created_at,
    total: c.total_price,
    email: c.email || 'N/A',
    phone: c.phone || c.shipping_address?.phone || 'N/A',
    name: `${c.shipping_address?.first_name || ''} ${c.shipping_address?.last_name || ''}`.trim(),
    city: c.shipping_address?.city || 'N/A',
    items: c.line_items?.map(i => `${i.title} (x${i.quantity})`).join(', ') || '',
    abandoned_checkout_url: c.abandoned_checkout_url
  }));
  console.log(`🛒 Retrieved ${checkouts.length} Abandoned Checkouts.`);
  if (checkouts.length > 0) {
    console.log(`  🕒 Latest Abandoned Checkout: ${report.abandonedCheckouts[0].created_at} for ₹${report.abandonedCheckouts[0].total} (${report.abandonedCheckouts[0].items})`);
  }

  // ==========================================
  // PART 2: META ADS INSIGHTS (TODAY & YESTERDAY)
  // ==========================================
  console.log('\n--- 2. META ADS INSIGHTS (TODAY VS YESTERDAY) ---');
  const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

  async function getMetaInsights(datePreset) {
    const url = `https://graph.facebook.com/v19.0/${adAccountId}/insights?access_token=${metaToken}&date_preset=${datePreset}&fields=spend,impressions,clicks,cpc,cpm,ctr,actions,cost_per_action_type`;
    const res = await fetch(url);
    const d = await res.json();
    return d.data?.[0] || null;
  }

  const todayInsights = await getMetaInsights('today');
  const yesterdayInsights = await getMetaInsights('yesterday');

  function parseMetaActions(ins) {
    if (!ins) return { spend: 0, clicks: 0, impressions: 0, chats: 0, purchases: 0, atc: 0 };
    const spend = parseFloat(ins.spend || 0);
    const clicks = parseInt(ins.clicks || 0);
    const impressions = parseInt(ins.impressions || 0);
    let chats = 0;
    let purchases = 0;
    let atc = 0;
    (ins.actions || []).forEach(a => {
      if (a.action_type.includes('messaging_conversation_started') || a.action_type.includes('onsite_conversion.messaging_first_reply')) {
        chats += parseInt(a.value || 0);
      }
      if (a.action_type === 'purchase' || a.action_type === 'omni_purchase') {
        purchases += parseInt(a.value || 0);
      }
      if (a.action_type === 'add_to_cart') {
        atc += parseInt(a.value || 0);
      }
    });
    return { spend, clicks, impressions, chats, purchases, atc, cpc: ins.cpc, ctr: ins.ctr };
  }

  report.metaToday = parseMetaActions(todayInsights);
  report.metaYesterday = parseMetaActions(yesterdayInsights);

  console.log('📅 Meta Ads Today:', report.metaToday);
  console.log('📅 Meta Ads Yesterday:', report.metaYesterday);

  // ==========================================
  // PART 3: GOOGLE SEARCH CONSOLE ORGANIC TRAFFIC
  // ==========================================
  console.log('\n--- 3. GOOGLE SEARCH CONSOLE DATA ---');
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
      // Query search analytics for last 7 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const gscRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fwww.sujatanutrilive.com%2F/searchAnalytics/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gAuth.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['date']
        })
      });
      const gscData = await gscRes.json();
      report.gsc = gscData.rows || [];
      console.log(`🔍 GSC Organic Search Traffic Rows (${report.gsc.length} days):`);
      report.gsc.forEach(r => console.log(`   ${r.keys[0]}: Clicks: ${r.clicks} | Impressions: ${r.impressions} | CTR: ${(r.ctr * 100).toFixed(2)}% | Pos: ${r.position.toFixed(1)}`));
    }
  } catch(e) {
    console.log('GSC Error:', e.message);
  }

  // Save report to disk
  fs.writeFileSync('scripts/forensic_diagnostic_report.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('\n===============================================================');
  console.log('✅ AUDIT COMPLETE — SAVED TO scripts/forensic_diagnostic_report.json');
  console.log('===============================================================');
}

main().catch(console.error);
