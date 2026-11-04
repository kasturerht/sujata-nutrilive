import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('scripts/master_7day_omnichannel_audit_raw.json', 'utf8'));

console.log("==================================================================");
console.log("      7-DAY OMNICHANNEL AUDIT: GSC, GA4, SHOPIFY, AMAZON, GMC     ");
console.log("==================================================================");

console.log("\n--- 1. GOOGLE SEARCH CONSOLE (GSC) ---");
console.log("Daily Performance:");
let totalGscClicks = 0;
let totalGscImp = 0;
(raw.gsc?.daily || []).forEach(r => {
  const date = r.keys[0];
  const clicks = r.clicks;
  const imp = r.impressions;
  const ctr = (r.ctr * 100).toFixed(2);
  const pos = r.position.toFixed(1);
  totalGscClicks += clicks;
  totalGscImp += imp;
  console.log(`  ${date} | Clicks: ${String(clicks).padStart(2)} | Imp: ${String(imp).padStart(4)} | CTR: ${ctr}% | Avg Pos: ${pos}`);
});
console.log(`GSC 7-Day Total: Clicks = ${totalGscClicks}, Imp = ${totalGscImp}`);

console.log("\nTop Search Queries:");
(raw.gsc?.topQueries || []).slice(0, 10).forEach(q => {
  console.log(`  • "${q.keys[0]}" -> Clicks: ${q.clicks}, Imp: ${q.impressions}, Pos: ${q.position.toFixed(1)}`);
});

console.log("\nTop Search Landing Pages:");
(raw.gsc?.topPages || []).slice(0, 5).forEach(p => {
  console.log(`  • ${p.keys[0]} -> Clicks: ${p.clicks}, Imp: ${p.impressions}`);
});

console.log("\n--- 2. GOOGLE ANALYTICS 4 (GA4) ---");
console.log("Daily Traffic & Engagement:");
let totalGa4Users = 0;
let totalGa4Sessions = 0;
let totalGa4Views = 0;
(raw.ga4?.daily || []).forEach(r => {
  const date = r.dimensionValues[0].value;
  const users = parseInt(r.metricValues[0].value);
  const sess = parseInt(r.metricValues[1].value);
  const views = parseInt(r.metricValues[2].value);
  const bounce = (parseFloat(r.metricValues[3].value) * 100).toFixed(1);
  const avgDur = parseFloat(r.metricValues[4].value).toFixed(1);
  totalGa4Users += users;
  totalGa4Sessions += sess;
  totalGa4Views += views;
  console.log(`  ${date} | Users: ${String(users).padStart(3)} | Sessions: ${String(sess).padStart(3)} | PageViews: ${String(views).padStart(4)} | Bounce Rate: ${bounce}% | Avg Duration: ${avgDur}s`);
});
console.log(`GA4 7-Day Total: Users = ${totalGa4Users}, Sessions = ${totalGa4Sessions}, Views = ${totalGa4Views}`);

console.log("\nTop Traffic Channels / Sources (Crowd origin):");
(raw.ga4?.sources || []).forEach(s => {
  const src = s.dimensionValues[0].value;
  const users = s.metricValues[0].value;
  const sess = s.metricValues[1].value;
  const bounce = (parseFloat(s.metricValues[2].value) * 100).toFixed(1);
  console.log(`  • ${src.padEnd(35)} | Sessions: ${String(sess).padStart(3)} | Users: ${String(users).padStart(3)} | Bounce: ${bounce}%`);
});

console.log("\nTop Landing Pages & Drop-off / Bounce Rate (Hurdle Detection):");
(raw.ga4?.landingPages || []).forEach(lp => {
  const page = lp.dimensionValues[0].value;
  const sess = lp.metricValues[0].value;
  const users = lp.metricValues[1].value;
  const bounce = (parseFloat(lp.metricValues[2].value) * 100).toFixed(1);
  const dur = parseFloat(lp.metricValues[3].value).toFixed(1);
  console.log(`  • ${page.padEnd(45)} | Sessions: ${String(sess).padStart(3)} | Bounce: ${bounce}% | Avg Time: ${dur}s`);
});

console.log("\nTop Cities (Where crowd comes from):");
(raw.ga4?.cities || []).slice(0, 10).forEach(c => {
  console.log(`  • ${c.dimensionValues[0].value}, ${c.dimensionValues[1].value}: ${c.metricValues[0].value} users`);
});

console.log("\n--- 3. SHOPIFY ORDERS & REVENUE (OCT 26 - NOV 02) ---");
console.log(`Total Orders in Last 7 Days: ${raw.shopify?.recentOrdersCount}`);
const dailyShopify = {};
let totalShopifyRev = 0;
(raw.shopify?.orders || []).forEach(o => {
  const date = o.createdAt.split('T')[0];
  const amt = parseFloat(o.totalPriceSet.shopMoney.amount);
  totalShopifyRev += amt;
  if (!dailyShopify[date]) dailyShopify[date] = { count: 0, revenue: 0, paid: 0, cod: 0, magic: 0 };
  dailyShopify[date].count++;
  dailyShopify[date].revenue += amt;
  if (o.displayFinancialStatus === 'PAID') dailyShopify[date].paid++;
  else dailyShopify[date].cod++;
  if ((o.tags || []).includes('Magic') || JSON.stringify(o).includes('MagicCheckout')) dailyShopify[date].magic++;
});
Object.keys(dailyShopify).sort().forEach(d => {
  const s = dailyShopify[d];
  console.log(`  ${d} | Orders: ${s.count} (Paid: ${s.paid}, COD: ${s.cod}, Magic: ${s.magic}) | Revenue: ₹${s.revenue.toFixed(2)}`);
});
console.log(`Shopify 7-Day Total Revenue: ₹${totalShopifyRev.toFixed(2)}`);

console.log("\nAbandoned Checkouts (Hurdles in buying):");
console.log(`Total Abandoned Checkouts (7 Days): ${raw.shopify?.abandonedCount}`);
(raw.shopify?.abandoned || []).slice(0, 8).forEach(ab => {
  console.log(`  • ${ab.createdAt} | Amount: ₹${ab.totalPriceSet?.shopMoney?.amount} | Customer: ${ab.shippingAddress?.name || 'Anonymous'} (${ab.shippingAddress?.city || 'No City'})`);
});

console.log("\n--- 4. AMAZON PERFORMANCE (OCT 26 - NOV 02) ---");
console.log(`Total Amazon Orders in Last 7 Days: ${raw.amazon?.orderCount}`);
let amzRev = 0;
const dailyAmz = {};
(raw.amazon?.orders || []).forEach(o => {
  const d = o.PurchaseDate.split('T')[0];
  const amt = parseFloat(o.OrderTotal?.Amount || '0');
  amzRev += amt;
  if (!dailyAmz[d]) dailyAmz[d] = { count: 0, rev: 0 };
  dailyAmz[d].count++;
  dailyAmz[d].rev += amt;
});
Object.keys(dailyAmz).sort().forEach(d => {
  console.log(`  ${d} | Orders: ${dailyAmz[d].count} | Revenue: ₹${dailyAmz[d].rev.toFixed(2)}`);
});
console.log(`Amazon 7-Day Total Revenue: ₹${amzRev.toFixed(2)}`);

console.log("\n--- 5. GOOGLE MERCHANT CENTER & FEED ---");
console.log(`Feed URL: ${raw.gmc?.feedUrl}`);
console.log(`HTTP Status: ${raw.gmc?.httpStatus}`);
console.log(`Total Products in Feed: ${raw.gmc?.productCount}`);
console.log(`In-Stock Products: ${raw.gmc?.inStockCount}`);
console.log(`Out-of-Stock: ${raw.gmc?.outOfStockCount}`);

console.log("\n--- 6. SEO & AEO (ANSWER ENGINE OPTIMIZATION) ---");
console.log(`PDP HTTP Status: ${raw.seo_aeo?.pdpHttpStatus}`);
console.log(`JSON-LD Schemas on Live PDP: ${raw.seo_aeo?.schemaCount}`);
console.log(`Has Canonical: ${raw.seo_aeo?.hasCanonical}`);
console.log(`Has OpenGraph: ${raw.seo_aeo?.hasOgTitle}`);
console.log(`Has Product Schema: ${raw.seo_aeo?.hasProductSchema}`);
console.log(`Has FAQ Schema: ${raw.seo_aeo?.hasFaq}`);
console.log(`Schema Types: ${JSON.stringify(raw.seo_aeo?.schemaTypes)}`);
