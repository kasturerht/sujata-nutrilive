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
    if (!trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
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

async function checkTodayLive() {
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');
  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
  const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';

  console.log('========================================================================');
  console.log(`⚡ LIVE STATUS FOR TODAY: 24 OCT 2026 (AS OF 06:14 PM IST)`);
  console.log('========================================================================\n');

  // 1. GA4 Today Summary
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
        { name: 'engagedSessions' }
      ]
    })
  });
  const summaryData = await summaryRes.json();
  const m = summaryData.rows?.[0]?.metricValues || [];
  console.log('>>> GA4 Today (24 Oct) Till Now:');
  console.log(`• Active Users Today: ${m[0]?.value || 0}`);
  console.log(`• New Users: ${m[1]?.value || 0}`);
  console.log(`• Sessions: ${m[2]?.value || 0}`);
  console.log(`• Pageviews: ${m[3]?.value || 0}`);
  console.log(`• Engaged Sessions: ${m[4]?.value || 0}\n`);

  // 2. Realtime Active Users (Last 30 mins)
  const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics: [{ name: 'activeUsers' }]
    })
  });
  const rtData = await rtRes.json();
  console.log(`• Realtime Active Users Right Now (Last 30 mins): ${rtData.rows?.[0]?.metricValues?.[0]?.value || 0}\n`);

  // 3. Today Traffic Sources
  const srcRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'sessionSourceMedium' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }]
    })
  });
  const srcData = await srcRes.json();
  console.log('>>> Today Traffic Sources:');
  srcData.rows?.forEach(r => {
    console.log(`• ${r.dimensionValues[0].value} (${r.dimensionValues[1].value}) -> Users: ${r.metricValues[0].value}, Sessions: ${r.metricValues[1].value}`);
  });
  console.log('');

  // 4. Today Shopify Orders
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

  const ordersRes = await fetch(`https://${domain}/admin/api/2024-04/orders.json?status=any&created_at_min=2026-10-24T00:00:00Z&limit=50`, {
    headers: { 'X-Shopify-Access-Token': adminToken }
  });
  const ordersData = await ordersRes.json();
  console.log(`>>> Shopify Orders Today (24 Oct): ${ordersData.orders?.length || 0}`);
}

checkTodayLive().catch(console.error);
