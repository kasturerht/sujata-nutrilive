// scripts/diagnose_nov1_bounce_rate.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

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
  if (!fs.existsSync(keyPath)) return null;
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

async function runGA4Report(propertyId, token, body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await res.json();
}

async function main() {
  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

  console.log("=== GA4 BOUNCE RATE INVESTIGATION FOR 2026-11-01 VS 2026-10-31 ===");

  // 1. Overall stats comparing Oct 31 vs Nov 01
  const overallRes = await runGA4Report(propertyId, token, {
    dateRanges: [{ startDate: '2026-10-31', endDate: '2026-11-01' }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
      { name: 'engagedSessions' },
      { name: 'averageSessionDuration' }
    ],
    dimensions: [{ name: 'date' }]
  });

  // 2. Nov 01 Breakdown by sessionSourceMedium
  const nov1SourceRes = await runGA4Report(propertyId, token, {
    dateRanges: [{ startDate: '2026-11-01', endDate: '2026-11-01' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagedSessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' }
    ],
    dimensions: [{ name: 'sessionSourceMedium' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  });

  // 3. Oct 31 Breakdown by sessionSourceMedium
  const oct31SourceRes = await runGA4Report(propertyId, token, {
    dateRanges: [{ startDate: '2026-10-31', endDate: '2026-10-31' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagedSessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' }
    ],
    dimensions: [{ name: 'sessionSourceMedium' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  });

  // 4. Nov 01 Breakdown by Landing Page
  const nov1LandingRes = await runGA4Report(propertyId, token, {
    dateRanges: [{ startDate: '2026-11-01', endDate: '2026-11-01' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagedSessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' }
    ],
    dimensions: [{ name: 'landingPage' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  });

  // 5. Oct 31 Breakdown by Landing Page
  const oct31LandingRes = await runGA4Report(propertyId, token, {
    dateRanges: [{ startDate: '2026-10-31', endDate: '2026-10-31' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagedSessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' }
    ],
    dimensions: [{ name: 'landingPage' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  });

  // 6. Nov 01 Breakdown by Landing Page AND Source Medium
  const nov1LandingSourceRes = await runGA4Report(propertyId, token, {
    dateRanges: [{ startDate: '2026-11-01', endDate: '2026-11-01' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' }
    ],
    dimensions: [{ name: 'landingPage' }, { name: 'sessionSourceMedium' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  });

  // 7. Nov 01 Breakdown by Device
  const nov1DeviceRes = await runGA4Report(propertyId, token, {
    dateRanges: [{ startDate: '2026-11-01', endDate: '2026-11-01' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'bounceRate' }
    ],
    dimensions: [{ name: 'deviceCategory' }]
  });

  const oct31DeviceRes = await runGA4Report(propertyId, token, {
    dateRanges: [{ startDate: '2026-10-31', endDate: '2026-10-31' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'bounceRate' }
    ],
    dimensions: [{ name: 'deviceCategory' }]
  });

  // 8. Meta Ads Data for Nov 01 vs Oct 31
  let metaData = {};
  try {
    const metaToken = env.META_ACCESS_TOKEN;
    const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';
    if (metaToken) {
      const metaRes = await fetch(
        `https://graph.facebook.com/v19.0/${adAccountId}/insights?time_range={'since':'2026-10-31','until':'2026-11-01'}&time_increment=1&fields=spend,impressions,clicks,cpc,ctr,actions&access_token=${metaToken}`
      );
      metaData = await metaRes.json();
    }
  } catch (err) {
    metaData = { error: err.message };
  }

  const diagnosis = {
    overall: overallRes.rows,
    oct31Sources: oct31SourceRes.rows,
    nov1Sources: nov1SourceRes.rows,
    oct31Landing: oct31LandingRes.rows,
    nov1Landing: nov1LandingRes.rows,
    nov1LandingSource: nov1LandingSourceRes.rows,
    oct31Device: oct31DeviceRes.rows,
    nov1Device: nov1DeviceRes.rows,
    meta: metaData
  };

  fs.writeFileSync(path.join(__dirname, 'nov1_bounce_diagnosis.json'), JSON.stringify(diagnosis, null, 2));
  console.log("Saved diagnosis to scripts/nov1_bounce_diagnosis.json");
}

main().catch(console.error);
