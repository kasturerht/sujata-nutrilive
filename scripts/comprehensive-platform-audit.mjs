// scripts/comprehensive-platform-audit.mjs
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

const auditResults = {
  timestamp: new Date().toISOString(),
  accessStatus: {},
  gsc: null,
  ga4: null,
  shopify: null,
  merchantCenter: null,
  amazon: null,
  metaAds: null,
  telegram: null,
  bing: null
};

// -------------------------------------------------------------
// HELPER: Google OAuth JWT
// -------------------------------------------------------------
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
  if (!fs.existsSync(keyPath)) throw new Error('Service account key file not found');
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
  if (!data.access_token) throw new Error(JSON.stringify(data));
  return { token: data.access_token, email: key.client_email };
}

// -------------------------------------------------------------
// 1. AUDIT GSC (Google Search Console)
// -------------------------------------------------------------
async function auditGsc() {
  console.log('\n--- 1. Testing Google Search Console (GSC) ---');
  try {
    const { token, email } = await getGoogleToken(['https://www.googleapis.com/auth/webmasters.readonly']);
    auditResults.accessStatus.gsc = { active: true, serviceAccount: email };

    // Fetch site verification & query performance
    const siteUrl = 'https://www.sujatanutrilive.com/';
    const encodedSite = encodeURIComponent(siteUrl);

    // Sitemaps check
    const sitemapsRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sitemapsData = await sitemapsRes.json();

    // Query 28 days performance
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0];

    const perfRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['date']
      })
    });
    const perfData = await perfRes.json();

    // Top queries
    const queriesRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 10
      })
    });
    const queriesData = await queriesRes.json();

    // Top pages
    const pagesRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 10
      })
    });
    const pagesData = await pagesRes.json();

    let totalClicks = 0;
    let totalImpressions = 0;
    (perfData.rows || []).forEach(r => {
      totalClicks += r.clicks;
      totalImpressions += r.impressions;
    });

    auditResults.gsc = {
      connected: true,
      serviceAccount: email,
      siteUrl,
      dateRange: `${startDate} to ${endDate}`,
      totalClicks,
      totalImpressions,
      averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) + '%' : '0%',
      dailyRows: (perfData.rows || []).slice(-7), // last 7 days
      topQueries: queriesData.rows || [],
      topPages: pagesData.rows || [],
      sitemaps: sitemapsData.sitemap || []
    };
    console.log(`✅ GSC: Connected! ${totalClicks} Clicks, ${totalImpressions} Impressions over 28 days.`);
  } catch (err) {
    console.error('❌ GSC Error:', err.message);
    auditResults.accessStatus.gsc = { active: false, error: err.message };
  }
}

// -------------------------------------------------------------
// 2. AUDIT GA4 (Google Analytics 4)
// -------------------------------------------------------------
async function auditGa4() {
  console.log('\n--- 2. Testing Google Analytics 4 (GA4) ---');
  try {
    const { token, email } = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
    const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');
    auditResults.accessStatus.ga4 = { active: true, propertyId, serviceAccount: email };

    // 1. Realtime Active Users
    const realtimeRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metrics: [{ name: 'activeUsers' }]
      })
    });
    const realtimeData = await realtimeRes.json();
    const activeUsersNow = parseInt(realtimeData.rows?.[0]?.metricValues?.[0]?.value || '0');

    // 2. Last 14 days traffic report by sessionDefaultChannelGroup
    const reportRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '14daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'screenPageViews' }
        ]
      })
    });
    const reportData = await reportRes.json();

    // 3. Last 14 days traffic by source / medium
    const sourceRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '14daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionSourceMedium' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        limit: 10
      })
    });
    const sourceData = await sourceRes.json();

    // 4. Daily traffic for last 7 days
    const dailyRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      })
    });
    const dailyData = await dailyRes.json();

    auditResults.ga4 = {
      connected: true,
      propertyId,
      activeUsersRightNow: activeUsersNow,
      channelBreakdown: (reportData.rows || []).map(r => ({
        channel: r.dimensionValues[0].value,
        users: r.metricValues[0].value,
        sessions: r.metricValues[1].value,
        engagedSessions: r.metricValues[2].value,
        pageViews: r.metricValues[3].value
      })),
      topSources: (sourceData.rows || []).map(r => ({
        sourceMedium: r.dimensionValues[0].value,
        users: r.metricValues[0].value,
        sessions: r.metricValues[1].value,
        pageViews: r.metricValues[2].value
      })),
      dailyTrend: (dailyData.rows || []).map(r => ({
        date: r.dimensionValues[0].value,
        users: r.metricValues[0].value,
        sessions: r.metricValues[1].value,
        pageViews: r.metricValues[2].value
      }))
    };
    console.log(`✅ GA4: Connected! Current Active: ${activeUsersNow}, Channels analyzed: ${reportData.rows?.length || 0}`);
  } catch (err) {
    console.error('❌ GA4 Error:', err.message);
    auditResults.accessStatus.ga4 = { active: false, error: err.message };
  }
}

// -------------------------------------------------------------
// 3. AUDIT SHOPIFY ADMIN
// -------------------------------------------------------------
async function auditShopify() {
  console.log('\n--- 3. Testing Shopify Admin API ---');
  try {
    let token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';

    // Verify token
    let testRes = await fetch(`https://${domain}/admin/api/2024-04/shop.json`, {
      headers: { 'X-Shopify-Access-Token': token }
    });

    if (testRes.status === 401) {
      console.log('Shopify token expired, refreshing via OAuth client credentials...');
      const authRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.SHOPIFY_CLIENT_ID,
          client_secret: env.SHOPIFY_CLIENT_SECRET,
          grant_type: 'client_credentials'
        })
      });
      const authData = await authRes.json();
      if (authData.access_token) {
        token = authData.access_token;
        testRes = await fetch(`https://${domain}/admin/api/2024-04/shop.json`, {
          headers: { 'X-Shopify-Access-Token': token }
        });
      }
    }

    const shopData = await testRes.json();
    if (!shopData.shop) throw new Error(JSON.stringify(shopData));

    auditResults.accessStatus.shopify = { active: true, domain, shopName: shopData.shop.name };

    // Fetch Products
    const prodRes = await fetch(`https://${domain}/admin/api/2024-04/products.json?limit=50`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const prodData = await prodRes.json();
    const products = prodData.products || [];

    // Fetch Orders in October 2026
    const octOrdersRes = await fetch(`https://${domain}/admin/api/2024-04/orders.json?status=any&created_at_min=2026-10-01T00:00:00Z&limit=250`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const octOrdersData = await octOrdersRes.json();
    const octOrders = octOrdersData.orders || [];

    // Fetch Abandoned Checkouts in October
    const checkoutsRes = await fetch(`https://${domain}/admin/api/2024-04/checkouts.json?created_at_min=2026-10-01T00:00:00Z&limit=250`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const checkoutsData = await checkoutsRes.json();
    const checkouts = checkoutsData.checkouts || [];

    // Financial calculations
    let totalRevenue = 0;
    let paidOrdersCount = 0;
    let codOrdersCount = 0;

    octOrders.forEach(o => {
      const price = parseFloat(o.total_price || 0);
      totalRevenue += price;
      if (o.financial_status === 'paid') paidOrdersCount++;
      if (o.financial_status === 'pending' || (o.gateway && o.gateway.toLowerCase().includes('cash'))) codOrdersCount++;
    });

    auditResults.shopify = {
      connected: true,
      shop: {
        name: shopData.shop.name,
        email: shopData.shop.email,
        currency: shopData.shop.currency,
        plan: shopData.shop.plan_name
      },
      catalog: {
        totalProducts: products.length,
        items: products.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          variantsCount: p.variants?.length,
          totalInventory: p.variants?.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0)
        }))
      },
      octoberPerformance: {
        totalOrders: octOrders.length,
        totalRevenue: `₹${totalRevenue.toFixed(2)}`,
        paidOrders: paidOrdersCount,
        pendingOrCodOrders: codOrdersCount,
        abandonedCheckoutsCount: checkouts.length,
        recentOrders: octOrders.slice(0, 5).map(o => ({
          name: o.name,
          date: o.created_at,
          total: o.total_price,
          status: o.financial_status,
          customer: `${o.customer?.first_name || ''} ${o.customer?.last_name || ''}`.trim(),
          city: o.shipping_address?.city || 'N/A',
          items: o.line_items?.map(i => `${i.title} (x${i.quantity})`).join(', ')
        }))
      }
    };
    console.log(`✅ Shopify: Connected! ${products.length} Products, ${octOrders.length} Orders in October (Rev: ₹${totalRevenue.toFixed(2)}).`);
  } catch (err) {
    console.error('❌ Shopify Error:', err.message);
    auditResults.accessStatus.shopify = { active: false, error: err.message };
  }
}

// -------------------------------------------------------------
// 4. AUDIT GOOGLE MERCHANT CENTER & FEED
// -------------------------------------------------------------
async function auditMerchantCenter() {
  console.log('\n--- 4. Testing Google Merchant Center & Product Feed ---');
  try {
    // 1. Test live feed endpoint
    const feedUrl = 'https://www.sujatanutrilive.com/google-merchant-feed.xml';
    const feedRes = await fetch(feedUrl);
    const feedXml = await feedRes.text();
    const isXml = feedRes.status === 200 && feedXml.includes('<rss') && feedXml.includes('<channel>');

    const itemCount = (feedXml.match(/<item>/g) || []).length;
    const hasGtin = feedXml.includes('<g:gtin>') || feedXml.includes('<g:identifier_exists>');
    const hasPrice = feedXml.includes('<g:price>');
    const hasAvailability = feedXml.includes('<g:availability>');

    // 2. Try Google Content API for Shopping with Service Account
    let contentApiStatus = 'Not authorized or No Merchant ID configured in Service Account';
    try {
      const { token } = await getGoogleToken(['https://www.googleapis.com/auth/content']);
      // We don't have MERCHANT_ID in .env, but let's test if token works
      contentApiStatus = 'Token acquired for https://www.googleapis.com/auth/content';
    } catch (e) {
      contentApiStatus = `Content API error: ${e.message}`;
    }

    auditResults.accessStatus.merchantCenter = {
      feedActive: isXml,
      feedUrl,
      contentApiStatus
    };

    auditResults.merchantCenter = {
      feedStatus: isXml ? 'Healthy (200 OK)' : `Failed (${feedRes.status})`,
      feedUrl,
      itemCount,
      xmlValidation: {
        hasRssEnvelope: feedXml.includes('<rss xmlns:g="http://base.google.com/ns/1.0"'),
        hasTitle: feedXml.includes('<title>Sujata Nutrilive'),
        hasPrice,
        hasAvailability,
        hasGtin
      },
      feedSizeKb: (Buffer.byteLength(feedXml, 'utf8') / 1024).toFixed(1)
    };
    console.log(`✅ Merchant Feed: Status ${feedRes.status}, ${itemCount} Items loaded.`);
  } catch (err) {
    console.error('❌ Merchant Center Error:', err.message);
    auditResults.accessStatus.merchantCenter = { active: false, error: err.message };
  }
}

// -------------------------------------------------------------
// 5. AUDIT AMAZON SP-API
// -------------------------------------------------------------
async function auditAmazon() {
  console.log('\n--- 5. Testing Amazon Seller Central (SP-API) ---');
  try {
    const tokenRes = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: env.AMAZON_REFRESH_TOKEN,
        client_id: env.AMAZON_LWA_CLIENT_ID,
        client_secret: env.AMAZON_LWA_CLIENT_SECRET
      })
    });
    const tData = await tokenRes.json();
    if (!tData.access_token) throw new Error(`LWA Auth failed: ${JSON.stringify(tData)}`);

    const spToken = tData.access_token;
    const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
    const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
    const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

    auditResults.accessStatus.amazon = {
      active: true,
      sellerId,
      marketplaceId: marketId,
      endpoint
    };

    // 1. Fetch October Orders
    const createdAfter = '2026-10-01T00:00:00Z';
    const ordersUrl = `${endpoint}/orders/v0/orders?MarketplaceIds=${marketId}&CreatedAfter=${encodeURIComponent(createdAfter)}`;
    const oRes = await fetch(ordersUrl, {
      headers: {
        'x-amz-access-token': spToken,
        'Content-Type': 'application/json'
      }
    });
    const oData = await oRes.json();
    const amazonOrders = oData.payload?.Orders || [];

    let amazonTotalRev = 0;
    amazonOrders.forEach(o => {
      amazonTotalRev += parseFloat(o.OrderTotal?.Amount || 0);
    });

    // 2. Fetch Listing Status for Parent & Key Child SKUs
    const skusToCheck = ['SJT-SP-TAB-PARENT', '8X-HQKV-14T7', 'SJT-SP-TAB-120', 'SJT-SP-CAP-60', 'SJT-SBT-CAP-60', 'SJT-COMBO-01'];
    const skuStatuses = [];

    for (const sku of skusToCheck) {
      try {
        const itemUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/${sku}?marketplaceIds=${marketId}&includedData=summaries,issues`;
        const itemRes = await fetch(itemUrl, {
          headers: { 'x-amz-access-token': spToken }
        });
        const itemData = await itemRes.json();
        const summary = itemData.summaries?.[0];
        skuStatuses.push({
          sku,
          status: summary?.status || (itemRes.status === 404 ? 'NOT_FOUND' : `HTTP_${itemRes.status}`),
          asin: summary?.asin || 'N/A',
          itemName: summary?.itemName?.slice(0, 30) || 'N/A',
          issuesCount: itemData.issues?.length || 0
        });
      } catch (e) {
        skuStatuses.push({ sku, error: e.message });
      }
    }

    auditResults.amazon = {
      connected: true,
      sellerId,
      marketplace: 'IN (Amazon.in)',
      octoberOrdersCount: amazonOrders.length,
      octoberRevenue: `₹${amazonTotalRev.toFixed(2)}`,
      orders: amazonOrders.map(o => ({
        id: o.AmazonOrderId,
        date: o.PurchaseDate,
        status: o.OrderStatus,
        total: `₹${o.OrderTotal?.Amount || 0}`,
        items: o.NumberOfItemsShipped + o.NumberOfItemsUnshipped
      })),
      skuHealth: skuStatuses
    };
    console.log(`✅ Amazon: Connected! ${amazonOrders.length} Orders in October (₹${amazonTotalRev.toFixed(2)}), ${skuStatuses.length} SKUs inspected.`);
  } catch (err) {
    console.error('❌ Amazon Error:', err.message);
    auditResults.accessStatus.amazon = { active: false, error: err.message };
  }
}

// -------------------------------------------------------------
// 6. AUDIT META ADS & INSTAGRAM
// -------------------------------------------------------------
async function auditMetaAds() {
  console.log('\n--- 6. Testing Meta Ads & Page API ---');
  try {
    const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
    const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

    // 1. Test account overview
    const accountUrl = `https://graph.facebook.com/v19.0/${adAccountId}?access_token=${metaToken}&fields=name,account_status,currency,balance`;
    const accRes = await fetch(accountUrl);
    const accData = await accRes.json();

    if (!accData.id) throw new Error(JSON.stringify(accData));

    auditResults.accessStatus.metaAds = {
      active: true,
      adAccountId,
      accountName: accData.name,
      currency: accData.currency
    };

    // 2. Fetch October insights (2026-10-01 to 2026-10-14)
    const insightsUrl = `https://graph.facebook.com/v19.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-01','until':'2026-10-14'}&level=campaign&fields=campaign_id,campaign_name,spend,impressions,clicks,cpc,ctr,actions&limit=100`;
    const insRes = await fetch(insightsUrl);
    const insData = await insRes.json();

    let totalSpend = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPurchases = 0;
    let totalAtc = 0;
    let totalChats = 0;

    const campaigns = (insData.data || []).map(c => {
      const spend = parseFloat(c.spend || 0);
      const clicks = parseInt(c.clicks || 0);
      const imp = parseInt(c.impressions || 0);
      let pur = 0, atc = 0, chats = 0;
      (c.actions || []).forEach(a => {
        if (a.action_type === 'purchase' || a.action_type === 'omni_purchase') pur += parseInt(a.value || 0);
        if (a.action_type === 'add_to_cart') atc += parseInt(a.value || 0);
        if (a.action_type.includes('messaging_conversation_started') || a.action_type.includes('onsite_conversion.messaging_first_reply')) chats += parseInt(a.value || 0);
      });

      totalSpend += spend;
      totalClicks += clicks;
      totalImpressions += imp;
      totalPurchases += pur;
      totalAtc += atc;
      totalChats += chats;

      return {
        id: c.campaign_id,
        name: c.campaign_name,
        spend: `₹${spend.toFixed(2)}`,
        clicks,
        impressions: imp,
        cpc: c.cpc,
        ctr: c.ctr,
        purchases: pur,
        addToCart: atc,
        whatsappChats: chats
      };
    });

    auditResults.metaAds = {
      connected: true,
      accountName: accData.name,
      currency: accData.currency,
      octoberTotals: {
        totalSpend: `₹${totalSpend.toFixed(2)}`,
        totalClicks,
        totalImpressions,
        totalPurchases,
        totalAddToCart: totalAtc,
        totalWhatsAppConversations: totalChats,
        overallCpc: totalClicks > 0 ? `₹${(totalSpend / totalClicks).toFixed(2)}` : 'N/A'
      },
      campaigns
    };
    console.log(`✅ Meta Ads: Connected! Spend: ₹${totalSpend.toFixed(2)}, Clicks: ${totalClicks}, Chats: ${totalChats}`);
  } catch (err) {
    console.error('❌ Meta Ads Error:', err.message);
    auditResults.accessStatus.metaAds = { active: false, error: err.message };
  }
}

// -------------------------------------------------------------
// 7. AUDIT TELEGRAM & BING
// -------------------------------------------------------------
async function auditOtherChannels() {
  console.log('\n--- 7. Testing Telegram & Bing Webmaster ---');
  // Telegram
  try {
    if (env.TELEGRAM_BOT_TOKEN) {
      const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getMe`);
      const data = await res.json();
      if (data.ok) {
        auditResults.telegram = {
          connected: true,
          botUsername: data.result.username,
          botName: data.result.first_name
        };
        auditResults.accessStatus.telegram = { active: true, username: data.result.username };
        console.log(`✅ Telegram: Bot @${data.result.username} active!`);
      } else {
        auditResults.accessStatus.telegram = { active: false, error: data.description };
      }
    }
  } catch (e) {
    auditResults.accessStatus.telegram = { active: false, error: e.message };
  }

  // Bing
  if (env.BING_WEBMASTER_API_KEY) {
    auditResults.accessStatus.bing = { configured: true, keyLength: env.BING_WEBMASTER_API_KEY.length };
  }
}

async function run() {
  console.log('========================================================================');
  console.log('🚀 SUJATA NUTRILIVE: 360° LIVE ACCESS AUDIT & PERFORMANCE FORENSIC');
  console.log(`🕒 Timestamp: ${auditResults.timestamp}`);
  console.log('========================================================================');

  await auditGsc();
  await auditGa4();
  await auditShopify();
  await auditMerchantCenter();
  await auditAmazon();
  await auditMetaAds();
  await auditOtherChannels();

  const outPath = path.join(__dirname, 'comprehensive_audit_dump.json');
  fs.writeFileSync(outPath, JSON.stringify(auditResults, null, 2), 'utf8');

  console.log('\n========================================================================');
  console.log(`🎉 AUDIT COMPLETE! Full results saved to: ${outPath}`);
  console.log('========================================================================');
}

run().catch(console.error);
