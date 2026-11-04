// scripts/deep_all_platforms_audit.mjs
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

const TODAY = '2026-10-27';
const report = {
  timestamp: new Date().toISOString(),
  date: TODAY,
  shopify: {},
  ga4: {},
  metaAds: {},
  gsc: {},
  merchant: {},
  diagnostics: []
};

// --- HELPER: Google OAuth Token ---
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

// --- HELPER: Shopify Admin OAuth Token ---
async function getShopifyToken() {
  const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const clientId = env.SHOPIFY_CLIENT_ID;
  const clientSecret = env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return env.SHOPIFY_ADMIN_ACCESS_TOKEN;

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

// ==========================================
// 1. SHOPIFY AUDIT
// ==========================================
async function auditShopify() {
  console.log('--- 1. Auditing Shopify ---');
  const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const token = await getShopifyToken();

  if (!token) {
    report.shopify.error = 'No Shopify token available';
    return;
  }

  try {
    // 1A. Fetch Orders via GraphQL (Recent 25)
    const orderQuery = `
      query {
        orders(first: 25, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
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

    const res = await fetch(`https://${shopifyDomain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query: orderQuery })
    });
    const data = await res.json();

    const orders = (data.data?.orders?.edges || []).map(e => e.node);
    const todayOrders = orders.filter(o => o.createdAt.startsWith(TODAY));

    report.shopify.totalFetched = orders.length;
    report.shopify.todayOrders = todayOrders;
    report.shopify.recentOrders = orders.slice(0, 5);

    // 1B. Fetch Abandoned Checkouts via GraphQL
    const chkQuery = `
      query {
        abandonedCheckouts(first: 20, reverse: true) {
          edges {
            node {
              id
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              shippingAddress {
                name
                phone
                formatted
              }
            }
          }
        }
      }
    `;

    const cRes = await fetch(`https://${shopifyDomain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query: chkQuery })
    });
    const cData = await cRes.json();
    const checkouts = (cData.data?.abandonedCheckouts?.edges || []).map(e => e.node);
    const todayCheckouts = checkouts.filter(c => c.createdAt.startsWith(TODAY));

    report.shopify.todayAbandonedCheckouts = todayCheckouts;
    report.shopify.recentAbandonedCheckouts = checkouts.slice(0, 5);

    // 1C. Check Draft Orders
    const draftQuery = `
      query {
        draftOrders(first: 10, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              status
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
            }
          }
        }
      }
    `;
    const dRes = await fetch(`https://${shopifyDomain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query: draftQuery })
    });
    const dData = await dRes.json();
    report.shopify.draftOrders = (dData.data?.draftOrders?.edges || []).map(e => e.node);

  } catch (err) {
    report.shopify.error = err.message;
  }
}

// ==========================================
// 2. GA4 AUDIT (REALTIME & TODAY CUMULATIVE)
// ==========================================
async function auditGA4() {
  console.log('--- 2. Auditing GA4 ---');
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');
  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);

  if (!token) {
    report.ga4.error = 'Could not obtain Google token for GA4';
    return;
  }

  try {
    // 2A. Realtime Active Users
    const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: [{ name: 'activeUsers' }],
        dimensions: [
          { name: 'unifiedScreenName' },
          { name: 'city' },
          { name: 'deviceCategory' }
        ]
      })
    });
    const rtData = await rtRes.json();
    report.ga4.realtime = {
      activeUsersNow: (rtData.rows || []).reduce((acc, r) => acc + parseInt(r.metricValues[0].value), 0),
      rows: rtData.rows || []
    };

    // 2B. Realtime Events
    const rtEventRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: [{ name: 'eventCount' }],
        dimensions: [{ name: 'eventName' }]
      })
    });
    const rtEventData = await rtEventRes.json();
    report.ga4.realtimeEvents = (rtEventData.rows || []).map(r => ({
      event: r.dimensionValues[0].value,
      count: parseInt(r.metricValues[0].value)
    }));

    // 2C. Today Cumulative Overview (Traffic Sources)
    const todayRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: TODAY, endDate: TODAY }],
        dimensions: [
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
          { name: 'sessionDefaultChannelGroup' }
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' }
        ]
      })
    });
    const todayData = await todayRes.json();
    report.ga4.todayTrafficSources = (todayData.rows || []).map(r => ({
      source: r.dimensionValues[0].value,
      medium: r.dimensionValues[1].value,
      channel: r.dimensionValues[2].value,
      users: parseInt(r.metricValues[0].value),
      sessions: parseInt(r.metricValues[1].value),
      pageViews: parseInt(r.metricValues[2].value),
      avgDurationSec: parseFloat(r.metricValues[3].value).toFixed(1),
      bounceRate: (parseFloat(r.metricValues[4].value) * 100).toFixed(1) + '%'
    }));

    // 2D. Today Pages Viewed
    const pagesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: TODAY, endDate: TODAY }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' }
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
          { name: 'userEngagementDuration' }
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 25
      })
    });
    const pagesData = await pagesRes.json();
    report.ga4.todayPages = (pagesData.rows || []).map(r => ({
      path: r.dimensionValues[0].value,
      title: r.dimensionValues[1].value,
      views: parseInt(r.metricValues[0].value),
      users: parseInt(r.metricValues[1].value),
      engagementSec: parseFloat(r.metricValues[2].value).toFixed(1)
    }));

    // 2E. Today All Events Count
    const eventsRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: TODAY, endDate: TODAY }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }]
      })
    });
    const eventsData = await eventsRes.json();
    report.ga4.todayEvents = (eventsData.rows || []).map(r => ({
      eventName: r.dimensionValues[0].value,
      count: parseInt(r.metricValues[0].value),
      users: parseInt(r.metricValues[1].value)
    }));

  } catch (err) {
    report.ga4.error = err.message;
  }
}

// ==========================================
// 3. META ADS AUDIT (WEBSITE ADS FOCUS)
// ==========================================
async function auditMetaAds() {
  console.log('--- 3. Auditing Meta Ads ---');
  const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

  if (!metaToken) {
    report.metaAds.error = 'No Meta token available';
    return;
  }

  try {
    const fields = [
      'campaign_id', 'campaign_name',
      'adset_id', 'adset_name',
      'ad_id', 'ad_name',
      'spend', 'impressions', 'clicks', 'cpc', 'ctr', 'cpm',
      'reach', 'frequency',
      'actions', 'action_values', 'cost_per_action_type'
    ].join(',');

    const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'${TODAY}','until':'${TODAY}'}&level=ad&fields=${fields}&limit=100`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      report.metaAds.error = data.error;
      return;
    }

    const allAds = data.data || [];
    report.metaAds.allAdsCount = allAds.length;

    // Separate Website ads from WhatsApp ads
    const websiteAds = [];
    const whatsappAds = [];

    allAds.forEach(ad => {
      const actionsMap = {};
      (ad.actions || []).forEach(a => { actionsMap[a.action_type] = parseFloat(a.value); });

      const actionValuesMap = {};
      (ad.action_values || []).forEach(a => { actionValuesMap[a.action_type] = parseFloat(a.value); });

      const costPerActionMap = {};
      (ad.cost_per_action_type || []).forEach(a => { costPerActionMap[a.action_type] = parseFloat(a.value); });

      const parsed = {
        campaignName: ad.campaign_name,
        adsetName: ad.adset_name,
        adName: ad.ad_name,
        spend: parseFloat(ad.spend || 0),
        impressions: parseInt(ad.impressions || 0),
        clicks: parseInt(ad.clicks || 0),
        cpc: parseFloat(ad.cpc || 0),
        ctr: parseFloat(ad.ctr || 0),
        reach: parseInt(ad.reach || 0),
        frequency: parseFloat(ad.frequency || 0),
        linkClicks: actionsMap['link_click'] || 0,
        landingPageViews: actionsMap['landing_page_view'] || 0,
        contentViews: actionsMap['view_content'] || actionsMap['omni_view_content'] || 0,
        addToCart: actionsMap['add_to_cart'] || actionsMap['omni_add_to_cart'] || 0,
        initiateCheckout: actionsMap['initiate_checkout'] || actionsMap['omni_initiated_checkout'] || 0,
        addPaymentInfo: actionsMap['add_payment_info'] || 0,
        purchases: actionsMap['purchase'] || actionsMap['omni_purchase'] || 0,
        purchaseValue: actionValuesMap['purchase'] || actionValuesMap['omni_purchase'] || 0,
        costPerPurchase: costPerActionMap['purchase'] || costPerActionMap['omni_purchase'] || 0,
        whatsAppConversations: actionsMap['onsite_conversion.messaging_conversation_started_7d'] || 0,
        allActions: actionsMap
      };

      // Check if it is a website conversion/traffic ad or WhatsApp ad
      const isWebsite = parsed.campaignName.toLowerCase().includes('asc') || 
                        parsed.campaignName.toLowerCase().includes('website') || 
                        parsed.campaignName.toLowerCase().includes('combo') ||
                        parsed.landingPageViews > 0 ||
                        parsed.contentViews > 0 ||
                        parsed.initiateCheckout > 0;

      if (isWebsite) {
        websiteAds.push(parsed);
      } else {
        whatsappAds.push(parsed);
      }
    });

    report.metaAds.websiteAds = websiteAds;
    report.metaAds.whatsappAds = whatsappAds;

    // Totals for Website Ads
    report.metaAds.websiteTotals = websiteAds.reduce((acc, ad) => ({
      spend: acc.spend + ad.spend,
      impressions: acc.impressions + ad.impressions,
      clicks: acc.clicks + ad.clicks,
      linkClicks: acc.linkClicks + ad.linkClicks,
      landingPageViews: acc.landingPageViews + ad.landingPageViews,
      contentViews: acc.contentViews + ad.contentViews,
      addToCart: acc.addToCart + ad.addToCart,
      initiateCheckout: acc.initiateCheckout + ad.initiateCheckout,
      addPaymentInfo: acc.addPaymentInfo + ad.addPaymentInfo,
      purchases: acc.purchases + ad.purchases,
      purchaseValue: acc.purchaseValue + ad.purchaseValue
    }), { spend: 0, impressions: 0, clicks: 0, linkClicks: 0, landingPageViews: 0, contentViews: 0, addToCart: 0, initiateCheckout: 0, addPaymentInfo: 0, purchases: 0, purchaseValue: 0 });

  } catch (err) {
    report.metaAds.error = err.message;
  }
}

// ==========================================
// 4. GOOGLE SEARCH CONSOLE AUDIT
// ==========================================
async function auditGSC() {
  console.log('--- 4. Auditing GSC ---');
  const token = await getGoogleToken([
    'https://www.googleapis.com/auth/webmasters',
    'https://www.googleapis.com/auth/webmasters.readonly'
  ]);

  if (!token) {
    report.gsc.error = 'Could not obtain token for GSC';
    return;
  }

  const siteUrl = 'https://www.sujatanutrilive.com/';

  try {
    // 4A. Check Sitemaps
    const smRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const smData = await smRes.json();
    report.gsc.sitemaps = smData.sitemap || [];

    // 4B. Query Search Analytics for Recent 7 Days
    const d = new Date();
    const endDate = d.toISOString().split('T')[0];
    const startDate = new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const saRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 20
      })
    });
    const saData = await saRes.json();
    report.gsc.recentQueries = saData.rows || [];

    // Also get top pages
    const pgRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 15
      })
    });
    const pgData = await pgRes.json();
    report.gsc.topOrganicPages = pgData.rows || [];

  } catch (err) {
    report.gsc.error = err.message;
  }
}

// ==========================================
// 5. GOOGLE MERCHANT CENTER FEED AUDIT
// ==========================================
async function auditMerchantFeed() {
  console.log('--- 5. Auditing Google Merchant Feed ---');
  try {
    const feedUrl = 'https://www.sujatanutrilive.com/google-merchant-feed.xml';
    const res = await fetch(feedUrl, { headers: { 'User-Agent': 'Googlebot/2.1' } });
    report.merchant.httpStatus = res.status;
    report.merchant.contentType = res.headers.get('content-type');

    if (res.ok) {
      const xml = await res.text();
      const items = xml.split('<item>').slice(1);
      report.merchant.totalItems = items.length;

      const parsedItems = items.map(item => {
        const id = item.match(/<g:id>([^<]+)<\/g:id>/)?.[1];
        const title = item.match(/<g:title>([^<]+)<\/g:title>/)?.[1];
        const price = item.match(/<g:price>([^<]+)<\/g:price>/)?.[1];
        const salePrice = item.match(/<g:sale_price>([^<]+)<\/g:sale_price>/)?.[1];
        const availability = item.match(/<g:availability>([^<]+)<\/g:availability>/)?.[1];
        const link = item.match(/<link>([^<]+)<\/link>/)?.[1];
        return { id, title, price, salePrice, availability, link };
      });

      report.merchant.sampleItems = parsedItems.slice(0, 10);
      report.merchant.outOfStockCount = parsedItems.filter(i => i.availability !== 'in stock' && i.availability !== 'in_stock').length;
    }
  } catch (err) {
    report.merchant.error = err.message;
  }
}

// ==========================================
// 6. WEBSITE LIVE FLOW & ERROR DIAGNOSTICS
// ==========================================
async function auditDiagnostics() {
  console.log('--- 6. Auditing Website Live Flow & Diagnostics ---');
  const diagnostics = [];

  // Check 6A: Live Homepage
  try {
    const t0 = Date.now();
    const res = await fetch('https://www.sujatanutrilive.com/');
    const time = Date.now() - t0;
    diagnostics.push({
      target: 'Homepage (https://www.sujatanutrilive.com/)',
      status: res.status,
      responseTimeMs: time,
      ok: res.ok
    });
  } catch (e) {
    diagnostics.push({ target: 'Homepage', error: e.message });
  }

  // Check 6B: Ad Target PDP
  const pdpUrl = 'https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack';
  try {
    const t0 = Date.now();
    const res = await fetch(pdpUrl);
    const html = await res.text();
    const time = Date.now() - t0;

    const hasMetaPixel = html.includes('fbq(') || html.includes('1045791637117525') || html.includes(env.PUBLIC_META_PIXEL_ID || '');
    const hasGA4 = html.includes('gtag(') || html.includes('G-') || html.includes('GTM-');
    const hasBuyNow = html.includes('Buy Now') || html.includes('buy-now') || html.includes('gokwik') || html.includes('kwik');
    const hasCart = html.includes('Add to Cart') || html.includes('add-to-cart');

    diagnostics.push({
      target: 'Combo PDP (Target of Meta Ads)',
      status: res.status,
      responseTimeMs: time,
      hasMetaPixel,
      hasGA4,
      hasBuyNow,
      hasCart,
      htmlLength: html.length
    });
  } catch (e) {
    diagnostics.push({ target: 'Combo PDP', error: e.message });
  }

  // Check 6C: Storefront Cart Creation & Checkout generation
  try {
    const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
    const token = env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
    const variantId = 'gid://shopify/ProductVariant/52738357854340'; // Sea Buckthorn combo

    const cartRes = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token
      },
      body: JSON.stringify({
        query: `
          mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
              cart {
                id
                checkoutUrl
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            lines: [{ quantity: 1, merchandiseId: variantId }]
          }
        }
      })
    });

    const cData = await cartRes.json();
    const checkoutUrl = cData?.data?.cartCreate?.cart?.checkoutUrl;
    let checkoutHttpStatus = null;

    if (checkoutUrl) {
      const chkRes = await fetch(checkoutUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' }
      });
      checkoutHttpStatus = chkRes.status;
    }

    diagnostics.push({
      target: 'Shopify Storefront Cart & Checkout Generation',
      cartCreated: !!checkoutUrl,
      checkoutUrlDomain: checkoutUrl ? new URL(checkoutUrl).hostname : null,
      checkoutHttpStatus,
      userErrors: cData?.data?.cartCreate?.userErrors || []
    });
  } catch (e) {
    diagnostics.push({ target: 'Storefront Cart Creation', error: e.message });
  }

  report.diagnostics = diagnostics;
}

// ==========================================
// RUN ALL AUDITS & SAVE
// ==========================================
async function run() {
  await auditShopify();
  await auditGA4();
  await auditMetaAds();
  await auditGSC();
  await auditMerchantFeed();
  await auditDiagnostics();

  const outPath = path.join(__dirname, 'today_deep_audit_result.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n Deep Audit Complete! Result saved to ${outPath}`);
}

run().catch(console.error);
