import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const CLIENT_ID = env.AMAZON_LWA_CLIENT_ID;
const CLIENT_SECRET = env.AMAZON_LWA_CLIENT_SECRET;
const REFRESH_TOKEN = env.AMAZON_REFRESH_TOKEN;
const MARKETPLACE_ID = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
const SP_ENDPOINT = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

async function getAccessToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });
  const data = await res.json();
  return data.access_token;
}

async function fetchAllAmazonOrders() {
  const token = await getAccessToken();
  let createdAfter = '2026-10-01T00:00:00Z';
  let allOrders = [];
  let nextToken = null;

  do {
    let url = `${SP_ENDPOINT}/orders/v0/orders?MarketplaceIds=${MARKETPLACE_ID}&CreatedAfter=${encodeURIComponent(createdAfter)}`;
    if (nextToken) {
      url = `${SP_ENDPOINT}/orders/v0/orders?NextToken=${encodeURIComponent(nextToken)}`;
    }
    const res = await fetch(url, {
      headers: {
        'x-amz-access-token': token,
        'User-Agent': 'SujataNutrilive/1.0 (Language=JavaScript)'
      }
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Amazon API Error:', data);
      break;
    }
    const orders = data.payload?.Orders || [];
    allOrders.push(...orders);
    nextToken = data.payload?.NextToken;
  } while (nextToken);

  console.log(`Total Amazon Orders fetched since 01 Oct 2026: ${allOrders.length}`);
  fs.writeFileSync('scripts/amazon_orders_oct_nov.json', JSON.stringify(allOrders, null, 2));

  // Summary by status
  let totalRev = 0;
  let statusCounts = {};
  for (const o of allOrders) {
    statusCounts[o.OrderStatus] = (statusCounts[o.OrderStatus] || 0) + 1;
    if (o.OrderStatus !== 'Canceled') {
      const amt = parseFloat(o.OrderTotal?.Amount || 0);
      totalRev += amt;
    }
  }
  console.log('Status counts:', statusCounts);
  console.log(`Total Amazon Gross Revenue (excluding Canceled): ₹${totalRev.toFixed(2)}`);
}

fetchAllAmazonOrders();
