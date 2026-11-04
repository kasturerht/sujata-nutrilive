// scripts/today_live_status_audit.mjs
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

const todayStr = '2026-11-02';
console.log(`=== AUDITING TODAY'S LIVE STATUS: ${todayStr} (Current Time: ${new Date().toISOString()}) ===`);

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

const statusReport = {
  timestamp: new Date().toISOString(),
  shopify: null,
  meta: null,
  ga4_today: null,
  ga4_realtime: null,
  amazon: null
};

// ==========================================
// 1. SHOPIFY AUDIT (TODAY'S ORDERS & ABANDONS)
// ==========================================
async function checkShopify() {
  console.log("--> Checking Shopify Today...");
  try {
    const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
    const clientId = env.SHOPIFY_CLIENT_ID;
    const clientSecret = env.SHOPIFY_CLIENT_SECRET;

    const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });
    const oData = await oRes.json();
    const token = oData.access_token;

    // GraphQL for latest orders
    const q = `
      query {
        orders(first: 10, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              displayFinancialStatus
              displayFulfillmentStatus
              tags
              note
              customAttributes {
                key
                value
              }
              lineItems(first: 5) {
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

    const res = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({ query: q })
    });
    const data = await res.json();
    const allRecent = data?.data?.orders?.edges?.map(e => e.node) || [];
    
    // Filter orders created today (after 2026-11-01T18:30:00.000Z which is midnight IST Nov 2)
    const todayCutoff = new Date('2026-11-01T18:30:00.000Z');
    const todayOrders = allRecent.filter(o => new Date(o.createdAt) >= todayCutoff);

    // Also check abandoned checkouts via REST API
    let abandonedToday = [];
    try {
      const cRes = await fetch(`https://${domain}/admin/api/2024-04/checkouts.json?created_at_min=2026-11-01T18:30:00Z&limit=20`, {
        headers: { 'X-Shopify-Access-Token': token }
      });
      const cData = await cRes.json();
      abandonedToday = cData.checkouts || [];
    } catch (e) {
      console.log("REST Checkouts error (may be protected):", e.message);
    }

    statusReport.shopify = {
      todayOrdersCount: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + parseFloat(o.totalPriceSet.shopMoney.amount), 0),
      todayOrders: todayOrders.map(o => ({
        id: o.name,
        createdAt: o.createdAt,
        amount: o.totalPriceSet.shopMoney.amount,
        status: o.displayFinancialStatus,
        tags: o.tags,
        items: o.lineItems.edges.map(li => `${li.node.title} (x${li.node.quantity})`).join(', ')
      })),
      latest5OrdersAcrossAllDays: allRecent.slice(0, 5).map(o => ({
        id: o.name,
        createdAt: o.createdAt,
        amount: o.totalPriceSet.shopMoney.amount,
        status: o.displayFinancialStatus,
        items: o.lineItems.edges.map(li => `${li.node.title} (x${li.node.quantity})`).join(', ')
      })),
      abandonedCount: abandonedToday.length
    };
    console.log(`Shopify: ${todayOrders.length} orders today, Revenue: ₹${statusReport.shopify.todayRevenue}`);
  } catch (err) {
    console.error("Shopify error:", err.message);
    statusReport.shopify = { error: err.message };
  }
}

// ==========================================
// 2. META ADS AUDIT (TODAY'S SPEND & STATS)
// ==========================================
async function checkMeta() {
  console.log("--> Checking Meta Ads Today...");
  try {
    const token = env.META_ADS_ACCESS_TOKEN;
    const adId = '120249010265760630';
    const fields = [
      'spend', 'impressions', 'reach', 'cpm', 'clicks', 'inline_link_clicks',
      'ctr', 'inline_link_click_ctr', 'cpc', 'cost_per_inline_link_click',
      'actions', 'action_values', 'purchase_roas'
    ].join(',');

    const url = `https://graph.facebook.com/v21.0/${adId}/insights?fields=${fields}&date_preset=today&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();

    const d = data.data?.[0];
    if (d) {
      const purchases = d.actions?.find(a => a.action_type === 'purchase')?.value || 0;
      const atc = d.actions?.find(a => a.action_type === 'add_to_cart')?.value || 0;
      const ic = d.actions?.find(a => a.action_type === 'initiate_checkout')?.value || 0;
      const lpv = d.actions?.find(a => a.action_type === 'landing_page_view')?.value || 0;
      statusReport.meta = {
        spend: d.spend,
        impressions: d.impressions,
        reach: d.reach,
        clicks: d.clicks,
        inline_link_clicks: d.inline_link_clicks,
        ctr: d.ctr,
        cpc: d.cpc,
        cost_per_link_click: d.cost_per_inline_link_click,
        landing_page_views: lpv,
        add_to_cart: atc,
        initiate_checkout: ic,
        purchases
      };
    } else {
      statusReport.meta = { note: 'No data returned or zero spend today' };
    }
    console.log(`Meta Today: Spend ₹${statusReport.meta.spend}, Link Clicks: ${statusReport.meta.inline_link_clicks}`);
  } catch (err) {
    console.error("Meta error:", err.message);
    statusReport.meta = { error: err.message };
  }
}

// ==========================================
// 3. GA4 AUDIT (TODAY'S TRAFFIC & REALTIME)
// ==========================================
async function checkGA4() {
  console.log("--> Checking GA4 Today & Realtime...");
  try {
    const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
    const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

    // 1. Today's report
    const todayRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'engagedSessions' },
          { name: 'averageSessionDuration' }
        ]
      })
    });
    const todayData = await todayRes.json();

    // Source breakdown today
    const srcRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'engagedSessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        dimensions: [{ name: 'sessionSourceMedium' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      })
    });
    const srcData = await srcRes.json();

    // Landing Page breakdown today
    const lpRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        dimensions: [{ name: 'landingPage' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      })
    });
    const lpData = await lpRes.json();

    // 2. Realtime report (last 30 minutes active users)
    const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'unifiedScreenName' }]
      })
    });
    const rtData = await rtRes.json();

    statusReport.ga4_today = {
      overall: todayData.rows?.[0]?.metricValues?.map(m => m.value) || [],
      sources: srcData.rows?.map(r => ({
        source: r.dimensionValues[0].value,
        sessions: r.metricValues[0].value,
        users: r.metricValues[1].value,
        engaged: r.metricValues[2].value,
        bounceRate: (parseFloat(r.metricValues[3].value)*100).toFixed(1) + '%',
        avgDuration: parseFloat(r.metricValues[4].value).toFixed(1) + 's'
      })) || [],
      landingPages: lpData.rows?.map(r => ({
        page: r.dimensionValues[0].value,
        sessions: r.metricValues[0].value,
        engaged: r.metricValues[1].value,
        bounceRate: (parseFloat(r.metricValues[2].value)*100).toFixed(1) + '%',
        avgDuration: parseFloat(r.metricValues[3].value).toFixed(1) + 's'
      })) || []
    };
    statusReport.ga4_realtime = {
      activeUsers: rtData.rows?.map(r => ({ page: r.dimensionValues[0].value, users: r.metricValues[0].value })) || [],
      rowCount: rtData.rowCount || 0
    };
    console.log(`GA4 Today overall:`, statusReport.ga4_today.overall);
  } catch (err) {
    console.error("GA4 error:", err.message);
    statusReport.ga4_today = { error: err.message };
  }
}

// ==========================================
// 4. AMAZON SP-API (TODAY'S ORDERS)
// ==========================================
async function checkAmazon() {
  console.log("--> Checking Amazon SP-API Today...");
  try {
    const lwaClientId = env.AMAZON_LWA_CLIENT_ID;
    const lwaClientSecret = env.AMAZON_LWA_CLIENT_SECRET;
    const refreshToken = env.AMAZON_REFRESH_TOKEN;

    if (!lwaClientId || !refreshToken) {
      statusReport.amazon = { note: 'Credentials not configured' };
      return;
    }

    const tokenRes = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: lwaClientId,
        client_secret: lwaClientSecret
      })
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // CreatedAfter = today midnight UTC/IST
    const createdAfter = '2026-11-01T18:30:00Z';
    const marketplaceId = 'A21TJRUUN4KGV';
    const oRes = await fetch(`https://sellingpartnerapi-eu.amazon.com/orders/v0/orders?MarketplaceIds=${marketplaceId}&CreatedAfter=${encodeURIComponent(createdAfter)}`, {
      headers: {
        'x-amz-access-token': accessToken,
        'Content-Type': 'application/json'
      }
    });
    const oData = await oRes.json();
    statusReport.amazon = {
      ordersCount: oData.payload?.Orders?.length || 0,
      orders: oData.payload?.Orders?.map(o => ({
        id: o.AmazonOrderId,
        status: o.OrderStatus,
        amount: o.OrderTotal?.Amount,
        currency: o.OrderTotal?.CurrencyCode,
        purchaseDate: o.PurchaseDate
      })) || []
    };
    console.log(`Amazon today: ${statusReport.amazon.ordersCount} orders.`);
  } catch (err) {
    console.error("Amazon error:", err.message);
    statusReport.amazon = { error: err.message };
  }
}

async function main() {
  await Promise.all([checkShopify(), checkMeta(), checkGA4(), checkAmazon()]);
  fs.writeFileSync(path.join(__dirname, 'today_live_status.json'), JSON.stringify(statusReport, null, 2));
  console.log("--> Audit Complete! Saved to scripts/today_live_status.json");
}

main().catch(console.error);
