// scripts/generate-full-omnichannel-status-report.mjs
// 🚀 SUJATA NUTRILIVE: COMPREHENSIVE OMNI-CHANNEL TRAFFIC & CONVERSION AUDIT (OCT 2026)
// Sources: GA4, GSC, AI/GEO Engines, Shopify Orders, Direct & Organic Social

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Service Account & Credentials
const keyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// Load .env
const envPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
}

const GA4_PROPERTY_ID = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');
const SHOPIFY_TOKEN = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_DOMAIN = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';

function createJwt(scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = base64Url(header) + '.' + base64Url(payload);
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  return signInput + '.' + sign.sign(key.private_key, 'base64url');
}

async function getGoogleToken(scopes) {
  const jwt = createJwt(scopes);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt
  });
  const data = await res.json();
  return data.access_token;
}

async function main() {
  console.log('========================================================================');
  console.log('🔬 SUJATA NUTRILIVE: FULL TRAFFIC & ATTRIBUTION AUDIT (OCT 1 - OCT 16, 2026)');
  console.log('========================================================================\n');

  const report = {
    generated_at: new Date().toISOString(),
    ga4: {},
    gsc: {},
    shopify: {}
  };

  const gaToken = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
  const gscToken = await getGoogleToken(['https://www.googleapis.com/auth/webmasters.readonly']);

  // -------------------------------------------------------------
  // 1. GA4: REALTIME TRAFFIC (Right Now)
  // -------------------------------------------------------------
  console.log('--- 1. GA4 REALTIME VISITORS (Right Now) ---');
  try {
    const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runRealtimeReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'country' }, { name: 'city' }, { name: 'unifiedScreenName' }]
      })
    });
    const rtData = await rtRes.json();
    const activeNow = rtData.rows?.reduce((acc, r) => acc + parseInt(r.metricValues[0].value), 0) || 0;
    console.log(`Active Users Right Now: ${activeNow}`);
    report.ga4.realtime = { activeUsers: activeNow, locations: rtData.rows || [] };
  } catch (err) {
    console.error('GA4 Realtime Error:', err.message);
  }

  // -------------------------------------------------------------
  // 2. GA4: FULL MONTH-TO-DATE CHANNEL & SOURCE AUDIT (OCT 1 - OCT 16)
  // -------------------------------------------------------------
  console.log('\n--- 2. GA4 CHANNEL & SOURCE BREAKDOWN (OCT 1 - OCT 16, 2026) ---');
  try {
    const gaRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-01', endDate: 'today' }],
        dimensions: [
          { name: 'sessionDefaultChannelGroup' },
          { name: 'sessionSourceMedium' }
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' }
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
      })
    });
    const gaData = await gaRes.json();

    const channels = {
      googleOrganic: { users: 0, sessions: 0, pageviews: 0, engaged: 0, sources: {} },
      aiSearch: { users: 0, sessions: 0, pageviews: 0, engaged: 0, sources: {} },
      direct: { users: 0, sessions: 0, pageviews: 0, engaged: 0 },
      organicSocial: { users: 0, sessions: 0, pageviews: 0, engaged: 0, sources: {} },
      paidAds: { users: 0, sessions: 0, pageviews: 0, engaged: 0, sources: {} },
      otherReferral: { users: 0, sessions: 0, pageviews: 0, engaged: 0, sources: {} }
    };

    let totalUsers = 0, totalSessions = 0, totalPageviews = 0, totalEngaged = 0;

    (gaData.rows || []).forEach(r => {
      const channel = r.dimensionValues[0].value;
      const sourceMedium = r.dimensionValues[1].value;
      const users = parseInt(r.metricValues[0].value || '0');
      const sessions = parseInt(r.metricValues[1].value || '0');
      const engaged = parseInt(r.metricValues[2].value || '0');
      const pageviews = parseInt(r.metricValues[3].value || '0');
      const avgDuration = parseFloat(r.metricValues[4].value || '0');

      totalUsers += users;
      totalSessions += sessions;
      totalEngaged += engaged;
      totalPageviews += pageviews;

      const isAi = /chatgpt|openai|perplexity|claude|gemini|copilot|ai-assistant/i.test(sourceMedium) || /ai assistant/i.test(channel);
      const isGoogleOrganic = /google.*organic/i.test(sourceMedium) || (channel === 'Organic Search' && /google/i.test(sourceMedium));
      const isDirect = /direct/i.test(sourceMedium) || channel === 'Direct';
      const isPaid = /cpc|paid|meta|facebook|fb|ig|ads/i.test(sourceMedium) && !/video|pinned_comment/i.test(sourceMedium);
      const isSocialOrganic = /youtube|instagram|facebook|linkedin|twitter|t\.co|fb\.me/i.test(sourceMedium) && !isPaid;

      if (isAi) {
        channels.aiSearch.users += users;
        channels.aiSearch.sessions += sessions;
        channels.aiSearch.pageviews += pageviews;
        channels.aiSearch.engaged += engaged;
        channels.aiSearch.sources[sourceMedium] = (channels.aiSearch.sources[sourceMedium] || 0) + users;
      } else if (isGoogleOrganic) {
        channels.googleOrganic.users += users;
        channels.googleOrganic.sessions += sessions;
        channels.googleOrganic.pageviews += pageviews;
        channels.googleOrganic.engaged += engaged;
        channels.googleOrganic.sources[sourceMedium] = (channels.googleOrganic.sources[sourceMedium] || 0) + users;
      } else if (isDirect) {
        channels.direct.users += users;
        channels.direct.sessions += sessions;
        channels.direct.pageviews += pageviews;
        channels.direct.engaged += engaged;
      } else if (isSocialOrganic) {
        channels.organicSocial.users += users;
        channels.organicSocial.sessions += sessions;
        channels.organicSocial.pageviews += pageviews;
        channels.organicSocial.engaged += engaged;
        channels.organicSocial.sources[sourceMedium] = (channels.organicSocial.sources[sourceMedium] || 0) + users;
      } else if (isPaid) {
        channels.paidAds.users += users;
        channels.paidAds.sessions += sessions;
        channels.paidAds.pageviews += pageviews;
        channels.paidAds.engaged += engaged;
        channels.paidAds.sources[sourceMedium] = (channels.paidAds.sources[sourceMedium] || 0) + users;
      } else {
        channels.otherReferral.users += users;
        channels.otherReferral.sessions += sessions;
        channels.otherReferral.pageviews += pageviews;
        channels.otherReferral.engaged += engaged;
        channels.otherReferral.sources[sourceMedium] = (channels.otherReferral.sources[sourceMedium] || 0) + users;
      }
    });

    report.ga4.totals = { totalUsers, totalSessions, totalEngaged, totalPageviews };
    report.ga4.channels = channels;
    report.ga4.rawRows = (gaData.rows || []).map(r => ({
      channel: r.dimensionValues[0].value,
      sourceMedium: r.dimensionValues[1].value,
      users: parseInt(r.metricValues[0].value),
      sessions: parseInt(r.metricValues[1].value),
      pageviews: parseInt(r.metricValues[3].value),
      avgDuration: parseFloat(r.metricValues[4].value).toFixed(1)
    }));

    console.log(`Total MTD: ${totalUsers} Users | ${totalSessions} Sessions | ${totalPageviews} Page Views`);
    console.log(`🔍 Google Organic:  ${channels.googleOrganic.users} users, ${channels.googleOrganic.sessions} sessions, ${channels.googleOrganic.pageviews} views`);
    console.log(`🤖 AI Search (GEO): ${channels.aiSearch.users} users, ${channels.aiSearch.sessions} sessions, ${channels.aiSearch.pageviews} views (Sources: ${JSON.stringify(channels.aiSearch.sources)})`);
    console.log(`🔗 Direct:          ${channels.direct.users} users, ${channels.direct.sessions} sessions, ${channels.direct.pageviews} views`);
    console.log(`📺 Organic Social:  ${channels.organicSocial.users} users, ${channels.organicSocial.sessions} sessions (Sources: ${JSON.stringify(channels.organicSocial.sources)})`);
    console.log(`📱 Paid Ads/Meta:   ${channels.paidAds.users} users, ${channels.paidAds.sessions} sessions`);
    console.log(`🌐 Other Referral:  ${channels.otherReferral.users} users, ${channels.otherReferral.sessions} sessions`);
  } catch (err) {
    console.error('GA4 Report Error:', err.message);
  }

  // -------------------------------------------------------------
  // 3. GA4: DAILY TREND (LAST 7 DAYS: OCT 10 - OCT 16)
  // -------------------------------------------------------------
  console.log('\n--- 3. GA4 DAILY TRAFFIC TREND (OCT 10 - OCT 16) ---');
  try {
    const dailyRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-10', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
      })
    });
    const dailyData = await dailyRes.json();
    report.ga4.dailyTrend = (dailyData.rows || []).map(r => ({
      date: `${r.dimensionValues[0].value.slice(0, 4)}-${r.dimensionValues[0].value.slice(4, 6)}-${r.dimensionValues[0].value.slice(6, 8)}`,
      users: parseInt(r.metricValues[0].value),
      sessions: parseInt(r.metricValues[1].value),
      pageviews: parseInt(r.metricValues[2].value)
    }));
    report.ga4.dailyTrend.forEach(d => {
      console.log(`📅 ${d.date}: ${d.users} Users | ${d.sessions} Sessions | ${d.pageviews} Page Views`);
    });
  } catch (err) {
    console.error('GA4 Daily Error:', err.message);
  }

  // -------------------------------------------------------------
  // 4. GA4: TOP LANDING PAGES (OCT 1 - OCT 16)
  // -------------------------------------------------------------
  console.log('\n--- 4. TOP LANDING PAGES VIEWED ---');
  try {
    const pagesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-01', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
          { name: 'averageSessionDuration' }
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      })
    });
    const pagesData = await pagesRes.json();
    report.ga4.topPages = (pagesData.rows || []).map(r => ({
      path: r.dimensionValues[0].value,
      views: parseInt(r.metricValues[0].value),
      users: parseInt(r.metricValues[1].value),
      avgDuration: parseFloat(r.metricValues[2].value).toFixed(1)
    }));
    report.ga4.topPages.forEach(p => {
      console.log(`• ${p.path} -> ${p.views} views (${p.users} users, avg ${p.avgDuration}s)`);
    });
  } catch (err) {
    console.error('GA4 Top Pages Error:', err.message);
  }

  // -------------------------------------------------------------
  // 5. GOOGLE SEARCH CONSOLE: QUERIES, PAGES, CLICKS & IMPRESSIONS
  // -------------------------------------------------------------
  console.log('\n--- 5. GOOGLE SEARCH CONSOLE AUDIT ---');
  try {
    // 5A. GSC Top Queries
    const gscQueryRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fwww.sujatanutrilive.com%2F/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gscToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-01',
        endDate: '2026-10-14',
        dimensions: ['query'],
        rowLimit: 15
      })
    });
    const gscQueryData = await gscQueryRes.json();
    report.gsc.topQueries = (gscQueryData.rows || []).map(r => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: (r.ctr * 100).toFixed(2) + '%',
      position: r.position.toFixed(1)
    }));

    console.log(`Top GSC Queries (${report.gsc.topQueries.length}):`);
    report.gsc.topQueries.slice(0, 8).forEach(q => {
      console.log(`  • "${q.query}": ${q.clicks} clicks | ${q.impressions} impr | CTR ${q.ctr} | Pos ${q.position}`);
    });

    // 5B. GSC Daily Clicks & Impressions
    const gscDailyRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fwww.sujatanutrilive.com%2F/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gscToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-01',
        endDate: '2026-10-14',
        dimensions: ['date']
      })
    });
    const gscDailyData = await gscDailyRes.json();
    let totalGscClicks = 0, totalGscImpressions = 0;
    report.gsc.daily = (gscDailyData.rows || []).map(r => {
      totalGscClicks += r.clicks;
      totalGscImpressions += r.impressions;
      return {
        date: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: (r.ctr * 100).toFixed(2) + '%',
        position: r.position.toFixed(1)
      };
    });
    report.gsc.totals = {
      clicks: totalGscClicks,
      impressions: totalGscImpressions,
      avgCtr: totalGscImpressions > 0 ? ((totalGscClicks / totalGscImpressions) * 100).toFixed(2) + '%' : '0%'
    };
    console.log(`Total GSC (Oct 1 - Oct 14): ${totalGscClicks} Clicks | ${totalGscImpressions} Impressions | Avg CTR: ${report.gsc.totals.avgCtr}`);
  } catch (err) {
    console.error('GSC Error:', err.message);
  }

  // -------------------------------------------------------------
  // 6. SHOPIFY ORDERS & REVENUE (OCT 1 - OCT 16)
  // -------------------------------------------------------------
  console.log('\n--- 6. SHOPIFY ORDERS & REVENUE AUDIT ---');
  try {
    const ordersUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-04/orders.json?status=any&limit=250`;
    const ordersRes = await fetch(ordersUrl, {
      headers: { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_ACCESS_TOKEN || SHOPIFY_TOKEN }
    });
    const ordersData = await ordersRes.json();
    const rawOrders = ordersData.orders || [];

    // Filter October 2026 orders
    const octOrders = rawOrders.filter(o => o.created_at && o.created_at.startsWith('2026-10'));

    let totalRevenue = 0;
    const paidOrders = octOrders.filter(o => o.financial_status === 'paid' || o.financial_status === 'partially_paid');
    const codOrders = octOrders.filter(o => o.gateway?.includes('COD') || o.gateway?.includes('Cash on Delivery') || o.payment_gateway_names?.some(g => g.includes('Cash on Delivery')));

    octOrders.forEach(o => {
      totalRevenue += parseFloat(o.total_price || 0);
    });

    const ordersAttribution = {};
    octOrders.forEach(o => {
      const src = o.referring_site || o.source_name || 'Direct / Storefront';
      ordersAttribution[src] = (ordersAttribution[src] || 0) + 1;
    });

    // Checkouts / Abandoned
    const checkoutsUrl = `https://${SHOPIFY_DOMAIN}/admin/api/2024-04/checkouts.json?limit=100`;
    const checkoutsRes = await fetch(checkoutsUrl, {
      headers: { 'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_ACCESS_TOKEN || SHOPIFY_TOKEN }
    });
    const checkoutsData = await checkoutsRes.json();
    const rawCheckouts = checkoutsData.checkouts || [];
    const octCheckouts = rawCheckouts.filter(c => c.created_at && c.created_at.startsWith('2026-10'));

    report.shopify = {
      total_october_orders: octOrders.length,
      paid_orders_count: paidOrders.length,
      cod_orders_count: codOrders.length,
      total_gross_revenue: totalRevenue.toFixed(2),
      average_order_value: octOrders.length > 0 ? (totalRevenue / octOrders.length).toFixed(2) : 0,
      abandoned_checkouts_count: octCheckouts.length,
      sources_distribution: ordersAttribution,
      orders_list: octOrders.map(o => ({
        order_number: o.order_number || o.name,
        created_at: o.created_at,
        total_price: o.total_price,
        financial_status: o.financial_status,
        gateway: o.gateway || o.payment_gateway_names?.join(', '),
        customer_city: o.shipping_address?.city || 'N/A',
        referring_site: o.referring_site || 'Direct',
        landing_site: o.landing_site || 'N/A',
        items: o.line_items?.map(i => `${i.title} (x${i.quantity})`).join(', ')
      }))
    };

    console.log(`Total October Orders: ${octOrders.length} (Paid: ${paidOrders.length}, COD: ${codOrders.length}) | Gross Rev: ₹${totalRevenue.toFixed(2)}`);
    console.log(`Average Order Value (AOV): ₹${report.shopify.average_order_value}`);
    console.log(`Abandoned Checkouts in October: ${octCheckouts.length}`);
    console.log(`Order Sources:`, ordersAttribution);

  } catch (err) {
    console.error('Shopify Error:', err.message);
  }

  // Write Full JSON
  fs.writeFileSync(path.join(__dirname, 'omnichannel_live_audit_october_16.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log('\n✅ Full audit written to scripts/omnichannel_live_audit_october_16.json');
}

main().catch(console.error);
