// scripts/pull-daily-and-10day-audit.mjs
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

const auditData = {
  generatedAt: new Date().toISOString(),
  targetDateYesterday: '2026-10-20',
  comparisonWindow: '2026-10-10 to 2026-10-20 (Last 10 Days)',
  platforms: {}
};

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
// 1. SHOPIFY
// -------------------------------------------------------------
async function runShopifyAudit() {
  console.log('--- Querying Shopify Admin API ---');
  try {
    const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
    let token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    // Refresh token via OAuth client credentials
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
    }

    // Query orders from 2026-10-10T00:00:00Z to now
    const ordersRes = await fetch(`https://${domain}/admin/api/2024-04/orders.json?status=any&created_at_min=2026-10-10T00:00:00Z&limit=250`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const ordersData = await ordersRes.json();
    const orders = ordersData.orders || [];

    // Query abandoned checkouts from 2026-10-10
    const checkoutsRes = await fetch(`https://${domain}/admin/api/2024-04/checkouts.json?created_at_min=2026-10-10T00:00:00Z&limit=250`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const checkoutsData = await checkoutsRes.json();
    const checkouts = checkoutsData.checkouts || [];

    // Organize day-by-day in IST (UTC + 5:30)
    const dayMap = {};
    for (let d = 10; d <= 20; d++) {
      const dayStr = `2026-10-${String(d).padStart(2, '0')}`;
      dayMap[dayStr] = {
        date: dayStr,
        ordersCount: 0,
        revenue: 0,
        paidOrders: 0,
        pendingOrCod: 0,
        cancelled: 0,
        abandonedCheckouts: 0,
        itemsSold: 0,
        ordersList: []
      };
    }

    orders.forEach(o => {
      // convert created_at to IST date string
      const dateUtc = new Date(o.created_at);
      const istTime = new Date(dateUtc.getTime() + (5.5 * 3600 * 1000));
      const dateKey = istTime.toISOString().split('T')[0];

      if (dayMap[dateKey]) {
        const amount = parseFloat(o.total_price || 0);
        dayMap[dateKey].ordersCount++;
        dayMap[dateKey].revenue += amount;
        if (o.financial_status === 'paid') dayMap[dateKey].paidOrders++;
        else dayMap[dateKey].pendingOrCod++;
        if (o.cancelled_at) dayMap[dateKey].cancelled++;

        let itemCount = 0;
        (o.line_items || []).forEach(item => {
          itemCount += (item.quantity || 1);
        });
        dayMap[dateKey].itemsSold += itemCount;

        dayMap[dateKey].ordersList.push({
          orderNumber: o.name,
          timeIST: istTime.toISOString().replace('T', ' ').slice(0, 19),
          total: o.total_price,
          status: o.financial_status,
          fulfillment: o.fulfillment_status || 'unfulfilled',
          customer: `${o.customer?.first_name || ''} ${o.customer?.last_name || ''}`.trim(),
          city: o.shipping_address?.city || o.billing_address?.city || 'N/A',
          items: o.line_items?.map(li => `${li.title} (${li.quantity})`).join(', ')
        });
      }
    });

    checkouts.forEach(c => {
      const dateUtc = new Date(c.created_at);
      const istTime = new Date(dateUtc.getTime() + (5.5 * 3600 * 1000));
      const dateKey = istTime.toISOString().split('T')[0];
      if (dayMap[dateKey]) {
        dayMap[dateKey].abandonedCheckouts++;
      }
    });

    const yesterdayData = dayMap['2026-10-20'] || { ordersCount: 0, revenue: 0, ordersList: [] };
    const tenDaysArray = Object.values(dayMap);
    const tenDayTotalRevenue = tenDaysArray.reduce((acc, d) => acc + d.revenue, 0);
    const tenDayTotalOrders = tenDaysArray.reduce((acc, d) => acc + d.ordersCount, 0);
    const tenDayTotalCheckouts = tenDaysArray.reduce((acc, d) => acc + d.abandonedCheckouts, 0);

    auditData.platforms.shopify = {
      status: 'Connected (OAuth Client Credentials)',
      domain,
      yesterday: {
        date: '2026-10-20',
        ordersCount: yesterdayData.ordersCount,
        revenue: yesterdayData.revenue,
        paidOrders: yesterdayData.paidOrders,
        pendingOrCod: yesterdayData.pendingOrCod,
        abandonedCheckouts: yesterdayData.abandonedCheckouts,
        itemsSold: yesterdayData.itemsSold,
        orders: yesterdayData.ordersList
      },
      last10Days: {
        totalOrders: tenDayTotalOrders,
        totalRevenue: tenDayTotalRevenue,
        totalAbandonedCheckouts: tenDayTotalCheckouts,
        dailyBreakdown: tenDaysArray
      }
    };
    console.log(`✅ Shopify: Yesterday had ${yesterdayData.ordersCount} orders (₹${yesterdayData.revenue}). 10-day total: ${tenDayTotalOrders} orders (₹${tenDayTotalRevenue}).`);
  } catch (err) {
    console.error('❌ Shopify error:', err);
    auditData.platforms.shopify = { status: 'Error', error: err.message };
  }
}

// -------------------------------------------------------------
// 2. AMAZON (SP-API)
// -------------------------------------------------------------
async function runAmazonAudit() {
  console.log('--- Querying Amazon SP-API ---');
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
    const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
    const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

    // Fetch orders from 2026-10-10
    const createdAfter = '2026-10-10T00:00:00Z';
    const ordersUrl = `${endpoint}/orders/v0/orders?MarketplaceIds=${marketId}&CreatedAfter=${encodeURIComponent(createdAfter)}`;
    const oRes = await fetch(ordersUrl, {
      headers: {
        'x-amz-access-token': spToken,
        'Content-Type': 'application/json'
      }
    });
    const oData = await oRes.json();
    const amazonOrders = oData.payload?.Orders || [];

    const dayMap = {};
    for (let d = 10; d <= 20; d++) {
      const dayStr = `2026-10-${String(d).padStart(2, '0')}`;
      dayMap[dayStr] = {
        date: dayStr,
        ordersCount: 0,
        revenue: 0,
        shippedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        ordersList: []
      };
    }

    amazonOrders.forEach(o => {
      const dateUtc = new Date(o.PurchaseDate);
      const istTime = new Date(dateUtc.getTime() + (5.5 * 3600 * 1000));
      const dateKey = istTime.toISOString().split('T')[0];

      const amount = parseFloat(o.OrderTotal?.Amount || 0);
      if (dayMap[dateKey]) {
        dayMap[dateKey].ordersCount++;
        dayMap[dateKey].revenue += amount;
        if (o.OrderStatus === 'Shipped') dayMap[dateKey].shippedOrders++;
        else if (o.OrderStatus === 'Pending') dayMap[dateKey].pendingOrders++;
        else if (o.OrderStatus === 'Canceled') dayMap[dateKey].cancelledOrders++;

        dayMap[dateKey].ordersList.push({
          orderId: o.AmazonOrderId,
          timeIST: istTime.toISOString().replace('T', ' ').slice(0, 19),
          status: o.OrderStatus,
          fulfillmentChannel: o.FulfillmentChannel,
          total: amount,
          items: (o.NumberOfItemsShipped || 0) + (o.NumberOfItemsUnshipped || 0)
        });
      }
    });

    const yesterdayData = dayMap['2026-10-20'] || { ordersCount: 0, revenue: 0, ordersList: [] };
    const tenDaysArray = Object.values(dayMap);
    const tenDayTotalRevenue = tenDaysArray.reduce((acc, d) => acc + d.revenue, 0);
    const tenDayTotalOrders = tenDaysArray.reduce((acc, d) => acc + d.ordersCount, 0);

    auditData.platforms.amazon = {
      status: 'Connected (Amazon SP-API)',
      yesterday: {
        date: '2026-10-20',
        ordersCount: yesterdayData.ordersCount,
        revenue: yesterdayData.revenue,
        shippedOrders: yesterdayData.shippedOrders,
        pendingOrders: yesterdayData.pendingOrders,
        cancelledOrders: yesterdayData.cancelledOrders,
        orders: yesterdayData.ordersList
      },
      last10Days: {
        totalOrders: tenDayTotalOrders,
        totalRevenue: tenDayTotalRevenue,
        dailyBreakdown: tenDaysArray
      }
    };
    console.log(`✅ Amazon: Yesterday had ${yesterdayData.ordersCount} orders (₹${yesterdayData.revenue}). 10-day total: ${tenDayTotalOrders} orders (₹${tenDayTotalRevenue}).`);
  } catch (err) {
    console.error('❌ Amazon error:', err);
    auditData.platforms.amazon = { status: 'Error', error: err.message };
  }
}

// -------------------------------------------------------------
// 3. META ADS
// -------------------------------------------------------------
async function runMetaAudit() {
  console.log('--- Querying Meta Ads API ---');
  try {
    const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
    const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

    // Day-wise insights from 2026-10-10 to 2026-10-20
    const url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'2026-10-10','until':'2026-10-20'}&time_increment=1&fields=date_start,spend,impressions,clicks,cpc,cpm,ctr,reach,actions,cost_per_action_type&limit=50`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      throw new Error(`Meta API error: ${JSON.stringify(data.error)}`);
    }

    const rows = data.data || [];
    const dailyBreakdown = rows.map(r => {
      const spend = parseFloat(r.spend || 0);
      const imp = parseInt(r.impressions || 0);
      const clicks = parseInt(r.clicks || 0);
      const reach = parseInt(r.reach || 0);
      const ctr = parseFloat(r.ctr || 0);
      const cpc = parseFloat(r.cpc || 0);
      const cpm = parseFloat(r.cpm || 0);

      let whatsappChats = 0;
      let leads = 0;
      let purchases = 0;
      let atc = 0;

      (r.actions || []).forEach(a => {
        if (a.action_type.includes('messaging_conversation_started') || a.action_type.includes('onsite_conversion.messaging_first_reply')) {
          whatsappChats = Math.max(whatsappChats, parseInt(a.value || 0));
        }
        if (a.action_type === 'lead' || a.action_type.includes('lead')) {
          leads += parseInt(a.value || 0);
        }
        if (a.action_type === 'purchase' || a.action_type === 'omni_purchase') {
          purchases += parseInt(a.value || 0);
        }
        if (a.action_type === 'add_to_cart') {
          atc += parseInt(a.value || 0);
        }
      });

      return {
        date: r.date_start,
        spend,
        impressions: imp,
        clicks,
        reach,
        ctr: ctr.toFixed(2) + '%',
        cpc: cpc.toFixed(2),
        cpm: cpm.toFixed(2),
        whatsappChats,
        costPerChat: whatsappChats > 0 ? (spend / whatsappChats).toFixed(2) : 'N/A',
        leads,
        purchases,
        addToCart: atc
      };
    });

    const yesterdayRow = dailyBreakdown.find(r => r.date === '2026-10-20') || {
      date: '2026-10-20',
      spend: 0,
      impressions: 0,
      clicks: 0,
      reach: 0,
      ctr: '0%',
      cpc: '0',
      cpm: '0',
      whatsappChats: 0,
      costPerChat: 'N/A',
      leads: 0,
      purchases: 0,
      addToCart: 0
    };

    const totalSpend = dailyBreakdown.reduce((sum, r) => sum + r.spend, 0);
    const totalClicks = dailyBreakdown.reduce((sum, r) => sum + r.clicks, 0);
    const totalImpressions = dailyBreakdown.reduce((sum, r) => sum + r.impressions, 0);
    const totalChats = dailyBreakdown.reduce((sum, r) => sum + r.whatsappChats, 0);
    const totalPurchases = dailyBreakdown.reduce((sum, r) => sum + r.purchases, 0);

    auditData.platforms.meta = {
      status: 'Connected (Meta Marketing API v21.0)',
      adAccountId,
      yesterday: yesterdayRow,
      last10Days: {
        totalSpend: totalSpend.toFixed(2),
        totalClicks,
        totalImpressions,
        totalWhatsAppChats: totalChats,
        totalPurchases,
        averageCtr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + '%' : '0%',
        averageCpc: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0',
        dailyBreakdown
      }
    };
    console.log(`✅ Meta Ads: Yesterday Spend: ₹${yesterdayRow.spend}, Chats: ${yesterdayRow.whatsappChats}. 10-day Spend: ₹${totalSpend.toFixed(2)}, Chats: ${totalChats}.`);
  } catch (err) {
    console.error('❌ Meta error:', err);
    auditData.platforms.meta = { status: 'Error', error: err.message };
  }
}

// -------------------------------------------------------------
// 4. GA4 (Google Analytics 4)
// -------------------------------------------------------------
async function runGa4Audit() {
  console.log('--- Querying GA4 Analytics API ---');
  try {
    const { token } = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
    const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

    // 1. Day-by-day metrics (2026-10-10 to 2026-10-20)
    const dailyRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-10', endDate: '2026-10-20' }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'engagedSessions' },
          { name: 'bounceRate' }
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      })
    });
    const dailyData = await dailyRes.json();

    const dailyBreakdown = (dailyData.rows || []).map(r => {
      const rawDate = r.dimensionValues[0].value;
      const formattedDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
      return {
        date: formattedDate,
        users: parseInt(r.metricValues[0].value || 0),
        sessions: parseInt(r.metricValues[1].value || 0),
        pageViews: parseInt(r.metricValues[2].value || 0),
        engagedSessions: parseInt(r.metricValues[3].value || 0),
        bounceRate: (parseFloat(r.metricValues[4].value || 0) * 100).toFixed(1) + '%'
      };
    });

    // 2. Yesterday channels & sources (2026-10-20)
    const yesterdayChanRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-20', endDate: '2026-10-20' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'sessionSourceMedium' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ]
      })
    });
    const yesterdayChanData = await yesterdayChanRes.json();
    const yesterdayChannels = (yesterdayChanData.rows || []).map(r => ({
      channel: r.dimensionValues[0].value,
      sourceMedium: r.dimensionValues[1].value,
      users: parseInt(r.metricValues[0].value || 0),
      sessions: parseInt(r.metricValues[1].value || 0),
      pageViews: parseInt(r.metricValues[2].value || 0)
    }));

    // 3. Yesterday top pages
    const yesterdayPagesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-20', endDate: '2026-10-20' }],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' }
        ],
        limit: 10
      })
    });
    const yesterdayPagesData = await yesterdayPagesRes.json();
    const yesterdayPages = (yesterdayPagesData.rows || []).map(r => ({
      pagePath: r.dimensionValues[0].value,
      title: r.dimensionValues[1].value,
      users: parseInt(r.metricValues[0].value || 0),
      views: parseInt(r.metricValues[1].value || 0)
    }));

    const yesterdayObj = dailyBreakdown.find(d => d.date === '2026-10-20') || {
      date: '2026-10-20',
      users: 0,
      sessions: 0,
      pageViews: 0,
      engagedSessions: 0,
      bounceRate: '0%'
    };

    const tenDayUsers = dailyBreakdown.reduce((sum, d) => sum + d.users, 0);
    const tenDaySessions = dailyBreakdown.reduce((sum, d) => sum + d.sessions, 0);
    const tenDayViews = dailyBreakdown.reduce((sum, d) => sum + d.pageViews, 0);

    auditData.platforms.ga4 = {
      status: 'Connected (GA4 Data API v1beta)',
      propertyId,
      yesterday: {
        ...yesterdayObj,
        channels: yesterdayChannels,
        topPages: yesterdayPages
      },
      last10Days: {
        totalActiveUsers: tenDayUsers,
        totalSessions: tenDaySessions,
        totalPageViews: tenDayViews,
        dailyBreakdown
      }
    };
    console.log(`✅ GA4: Yesterday had ${yesterdayObj.users} users, ${yesterdayObj.pageViews} views. 10-day sum: ${tenDayUsers} users, ${tenDayViews} views.`);
  } catch (err) {
    console.error('❌ GA4 error:', err);
    auditData.platforms.ga4 = { status: 'Error', error: err.message };
  }
}

// -------------------------------------------------------------
// 5. GSC (Google Search Console)
// -------------------------------------------------------------
async function runGscAudit() {
  console.log('--- Querying Google Search Console API ---');
  try {
    const { token } = await getGoogleToken(['https://www.googleapis.com/auth/webmasters.readonly']);
    const siteUrl = 'https://www.sujatanutrilive.com/';

    // Check date-by-date search performance (2026-10-01 to 2026-10-20)
    const perfRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-05',
        endDate: '2026-10-20',
        dimensions: ['date']
      })
    });
    const perfData = await perfRes.json();
    const dailyRows = (perfData.rows || []).map(r => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: (r.ctr * 100).toFixed(2) + '%',
      position: r.position.toFixed(1)
    }));

    // Top queries over last 10 days
    const queryRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-10',
        endDate: '2026-10-20',
        dimensions: ['query'],
        rowLimit: 15
      })
    });
    const queryData = await queryRes.json();
    const topQueries = (queryData.rows || []).map(r => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: (r.ctr * 100).toFixed(2) + '%',
      position: r.position.toFixed(1)
    }));

    // Top pages over last 10 days
    const pagesRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-10',
        endDate: '2026-10-20',
        dimensions: ['page'],
        rowLimit: 10
      })
    });
    const pagesData = await pagesRes.json();
    const topPages = (pagesData.rows || []).map(r => ({
      page: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: (r.ctr * 100).toFixed(2) + '%',
      position: r.position.toFixed(1)
    }));

    // Note: Google Search Console typically operates on a 2-3 day processing lag.
    const latestAvailableDate = dailyRows.length > 0 ? dailyRows[dailyRows.length - 1].date : 'N/A';
    const yesterdayRow = dailyRows.find(r => r.date === '2026-10-20') || null;

    auditData.platforms.gsc = {
      status: 'Connected (Google Search Console API v3)',
      siteUrl,
      dataLagNote: 'Google Search Console data has an inherent 48-72h Google pipeline lag.',
      latestAvailableDateInGsc: latestAvailableDate,
      yesterdayRow: yesterdayRow || 'Data still processing in Google GSC pipeline (Expected due to 48h lag)',
      last10Days: {
        dailyBreakdown: dailyRows,
        topQueries,
        topPages
      }
    };
    console.log(`✅ GSC: Latest Date available: ${latestAvailableDate}. Total daily rows: ${dailyRows.length}. Top Queries: ${topQueries.length}.`);
  } catch (err) {
    console.error('❌ GSC error:', err);
    auditData.platforms.gsc = { status: 'Error', error: err.message };
  }
}

// -------------------------------------------------------------
// 6. GOOGLE MERCHANT CENTER
// -------------------------------------------------------------
async function runMerchantAudit() {
  console.log('--- Querying Google Merchant Center & Live Feed ---');
  try {
    const feedUrl = 'https://www.sujatanutrilive.com/google-merchant-feed.xml';
    const res = await fetch(feedUrl);
    const xml = await res.text();

    const items = xml.split('<item>').slice(1);
    const parsedProducts = [];

    items.forEach(item => {
      const id = item.match(/<g:id>([^<]+)<\/g:id>/)?.[1];
      const title = item.match(/<g:title>([^<]+)<\/g:title>/)?.[1];
      const link = item.match(/<g:link>([^<]+)<\/g:link>/)?.[1];
      const price = item.match(/<g:price>([^<]+)<\/g:price>/)?.[1];
      const salePrice = item.match(/<g:sale_price>([^<]+)<\/g:sale_price>/)?.[1];
      const avail = item.match(/<g:availability>([^<]+)<\/g:availability>/)?.[1];
      const gtin = item.match(/<g:gtin>([^<]+)<\/g:gtin>/)?.[1];
      const brand = item.match(/<g:brand>([^<]+)<\/g:brand>/)?.[1];

      if (title) {
        parsedProducts.push({
          id,
          title,
          price: salePrice || price,
          availability: avail,
          gtin: gtin || 'Exempt / Not Assigned',
          brand: brand || 'Sujata Nutrilive',
          link
        });
      }
    });

    const inStockCount = parsedProducts.filter(p => p.availability === 'in_stock').length;
    const outOfStockCount = parsedProducts.filter(p => p.availability === 'out_of_stock').length;

    auditData.platforms.googleMerchant = {
      status: 'Live Feed Monitored (200 OK)',
      feedUrl,
      totalCatalogItems: parsedProducts.length,
      inStockCount,
      outOfStockCount,
      xmlValidation: {
        rssCompliant: xml.includes('<rss xmlns:g="http://base.google.com/ns/1.0"'),
        gtinProvidedCount: parsedProducts.filter(p => p.gtin !== 'Exempt / Not Assigned').length,
        priceTagValid: parsedProducts.every(p => !!p.price)
      },
      products: parsedProducts
    };
    console.log(`✅ Google Merchant Feed: ${parsedProducts.length} items (${inStockCount} In Stock, ${outOfStockCount} Out of Stock).`);
  } catch (err) {
    console.error('❌ Google Merchant Feed error:', err);
    auditData.platforms.googleMerchant = { status: 'Error', error: err.message };
  }
}

async function main() {
  await runShopifyAudit();
  await runAmazonAudit();
  await runMetaAudit();
  await runGa4Audit();
  await runGscAudit();
  await runMerchantAudit();

  const outPath = path.join(__dirname, 'daily_and_10day_performance_audit.json');
  fs.writeFileSync(outPath, JSON.stringify(auditData, null, 2), 'utf8');
  console.log(`\n🎉 Full Multi-Platform Audit Complete! Saved to ${outPath}`);
}

main();
