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

// 2. Google Service Account for GA4
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

async function auditMagicTraffic() {
  console.log("=== 🔬 FORENSIC SCAN: TRAFFIC & CHECKOUT BOUNCE POST-MAGIC CHECKOUT ===");
  console.log("Window: 29 Oct 2026 (15:30 IST) to 30 Oct 2026 (11:46 IST)\n");

  const results = {
    generated_at: new Date().toISOString(),
    ga4_hourly: [],
    ga4_sources: [],
    ga4_pages: [],
    ga4_events: [],
    ga4_realtime: [],
    shopify_orders: [],
    shopify_abandoned: []
  };

  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

  // 1. Hourly Traffic for 29th and 30th
  const hourlyRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-30' }],
      dimensions: [{ name: 'date' }, { name: 'hour' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }, { dimension: { dimensionName: 'hour' } }]
    })
  });
  results.ga4_hourly = (await hourlyRes.json()).rows || [];

  // 2. Traffic Sources for 29th and 30th
  const sourceRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-30' }],
      dimensions: [{ name: 'date' }, { name: 'sessionSourceMedium' }, { name: 'sessionCampaignName' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ]
    })
  });
  results.ga4_sources = (await sourceRes.json()).rows || [];

  // 3. Pages Visited & Time Spent
  const pageRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-30' }],
      dimensions: [{ name: 'date' }, { name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'userEngagementDuration' },
        { name: 'bounceRate' }
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
    })
  });
  results.ga4_pages = (await pageRes.json()).rows || [];

  // 4. Funnel Events (Begin checkout, add to cart, purchase, view item)
  const eventRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-30' }],
      dimensions: [{ name: 'date' }, { name: 'hour' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }, { dimension: { dimensionName: 'hour' } }]
    })
  });
  results.ga4_events = (await eventRes.json()).rows || [];

  // 5. Realtime (Now)
  const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dimensions: [{ name: 'unifiedScreenName' }, { name: 'city' }, { name: 'eventName' }],
      metrics: [{ name: 'activeUsers' }]
    })
  });
  results.ga4_realtime = (await rtRes.json()).rows || [];

  // 6. Shopify Admin (Orders & Checkouts)
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
    const sToken = oData.access_token;

    // Checkouts / Abandoned Checkouts
    const chkRes = await fetch(`https://${shopifyDomain}/admin/api/2024-04/checkouts.json?limit=50&status=any`, {
      headers: { 'X-Shopify-Access-Token': sToken }
    });
    if (chkRes.ok) {
      const cData = await chkRes.json();
      results.shopify_abandoned = cData.checkouts || [];
    }

    // Orders since yesterday
    const ordersQuery = `
      query {
        orders(first: 30, reverse: true, query: "created_at:>='2026-10-29T10:00:00Z'") {
          edges {
            node {
              id
              name
              createdAt
              totalPriceSet { presentmentMoney { amount currencyCode } }
              displayFinancialStatus
              displayFulfillmentStatus
              customer { firstName lastName phone email }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `;
    const sGqlRes = await fetch(`https://${shopifyDomain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': sToken },
      body: JSON.stringify({ query: ordersQuery })
    });
    const sGqlData = await sGqlRes.json();
    results.shopify_orders = sGqlData.data?.orders?.edges || [];
  } catch (err) {
    console.error("Shopify scan error:", err.message);
  }

  fs.writeFileSync('reports/magic_checkout_traffic_audit.json', JSON.stringify(results, null, 2));
  console.log("Scan complete. Saved to reports/magic_checkout_traffic_audit.json");
}

auditMagicTraffic();
