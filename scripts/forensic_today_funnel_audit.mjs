import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env
const envPath = path.resolve('.env');
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

// Service account for Google (GA4)
const googleKeyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
const googleKey = JSON.parse(fs.readFileSync(googleKeyPath, 'utf8'));

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
  const assertion = getGoogleJwt(scopes, googleKey);
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
  local_time: '2026-10-29 17:42 IST',
  ga4: {},
  meta: {},
  shopify: {}
};

async function runAudit() {
  console.log("=== 🔬 FORENSIC AUDIT: TODAY'S TRAFFIC & CHECKOUT BOUNCE ANALYSIS ===");

  // ==================== 1. GA4 INTRADAY ====================
  try {
    const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
    const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

    // 1A. Hourly traffic today
    const hourlyRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-29' }],
        dimensions: [{ name: 'hour' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'hour' } }]
      })
    });
    audit.ga4.hourly = await hourlyRes.json();

    // 1B. Sources today
    const sourceRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-29' }],
        dimensions: [{ name: 'sessionSourceMedium' }, { name: 'sessionCampaignName' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ]
      })
    });
    audit.ga4.sources = await sourceRes.json();

    // 1C. Events & Micro-funnel today
    const eventsRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-29' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }]
      })
    });
    audit.ga4.events = await eventsRes.json();

    // 1D. Top Landing Pages today
    const pagesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-29' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'bounceRate' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
      })
    });
    audit.ga4.pages = await pagesRes.json();

    // 1E. Realtime (last 30 minutes)
    const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dimensions: [{ name: 'unifiedScreenName' }, { name: 'city' }],
        metrics: [{ name: 'activeUsers' }]
      })
    });
    audit.ga4.realtime = await rtRes.json();
    console.log("GA4 Audit: Successfully fetched intraday data.");
  } catch (e) {
    console.error("GA4 Audit Error:", e.message);
    audit.ga4.error = e.message;
  }

  // ==================== 2. META ADS TODAY ====================
  try {
    const metaToken = env.META_ADS_ACCESS_TOKEN;
    const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';
    const mUrl = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-29','until':'2026-10-29'}&fields=spend,impressions,reach,clicks,cpc,ctr,actions,cost_per_action_type&level=ad`;
    const mRes = await fetch(mUrl);
    audit.meta = await mRes.json();
    console.log("Meta Ads: Successfully fetched today's ad performance.");
  } catch (e) {
    console.error("Meta Ads Error:", e.message);
    audit.meta.error = e.message;
  }

  // ==================== 3. SHOPIFY ABANDONED CHECKOUTS & ORDERS ====================
  try {
    const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
    const oRes = await fetch(`https://${shopifyDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.SHOPIFY_CLIENT_ID,
        client_secret: env.SHOPIFY_CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });
    const oData = await oRes.json();
    const token = oData.access_token;

    // A. Checkouts / Abandoned Checkouts via REST
    const checkoutsRes = await fetch(`https://${shopifyDomain}/admin/api/2024-01/checkouts.json?limit=50&status=open`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    if (checkoutsRes.ok) {
      audit.shopify.open_checkouts = await checkoutsRes.json();
    } else {
      audit.shopify.open_checkouts_err = await checkoutsRes.text();
    }

    // B. Orders created today
    const ordersQuery = `
      query {
        orders(first: 20, reverse: true, query: "created_at:>='2026-10-29T00:00:00Z'") {
          edges {
            node {
              id
              name
              createdAt
              totalPriceSet { presentmentMoney { amount currencyCode } }
              displayFinancialStatus
              displayFulfillmentStatus
              customer { firstName lastName email phone }
            }
          }
        }
      }
    `;
    const sGqlRes = await fetch(`https://${shopifyDomain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query: ordersQuery })
    });
    audit.shopify.orders_today = await sGqlRes.json();
    console.log("Shopify: Successfully fetched today's checkouts & orders.");
  } catch (e) {
    console.error("Shopify Error:", e.message);
    audit.shopify.error = e.message;
  }

  fs.writeFileSync('reports/today_forensic_funnel_oct29.json', JSON.stringify(audit, null, 2));
  console.log("Audit data saved to reports/today_forensic_funnel_oct29.json");
}

runAudit();
