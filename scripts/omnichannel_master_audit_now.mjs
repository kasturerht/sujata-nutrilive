// scripts/omnichannel_master_audit_now.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env
const env = {};
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
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

// 2. Google OAuth Token Generator
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

// 3. Shopify Token Generator
async function getShopifyToken() {
  const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const clientId = env.SHOPIFY_CLIENT_ID;
  const clientSecret = env.SHOPIFY_CLIENT_SECRET;
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
  return oData.access_token;
}

// 4. Amazon Token Generator
async function getAmazonToken() {
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
  return data.access_token;
}

async function runMasterAudit() {
  console.log("================================================================================");
  console.log("🌟 SUJATA NUTRILIVE: 360° OMNICHANNEL REAL-TIME PERFORMANCE AUDIT (03 NOV 2026)");
  console.log("================================================================================\n");

  const results = {};

  // --------------------------------------------------------------------------
  // SECTION 1: GOOGLE ANALYTICS 4 (GA4) TRAFFIC & COMPLETE FUNNEL AUDIT
  // --------------------------------------------------------------------------
  console.log("--- 1. GOOGLE ANALYTICS 4 (GA4) TRAFFIC & FUNNEL AUDIT ---");
  try {
    const gaToken = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
    const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

    const runGa = async (body) => {
      const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await res.json();
    };

    // A. 7-Day Daily Trend (27 Oct to 03 Nov)
    const dailyStats = await runGa({
      dateRanges: [{ startDate: '2026-10-27', endDate: '2026-11-03' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }]
    });

    console.log("A. Daily Trend (Users, Sessions, Pageviews, Bounce Rate):");
    dailyStats.rows?.forEach(r => {
      const d = r.dimensionValues[0].value;
      const formattedDate = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
      const users = r.metricValues[0].value;
      const sessions = r.metricValues[1].value;
      const pvs = r.metricValues[2].value;
      const bounce = (parseFloat(r.metricValues[3].value) * 100).toFixed(1);
      const avgDuration = parseFloat(r.metricValues[4].value).toFixed(1);
      console.log(`   ${formattedDate} | Users: ${users.padStart(3)} | Sessions: ${sessions.padStart(3)} | PageViews: ${pvs.padStart(4)} | Bounce: ${bounce.padStart(5)}% | Avg Time: ${avgDuration}s`);
    });

    // B. Traffic Sources Breakdown (Last 7 Days)
    const sourceStats = await runGa({
      dateRanges: [{ startDate: '2026-10-27', endDate: '2026-11-03' }],
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10
    });
    console.log("\nB. Traffic Sources Breakdown (Last 7 Days):");
    sourceStats.rows?.forEach(r => {
      const src = r.dimensionValues[0].value;
      const sessions = r.metricValues[0].value;
      const users = r.metricValues[1].value;
      const bounce = (parseFloat(r.metricValues[2].value) * 100).toFixed(1);
      const avgDuration = parseFloat(r.metricValues[3].value).toFixed(1);
      console.log(`   ${src.padEnd(30)} | Sessions: ${sessions.padStart(3)} | Users: ${users.padStart(3)} | Bounce: ${bounce}% | Avg: ${avgDuration}s`);
    });

    // C. The Complete Funnel (View Item -> Add To Cart -> Begin Checkout -> Payment -> Purchase)
    const funnelStats = await runGa({
      dateRanges: [{ startDate: '2026-10-27', endDate: '2026-11-03' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }]
    });

    const keyEvents = ['page_view', 'view_item', 'add_to_cart', 'begin_checkout', 'add_payment_info', 'purchase'];
    console.log("\nC. E-Commerce Funnel Metrics (Last 7 Days):");
    const eventMap = {};
    funnelStats.rows?.forEach(r => {
      eventMap[r.dimensionValues[0].value] = {
        count: parseInt(r.metricValues[0].value),
        users: parseInt(r.metricValues[1].value)
      };
    });

    keyEvents.forEach(evt => {
      const data = eventMap[evt] || { count: 0, users: 0 };
      console.log(`   ${evt.padEnd(20)}: ${String(data.users).padStart(4)} Unique Users | ${String(data.count).padStart(5)} Total Events`);
    });

    // D. Device Breakdown
    const deviceStats = await runGa({
      dateRanges: [{ startDate: '2026-10-27', endDate: '2026-11-03' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'bounceRate' }]
    });
    console.log("\nD. Device Category Breakdown:");
    deviceStats.rows?.forEach(r => {
      const dev = r.dimensionValues[0].value;
      const sess = r.metricValues[0].value;
      const users = r.metricValues[1].value;
      const bounce = (parseFloat(r.metricValues[2].value) * 100).toFixed(1);
      console.log(`   ${dev.padEnd(10)}: Sessions: ${sess.padStart(3)} | Users: ${users.padStart(3)} | Bounce: ${bounce}%`);
    });

  } catch (e) {
    console.error("GA4 Error:", e.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 2: GOOGLE SEARCH CONSOLE (GSC) ORGANIC SEARCH METRICS
  // --------------------------------------------------------------------------
  console.log("\n--- 2. GOOGLE SEARCH CONSOLE (GSC) ORGANIC SEARCH METRICS ---");
  try {
    const gscToken = await getGoogleToken([
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly'
    ]);
    const siteUrl = 'https://www.sujatanutrilive.com/';

    // Last 28 Days Aggregate
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const gscRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gscToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 15
      })
    });
    const gscData = await gscRes.json();
    console.log(`A. Overall GSC Top Search Queries (28-day window: ${startDate} to ${endDate}):`);
    let totalClicks = 0;
    let totalImpr = 0;
    (gscData.rows || []).forEach(r => {
      totalClicks += r.clicks;
      totalImpr += r.impressions;
      console.log(`   "${r.keys[0]}": Clicks: ${r.clicks} | Impr: ${r.impressions} | CTR: ${(r.ctr * 100).toFixed(1)}% | Avg Pos: ${r.position.toFixed(1)}`);
    });
    console.log(`   -> Total Sampled Organic Clicks: ${totalClicks} | Total Impressions: ${totalImpr}`);

    // Top Pages
    const pagesRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gscToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 8
      })
    });
    const pagesData = await pagesRes.json();
    console.log("\nB. Top Organic Landing Pages in Google:");
    (pagesData.rows || []).forEach(r => {
      const pagePath = r.keys[0].replace('https://www.sujatanutrilive.com', '');
      console.log(`   ${pagePath.padEnd(45)}: Clicks: ${r.clicks} | Impr: ${r.impressions} | Pos: ${r.position.toFixed(1)}`);
    });

  } catch (e) {
    console.error("GSC Error:", e.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 3: SHOPIFY SALES & ORDERS METRICS
  // --------------------------------------------------------------------------
  console.log("\n--- 3. SHOPIFY E-COMMERCE & ORDER METRICS ---");
  try {
    const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
    const shopifyToken = await getShopifyToken();

    const query = `
      query {
        orders(first: 30, sortKey: CREATED_AT, reverse: true) {
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
                }
              }
              lineItems(first: 3) {
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

    const sRes = await fetch(`https://${shopifyDomain}/admin/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': shopifyToken },
      body: JSON.stringify({ query })
    });
    const sData = await sRes.json();
    const orders = sData.data?.orders?.edges?.map(e => e.node) || [];

    // Filter orders in last 7 days (from Oct 27 onwards)
    const recentOrders = orders.filter(o => new Date(o.createdAt) >= new Date('2026-10-27T00:00:00Z'));
    let recentRevenue = 0;
    let paidCount = 0;
    let pendingCount = 0;
    console.log(`Recent Orders since Oct 27 (Total: ${recentOrders.length}):`);
    recentOrders.forEach(o => {
      const amt = parseFloat(o.totalPriceSet.shopMoney.amount);
      recentRevenue += amt;
      if (o.displayFinancialStatus === 'PAID') paidCount++;
      else pendingCount++;
      const ist = new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      console.log(`   Order ${o.name} | ${ist} | ₹${amt} | ${o.displayFinancialStatus} | Items: ${o.lineItems.edges.map(li => li.node.title).join(', ')}`);
    });
    console.log(`   -> Total 7-Day Revenue: ₹${recentRevenue.toFixed(2)} | Paid: ${paidCount} | COD/Pending: ${pendingCount}`);

  } catch (e) {
    console.error("Shopify Error:", e.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 4: AMAZON (SP-API) PERFORMANCE & ORDERS
  // --------------------------------------------------------------------------
  console.log("\n--- 4. AMAZON INDIA (SP-API) METRICS ---");
  try {
    const amzToken = await getAmazonToken();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const amzUrl = `https://sellingpartnerapi-eu.amazon.com/orders/v0/orders?MarketplaceIds=A21TJRUUN4KGV&CreatedAfter=${encodeURIComponent(sevenDaysAgo)}`;
    const amzRes = await fetch(amzUrl, {
      headers: {
        'x-amz-access-token': amzToken,
        'Content-Type': 'application/json'
      }
    });
    const amzData = await amzRes.json();
    const amzOrders = amzData.payload?.Orders || [];
    console.log(`Amazon Orders in Last 7 Days (Total: ${amzOrders.length}):`);
    let amzTotalRevenue = 0;
    amzOrders.forEach(o => {
      const amt = parseFloat(o.OrderTotal?.Amount || 0);
      amzTotalRevenue += amt;
      const ist = new Date(o.PurchaseDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      console.log(`   Amazon ${o.AmazonOrderId} | ${ist} | Status: ${o.OrderStatus} | ₹${amt} | Items: ${o.NumberOfItemsShipped || o.NumberOfItemsUnshipped}`);
    });
    console.log(`   -> Amazon 7-Day Total Sales: ₹${amzTotalRevenue.toFixed(2)}`);

  } catch (e) {
    console.error("Amazon Error:", e.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 5: GOOGLE MERCHANT CENTER (GMC) LIVE FEED STATUS
  // --------------------------------------------------------------------------
  console.log("\n--- 5. GOOGLE MERCHANT CENTER (GMC) PRODUCT FEED AUDIT ---");
  try {
    const feedRes = await fetch('https://www.sujatanutrilive.com/google-merchant-feed.xml');
    const xml = await feedRes.text();
    const items = xml.split('<item>').slice(1);
    console.log(`GMC Dynamic Feed Status: HTTP ${feedRes.status} | Total Products in Feed: ${items.length}`);
    items.forEach((item, idx) => {
      const title = item.match(/<g:title>([^<]+)<\/g:title>/)?.[1];
      const id = item.match(/<g:id>([^<]+)<\/g:id>/)?.[1];
      const avail = item.match(/<g:availability>([^<]+)<\/g:availability>/)?.[1];
      const price = item.match(/<g:price>([^<]+)<\/g:price>/)?.[1];
      const link = item.match(/<link>([^<]+)<\/link>/)?.[1];
      console.log(`   [${idx + 1}] ID: ${id} | ${title?.slice(0, 45)}... | Price: ${price} | Avail: ${avail}`);
    });
  } catch (e) {
    console.error("GMC Error:", e.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 6: META ADS RECENT PERFORMANCE COMPARISON
  // --------------------------------------------------------------------------
  console.log("\n--- 6. META ADS FUNNEL & PACING (TODAY VS YESTERDAY VS 7-DAY) ---");
  try {
    const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
    const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

    for (const d of ['2026-11-02', '2026-11-03']) {
      const metaUrl = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'${d}','until':'${d}'}&level=campaign&fields=campaign_name,spend,impressions,clicks,cpc,ctr,actions&limit=10`;
      const mRes = await fetch(metaUrl);
      const mData = await mRes.json();
      console.log(`\nDate: ${d}`);
      (mData.data || []).forEach(c => {
        if (c.campaign_name.includes('Hero Video') || c.campaign_name.includes('Website')) {
          console.log(`   Campaign: "${c.campaign_name}"`);
          console.log(`     Spend: ₹${c.spend} | Impr: ${c.impressions} | Clicks: ${c.clicks} | CPC: ₹${c.cpc} | CTR: ${c.ctr}%`);
          const acts = (c.actions || []).filter(a => ['link_click', 'landing_page_view', 'add_to_cart', 'initiate_checkout', 'purchase'].includes(a.action_type));
          console.log(`     Actions: ${acts.map(a => `${a.action_type}: ${a.value}`).join(' | ')}`);
        }
      });
    }
  } catch (e) {
    console.error("Meta Error:", e.message);
  }

  console.log("\n================================================================================");
  console.log("✅ AUDIT DATA COLLECTION COMPLETE");
  console.log("================================================================================");
}

runMasterAudit().catch(console.error);
