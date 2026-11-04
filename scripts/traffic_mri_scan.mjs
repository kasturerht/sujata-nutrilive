// scripts/traffic_mri_scan.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env
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

async function getShopifyToken() {
  const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const clientId = env.SHOPIFY_CLIENT_ID;
  const clientSecret = env.SHOPIFY_CLIENT_SECRET;
  try {
    const oRes = await fetch(`https://${shopifyDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });
    const oData = await oRes.json();
    return oData.access_token || env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  } catch (e) {
    return env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  }
}

async function runMriScan() {
  const results = {};

  // ============================================
  // 1. SHOPIFY ORDERS & CHECKOUTS SINCE OCT 27
  // ============================================
  console.log("--> 1. Fetching Shopify Orders & Abandoned Checkouts since Oct 27...");
  const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const token = await getShopifyToken();

  const orderQuery = `
    query {
      orders(first: 10, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFinancialStatus
            displayFulfillmentStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            customer { firstName lastName phone }
            lineItems(first: 3) {
              edges { node { title quantity } }
            }
          }
        }
      }
      abandonedCheckouts(first: 10, reverse: true) {
        edges {
          node {
            id
            createdAt
            abandonedCheckoutUrl
            totalPriceSet { shopMoney { amount currencyCode } }
            shippingAddress { name phone city province }
          }
        }
      }
    }
  `;

  const sRes = await fetch(`https://${shopifyDomain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query: orderQuery })
  });
  const sData = await sRes.json();
  results.shopify = {
    orders: (sData.data?.orders?.edges || []).map(e => e.node),
    abandonedCheckouts: (sData.data?.abandonedCheckouts?.edges || []).map(e => e.node)
  };

  // ============================================
  // 2. META ADS INSIGHTS (YESTERDAY & TODAY)
  // ============================================
  console.log("--> 2. Fetching Meta Ads Insights for Oct 27 & Oct 28...");
  const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';
  
  const fields = 'campaign_name,ad_name,spend,impressions,clicks,cpc,ctr,actions,action_values';
  
  // Yesterday 2026-10-27
  const urlYesterday = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-27','until':'2026-10-27'}&level=campaign&fields=${fields}&limit=50`;
  const mResY = await fetch(urlYesterday);
  const mDataY = await mResY.json();

  // Today 2026-10-28
  const urlToday = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-28','until':'2026-10-28'}&level=campaign&fields=${fields}&limit=50`;
  const mResT = await fetch(urlToday);
  const mDataT = await mResT.json();

  results.meta = {
    yesterdayCampaigns: mDataY.data || [],
    todayCampaigns: mDataT.data || []
  };

  // ============================================
  // 3. GA4 DEEP MRI SCAN (YESTERDAY & TODAY)
  // ============================================
  console.log("--> 3. Running GA4 Traffic MRI Scan...");
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');
  const gaToken = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);

  // 3A. Hourly breakdown from Oct 27 to Oct 28
  const hourlyRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-27', endDate: '2026-10-28' }],
      dimensions: [
        { name: 'date' },
        { name: 'hour' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [
        { dimension: { dimensionName: 'date' }, desc: false },
        { dimension: { dimensionName: 'hour' }, desc: false }
      ]
    })
  });
  const hourlyData = await hourlyRes.json();
  results.gaHourly = hourlyData.rows || [];

  // 3B. Source / Medium & Engagement
  const sourceRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-27', endDate: '2026-10-28' }],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
        { name: 'sessionCampaignName' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
    })
  });
  const sourceData = await sourceRes.json();
  results.gaSources = sourceData.rows || [];

  // 3C. Pages Performance: Time on Page, Bounce Rate, Exits
  const pageRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-27', endDate: '2026-10-28' }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' }
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'userEngagementDuration' },
        { name: 'bounceRate' }
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
    })
  });
  const pageData = await pageRes.json();
  results.gaPages = pageData.rows || [];

  // 3D. Funnel Events (view_item, add_to_cart, begin_checkout, purchase)
  const funnelRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-27', endDate: '2026-10-28' }],
      dimensions: [
        { name: 'date' },
        { name: 'eventName' }
      ],
      metrics: [
        { name: 'eventCount' },
        { name: 'totalUsers' }
      ],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }]
    })
  });
  const funnelData = await funnelRes.json();
  results.gaFunnelEvents = funnelData.rows || [];

  // 3E. Realtime right now
  const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'unifiedScreenName' }, { name: 'city' }, { name: 'deviceCategory' }]
    })
  });
  const rtData = await rtRes.json();
  results.gaRealtime = rtData.rows || [];

  fs.writeFileSync('scripts/mri_scan_output.json', JSON.stringify(results, null, 2));
  console.log("MRI Scan complete! Results saved to scripts/mri_scan_output.json");
}

runMriScan().catch(console.error);
