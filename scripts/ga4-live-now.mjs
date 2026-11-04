// scripts/ga4-live-now.mjs
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

  console.log('====================================================');
  console.log('⚡ GA4 REALTIME & LIVE AUDIT (AS OF 04:04 PM IST)');
  console.log('====================================================\n');

  // 1. Realtime Users by City & Page
  const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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

  console.log(`🟢 Active Users Right Now (Last 30 Mins): ${totalActive}`);
  if (rtData.rows && rtData.rows.length > 0) {
    rtData.rows.forEach(r => {
      console.log(`• Location: ${r.dimensionValues[1].value}, ${r.dimensionValues[2].value} | Page: ${r.dimensionValues[0].value} -> ${r.metricValues[0].value} user(s)`);
    });
  } else {
    console.log('• No active users on site in the last 30 minutes.');
  }

  // 2. Realtime Events (e.g. scroll, view_item, click, add_to_cart)
  const rtEventRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics: [{ name: 'eventCount' }],
      dimensions: [{ name: 'eventName' }]
    })
  });
  const rtEventData = await rtEventRes.json();
  if (rtEventData.rows && rtEventData.rows.length > 0) {
    console.log('\n--- Realtime Events in Last 30 Mins ---');
    rtEventData.rows.forEach(r => {
      console.log(`• ${r.dimensionValues[0].value}: ${r.metricValues[0].value} event(s)`);
    });
  }

  // 2B. Realtime Traffic Sources
  try {
    const rtSrcRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'source' }, { name: 'medium' }]
      })
    });
    const rtSrcData = await rtSrcRes.json();
    if (rtSrcData.rows && rtSrcData.rows.length > 0) {
      console.log('\n--- Realtime Traffic Sources in Last 30 Mins ---');
      rtSrcData.rows.forEach(r => {
        console.log(`• Source / Medium: ${r.dimensionValues[0].value} / ${r.dimensionValues[1].value} -> ${r.metricValues[0].value} active user(s)`);
      });
    }
  } catch (err) {
    console.error('Realtime sources error:', err.message);
  }

  // 3. Today Cumulative (14 Oct) Overview
  const todayRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
  console.log('\n--- Today (14 Oct) Cumulative Traffic Sources ---');
  let tUsers = 0, tSessions = 0, tViews = 0;
  if (todayData.rows && todayData.rows.length > 0) {
    todayData.rows.forEach(r => {
      const u = parseInt(r.metricValues[0].value);
      const s = parseInt(r.metricValues[1].value);
      const p = parseInt(r.metricValues[2].value);
      tUsers += u;
      tSessions += s;
      tViews += p;
      console.log(`• ${r.dimensionValues[0].value} / ${r.dimensionValues[1].value} -> Users: ${u}, Sessions: ${s}, Views: ${p}`);
    });
    console.log(`\nTotals Today: ${tUsers} Unique Users | ${tSessions} Sessions | ${tViews} Page Views`);
  } else {
    console.log('No cumulative rows returned for today.');
  }

  // 4. Pages Viewed Today
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
        { name: 'activeUsers' }
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
    })
  });
  const pagesData = await pagesRes.json();
  if (pagesData.rows && pagesData.rows.length > 0) {
    console.log('\n--- Pages Viewed Today ---');
    pagesData.rows.forEach(r => {
      console.log(`• ${r.dimensionValues[0].value} ("${r.dimensionValues[1].value.slice(0, 40)}..."): ${r.metricValues[0].value} views (${r.metricValues[1].value} users)`);
    });
  }
}

main().catch(console.error);
