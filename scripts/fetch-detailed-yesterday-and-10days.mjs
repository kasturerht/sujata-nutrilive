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

async function main() {
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');
  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
  const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';

  console.log('========================================================================');
  console.log('📊 DETAILED AUDIT: YESTERDAY (2026-10-23) & LAST 10 DAYS (OCT 14-23)');
  console.log('========================================================================\n');

  // ===========================================================================
  // 1. GA4 YESTERDAY (2026-10-23) DETAILED BREAKDOWN
  // ===========================================================================
  console.log('>>> 1. GA4 YESTERDAY (2026-10-23) METRICS <<<');
  
  // A. Overall Summary
  const ySummaryRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-23', endDate: '2026-10-23' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'engagedSessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ]
    })
  });
  const ySummaryData = await ySummaryRes.json();
  const yRow = ySummaryData.rows?.[0]?.metricValues || [];
  console.log(`Active Users: ${yRow[0]?.value || 0}`);
  console.log(`New Users: ${yRow[1]?.value || 0}`);
  console.log(`Sessions: ${yRow[2]?.value || 0}`);
  console.log(`Pageviews: ${yRow[3]?.value || 0}`);
  console.log(`Engaged Sessions: ${yRow[4]?.value || 0}`);
  console.log(`Avg Session Duration: ${(parseFloat(yRow[5]?.value || 0)).toFixed(1)}s`);
  console.log(`Bounce Rate: ${(parseFloat(yRow[6]?.value || 0) * 100).toFixed(1)}%\n`);

  // B. Traffic Sources & Mediums Yesterday
  console.log('>>> Traffic Sources & Mediums Yesterday:');
  const ySourceRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-23', endDate: '2026-10-23' }],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' },
        { name: 'sessionSourceMedium' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' }
      ]
    })
  });
  const ySourceData = await ySourceRes.json();
  ySourceData.rows?.forEach(r => {
    console.log(`• Channel: ${r.dimensionValues[0].value} | Source/Medium: ${r.dimensionValues[1].value} -> Users: ${r.metricValues[0].value}, Sessions: ${r.metricValues[1].value}, Views: ${r.metricValues[2].value}`);
  });
  console.log('');

  // C. Geo Distribution (Cities) Yesterday
  console.log('>>> Geo Locations (Cities) Yesterday:');
  const yCityRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-23', endDate: '2026-10-23' }],
      dimensions: [{ name: 'city' }, { name: 'region' }, { name: 'country' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 15
    })
  });
  const yCityData = await yCityRes.json();
  yCityData.rows?.forEach(r => {
    console.log(`• City: ${r.dimensionValues[0].value}, ${r.dimensionValues[1].value} (${r.dimensionValues[2].value}) -> Users: ${r.metricValues[0].value}, Sessions: ${r.metricValues[1].value}`);
  });
  console.log('');

  // D. Landing Pages Yesterday (Where did their journey start?)
  console.log('>>> Landing Pages Yesterday (Entry Points):');
  const yLandingRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-23', endDate: '2026-10-23' }],
      dimensions: [{ name: 'landingPage' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
    })
  });
  const yLandingData = await yLandingRes.json();
  yLandingData.rows?.forEach(r => {
    console.log(`• Entry: ${r.dimensionValues[0].value} -> Sessions: ${r.metricValues[0].value}, Users: ${r.metricValues[1].value}`);
  });
  console.log('');

  // E. All Pages Viewed Yesterday
  console.log('>>> Pages Viewed Yesterday:');
  const yPagesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-23', endDate: '2026-10-23' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 15
    })
  });
  const yPagesData = await yPagesRes.json();
  yPagesData.rows?.forEach(r => {
    console.log(`• ${r.dimensionValues[0].value} ("${r.dimensionValues[1].value}") -> Views: ${r.metricValues[0].value}, Users: ${r.metricValues[1].value}`);
  });
  console.log('');

  // F. User Journey & Funnel Events Yesterday
  console.log('>>> Events & Funnel Progression Yesterday:');
  const yEventsRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-23', endDate: '2026-10-23' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }]
    })
  });
  const yEventsData = await yEventsRes.json();
  yEventsData.rows?.forEach(r => {
    console.log(`• Event: ${r.dimensionValues[0].value} -> Count: ${r.metricValues[0].value}, Users: ${r.metricValues[1].value}`);
  });
  console.log('\n');

  // ===========================================================================
  // 2. SHOPIFY ORDERS & CHECKOUTS YESTERDAY (2026-10-23)
  // ===========================================================================
  console.log('>>> 2. SHOPIFY ORDERS & CHECKOUTS YESTERDAY (2026-10-23) <<<');
  let adminToken = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  try {
    const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.SHOPIFY_CLIENT_ID,
        client_secret: env.SHOPIFY_CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });
    const oData = await oRes.json();
    if (oData.access_token) adminToken = oData.access_token;
  } catch(e) {}

  const ordersRes = await fetch(`https://${domain}/admin/api/2024-04/orders.json?status=any&created_at_min=2026-10-14T00:00:00Z&limit=250`, {
    headers: { 'X-Shopify-Access-Token': adminToken }
  });
  const ordersData = await ordersRes.json();
  const allOrders = ordersData.orders || [];

  const checkoutsRes = await fetch(`https://${domain}/admin/api/2024-04/checkouts.json?created_at_min=2026-10-14T00:00:00Z&limit=250`, {
    headers: { 'X-Shopify-Access-Token': adminToken }
  });
  const checkoutsData = await checkoutsRes.json();
  const allCheckouts = checkoutsData.checkouts || [];

  const yOrders = allOrders.filter(o => {
    const d = new Date(new Date(o.created_at).getTime() + 5.5 * 3600 * 1000).toISOString().split('T')[0];
    return d === '2026-10-23';
  });

  const yCheckouts = allCheckouts.filter(c => {
    const d = new Date(new Date(c.created_at).getTime() + 5.5 * 3600 * 1000).toISOString().split('T')[0];
    return d === '2026-10-23';
  });

  console.log(`Yesterday Orders: ${yOrders.length}`);
  yOrders.forEach(o => {
    console.log(`  Order: ${o.name} | Total: ₹${o.total_price} | Customer: ${o.customer?.first_name} ${o.customer?.last_name} | City: ${o.shipping_address?.city} | Status: ${o.financial_status}`);
  });
  console.log(`Yesterday Abandoned Checkouts: ${yCheckouts.length}`);
  yCheckouts.forEach(c => {
    console.log(`  Checkout: ${c.id} | Total: ₹${c.total_price} | Email/Phone: ${c.email || c.phone || 'Anonymous'}`);
  });
  console.log('\n');

  // ===========================================================================
  // 3. LAST 10 DAYS DAY-BY-DAY AUDIT (2026-10-14 TO 2026-10-23)
  // ===========================================================================
  console.log('========================================================================');
  console.log('📈 3. LAST 10 DAYS DAY-BY-DAY GA4 & SHOPIFY BREAKDOWN (OCT 14 - OCT 23)');
  console.log('========================================================================');

  const tenDaysGa4Res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-14', endDate: '2026-10-23' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'engagedSessions' },
        { name: 'bounceRate' }
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }]
    })
  });
  const tenDaysGa4Data = await tenDaysGa4Res.json();

  // Also get day-by-day top traffic channel for last 10 days
  const tenDaysChanRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-14', endDate: '2026-10-23' }],
      dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }, { metric: { metricName: 'sessions' }, desc: true }]
    })
  });
  const tenDaysChanData = await tenDaysChanRes.json();
  const dayChannelMap = {};
  tenDaysChanData.rows?.forEach(r => {
    const rawDate = r.dimensionValues[0].value;
    const fDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    if (!dayChannelMap[fDate]) dayChannelMap[fDate] = [];
    dayChannelMap[fDate].push(`${r.dimensionValues[1].value} (${r.metricValues[0].value})`);
  });

  // Organize Shopify orders day-by-day
  const shopifyDayMap = {};
  for (let d = 14; d <= 23; d++) {
    shopifyDayMap[`2026-10-${d}`] = { orders: 0, revenue: 0, checkouts: 0 };
  }
  allOrders.forEach(o => {
    const d = new Date(new Date(o.created_at).getTime() + 5.5 * 3600 * 1000).toISOString().split('T')[0];
    if (shopifyDayMap[d]) {
      shopifyDayMap[d].orders++;
      shopifyDayMap[d].revenue += parseFloat(o.total_price || 0);
    }
  });
  allCheckouts.forEach(c => {
    const d = new Date(new Date(c.created_at).getTime() + 5.5 * 3600 * 1000).toISOString().split('T')[0];
    if (shopifyDayMap[d]) {
      shopifyDayMap[d].checkouts++;
    }
  });

  console.log('| Date | Users | Sessions | Pageviews | Top Channels | Orders | Revenue | Abandoned |');
  console.log('| :--- | :---: | :---: | :---: | :--- | :---: | :---: | :---: |');
  tenDaysGa4Data.rows?.forEach(r => {
    const rawDate = r.dimensionValues[0].value;
    const fDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    const users = r.metricValues[0].value;
    const sessions = r.metricValues[1].value;
    const views = r.metricValues[2].value;
    const chans = dayChannelMap[fDate]?.slice(0, 2).join(', ') || 'Direct';
    const sOrders = shopifyDayMap[fDate]?.orders || 0;
    const sRev = shopifyDayMap[fDate]?.revenue ? `₹${shopifyDayMap[fDate].revenue}` : '₹0';
    const sAband = shopifyDayMap[fDate]?.checkouts || 0;

    console.log(`| ${fDate} | ${users} | ${sessions} | ${views} | ${chans} | ${sOrders} | ${sRev} | ${sAband} |`);
  });
}

main().catch(console.error);
