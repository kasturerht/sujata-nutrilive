import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load env
const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const adId = '120249010265760630'; // AD02
const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const clientId = env.SHOPIFY_CLIENT_ID;
const clientSecret = env.SHOPIFY_CLIENT_SECRET;
const ACTIVATION_ISO = '2026-10-29T09:24:35Z'; // Oct 29 14:54:35 IST

// Helper for Google Token
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

async function runAudit() {
  console.log("=== 1. FETCHING EXACT SHOPIFY ORDERS SINCE MAGIC CHECKOUT ACTIVATION ===");
  console.log("Activation timestamp: 2026-10-29 14:54:35 IST (" + ACTIVATION_ISO + ")");
  const sToken = await getShopifyToken();

  const q = `
    query {
      orders(first: 30, reverse: true) {
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
            customer {
              displayName
              phone
              email
            }
            shippingAddress {
              city
              province
            }
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

  const sRes = await fetch(`https://${shopifyDomain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': sToken },
    body: JSON.stringify({ query: q })
  });
  const sData = await sRes.json();
  const allOrders = sData?.data?.orders?.edges || [];

  const postActivationOrders = allOrders.filter(e => {
    return new Date(e.node.createdAt) >= new Date(ACTIVATION_ISO);
  });

  console.log(`Found ${postActivationOrders.length} orders created AFTER activation:`);
  let totalOrderRevenue = 0;
  postActivationOrders.forEach(e => {
    const o = e.node;
    const amount = parseFloat(o.totalPriceSet.shopMoney.amount);
    totalOrderRevenue += amount;
    const items = o.lineItems.edges.map(li => `${li.node.title} (x${li.node.quantity})`).join(', ');
    const gateways = (o.paymentGatewayNames || []).join(', ') || 'N/A';
    const city = o.shippingAddress?.city || 'N/A';
    const state = o.shippingAddress?.province || 'N/A';
    const utm = (o.customAttributes || []).find(a => a.key === 'utm_source' || a.key === 'utm_campaign')?.value || 'N/A';
    console.log(`• Order ${o.name} | ${o.createdAt} | ₹${amount} | Financial: ${o.displayFinancialStatus} | Gateways: ${gateways} | Location: ${city}, ${state} | UTM: ${utm} | Items: ${items}`);
  });
  console.log(`Total Shopify Revenue since activation: ₹${totalOrderRevenue.toFixed(2)}`);

  console.log("\n=== 2. FETCHING GA4 WEBSITE SESSIONS & TRAFFIC SOURCES (OCT 29 - 31) ===");
  try {
    const gaToken = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
    const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

    const gaRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-31' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' }
        ],
        dimensions: [
          { name: 'sessionSourceMedium' },
          { name: 'date' }
        ]
      })
    });
    const gaData = await gaRes.json();
    console.log("GA4 Traffic Report (Rows):", (gaData.rows || []).length);
    let totalSessions = 0;
    let totalUsers = 0;
    (gaData.rows || []).forEach(r => {
      const src = r.dimensionValues[0].value;
      const date = r.dimensionValues[1].value;
      const sess = parseInt(r.metricValues[0].value);
      const usr = parseInt(r.metricValues[1].value);
      totalSessions += sess;
      totalUsers += usr;
      console.log(`Date: ${date} | Source/Medium: ${src} | Sessions: ${sess} | Users: ${usr}`);
    });
    console.log(`GA4 Summary (Oct 29-31): Total Sessions = ${totalSessions}, Total Users = ${totalUsers}`);

    // Fetch City breakdown
    const cityRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${gaToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-31' }],
        metrics: [{ name: 'totalUsers' }],
        dimensions: [{ name: 'city' }, { name: 'region' }],
        orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
        limit: 10
      })
    });
    const cityData = await cityRes.json();
    console.log("\nTop Visitor Cities (Oct 29-31):");
    (cityData.rows || []).forEach(r => {
      console.log(`- ${r.dimensionValues[0].value}, ${r.dimensionValues[1].value}: ${r.metricValues[0].value} users`);
    });

  } catch(e) {
    console.error("GA4 fetch error:", e.message);
  }

  console.log("\n=== 3. META ADS INSIGHTS FOR OCT 29, 30, 31 (SINCE ACTIVATION WINDOW) ===");
  const fields = 'spend,impressions,reach,inline_link_clicks,cost_per_inline_link_click,actions,action_values,quality_ranking,engagement_rate_ranking,conversion_rate_ranking';
  const metaUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=${fields}&time_range=${encodeURIComponent(JSON.stringify({ since: '2026-10-29', until: '2026-10-31' }))}&access_token=${adsToken}`;
  const mRes = await fetch(metaUrl);
  const mData = await mRes.json();
  const mInsight = mData.data ? mData.data[0] : null;

  if (mInsight) {
    console.log(`Meta Spend (Oct 29-31): ₹${parseFloat(mInsight.spend || '0').toFixed(2)}`);
    console.log(`Impressions: ${mInsight.impressions}`);
    console.log(`Reach: ${mInsight.reach}`);
    console.log(`Link Clicks: ${mInsight.inline_link_clicks}`);
    console.log(`Quality Ranking: ${mInsight.quality_ranking}`);
    console.log(`Engagement Rate Ranking: ${mInsight.engagement_rate_ranking}`);
    console.log(`Conversion Rate Ranking: ${mInsight.conversion_rate_ranking}`);
    console.log("Actions (Oct 29-31):");
    (mInsight.actions || []).forEach(a => {
      console.log(`  - ${a.action_type}: ${a.value}`);
    });
    console.log("Action Values (Oct 29-31):");
    (mInsight.action_values || []).forEach(v => {
      console.log(`  - ${v.action_type}: ₹${v.value}`);
    });
  }

  // Also check day-by-day
  const dailyUrl = `https://graph.facebook.com/v21.0/${adId}/insights?fields=${fields}&time_increment=1&time_range=${encodeURIComponent(JSON.stringify({ since: '2026-10-29', until: '2026-10-31' }))}&access_token=${adsToken}`;
  const dRes = await fetch(dailyUrl);
  const dData = await dRes.json();
  console.log("\nDay-by-Day Meta Insights (Oct 29 - 31):");
  (dData.data || []).forEach(d => {
    const lpv = (d.actions || []).find(a => a.action_type === 'landing_page_view')?.value || 0;
    const ic = (d.actions || []).find(a => a.action_type === 'initiate_checkout')?.value || 0;
    const pur = (d.actions || []).find(a => a.action_type === 'purchase')?.value || 0;
    const purVal = (d.action_values || []).find(a => a.action_type === 'purchase')?.value || 0;
    console.log(`${d.date_start}: Spend: ₹${parseFloat(d.spend).toFixed(2)} | Clicks: ${d.inline_link_clicks} | LPV: ${lpv} | Checkouts: ${ic} | Purchases: ${pur} (₹${purVal}) | Conversion Ranking: ${d.conversion_rate_ranking || 'N/A'}`);
  });
}

runAudit().catch(console.error);
