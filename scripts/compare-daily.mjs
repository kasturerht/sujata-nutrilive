// scripts/compare-daily.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

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

async function getGoogleToken(scopes) {
  const jwt = createJwt(scopes);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt
  });
  const data = await res.json();
  return data.access_token;
}

async function run() {
  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
  const res = await fetch('https://analyticsdata.googleapis.com/v1beta/properties/513910296:runReport', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-10', endDate: '2026-10-15' }],
      dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }, { name: 'sessionSourceMedium' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'engagedSessions' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [
        { dimension: { dimensionName: 'date' } },
        { metric: { metricName: 'activeUsers' }, desc: true }
      ]
    })
  });
  const data = await res.json();
  
  // Aggregate per day
  const days = {};
  for (const r of (data.rows || [])) {
    const raw = r.dimensionValues[0].value;
    const d = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    const channel = r.dimensionValues[1].value;
    const sm = r.dimensionValues[2].value;
    const users = parseInt(r.metricValues[0].value);
    const sessions = parseInt(r.metricValues[1].value);
    const pageviews = parseInt(r.metricValues[2].value);
    const engaged = parseInt(r.metricValues[3].value);
    const duration = parseFloat(r.metricValues[4].value);

    if (!days[d]) {
      days[d] = {
        totalUsers: 0,
        totalSessions: 0,
        totalPageviews: 0,
        totalEngaged: 0,
        channels: {
          googleOrganic: 0,
          aiSearch: 0,
          direct: 0,
          youtubeOrganic: 0,
          metaWeb: 0,
          other: 0
        },
        sources: []
      };
    }

    const day = days[d];
    day.totalUsers += users;
    day.totalSessions += sessions;
    day.totalPageviews += pageviews;
    day.totalEngaged += engaged;

    if (/google.*organic/i.test(sm) || (channel === 'Organic Search' && /google/i.test(sm))) {
      day.channels.googleOrganic += users;
    } else if (/chatgpt|openai|perplexity|claude|gemini|ai-assistant/i.test(sm) || /ai assistant/i.test(channel)) {
      day.channels.aiSearch += users;
    } else if (/direct/i.test(sm) || channel === 'Direct') {
      day.channels.direct += users;
    } else if (/youtube/i.test(sm)) {
      day.channels.youtubeOrganic += users;
    } else if (/meta|facebook|fb|ig|instagram/i.test(sm)) {
      day.channels.metaWeb += users;
    } else {
      day.channels.other += users;
    }

    day.sources.push({ channel, sm, users, sessions, pageviews, engaged, duration });
  }

  // Load Shopify Orders per day
  const envPath = path.resolve('.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  let shopifyToken = '';
  envContent.split(/\r?\n/).forEach(line => {
    if (line.startsWith('SHOPIFY_ADMIN_ACCESS_TOKEN=')) {
      shopifyToken = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  });

  const ordersRes = await fetch('https://tvczdq-nu.myshopify.com/admin/api/2024-04/orders.json?status=any&limit=250', {
    headers: { 'X-Shopify-Access-Token': shopifyToken }
  });
  const ordersData = await ordersRes.json();
  const rawOrders = ordersData.orders || [];

  const ordersByDay = {};
  rawOrders.forEach(o => {
    const d = new Date(o.created_at);
    // IST
    const ist = new Date(d.getTime() + (5.5 * 60 * 60 * 1000)).toISOString().split('T')[0];
    if (!ordersByDay[ist]) ordersByDay[ist] = [];
    ordersByDay[ist].push({
      name: o.name,
      total: parseFloat(o.total_price),
      gateway: o.gateway || o.payment_gateway_names?.join(', '),
      status: o.financial_status
    });
  });

  console.log('\n========================================================================');
  console.log('📅 DAY-BY-DAY COMPARATIVE AUDIT: 10 OCT TO 15 OCT 2026');
  console.log('========================================================================\n');

  Object.keys(days).sort().forEach(d => {
    const info = days[d];
    const ords = ordersByDay[d] || [];
    const rev = ords.reduce((sum, o) => sum + o.total, 0);
    console.log(`------------------------------------------------------------------------`);
    console.log(`📌 DATE: ${d} ${d === '2026-10-15' ? '👈 [KAAL / YESTERDAY]' : ''}`);
    console.log(`   Traffic: ${info.totalUsers} Users | ${info.totalSessions} Sessions | ${info.totalPageviews} Pageviews | Engaged: ${info.totalEngaged}`);
    console.log(`   Breakdown:`);
    console.log(`     • YouTube Organic:  ${info.channels.youtubeOrganic} users`);
    console.log(`     • Direct Traffic:   ${info.channels.direct} users`);
    console.log(`     • Google Organic:   ${info.channels.googleOrganic} users`);
    console.log(`     • AI Search (GEO):  ${info.channels.aiSearch} users`);
    console.log(`     • Meta Web Clicks:  ${info.channels.metaWeb} users`);
    console.log(`     • Other Referrals:  ${info.channels.other} users`);
    console.log(`   Shopify Storefront:`);
    console.log(`     • Orders: ${ords.length} | Revenue: ₹${rev.toFixed(2)} ${ords.length > 0 ? `(${ords.map(o => `${o.name} ₹${o.total}`).join(', ')})` : '(No new web orders)'}`);
    console.log(`   Top 3 Sources:`);
    info.sources.slice(0, 3).forEach(s => {
      console.log(`     - ${s.sm} (${s.channel}): ${s.users} users, ${s.pageviews} views, avg ${s.duration.toFixed(0)}s`);
    });
  });
}

run().catch(console.error);
