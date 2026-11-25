// scripts/seo/reconcile-orders.mjs
// Daily check that GA4 sees the website's orders: Shopify web orders vs GA4 purchase events per day,
// plus whether GA4 purchases carry revenue and a transaction ID. Exit 1 when the 7-day gap > 10%.
// Usage: node scripts/seo/reconcile-orders.mjs [days=7]
import fs from 'node:fs';
import { googleToken, ga4Client, ga4Rows, loadEnv, daysAgo } from './lib/google.mjs';

const days = Number(process.argv[2] || 7);
const env = loadEnv();
const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';

// Shopify Admin token via the app's client-credentials grant (same as the dispatch scripts).
const auth = await (await fetch(`https://${domain}/admin/oauth/access_token`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ client_id: env.SHOPIFY_CLIENT_ID, client_secret: env.SHOPIFY_CLIENT_SECRET, grant_type: 'client_credentials' }),
})).json();
if (!auth.access_token) throw new Error(`Shopify auth failed: ${JSON.stringify(auth).slice(0, 200)}`);

const since = daysAgo(days);
const shopify = await (await fetch(`https://${domain}/admin/api/2024-10/orders.json?status=any&created_at_min=${since}T00:00:00%2B05:30&limit=250&fields=name,created_at,total_price,cancelled_at,source_name`, {
  headers: { 'X-Shopify-Access-Token': auth.access_token },
})).json();
const orders = (shopify.orders || []).filter((o) => !o.cancelled_at);
const shopByDay = {};
for (const o of orders) { const d = new Date(new Date(o.created_at).getTime() + 5.5 * 36e5).toISOString().slice(0, 10); shopByDay[d] = (shopByDay[d] || 0) + 1; }

const token = await googleToken(['https://www.googleapis.com/auth/analytics.readonly']);
const ga = ga4Client(token);
// QA test orders (cancelled in Shopify) are excluded from GA4 totals.
const testTx = new Set(JSON.parse(fs.readFileSync('src/config/test-transactions.json', 'utf8')).transactions.map((t) => t.id));
const gaRows = ga4Rows(await ga({
  dateRanges: [{ startDate: since, endDate: 'today' }], dimensions: [{ name: 'date' }, { name: 'transactionId' }],
  metrics: [{ name: 'ecommercePurchases' }, { name: 'purchaseRevenue' }], limit: 1000,
})).filter((r) => r.m[0] > 0 && !testTx.has(r.d[1]));
const gaTx = gaRows.filter((r) => r.d[1] && r.d[1] !== '(not set)');
const gaByDay = {};
for (const r of gaRows) {
  const d = `${r.d[0].slice(0, 4)}-${r.d[0].slice(4, 6)}-${r.d[0].slice(6)}`;
  gaByDay[d] = { n: (gaByDay[d]?.n || 0) + r.m[0], rev: (gaByDay[d]?.rev || 0) + r.m[1] };
}

let shopTotal = 0, gaTotal = 0, gaRevenue = 0;
console.log('date        shopify  ga4  ga4_revenue');
for (let i = days; i >= 0; i--) {
  const d = daysAgo(i);
  const s = shopByDay[d] || 0, g = gaByDay[d]?.n || 0, rev = gaByDay[d]?.rev || 0;
  shopTotal += s; gaTotal += g; gaRevenue += rev;
  console.log(`${d}  ${String(s).padStart(7)}  ${String(g).padStart(3)}  ${rev.toFixed(0).padStart(11)}`);
}
const shopRevenue = orders.reduce((a, o) => a + Number(o.total_price), 0);
const gap = shopTotal ? Math.abs(gaTotal - shopTotal) / shopTotal : (gaTotal ? 1 : 0);
console.log(`\nTotals: Shopify ${shopTotal} orders (₹${shopRevenue.toFixed(0)}) | GA4 ${gaTotal} purchases (₹${gaRevenue.toFixed(0)}), ${gaTx.length} with a transaction ID | gap ${(gap * 100).toFixed(0)}%`);
if (shopTotal === 0 && gaTotal === 0) { console.log('No orders in the window: nothing to reconcile yet.'); process.exit(0); }
const ok = gap <= 0.1 && gaRevenue > 0 && gaTx.length >= Math.min(gaTotal, shopTotal);
console.log(ok ? 'PASS' : 'FAIL: GA4 does not match Shopify within 10% with revenue and transaction IDs');
process.exit(ok ? 0 : 1);
