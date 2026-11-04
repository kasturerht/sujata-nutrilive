// scripts/get-oct17-status.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

function getGoogleJwt(scopes, key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: Array.isArray(scopes) ? scopes.join(' ') : scopes,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = b64(header) + '.' + b64(payload);
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  return signInput + '.' + signer.sign(key.private_key, 'base64url');
}

async function getGoogleToken(scopes) {
  const keyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const assertion = getGoogleJwt(scopes, key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const data = await res.json();
  return data.access_token;
}

const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const clientId = env.SHOPIFY_CLIENT_ID;
const clientSecret = env.SHOPIFY_CLIENT_SECRET;

async function getShopifyAdminToken() {
  try {
    const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });
    const oData = await oRes.json();
    if (oData.access_token) {
      return oData.access_token;
    }
  } catch (e) {
    console.error("Shopify OAuth error:", e.message);
  }
  return env.SHOPIFY_ADMIN_ACCESS_TOKEN;
}

async function run() {
  console.log("================================================================================");
  console.log("🚀 SUJATA NUTRILIVE: REAL-TIME & LIVE STATUS REPORT (17-OCT-2026)");
  console.log(`🕒 Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
  console.log("================================================================================\n");

  const gaToken = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
  const gscToken = await getGoogleToken(['https://www.googleapis.com/auth/webmasters.readonly']);
  const shopifyToken = await getShopifyAdminToken();
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

  // 1. GA4 REALTIME (Right Now)
  console.log("📊 [1] GA4 REALTIME ACTIVE USERS (Last 30 Minutes):");
  try {
    const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: [{ name: 'activeUsers' }],
        dimensions: [
          { name: 'unifiedScreenName' },
          { name: 'city' },
          { name: 'country' }
        ]
      })
    });
    const rtData = await rtRes.json();
    const totalActive = (rtData.rows || []).reduce((acc, r) => acc + parseInt(r.metricValues[0].value), 0);
    console.log(`   🟢 Active Users Right Now: ${totalActive}`);
    if (rtData.rows && rtData.rows.length > 0) {
      rtData.rows.forEach(r => {
        console.log(`      📍 ${r.dimensionValues[1].value}, ${r.dimensionValues[2].value} | Page: ${r.dimensionValues[0].value} -> ${r.metricValues[0].value} user(s)`);
      });
    } else {
      console.log("      (No active users currently browsing in the last 30 minutes)");
    }

    // Realtime sources
    const rtSrcRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'source' }, { name: 'medium' }]
      })
    });
    const rtSrcData = await rtSrcRes.json();
    if (rtSrcData.rows && rtSrcData.rows.length > 0) {
      console.log("\n   📍 Realtime Traffic Channels:");
      rtSrcData.rows.forEach(r => {
        console.log(`      • ${r.dimensionValues[0].value} / ${r.dimensionValues[1].value} -> ${r.metricValues[0].value} user(s)`);
      });
    }
  } catch (err) {
    console.error("GA4 Realtime error:", err.message);
  }

  // 2. GA4 TODAY (17-Oct-2026 Cumulative)
  console.log("\n📈 [2] GA4 TODAY CUMULATIVE TRAFFIC (17-Oct-2026):");
  try {
    const todayRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        dimensions: [
          { name: 'sessionSource' },
          { name: 'sessionMedium' }
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ]
      })
    });
    const todayData = await todayRes.json();
    let totUsers = 0, totSessions = 0, totViews = 0;
    if (todayData.rows && todayData.rows.length > 0) {
      console.log("   Channels / Sources Today:");
      todayData.rows.forEach(r => {
        const u = parseInt(r.metricValues[0].value);
        const s = parseInt(r.metricValues[1].value);
        const p = parseInt(r.metricValues[2].value);
        totUsers += u;
        totSessions += s;
        totViews += p;
        console.log(`      • ${r.dimensionValues[0].value} / ${r.dimensionValues[1].value} -> Users: ${u}, Sessions: ${s}, Views: ${p}`);
      });
      console.log(`   👉 TOTALS TODAY: ${totUsers} Users | ${totSessions} Sessions | ${totViews} Page Views`);
    } else {
      console.log("   (GA4 has not logged completed sessions for today yet, or 0 sessions logged)");
    }

    // Top Pages Today
    const todayPagesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' }
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' }
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      })
    });
    const todayPagesData = await todayPagesRes.json();
    if (todayPagesData.rows && todayPagesData.rows.length > 0) {
      console.log("\n   📄 Top Pages Viewed Today:");
      todayPagesData.rows.forEach(r => {
        console.log(`      • ${r.dimensionValues[0].value} -> ${r.metricValues[0].value} views (${r.metricValues[1].value} users)`);
      });
    }
  } catch (err) {
    console.error("GA4 Today error:", err.message);
  }

  // 3. GA4 LAST 7 DAYS OVERVIEW (OCT 11 - OCT 17)
  console.log("\n📅 [3] GA4 DAILY TRAFFIC TREND (Last 7 Days):");
  try {
    const dailyRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
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
    if (dailyData.rows && dailyData.rows.length > 0) {
      dailyData.rows.forEach(r => {
        const d = r.dimensionValues[0].value;
        const formattedDate = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
        console.log(`      • ${formattedDate}: ${r.metricValues[0].value} Users | ${r.metricValues[1].value} Sessions | ${r.metricValues[2].value} Views`);
      });
    }
  } catch (err) {
    console.error("GA4 7-days error:", err.message);
  }

  // 4. GOOGLE SEARCH CONSOLE (GSC) PERFORMANCE
  console.log("\n🔍 [4] GOOGLE SEARCH CONSOLE (GSC) ORGANIC SEARCH PERFORMANCE:");
  try {
    // Check daily breakdown to see latest available date in GSC
    const gscDailyRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fwww.sujatanutrilive.com%2F/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gscToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-01',
        endDate: '2026-10-17',
        dimensions: ['date']
      })
    });
    const gscDailyData = await gscDailyRes.json();
    let totalClicks = 0, totalImpr = 0;
    if (gscDailyData.rows && gscDailyData.rows.length > 0) {
      console.log(`   GSC Daily Organic Performance (Available Days in Oct 2026):`);
      gscDailyData.rows.forEach(r => {
        totalClicks += r.clicks;
        totalImpr += r.impressions;
        console.log(`      • ${r.keys[0]}: ${r.clicks} clicks | ${r.impressions} impressions | CTR: ${(r.ctr * 100).toFixed(1)}% | Avg Pos: ${r.position.toFixed(1)}`);
      });
      const avgCtr = totalImpr > 0 ? ((totalClicks / totalImpr) * 100).toFixed(2) : '0';
      console.log(`   👉 GSC Oct Total: ${totalClicks} Clicks | ${totalImpr} Impressions | Avg CTR: ${avgCtr}%`);
      const latestDate = gscDailyData.rows[gscDailyData.rows.length - 1].keys[0];
      console.log(`   ℹ️ Note: Google Search Console API data pipeline currently refreshed up to ${latestDate} (standard 48-72 hr Google reporting lag).`);
    } else {
      console.log("   (No GSC daily data returned)");
    }

    // Top queries in GSC
    const gscQueryRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fwww.sujatanutrilive.com%2F/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gscToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-01',
        endDate: '2026-10-17',
        dimensions: ['query'],
        rowLimit: 12
      })
    });
    const gscQueryData = await gscQueryRes.json();
    if (gscQueryData.rows && gscQueryData.rows.length > 0) {
      console.log("\n   Top Google Search Queries & Rankings:");
      gscQueryData.rows.forEach(r => {
        console.log(`      • "${r.keys[0]}": ${r.clicks} clicks | ${r.impressions} impr | Avg Pos: ${r.position.toFixed(1)}`);
      });
    }

    // Top Pages in GSC
    const gscPageRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fwww.sujatanutrilive.com%2F/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gscToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-01',
        endDate: '2026-10-17',
        dimensions: ['page'],
        rowLimit: 8
      })
    });
    const gscPageData = await gscPageRes.json();
    if (gscPageData.rows && gscPageData.rows.length > 0) {
      console.log("\n   Top Ranking Pages in Google:");
      gscPageData.rows.forEach(r => {
        console.log(`      • ${r.keys[0]}: ${r.clicks} clicks | ${r.impressions} impr | Avg Pos: ${r.position.toFixed(1)}`);
      });
    }
  } catch (err) {
    console.error("GSC error:", err.message);
  }

  // 5. SHOPIFY ORDERS & REVENUE (TODAY + OCT MTD)
  console.log("\n💰 [5] SHOPIFY ORDERS & REVENUE STATUS:");
  try {
    const ordersRes = await fetch(`https://${domain}/admin/api/2024-04/orders.json?status=any&limit=250`, {
      headers: {
        'X-Shopify-Access-Token': shopifyToken,
        'Content-Type': 'application/json'
      }
    });
    const ordersData = await ordersRes.json();
    const orders = ordersData.orders || [];

    // Filter today's orders (17-Oct-2026)
    // Check in IST timezone
    const todayStrIST = '2026-10-17';
    const todayOrders = [];
    let todayRevenue = 0;
    let octRevenue = 0;
    let octCount = 0;

    orders.forEach(o => {
      // created_at is ISO e.g. "2026-10-12T10:44:00+05:30"
      const dateIST = new Date(o.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
      const price = parseFloat(o.total_price || 0);

      if (dateIST.startsWith('2026-10')) {
        octCount++;
        octRevenue += price;
      }

      if (dateIST === todayStrIST) {
        todayOrders.push(o);
        todayRevenue += price;
      }
    });

    console.log(`   🛒 Today (17-Oct-2026) Orders: ${todayOrders.length}`);
    console.log(`   💵 Today Revenue: ₹${todayRevenue.toFixed(2)}`);

    if (todayOrders.length > 0) {
      console.log("\n   📦 Today's Orders Detail:");
      todayOrders.forEach(o => {
        console.log(`      • Order #${o.order_number} (${o.name}): ₹${o.total_price} | Status: ${o.financial_status} | Customer: ${o.customer?.first_name || ''} ${o.customer?.last_name || ''} (${o.shipping_address?.city || 'N/A'}) | Items: ${(o.line_items || []).map(i => i.title).join(', ')}`);
      });
    } else {
      console.log("      (No new website orders placed yet today on Shopify)");
    }

    // Check Abandoned Checkouts Today
    const checkoutsRes = await fetch(`https://${domain}/admin/api/2024-04/checkouts.json?limit=50`, {
      headers: {
        'X-Shopify-Access-Token': shopifyToken,
        'Content-Type': 'application/json'
      }
    });
    const checkoutsData = await checkoutsRes.json();
    const checkouts = checkoutsData.checkouts || [];
    const todayCheckouts = checkouts.filter(c => {
      const cDate = new Date(c.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      return cDate === todayStrIST;
    });

    console.log(`\n   🛒 Abandoned Checkouts Today (17-Oct): ${todayCheckouts.length}`);
    if (todayCheckouts.length > 0) {
      todayCheckouts.forEach(c => {
        console.log(`      • Checkout #${c.id}: ₹${c.total_price} | Email: ${c.email || 'N/A'} | Phone: ${c.phone || 'N/A'} | Cart: ${(c.line_items || []).map(i => i.title).join(', ')}`);
      });
    }

    console.log(`\n   📊 October 2026 Month-to-Date (MTD) Shopify Performance:`);
    console.log(`      • Total Orders in Oct: ${octCount}`);
    console.log(`      • Total Revenue in Oct: ₹${octRevenue.toFixed(2)}`);

    // Latest 3 orders overall
    console.log(`\n   🕒 Last 3 Orders Placed on Store:`);
    orders.slice(0, 3).forEach(o => {
      const oDateIST = new Date(o.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      console.log(`      • Order #${o.order_number} (${oDateIST}): ₹${o.total_price} | ${o.financial_status} | Customer: ${o.customer?.first_name || ''} ${o.customer?.last_name || ''} (${o.shipping_address?.city || 'N/A'})`);
    });

  } catch (err) {
    console.error("Shopify error:", err.message);
  }

  console.log("\n================================================================================");
  console.log("✅ AUDIT COMPLETED SUCCESSFULLY");
  console.log("================================================================================");
}

run().catch(console.error);
