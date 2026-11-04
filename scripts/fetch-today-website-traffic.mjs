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

async function fetchTodayTraffic() {
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');
  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);

  console.log(`Querying GA4 Property: ${propertyId} for TODAY (2026-10-26)...`);

  // 1. Overall Today Metrics
  const summaryRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'userEngagementDuration' }
      ]
    })
  });
  const summaryData = await summaryRes.json();
  const summaryRow = summaryData.rows?.[0]?.metricValues || [];
  const metrics = {
    activeUsers: parseInt(summaryRow[0]?.value || 0),
    newUsers: parseInt(summaryRow[1]?.value || 0),
    sessions: parseInt(summaryRow[2]?.value || 0),
    pageViews: parseInt(summaryRow[3]?.value || 0),
    avgDurationSec: parseFloat(summaryRow[4]?.value || 0).toFixed(1),
    bounceRate: (parseFloat(summaryRow[5]?.value || 0) * 100).toFixed(1) + '%',
    engagementSecTotal: parseFloat(summaryRow[6]?.value || 0).toFixed(0)
  };

  // 2. Traffic Sources Breakdown Today
  const sourcesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' },
        { name: 'sessionSourceMedium' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
    })
  });
  const sourcesData = await sourcesRes.json();
  const sources = (sourcesData.rows || []).map(r => ({
    channel: r.dimensionValues[0].value,
    sourceMedium: r.dimensionValues[1].value,
    users: parseInt(r.metricValues[0].value),
    sessions: parseInt(r.metricValues[1].value),
    pageViews: parseInt(r.metricValues[2].value),
    avgDuration: parseFloat(r.metricValues[3].value).toFixed(1) + 's'
  }));

  // 3. Pages Viewed Today
  const pagesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' }
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 20
    })
  });
  const pagesData = await pagesRes.json();
  const pages = (pagesData.rows || []).map(r => ({
    pagePath: r.dimensionValues[0].value,
    pageTitle: r.dimensionValues[1].value,
    pageViews: parseInt(r.metricValues[0].value),
    users: parseInt(r.metricValues[1].value),
    avgTime: parseFloat(r.metricValues[2].value).toFixed(1) + 's'
  }));

  // 4. Cities / Geo Breakdown Today
  const geoRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      dimensions: [
        { name: 'city' },
        { name: 'region' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' }
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10
    })
  });
  const geoData = await geoRes.json();
  const cities = (geoData.rows || []).map(r => ({
    city: r.dimensionValues[0].value,
    region: r.dimensionValues[1].value,
    users: parseInt(r.metricValues[0].value),
    sessions: parseInt(r.metricValues[1].value)
  }));

  // 5. Realtime Users in Last 30 Minutes
  const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics: [{ name: 'activeUsers' }],
      dimensions: [
        { name: 'unifiedScreenName' },
        { name: 'city' }
      ]
    })
  });
  const rtData = await rtRes.json();
  const activeNow = (rtData.rows || []).reduce((acc, r) => acc + parseInt(r.metricValues[0].value), 0);

  // 6. Realtime Events Today
  const rtEventsRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics: [{ name: 'eventCount' }],
      dimensions: [{ name: 'eventName' }]
    })
  });
  const rtEventsData = await rtEventsRes.json();
  const realtimeEvents = (rtEventsData.rows || []).map(r => ({
    event: r.dimensionValues[0].value,
    count: parseInt(r.metricValues[0].value)
  }));

  const fullReport = {
    date: '2026-10-26',
    metrics,
    activeNow,
    sources,
    pages,
    cities,
    realtimeEvents
  };

  fs.writeFileSync('scripts/today_website_traffic_full.json', JSON.stringify(fullReport, null, 2));

  console.log('\n================ TODAY TRAFFIC SUMMARY ================');
  console.log(metrics);
  console.log('\n--- Sources Breakdown ---');
  console.table(sources);
  console.log('\n--- Top Pages Visited ---');
  console.table(pages);
  console.log('\n--- Cities ---');
  console.table(cities);
  console.log(`\nActive Users in Last 30 Mins: ${activeNow}`);
}

fetchTodayTraffic().catch(console.error);
