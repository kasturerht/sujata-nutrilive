// scripts/master_7day_omnichannel_audit.mjs
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

const report = {
  timestamp: new Date().toISOString(),
  dateRange: { start: '2026-10-26', end: '2026-11-01' },
  gsc: null,
  ga4: null,
  shopify: null,
  amazon: null,
  gmc: null,
  seo_aeo: null,
  hurdles: []
};

// --- Google Auth Helper ---
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

// ==========================================
// 1. GOOGLE SEARCH CONSOLE (GSC)
// ==========================================
async function auditGsc() {
  console.log("--> Querying GSC Search Console API...");
  try {
    const token = await getGoogleToken([
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly'
    ]);
    const siteUrl = 'https://www.sujatanutrilive.com/';

    // Day-wise query for last 7-14 days
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-25',
        endDate: '2026-11-01',
        dimensions: ['date'],
        rowLimit: 100
      })
    });
    const data = await res.json();

    // Top queries
    const qRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-25',
        endDate: '2026-11-01',
        dimensions: ['query'],
        rowLimit: 15
      })
    });
    const qData = await qRes.json();

    // Top pages
    const pRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2026-10-25',
        endDate: '2026-11-01',
        dimensions: ['page'],
        rowLimit: 10
      })
    });
    const pData = await pRes.json();

    report.gsc = {
      daily: data.rows || [],
      topQueries: qData.rows || [],
      topPages: pData.rows || []
    };
    console.log(`GSC returned ${data.rows?.length || 0} daily rows.`);
  } catch(e) {
    console.error("GSC Error:", e.message);
    report.gsc = { error: e.message };
  }
}

// ==========================================
// 2. GOOGLE ANALYTICS 4 (GA4)
// ==========================================
async function auditGa4() {
  console.log("--> Querying GA4 Analytics API...");
  try {
    const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
    const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

    // Day-wise traffic
    const dailyRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-26', endDate: '2026-11-01' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        dimensions: [{ name: 'date' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      })
    });
    const dailyData = await dailyRes.json();

    // Source / Medium breakdown
    const srcRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-26', endDate: '2026-11-01' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'sessions' },
          { name: 'bounceRate' }
        ],
        dimensions: [{ name: 'sessionSourceMedium' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 15
      })
    });
    const srcData = await srcRes.json();

    // Top Landing Pages & Bounce Rate (Hurdle analysis)
    const lpRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-26', endDate: '2026-11-01' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        dimensions: [{ name: 'landingPage' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      })
    });
    const lpData = await lpRes.json();

    // Geographic Crowds
    const geoRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-26', endDate: '2026-11-01' }],
        metrics: [{ name: 'totalUsers' }],
        dimensions: [{ name: 'city' }, { name: 'region' }],
        orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
        limit: 10
      })
    });
    const geoData = await geoRes.json();

    report.ga4 = {
      daily: dailyData.rows || [],
      sources: srcData.rows || [],
      landingPages: lpData.rows || [],
      cities: geoData.rows || []
    };
    console.log(`GA4 returned ${dailyData.rows?.length || 0} daily rows.`);
  } catch(e) {
    console.error("GA4 Error:", e.message);
    report.ga4 = { error: e.message };
  }
}

// ==========================================
// 3. SHOPIFY REVENUE & ORDERS
// ==========================================
async function auditShopify() {
  console.log("--> Querying Shopify Admin API...");
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

    // Fetch Orders in last 8 days
    const q = `
      query {
        orders(first: 50, reverse: true) {
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
              paymentGatewayNames
              tags
              channel: publication {
                name
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
              customAttributes {
                key
                value
              }
              shippingAddress {
                city
                province
              }
            }
          }
        }
      }
    `;

    const sRes = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query: q })
    });
    const sData = await sRes.json();
    const orders = sData?.data?.orders?.edges || [];

    // Filter to last 7 days (2026-10-26T00:00:00Z to now)
    const startDate = new Date('2026-10-26T00:00:00+05:30');
    const recentOrders = orders.filter(e => new Date(e.node.createdAt) >= startDate);

    // Fetch Abandoned Checkouts
    const abQuery = `
      query {
        abandonedCheckouts(first: 25, reverse: true) {
          edges {
            node {
              id
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
              shippingAddress {
                name
                city
              }
            }
          }
        }
      }
    `;
    const abRes = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query: abQuery })
    });
    const abData = await abRes.json();
    const recentAbandoned = (abData?.data?.abandonedCheckouts?.edges || []).filter(e => new Date(e.node.createdAt) >= startDate);

    report.shopify = {
      recentOrdersCount: recentOrders.length,
      orders: recentOrders.map(e => e.node),
      abandonedCount: recentAbandoned.length,
      abandoned: recentAbandoned.map(e => e.node)
    };
    console.log(`Shopify returned ${recentOrders.length} orders and ${recentAbandoned.length} abandoned checkouts.`);
  } catch(e) {
    console.error("Shopify Error:", e.message);
    report.shopify = { error: e.message };
  }
}

// ==========================================
// 4. AMAZON SP-API (ORDERS & INVENTORY)
// ==========================================
async function auditAmazon() {
  console.log("--> Querying Amazon SP-API...");
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
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      report.amazon = { error: 'Failed to refresh LWA token', details: tokenData };
      return;
    }
    const token = tokenData.access_token;

    // Last 7 days orders
    const createdAfter = new Date('2026-10-26T00:00:00+05:30').toISOString();
    const ordersUrl = 'https://sellingpartnerapi-eu.amazon.com/orders/v0/orders?MarketplaceIds=A21TJRUUN4KGV&CreatedAfter=' + encodeURIComponent(createdAfter);
    const ordRes = await fetch(ordersUrl, {
      headers: {
        'x-amz-access-token': token,
        'Content-Type': 'application/json'
      }
    });
    const ordData = await ordRes.json();

    report.amazon = {
      orderCount: (ordData.payload?.Orders || []).length,
      orders: ordData.payload?.Orders || []
    };
    console.log(`Amazon returned ${report.amazon.orderCount} orders.`);
  } catch(e) {
    console.error("Amazon Error:", e.message);
    report.amazon = { error: e.message };
  }
}

// ==========================================
// 5. GOOGLE MERCHANT CENTER (FEED AUDIT)
// ==========================================
async function auditGmc() {
  console.log("--> Querying Google Merchant Center XML Feed...");
  try {
    const feedUrl = 'https://www.sujatanutrilive.com/google-merchant-feed.xml';
    const res = await fetch(feedUrl);
    const xml = await res.text();

    const items = xml.split('<item>').slice(1);
    const products = [];
    items.forEach(item => {
      const id = item.match(/<g:id>([^<]+)<\/g:id>/)?.[1];
      const title = item.match(/<g:title>([^<]+)<\/g:title>/)?.[1];
      const price = item.match(/<g:price>([^<]+)<\/g:price>/)?.[1];
      const avail = item.match(/<g:availability>([^<]+)<\/g:availability>/)?.[1];
      if (title) products.push({ id, title, price, avail });
    });

    report.gmc = {
      feedUrl,
      httpStatus: res.status,
      productCount: products.length,
      inStockCount: products.filter(p => p.avail === 'in_stock').length,
      outOfStockCount: products.filter(p => p.avail === 'out_of_stock').length,
      products
    };
    console.log(`GMC Feed has ${products.length} products (In-Stock: ${report.gmc.inStockCount}).`);
  } catch(e) {
    console.error("GMC Error:", e.message);
    report.gmc = { error: e.message };
  }
}

// ==========================================
// 6. SEO & AEO (ANSWER ENGINE OPTIMIZATION)
// ==========================================
async function auditSeoAeo() {
  console.log("--> Querying Live SEO & AEO Schema Structures...");
  try {
    const pdpUrl = 'https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack';
    const res = await fetch(pdpUrl);
    const html = await res.text();

    // Check for schema tags
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
    const schemas = [];
    jsonLdMatches.forEach(m => {
      try {
        const clean = m.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        schemas.push(JSON.parse(clean));
      } catch(e) {}
    });

    // Check meta tags
    const hasCanonical = html.includes('rel="canonical"');
    const hasOgTitle = html.includes('property="og:title"');
    const hasFaq = schemas.some(s => s['@type'] === 'FAQPage' || (Array.isArray(s['@graph']) && s['@graph'].some(g => g['@type'] === 'FAQPage')));
    const hasProductSchema = schemas.some(s => s['@type'] === 'Product' || (Array.isArray(s['@graph']) && s['@graph'].some(g => g['@type'] === 'Product')));

    report.seo_aeo = {
      pdpHttpStatus: res.status,
      schemaCount: schemas.length,
      hasCanonical,
      hasOgTitle,
      hasFaq,
      hasProductSchema,
      schemaTypes: schemas.map(s => s['@type'] || (s['@graph'] ? s['@graph'].map(g => g['@type']) : 'Unknown'))
    };
    console.log(`SEO/AEO: Found ${schemas.length} JSON-LD schemas.`);
  } catch(e) {
    console.error("SEO/AEO Error:", e.message);
    report.seo_aeo = { error: e.message };
  }
}

async function runAll() {
  await auditGsc();
  await auditGa4();
  await auditShopify();
  await auditAmazon();
  await auditGmc();
  await auditSeoAeo();

  fs.writeFileSync('scripts/master_7day_omnichannel_audit_raw.json', JSON.stringify(report, null, 2));
  console.log("\n✅ Master 7-day Omnichannel Audit Saved to scripts/master_7day_omnichannel_audit_raw.json");
}

runAll().catch(console.error);
