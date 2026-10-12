// scripts/fetch-organic-traffic.mjs
// 🔍 GA4 EXACT ORGANIC & AI TRAFFIC AUDIT (YESTERDAY VS TODAY)
// Queries GA4 Data API for pure Organic Search & AI Referral visitors (Zero Paid Ads)

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
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
}

const GA4_PROPERTY_ID = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

// 2. Google OAuth2 JWT
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

async function getAccessToken() {
  const jwt = createJwt(['https://www.googleapis.com/auth/analytics.readonly']);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt
  });
  const data = await res.json();
  return data.access_token;
}

async function runAudit() {
  console.log('====================================================================');
  console.log('📊 GA4 ACTUAL AUDIT: PURE NON-PAID (ORGANIC & AI) TRAFFIC');
  console.log('📅 Date Comparison: Yesterday (2026-10-11) vs Today (2026-10-12)');
  console.log('====================================================================\n');

  const token = await getAccessToken();

  // Query 1: Full breakdown by Source / Medium for Yesterday and Today
  const reportRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [
        { startDate: 'yesterday', endDate: 'today' }
      ],
      dimensions: [
        { name: 'date' },
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

  const data = await reportRes.json();
  
  if (!reportRes.ok) {
    console.error('GA4 API Error:', JSON.stringify(data, null, 2));
    return;
  }

  const rows = data.rows || [];

  console.log(`Found ${rows.length} traffic source records for Yesterday & Today.\n`);

  const formattedRows = rows.map(r => {
    const dStr = r.dimensionValues[0].value; // e.g. "20261011"
    const dateFormatted = dStr.slice(0, 4) + '-' + dStr.slice(4, 6) + '-' + dStr.slice(6, 8);
    const source = r.dimensionValues[1].value;
    const medium = r.dimensionValues[2].value;
    const activeUsers = parseInt(r.metricValues[0].value, 10);
    const sessions = parseInt(r.metricValues[1].value, 10);
    const pageviews = parseInt(r.metricValues[2].value, 10);

    // Classification
    const isPaid = /cpc|paid|meta|facebook|fb|ig|instagram|ads/i.test(medium) || /fb|meta|facebook|instagram/i.test(source);
    const isAi = /chatgpt|openai|perplexity|claude|gemini/i.test(source) || /chatgpt|openai|perplexity/i.test(medium);
    const isOrganicSearch = /google|bing|yahoo|duckduckgo/i.test(source) && !isPaid;
    const isDirect = /direct|\(none\)/i.test(source) || /direct|\(none\)/i.test(medium);

    let category = 'Other / Referral';
    if (isPaid) category = 'Paid Ads (Meta/IG)';
    else if (isAi) category = '🤖 AI Search (ChatGPT/Perplexity)';
    else if (isOrganicSearch) category = '🔍 Organic Google Search';
    else if (isDirect) category = 'Direct (URL typed / bookmarks)';

    return {
      Date: dateFormatted,
      Category: category,
      Source: source,
      Medium: medium,
      ActiveUsers: activeUsers,
      Sessions: sessions,
      Pageviews: pageviews,
      isPaid
    };
  });

  // Print all breakdown
  console.log('📋 COMPLETE SOURCE & MEDIUM RAW BREAKDOWN:');
  console.table(formattedRows);

  // Group summary for Yesterday vs Today (Paid vs Organic/AI/Direct)
  const yesterdayDate = formattedRows.find(r => r.Date.endsWith('11'))?.Date || '2026-10-11';
  const todayDate = formattedRows.find(r => r.Date.endsWith('12'))?.Date || '2026-10-12';

  function summarizeForDate(date) {
    const forDate = formattedRows.filter(r => r.Date === date);
    const nonPaid = forDate.filter(r => !r.isPaid);
    const paid = forDate.filter(r => r.isPaid);
    const ai = forDate.filter(r => r.Category.includes('AI Search'));
    const googleOrganic = forDate.filter(r => r.Category.includes('Organic Google Search'));
    const direct = forDate.filter(r => r.Category.includes('Direct'));

    const sumUsers = (arr) => arr.reduce((acc, c) => acc + c.ActiveUsers, 0);
    const sumSessions = (arr) => arr.reduce((acc, c) => acc + c.Sessions, 0);
    const sumViews = (arr) => arr.reduce((acc, c) => acc + c.Pageviews, 0);

    return {
      date,
      totalActiveUsers: sumUsers(forDate),
      paidUsers: sumUsers(paid),
      nonPaidTotalUsers: sumUsers(nonPaid),
      nonPaidSessions: sumSessions(nonPaid),
      nonPaidPageviews: sumViews(nonPaid),
      aiUsers: sumUsers(ai),
      googleOrganicUsers: sumUsers(googleOrganic),
      directUsers: sumUsers(direct)
    };
  }

  const yesterdaySummary = summarizeForDate(yesterdayDate);
  const todaySummary = summarizeForDate(todayDate);

  console.log('\n====================================================================');
  console.log('🎯 EXECUTIVE SUMMARY: NON-PAID (ORGANIC + AI) TRAFFIC');
  console.log('====================================================================');
  console.table([yesterdaySummary, todaySummary]);
}

runAudit();
