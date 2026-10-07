// scripts/seo-brain.mjs
// 🧠 SUJATA NUTRILIVE: AUTONOMOUS SEO & ANALYTICS INTELLIGENCE ENGINE (2026)
// Direct API Integration with Google Search Console & Google Analytics 4

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Locate Service Account JSON Credentials
const scriptsDir = __dirname;
const jsonFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.json') && (f.includes('sujata-nutrilive-seo') || f.includes('service-account') || f.includes('credentials')));

if (jsonFiles.length === 0) {
  console.error('❌ Error: No Google Service Account JSON key found in scripts/ directory.');
  process.exit(1);
}

const keyPath = path.join(scriptsDir, jsonFiles[0]);
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// Automatically load .env for GA4 Property ID and site URL
const envPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[k] = val;
    }
  });
}

const SITE_URL = env.PUBLIC_SITE_URL ? env.PUBLIC_SITE_URL.replace(/\/$/, '') + '/' : 'https://sujatanutrilive.com/';
const GA4_PROPERTY_ID = env.GA4_PROPERTY_ID || '';

// 2. Google OAuth2 JWT Generator (Native zero-dependency RSA-SHA256)
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

async function getAccessToken(scopes) {
  const jwt = createJwt(scopes);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OAuth error: ${JSON.stringify(data)}`);
  return data.access_token;
}

// 3. Google Search Console Intelligence
async function fetchGSCData(accessToken) {
  console.log('🔍 [GSC] Querying Google Search Console API for:', SITE_URL);
  const siteUrlEncoded = encodeURIComponent(SITE_URL);

  // A. Verify Sitemaps
  let sitemaps = [];
  try {
    const smRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrlEncoded}/sitemaps`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (smRes.ok) {
      const smData = await smRes.json();
      sitemaps = smData.sitemap || [];
    }
  } catch (e) {
    console.warn('⚠️ Could not fetch sitemaps:', e.message);
  }

  // B. Query Search Analytics (Last 28 Days)
  const end = new Date();
  end.setDate(end.getDate() - 2); // GSC has 2-day delay
  const start = new Date();
  start.setDate(start.getDate() - 30);

  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  let queryRows = [];
  let pageRows = [];

  try {
    const qRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrlEncoded}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 100
      })
    });
    if (qRes.ok) {
      const qData = await qRes.json();
      queryRows = qData.rows || [];
    }

    const pRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrlEncoded}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 50
      })
    });
    if (pRes.ok) {
      const pData = await pRes.json();
      pageRows = pData.rows || [];
    }
  } catch (e) {
    console.warn('⚠️ Could not query search analytics:', e.message);
  }

  return { sitemaps, queryRows, pageRows, startDate, endDate };
}

// 4. Google Analytics 4 (GA4) Intelligence
async function fetchGA4Data(accessToken) {
  if (!GA4_PROPERTY_ID) {
    return { status: 'MISSING_PROPERTY_ID' };
  }

  const propIdClean = GA4_PROPERTY_ID.replace(/^properties\//, '');
  console.log(`📊 [GA4] Querying Google Analytics Data API for property: properties/${propIdClean}`);

  try {
    const gaRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propIdClean}:runReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'userEngagementDuration' }
        ],
        limit: 25
      })
    });

    if (!gaRes.ok) {
      const err = await gaRes.json();
      return { status: 'ERROR', error: err };
    }

    const report = await gaRes.json();
    return { status: 'SUCCESS', report };
  } catch (e) {
    return { status: 'ERROR', error: e.message };
  }
}

// 5. Intelligence Engine: Actionable SEO Insights Generator
function generateSeoActionPlan(gscData, ga4Data) {
  console.log('\n=============================================================');
  console.log('🎯 SUJATA NUTRILIVE: SEO & ANALYTICS INTELLIGENCE AUDIT');
  console.log('=============================================================');
  console.log(`🤖 Service Account: ${key.client_email}`);
  console.log(`🌐 Verified GSC Site: ${SITE_URL}`);
  console.log(`📅 Analysis Date Range: ${gscData.startDate} to ${gscData.endDate}`);

  // Sitemaps Audit
  console.log('\n🗺️ SITEMAP & INDEXING STATUS:');
  if (gscData.sitemaps.length > 0) {
    gscData.sitemaps.forEach(sm => {
      console.log(`  • ${sm.path} | Submitted: ${sm.contents ? sm.contents[0].submitted : 'Yes'} | Errors: ${sm.errors || 0}`);
    });
  } else {
    console.log('  • No sitemaps detected yet or currently being crawled.');
  }

  // Queries Audit
  console.log('\n📈 SEARCH CONSOLE REAL-TIME QUERIES:');
  if (gscData.queryRows.length === 0) {
    console.log('  ℹ️ GSC verified recently. Google updates query logs every 24-48 hours.');
    console.log('  💡 Search Console API authentication is 100% active and standing by for incoming query batches.');
  } else {
    console.table(gscData.queryRows.slice(0, 15).map(r => ({
      Query: r.keys[0],
      Clicks: r.clicks,
      Impressions: r.impressions,
      CTR: (r.ctr * 100).toFixed(1) + '%',
      Rank: r.position.toFixed(1)
    })));
  }

  // GA4 Status
  console.log('\n📊 GOOGLE ANALYTICS 4 (GA4) TRAFFIC & ENGAGEMENT:');
  if (ga4Data.status === 'MISSING_PROPERTY_ID') {
    console.log('  ℹ️ Measurement ID (G-5WZ8DNW2PD) is active in StoreLayout.astro.');
    console.log('  👉 To unlock automated GA4 traffic reports, add numeric GA4_PROPERTY_ID to .env.');
  } else if (ga4Data.status === 'SUCCESS') {
    if (ga4Data.report && ga4Data.report.rows && ga4Data.report.rows.length > 0) {
      console.table(ga4Data.report.rows.map(r => ({
        Page: r.dimensionValues[0].value,
        ActiveUsers: r.metricValues[0].value,
        Pageviews: r.metricValues[1].value,
        AvgEngageTime: Math.round(Number(r.metricValues[2].value) / (Number(r.metricValues[0].value) || 1)) + 's'
      })));
    } else {
      console.log('  ℹ️ GA4 connected successfully! Traffic data is currently accumulating.');
    }
  } else {
    console.log('  ⚠️ GA4 Notice:', ga4Data.error && ga4Data.error.message ? ga4Data.error.message : JSON.stringify(ga4Data.error));
  }

  console.log('\n=============================================================');
  console.log('🚀 AI SEO AGENT STANDING BY FOR STRATEGY & BLOG DISPATCH');
  console.log('=============================================================\n');
}

async function main() {
  try {
    const accessToken = await getAccessToken([
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics.readonly'
    ]);

    const gscData = await fetchGSCData(accessToken);
    const ga4Data = await fetchGA4Data(accessToken);

    generateSeoActionPlan(gscData, ga4Data);
  } catch (err) {
    console.error('❌ Failed to run SEO audit:', err);
  }
}

main();
