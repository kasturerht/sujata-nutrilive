// scripts/mri_deep_audit_oct28_29.mjs
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

// Service account for Google (GA4 + GSC)
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

const auditResults = {
  timestamp: new Date().toISOString(),
  local_time_ist: '2026-10-29 15:30:00 IST',
  shopify: {},
  meta_ads_website: {},
  ga4: {},
  gsc: {},
  amazon: {},
  youtube_social: {},
  seo_aeo: {}
};

// ==========================================
// 1. SHOPIFY LIVE ORDERS & AUDIT
// ==========================================
async function auditShopify() {
  console.log(">> Auditing Shopify...");
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

    const query = `
      query {
        orders(first: 50, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet { shopMoney { amount } }
              subtotalPriceSet { shopMoney { amount } }
              totalDiscountsSet { shopMoney { amount } }
              paymentGatewayNames
              customer { firstName lastName phone email }
              shippingAddress { city province zip address1 }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    originalUnitPriceSet { shopMoney { amount } }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const res = await fetch(`https://${shopifyDomain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    const orders = (data.data?.orders?.edges || []).map(e => e.node);

    const oct28Orders = orders.filter(o => o.createdAt.startsWith('2026-10-28'));
    const oct29Orders = orders.filter(o => o.createdAt.startsWith('2026-10-29'));

    auditResults.shopify = {
      oct28: {
        count: oct28Orders.length,
        revenue: oct28Orders.reduce((sum, o) => sum + parseFloat(o.totalPriceSet?.shopMoney?.amount || 0), 0),
        orders: oct28Orders
      },
      oct29: {
        count: oct29Orders.length,
        revenue: oct29Orders.reduce((sum, o) => sum + parseFloat(o.totalPriceSet?.shopMoney?.amount || 0), 0),
        orders: oct29Orders
      },
      recent_orders: orders.slice(0, 5)
    };
    console.log(`Shopify: Oct 28 has ${oct28Orders.length} orders (₹${auditResults.shopify.oct28.revenue}), Oct 29 has ${oct29Orders.length} orders (₹${auditResults.shopify.oct29.revenue})`);
  } catch (err) {
    console.error("Shopify Audit Error:", err.message);
    auditResults.shopify.error = err.message;
  }
}

// ==========================================
// 2. META ADS (WEBSITE ONLY)
// ==========================================
async function auditMetaAds() {
  console.log(">> Auditing Meta Ads (Website Sales)...");
  try {
    const metaToken = env.META_ADS_ACCESS_TOKEN;
    const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

    // Fetch day-wise insights for Oct 28 and Oct 29
    const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-28','until':'2026-10-29'}&time_increment=1&fields=date_start,spend,impressions,reach,frequency,clicks,cpc,cpm,ctr,actions,cost_per_action_type,cost_per_unique_click&level=campaign`;
    const res = await fetch(url);
    const data = await res.json();

    // Fetch active AdSet and Ad details
    const adRes = await fetch(`https://graph.facebook.com/v21.0/120249010265760630?access_token=${metaToken}&fields=id,name,status,effective_status,adset{id,name,targeting}`);
    const adData = await adRes.json();

    auditResults.meta_ads_website = {
      insights_by_date: data.data || [],
      ad_status: adData,
      raw_meta_error: data.error || null
    };
    console.log("Meta Ads: Fetched insights for Oct 28-29.");
  } catch (err) {
    console.error("Meta Ads Audit Error:", err.message);
    auditResults.meta_ads_website.error = err.message;
  }
}

// ==========================================
// 3. GA4 TRAFFIC & FUNNEL AUDIT
// ==========================================
async function auditGA4() {
  console.log(">> Auditing GA4 (Funnel & Movements)...");
  try {
    const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
    const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

    // A. Day-wise summary (Oct 28 and Oct 29)
    const reportRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-28', endDate: '2026-10-29' }],
        dimensions: [{ name: 'date' }, { name: 'sessionSourceMedium' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' }
        ]
      })
    });
    const reportData = await reportRes.json();

    // B. MRI Funnel Events (page_view -> scroll -> view_item -> add_to_cart -> begin_checkout -> purchase)
    const funnelRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-28', endDate: '2026-10-29' }],
        dimensions: [{ name: 'date' }, { name: 'eventName' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }]
      })
    });
    const funnelData = await funnelRes.json();

    // C. Top Landing Pages
    const pagesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-28', endDate: '2026-10-29' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      })
    });
    const pagesData = await pagesRes.json();

    // D. Realtime Users (Right Now)
    const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dimensions: [{ name: 'city' }, { name: 'unifiedScreenName' }],
        metrics: [{ name: 'activeUsers' }]
      })
    });
    const rtData = await rtRes.json();

    auditResults.ga4 = {
      sources: reportData.rows || [],
      funnel: funnelData.rows || [],
      top_pages: pagesData.rows || [],
      realtime: rtData.rows || []
    };
    console.log("GA4: Traffic sources, MRI funnel, top pages, and Realtime captured.");
  } catch (err) {
    console.error("GA4 Audit Error:", err.message);
    auditResults.ga4.error = err.message;
  }
}

// ==========================================
// 4. GOOGLE SEARCH CONSOLE (GSC)
// ==========================================
async function auditGSC() {
  console.log(">> Auditing GSC...");
  try {
    const token = await getGoogleToken([
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly'
    ]);
    const siteUrl = 'https://www.sujatanutrilive.com/';

    // GSC data usually has a 2-day lag, query the last 7 days including up to Oct 27/28
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate: '2026-10-20',
        endDate: '2026-10-27',
        dimensions: ['date'],
        rowLimit: 10
      })
    });
    const data = await res.json();

    // Top queries
    const qRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate: '2026-10-01',
        endDate: '2026-10-27',
        dimensions: ['query'],
        rowLimit: 15
      })
    });
    const qData = await qRes.json();

    auditResults.gsc = {
      date_trend: data.rows || [],
      top_queries: qData.rows || []
    };
    console.log("GSC: Captured date trend and top queries.");
  } catch (err) {
    console.error("GSC Audit Error:", err.message);
    auditResults.gsc.error = err.message;
  }
}

// ==========================================
// 5. AMAZON SP-API AUDIT
// ==========================================
async function auditAmazon() {
  console.log(">> Auditing Amazon SP-API...");
  try {
    const res = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: env.AMAZON_REFRESH_TOKEN,
        client_id: env.AMAZON_LWA_CLIENT_ID,
        client_secret: env.AMAZON_LWA_CLIENT_SECRET
      })
    });
    const data = await res.json();
    const token = data.access_token;

    if (!token) throw new Error("Could not get Amazon access token");

    const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';
    const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';

    // Fetch Orders created since Oct 27
    const ordersRes = await fetch(`${endpoint}/orders/v0/orders?MarketplaceIds=${marketId}&CreatedAfter=2026-10-27T00:00:00Z`, {
      headers: {
        'x-amz-access-token': token,
        'Content-Type': 'application/json'
      }
    });
    const ordersData = await ordersRes.json();

    auditResults.amazon = {
      orders_count: ordersData.payload?.Orders?.length || 0,
      orders: ordersData.payload?.Orders || [],
      raw: ordersData
    };
    console.log(`Amazon: Orders since Oct 27 = ${auditResults.amazon.orders_count}`);
  } catch (err) {
    console.error("Amazon Audit Error:", err.message);
    auditResults.amazon.error = err.message;
  }
}

// ==========================================
// 6. YOUTUBE & SOCIAL MEDIA AUDIT
// ==========================================
async function auditSocial() {
  console.log(">> Auditing YouTube & Social Media...");
  try {
    // A. YouTube
    const ytTokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.YOUTUBE_CLIENT_ID,
        client_secret: env.YOUTUBE_CLIENT_SECRET,
        refresh_token: env.YOUTUBE_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });
    const ytTokenData = await ytTokenRes.json();
    const ytToken = ytTokenData.access_token;

    let ytChannels = [];
    let ytComments = [];
    if (ytToken) {
      const chRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
        headers: { Authorization: `Bearer ${ytToken}` }
      });
      const chData = await chRes.json();
      ytChannels = chData.items || [];

      const ctRes = await fetch('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&allThreadsRelatedToChannelId=mine&maxResults=10', {
        headers: { Authorization: `Bearer ${ytToken}` }
      });
      const ctData = await ctRes.json();
      ytComments = ctData.items || [];
    }

    // B. Meta Instagram & Facebook Page
    const pageToken = env.META_PAGE_ACCESS_TOKEN;
    const pageId = env.META_PAGE_ID || '356279144243520';
    const igId = env.META_INSTAGRAM_ACCOUNT_ID || '17841468384194114';

    const pageRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=name,followers_count,fan_count&access_token=${pageToken}`);
    const pageData = await pageRes.json();

    const igRes = await fetch(`https://graph.facebook.com/v21.0/${igId}?fields=username,name,followers_count,media_count&access_token=${pageToken}`);
    const igData = await igRes.json();

    auditResults.youtube_social = {
      youtube: {
        channel: ytChannels[0] || null,
        recent_comments: ytComments.length
      },
      facebook_page: pageData,
      instagram: igData
    };
    console.log("Social Media: YouTube, FB page, and Instagram audit captured.");
  } catch (err) {
    console.error("Social Media Audit Error:", err.message);
    auditResults.youtube_social.error = err.message;
  }
}

// ==========================================
// RUN ALL IN PARALLEL & WRITE OUTPUT
// ==========================================
async function runMasterAudit() {
  console.log("=== STARTING MASTER REAL-TIME DATA AUDIT (OCT 28 & 29, 2026) ===");
  await Promise.all([
    auditShopify(),
    auditMetaAds(),
    auditGA4(),
    auditGSC(),
    auditAmazon(),
    auditSocial()
  ]);

  const outPath = path.resolve('reports', 'mri_audit_raw_oct28_29.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(auditResults, null, 2), 'utf8');
  console.log(`\n>> Master audit finished! Saved to ${outPath}`);
}

runMasterAudit().catch(console.error);
