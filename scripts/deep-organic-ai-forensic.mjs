// scripts/deep-organic-ai-forensic.mjs
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

// Google OAuth JWT
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
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt
  });
  const data = await res.json();
  return data.access_token;
}

async function main() {
  console.log('========================================================================');
  console.log('🔬 DEEP ORGANIC & AI TRAFFIC AUDIT: PARVA (OCT 12) VS KAAL (OCT 13)');
  console.log('========================================================================\n');

  const gaToken = await getAccessToken(['https://www.googleapis.com/auth/analytics.readonly']);
  const gscToken = await getAccessToken(['https://www.googleapis.com/auth/webmasters.readonly']);

  // -------------------------------------------------------------
  // GA4 QUERY 1: Daily Organic & AI vs Paid Breakdown (Oct 10 - Oct 14)
  // -------------------------------------------------------------
  console.log('--- 1. GA4: DAILY CHANNEL & SOURCE BREAKDOWN ---');
  const gaRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${gaToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-10', endDate: '2026-10-14' }],
      dimensions: [
        { name: 'date' },
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
      orderBys: [
        { dimension: { dimensionName: 'date' } },
        { metric: { metricName: 'activeUsers' }, desc: true }
      ]
    })
  });
  const gaData = await gaRes.json();

  const dayAggregates = {};
  (gaData.rows || []).forEach(r => {
    const rawDate = r.dimensionValues[0].value;
    const dateFormatted = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    const channel = r.dimensionValues[1].value;
    const sourceMedium = r.dimensionValues[2].value;
    const users = parseInt(r.metricValues[0].value || '0');
    const sessions = parseInt(r.metricValues[1].value || '0');
    const engaged = parseInt(r.metricValues[2].value || '0');
    const pageviews = parseInt(r.metricValues[3].value || '0');
    const avgDuration = parseFloat(r.metricValues[4].value || '0');

    if (!dayAggregates[dateFormatted]) {
      dayAggregates[dateFormatted] = {
        totalUsers: 0,
        totalSessions: 0,
        totalPageviews: 0,
        organicGoogle: { users: 0, sessions: 0, pageviews: 0, engaged: 0 },
        aiSearch: { users: 0, sessions: 0, pageviews: 0, engaged: 0, sources: {} },
        direct: { users: 0, sessions: 0, pageviews: 0, engaged: 0 },
        paidAds: { users: 0, sessions: 0, pageviews: 0, engaged: 0 },
        other: { users: 0, sessions: 0, pageviews: 0, engaged: 0 },
        allSources: []
      };
    }

    const da = dayAggregates[dateFormatted];
    da.totalUsers += users;
    da.totalSessions += sessions;
    da.totalPageviews += pageviews;

    const isPaid = /cpc|paid|meta|facebook|fb|ig|ads/i.test(sourceMedium) || /paid/i.test(channel);
    const isAi = /chatgpt|openai|perplexity|claude|gemini|ai-assistant/i.test(sourceMedium) || /ai assistant/i.test(channel);
    const isGoogleOrganic = /google.*organic/i.test(sourceMedium) || (channel === 'Organic Search' && /google/i.test(sourceMedium));
    const isDirect = /direct/i.test(sourceMedium) || channel === 'Direct';

    if (isAi) {
      da.aiSearch.users += users;
      da.aiSearch.sessions += sessions;
      da.aiSearch.pageviews += pageviews;
      da.aiSearch.engaged += engaged;
      da.aiSearch.sources[sourceMedium] = (da.aiSearch.sources[sourceMedium] || 0) + users;
    } else if (isGoogleOrganic) {
      da.organicGoogle.users += users;
      da.organicGoogle.sessions += sessions;
      da.organicGoogle.pageviews += pageviews;
      da.organicGoogle.engaged += engaged;
    } else if (isDirect) {
      da.direct.users += users;
      da.direct.sessions += sessions;
      da.direct.pageviews += pageviews;
      da.direct.engaged += engaged;
    } else if (isPaid) {
      da.paidAds.users += users;
      da.paidAds.sessions += sessions;
      da.paidAds.pageviews += pageviews;
      da.paidAds.engaged += engaged;
    } else {
      da.other.users += users;
      da.other.sessions += sessions;
      da.other.pageviews += pageviews;
      da.other.engaged += engaged;
    }

    da.allSources.push({ channel, sourceMedium, users, sessions, pageviews, avgDuration });
  });

  console.log('Daily Aggregates Summary:');
  Object.keys(dayAggregates).sort().forEach(d => {
    const da = dayAggregates[d];
    console.log(`\n📅 Date: ${d}`);
    console.log(`   Total Active Users: ${da.totalUsers} | Total Sessions: ${da.totalSessions} | PageViews: ${da.totalPageviews}`);
    console.log(`   🔍 Google Organic:  ${da.organicGoogle.users} users, ${da.organicGoogle.sessions} sessions, ${da.organicGoogle.pageviews} views (Engaged: ${da.organicGoogle.engaged})`);
    console.log(`   🤖 AI Search:       ${da.aiSearch.users} users, ${da.aiSearch.sessions} sessions, ${da.aiSearch.pageviews} views (Sources: ${JSON.stringify(da.aiSearch.sources)})`);
    console.log(`   🔗 Direct Traffic:  ${da.direct.users} users, ${da.direct.sessions} sessions, ${da.direct.pageviews} views`);
    console.log(`   📱 Paid Meta Ads:   ${da.paidAds.users} users, ${da.paidAds.sessions} sessions, ${da.paidAds.pageviews} views`);
    console.log(`   🌐 Other/Social:    ${da.other.users} users, ${da.other.sessions} sessions, ${da.other.pageviews} views`);
  });

  // -------------------------------------------------------------
  // GA4 QUERY 2: Top Landing Pages for Organic & AI (Oct 12 vs Oct 13)
  // -------------------------------------------------------------
  console.log('\n--- 2. GA4: TOP LANDING PAGES FOR ORGANIC & AI (OCT 12 & 13) ---');
  const pagesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${gaToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-12', endDate: '2026-10-13' }],
      dimensions: [
        { name: 'date' },
        { name: 'pagePath' },
        { name: 'sessionDefaultChannelGroup' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' }
      ],
      dimensionFilter: {
        orGroup: {
          expressions: [
            { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Organic Search' } } },
            { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'AI Assistant' } } },
            { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Direct' } } }
          ]
        }
      },
      limit: 25
    })
  });
  const pagesData = await pagesRes.json();
  const landingPages = (pagesData.rows || []).map(r => ({
    date: r.dimensionValues[0].value,
    path: r.dimensionValues[1].value,
    channel: r.dimensionValues[2].value,
    users: r.metricValues[0].value,
    views: r.metricValues[1].value
  }));
  console.table(landingPages);

  // -------------------------------------------------------------
  // GSC QUERY: Exact Day-by-Day Search Performance (Oct 08 - Oct 14)
  // -------------------------------------------------------------
  console.log('\n--- 3. GSC: EXACT SEARCH PERFORMANCE BY DATE ---');
  const siteUrl = 'https://www.sujatanutrilive.com/';
  const encodedSite = encodeURIComponent(siteUrl);

  const gscDailyRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${gscToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate: '2026-10-08',
      endDate: '2026-10-14',
      dimensions: ['date']
    })
  });
  const gscDaily = await gscDailyRes.json();
  console.log('GSC Daily Rows:');
  console.table(gscDaily.rows || []);

  // GSC Queries on Oct 11, 12, 13
  const gscQueryDateRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${gscToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate: '2026-10-10',
      endDate: '2026-10-14',
      dimensions: ['date', 'query']
    })
  });
  const gscQueryDate = await gscQueryDateRes.json();
  console.log('\nGSC Queries breakdown:');
  console.table(gscQueryDate.rows?.slice(0, 20) || []);

  // GSC Pages breakdown
  const gscPagesRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${gscToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate: '2026-10-10',
      endDate: '2026-10-14',
      dimensions: ['date', 'page']
    })
  });
  const gscPages = await gscPagesRes.json();
  console.log('\nGSC Pages breakdown:');
  console.table(gscPages.rows?.slice(0, 20) || []);

  // Save report
  const finalReport = {
    dayAggregates,
    landingPages,
    gscDaily: gscDaily.rows || [],
    gscQueries: gscQueryDate.rows || [],
    gscPages: gscPages.rows || []
  };
  fs.writeFileSync(path.join(__dirname, 'yesterday_parva_organic_report.json'), JSON.stringify(finalReport, null, 2), 'utf8');
}

main().catch(console.error);
