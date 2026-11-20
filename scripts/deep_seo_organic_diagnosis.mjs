// scripts/deep_seo_organic_diagnosis.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env
const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

// Helper: Google JWT Token
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

const audit = {
  timestamp: new Date().toISOString(),
  gsc: {},
  ga4: {},
  sitemap: {}
};

async function auditGsc() {
  console.log("--> Querying Google Search Console (GSC)...");
  try {
    const token = await getGoogleToken([
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly'
    ]);
    const siteUrl = 'https://www.sujatanutrilive.com/';

    // 1. Last 28 days overall daily performance
    const dailyRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-23',
        endDate: '2026-11-18',
        dimensions: ['date'],
        rowLimit: 50
      })
    });
    const dailyData = await dailyRes.json();

    // 2. Top Search Queries with Position, Clicks, Impressions, CTR
    const queryRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-23',
        endDate: '2026-11-18',
        dimensions: ['query'],
        rowLimit: 50
      })
    });
    const queryData = await queryRes.json();

    // 3. Top Organic Landing Pages
    const pageRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-23',
        endDate: '2026-11-18',
        dimensions: ['page'],
        rowLimit: 30
      })
    });
    const pageData = await pageRes.json();

    // 4. Query + Page combo (Which query leads to which page)
    const comboRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-23',
        endDate: '2026-11-18',
        dimensions: ['query', 'page'],
        rowLimit: 50
      })
    });
    const comboData = await comboRes.json();

    // 5. Sitemaps status in GSC
    const sitemapsRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sitemapsData = await sitemapsRes.json();

    audit.gsc = {
      daily: dailyData.rows || [],
      queries: queryData.rows || [],
      pages: pageData.rows || [],
      queryPages: comboData.rows || [],
      sitemaps: sitemapsData.sitemap || []
    };
    console.log(`GSC: ${dailyData.rows?.length || 0} days, ${queryData.rows?.length || 0} queries, ${pageData.rows?.length || 0} pages.`);
  } catch (err) {
    console.error("GSC error:", err.message);
    audit.gsc = { error: err.message };
  }
}

async function auditGa4() {
  console.log("--> Querying GA4 Organic Traffic...");
  try {
    const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
    const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

    // Organic Traffic Only (Last 28 days)
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-23', endDate: '2026-11-19' }],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionMedium',
            stringFilter: {
              value: 'organic',
              matchType: 'EXACT'
            }
          }
        },
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'engagedSessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        dimensions: [{ name: 'landingPage' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      })
    });
    const data = await res.json();

    // Daily Organic Trend
    const dailyRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-23', endDate: '2026-11-19' }],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionMedium',
            stringFilter: {
              value: 'organic',
              matchType: 'EXACT'
            }
          }
        },
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'engagedSessions' }
        ],
        dimensions: [{ name: 'date' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      })
    });
    const dailyData = await dailyRes.json();

    audit.ga4 = {
      landingPages: data.rows || [],
      daily: dailyData.rows || []
    };
    console.log(`GA4 Organic: ${data.rows?.length || 0} landing pages, ${dailyData.rows?.length || 0} days.`);
  } catch (err) {
    console.error("GA4 error:", err.message);
    audit.ga4 = { error: err.message };
  }
}

async function main() {
  await Promise.all([auditGsc(), auditGa4()]);
  fs.writeFileSync(path.join(__dirname, 'deep_seo_audit.json'), JSON.stringify(audit, null, 2));
  console.log("Saved SEO audit to scripts/deep_seo_audit.json");
}

main().catch(console.error);
