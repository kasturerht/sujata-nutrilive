// scripts/forensic-orders-and-traffic.mjs
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

async function checkAmazon() {
  console.log('\n================================================================');
  console.log('📦 1. AMAZON SP-API: EXACT RECENT ORDERS & LAST PURCHASE DATE');
  console.log('================================================================');
  try {
    const resToken = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: env.AMAZON_REFRESH_TOKEN,
        client_id: env.AMAZON_CLIENT_ID,
        client_secret: env.AMAZON_CLIENT_SECRET
      })
    });
    const tokenData = await resToken.json();
    const token = tokenData.access_token;

    const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
    const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

    // Query orders from Oct 1st onwards
    const createdAfter = '2026-10-01T00:00:00Z';
    const url = `${endpoint}/orders/v0/orders?MarketplaceIds=${marketId}&CreatedAfter=${encodeURIComponent(createdAfter)}`;
    const oRes = await fetch(url, {
      headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json' }
    });
    const oData = await oRes.json();
    const orders = oData.payload?.Orders || [];

    // Sort by PurchaseDate desc
    orders.sort((a, b) => new Date(b.PurchaseDate) - new Date(a.PurchaseDate));

    console.log(`Total October Orders on Amazon: ${orders.length}`);
    if (orders.length > 0) {
      const latest = orders[0];
      console.log(`\n🚨 MOST RECENT AMAZON ORDER:`);
      console.log(`• Order ID: ${latest.AmazonOrderId}`);
      console.log(`• Purchase Date: ${latest.PurchaseDate} (IST: ${new Date(latest.PurchaseDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })})`);
      console.log(`• Status: ${latest.OrderStatus}`);
      console.log(`• Total: ${latest.OrderTotal?.CurrencyCode} ${latest.OrderTotal?.Amount}`);
      console.log(`• Items: ${latest.NumberOfItemsShipped || latest.NumberOfItemsUnshipped}`);

      console.log('\nAll October Amazon Orders Timeline:');
      orders.forEach((o, i) => {
        const ist = new Date(o.PurchaseDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        console.log(` ${i + 1}. [${ist}] ${o.AmazonOrderId} | Status: ${o.OrderStatus} | ₹${o.OrderTotal?.Amount || 0}`);
      });
    } else {
      console.log('No Amazon orders found in October!');
    }
  } catch (e) {
    console.error('Amazon SP-API Error:', e.message);
  }
}

async function checkShopify() {
  console.log('\n================================================================');
  console.log('🛒 2. SHOPIFY STORE: ORDERS & ABANDONED CHECKOUTS FORENSIC');
  console.log('================================================================');
  try {
    const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
    const adminToken = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    // Fetch all orders from October
    const ordersRes = await fetch(`https://${domain}/admin/api/2024-01/orders.json?status=any&created_at_min=2026-10-01T00:00:00Z&limit=50`, {
      headers: { 'X-Shopify-Access-Token': adminToken, 'Content-Type': 'application/json' }
    });
    const ordersData = await ordersRes.json();
    const orders = ordersData.orders || [];

    console.log(`Total Website Orders in October: ${orders.length}`);
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (orders.length > 0) {
      console.log(`\n🚨 MOST RECENT WEBSITE ORDER:`);
      const latest = orders[0];
      console.log(`• Order #${latest.order_number || latest.name}`);
      console.log(`• Created At: ${latest.created_at} (${new Date(latest.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })})`);
      console.log(`• Total Price: ₹${latest.total_price} (${latest.financial_status})`);
      console.log(`• Customer: ${latest.customer?.first_name} ${latest.customer?.last_name} (${latest.shipping_address?.city})`);
      console.log(`• Source / Referrer: ${latest.referring_site || 'Direct'}`);
      console.log(`• UTMs: ${JSON.stringify(latest.note_attributes || [])}`);
      console.log(`• Items: ${(latest.line_items || []).map(li => li.title).join(', ')}`);

      console.log('\nDaily Website Orders Breakdown (October):');
      const dailyOrders = {};
      orders.forEach(o => {
        const dateStr = o.created_at.slice(0, 10);
        dailyOrders[dateStr] = (dailyOrders[dateStr] || 0) + 1;
      });
      Object.keys(dailyOrders).sort().forEach(d => {
        console.log(`• ${d}: ${dailyOrders[d]} order(s)`);
      });
    }

    // Checkouts In October
    const checkoutsRes = await fetch(`https://${domain}/admin/api/2024-01/checkouts.json?limit=50`, {
      headers: { 'X-Shopify-Access-Token': adminToken, 'Content-Type': 'application/json' }
    });
    const checkoutsData = await checkoutsRes.json();
    const checkouts = checkoutsData.checkouts || [];
    console.log(`\nIncomplete / Abandoned Checkouts in system: ${checkouts.length}`);
    checkouts.slice(0, 5).forEach(c => {
      console.log(`• ${c.created_at} | ₹${c.total_price} | Customer: ${c.email || c.phone || 'Anonymous'}`);
    });
  } catch (e) {
    console.error('Shopify Error:', e.message);
  }
}

async function checkGa4OrganicAndAi() {
  console.log('\n================================================================');
  console.log('🤖 3. GA4: ORGANIC SEARCH & AI ASSISTANT TRAFFIC (OCT 1 - OCT 14)');
  console.log('================================================================');
  try {
    const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
    const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

    // Daily breakdown of Organic Search vs AI vs Direct
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-01', endDate: 'today' }],
        dimensions: [
          { name: 'date' },
          { name: 'sessionDefaultChannelGroup' }
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      })
    });
    const data = await res.json();
    const rows = data.rows || [];

    // Aggregate by date and channel
    const dailyMap = {};
    rows.forEach(r => {
      const d = r.dimensionValues[0].value;
      const ch = r.dimensionValues[1].value;
      const u = parseInt(r.metricValues[0].value);
      const s = parseInt(r.metricValues[1].value);
      if (!dailyMap[d]) dailyMap[d] = {};
      dailyMap[d][ch] = (dailyMap[d][ch] || 0) + u;
    });

    console.log('Daily Users by Channel:');
    Object.keys(dailyMap).sort().forEach(d => {
      const formatted = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
      const chs = dailyMap[d];
      console.log(`• ${formatted}: Organic Search: ${chs['Organic Search'] || 0} | AI/Referral: ${chs['AI Assistant'] || chs['Referral'] || 0} | Direct: ${chs['Direct'] || 0} | Paid Social: ${chs['Paid Social'] || 0}`);
    });

    // AI Assistant (ChatGPT, Perplexity, Claude, Bing) Sources in October
    const aiRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2026-10-01', endDate: 'today' }],
        dimensions: [
          { name: 'sessionSource' },
          { name: 'landingPage' }
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ]
      })
    });
    const aiData = await aiRes.json();
    const aiRows = (aiData.rows || []).filter(r => {
      const src = r.dimensionValues[0].value.toLowerCase();
      return src.includes('chatgpt') || src.includes('openai') || src.includes('perplexity') || src.includes('claude') || src.includes('bing') || src.includes('ai');
    });

    console.log('\nAI Engine Referrals & Landing Pages (Oct 1 - Oct 14):');
    if (aiRows.length > 0) {
      aiRows.forEach(r => {
        console.log(`• Source: ${r.dimensionValues[0].value} | Landing Page: ${r.dimensionValues[1].value} -> Users: ${r.metricValues[0].value}, Pageviews: ${r.metricValues[2].value}`);
      });
    } else {
      console.log('No direct AI referral source matching filter in this view.');
    }

  } catch (e) {
    console.error('GA4 Error:', e.message);
  }
}

async function run() {
  await checkAmazon();
  await checkShopify();
  await checkGa4OrganicAndAi();
}

run();
