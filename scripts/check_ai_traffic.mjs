// scripts/check_ai_traffic.mjs
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
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

async function checkAITraffic() {
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');
  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);

  console.log("Checking GA4 for AI Referrals (ChatGPT, Perplexity, Claude, Gemini, Copilot, etc.)...\n");

  const dates = [
    { label: 'Yesterday (2026-10-26)', start: '2026-10-26', end: '2026-10-26' },
    { label: 'Today (2026-10-27)', start: '2026-10-27', end: '2026-10-27' },
    { label: 'Last 7 Days (2026-10-21 to 2026-10-27)', start: '2026-10-21', end: '2026-10-27' }
  ];

  for (const d of dates) {
    console.log(`========================================`);
    console.log(`📊 DATE RANGE: ${d.label}`);
    console.log(`========================================`);

    // 1. Session Source / Medium / PageReferrer
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: d.start, endDate: d.end }],
        dimensions: [
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
          { name: 'pageReferrer' }
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' }
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
      })
    });
    const data = await res.json();

    const aiKeywords = ['chatgpt', 'openai', 'perplexity', 'claude', 'anthropic', 'copilot', 'gemini', 'bard', 'you.com', 'phind', 'meta.ai'];
    const aiRows = [];
    const allRows = data.rows || [];

    allRows.forEach(r => {
      const src = r.dimensionValues[0].value.toLowerCase();
      const med = r.dimensionValues[1].value.toLowerCase();
      const ref = r.dimensionValues[2].value.toLowerCase();

      const isAI = aiKeywords.some(kw => src.includes(kw) || med.includes(kw) || ref.includes(kw));
      if (isAI) {
        aiRows.push({
          source: r.dimensionValues[0].value,
          medium: r.dimensionValues[1].value,
          referrer: r.dimensionValues[2].value,
          users: r.metricValues[0].value,
          sessions: r.metricValues[1].value,
          pageViews: r.metricValues[2].value,
          avgDurationSec: parseFloat(r.metricValues[3].value).toFixed(1)
        });
      }
    });

    console.log(`Total Sources Found: ${allRows.length}`);
    console.log(`AI-Specific Referrals Found: ${aiRows.length}`);

    if (aiRows.length > 0) {
      console.log(`\n🤖 AI Traffic Detected:`);
      aiRows.forEach(r => {
        console.log(` - Source: ${r.source} | Medium: ${r.medium} | Referrer: ${r.referrer}`);
        console.log(`   Users: ${r.users} | Sessions: ${r.sessions} | Pageviews: ${r.pageViews} | Avg Duration: ${r.avgDurationSec}s`);
      });
    } else {
      console.log(`\n❌ No AI referrals detected for this range.`);
    }

    console.log(`\nAll Sources Summary for ${d.label}:`);
    allRows.forEach(r => {
      console.log(` • ${r.dimensionValues[0].value} / ${r.dimensionValues[1].value} (ref: ${r.dimensionValues[2].value.slice(0, 40)}) -> Users: ${r.metricValues[0].value}, Sessions: ${r.metricValues[1].value}`);
    });
    console.log('\n');
  }
}

checkAITraffic().catch(console.error);
