import fs from 'fs';

const data = JSON.parse(fs.readFileSync('reports/magic_checkout_traffic_audit.json', 'utf8'));

console.log("======================================================================");
console.log("🔬 MRI ANALYSIS: WEBSITE TRAFFIC SINCE MAGIC CHECKOUT ACTIVATION");
console.log("Timeline: 29 Oct 2026, 15:30 IST -> 30 Oct 2026, 11:46 IST (Current)");
console.log("======================================================================\n");

// 1. FILTER HOURLY POST 15:30 IST (10:00 UTC on 2026-10-29 onwards)
const hourlyRows = data.ga4_hourly || [];
let postMagicUsers = 0;
let postMagicSessions = 0;
let postMagicPV = 0;

console.log("1. ⏰ HOURLY TRAFFIC BREAKDOWN (SINCE MAGIC CHECKOUT):");
console.log("Date       | UTC Hour | Approx IST Time | Users | Sessions | Pageviews");
console.log("------------------------------------------------------------------");
hourlyRows.forEach(r => {
  const date = r.dimensionValues[0].value;
  const hr = parseInt(r.dimensionValues[1].value, 10);
  const u = parseInt(r.metricValues[0].value, 10);
  const s = parseInt(r.metricValues[1].value, 10);
  const pv = parseInt(r.metricValues[2].value, 10);

  // Filter >= Oct 29 10:00 UTC (15:30 IST)
  const isPostMagic = (date === '20261029' && hr >= 10) || (date === '20261030');
  if (isPostMagic) {
    postMagicUsers += u;
    postMagicSessions += s;
    postMagicPV += pv;
    const istHr = (hr + 5) % 24;
    const istMin = (hr + 5 >= 24) ? "30 (Next Day)" : "30 IST";
    console.log(`${date}   | ${String(hr).padStart(2, '0')}:00    | ~${String(istHr).padStart(2, '0')}:${istMin.padEnd(14)} | ${String(u).padStart(5)} | ${String(s).padStart(8)} | ${String(pv).padStart(9)}`);
  }
});
console.log("------------------------------------------------------------------");
console.log(`TOTAL POST-MAGIC: ${postMagicUsers} Users | ${postMagicSessions} Sessions | ${postMagicPV} Pageviews\n`);

// 2. TRAFFIC SOURCES POST MAGIC CHECKOUT
console.log("2. 🌐 TRAFFIC SOURCES (WHERE TRAFFIC CAME FROM):");
console.log("Date     | Source / Medium           | Campaign        | Users | Sess | PV | Bounce % | Avg Duration");
console.log("--------------------------------------------------------------------------------------------------");
(data.ga4_sources || []).forEach(r => {
  const date = r.dimensionValues[0].value;
  const sm = r.dimensionValues[1].value;
  const cmp = r.dimensionValues[2].value;
  const u = r.metricValues[0].value;
  const s = r.metricValues[1].value;
  const pv = r.metricValues[2].value;
  const br = (parseFloat(r.metricValues[3].value) * 100).toFixed(1) + "%";
  const dur = parseFloat(r.metricValues[4].value).toFixed(1) + "s";
  console.log(`${date} | ${sm.padEnd(25)} | ${cmp.slice(0, 15).padEnd(15)} | ${String(u).padStart(5)} | ${String(s).padStart(4)} | ${String(pv).padStart(2)} | ${br.padStart(8)} | ${dur.padStart(10)}`);
});

// 3. PAGES VISITED & ENGAGEMENT TIME
console.log("\n3. 📄 PAGES VISITED & TIME SPENT (WHERE USERS SPENT MORE TIME):");
console.log("Page Path                                      | Views | Users | Total Engaged Time | Bounce Rate");
console.log("-------------------------------------------------------------------------------------------------");
(data.ga4_pages || []).forEach(r => {
  const date = r.dimensionValues[0].value;
  const p = r.dimensionValues[1].value;
  const pv = r.metricValues[0].value;
  const u = r.metricValues[1].value;
  const engSec = parseFloat(r.metricValues[2].value);
  const br = (parseFloat(r.metricValues[3].value) * 100).toFixed(1) + "%";
  const avgTimePerUser = u > 0 ? (engSec / u).toFixed(1) + "s" : "0s";
  console.log(`${p.padEnd(46)} | ${String(pv).padStart(5)} | ${String(u).padStart(5)} | ${String(engSec.toFixed(0) + "s (avg " + avgTimePerUser + ")").padEnd(18)} | ${br.padStart(11)}`);
});

// 4. FUNNEL MOVEMENTS & CHECKOUT DROPS
console.log("\n4. 🎯 FUNNEL EVENTS & CHECKOUT BOUNCE ANALYSIS:");
const eventsPost = (data.ga4_events || []).filter(r => {
  const date = r.dimensionValues[0].value;
  const hr = parseInt(r.dimensionValues[1].value, 10);
  return (date === '20261029' && hr >= 10) || (date === '20261030');
});

const eventTotals = {};
eventsPost.forEach(r => {
  const ev = r.dimensionValues[2].value;
  const cnt = parseInt(r.metricValues[0].value, 10);
  const u = parseInt(r.metricValues[1].value, 10);
  if (!eventTotals[ev]) eventTotals[ev] = { count: 0, users: 0 };
  eventTotals[ev].count += cnt;
  eventTotals[ev].users = Math.max(eventTotals[ev].users, u);
});

console.log("Funnel Step          | Event Count | Users");
console.log("-------------------------------------------");
['page_view', 'view_item', 'session_start', 'user_engagement', 'add_to_cart', 'begin_checkout', 'purchase'].forEach(step => {
  const info = eventTotals[step] || { count: 0, users: 0 };
  console.log(`${step.padEnd(20)} | ${String(info.count).padStart(11)} | ${String(info.users).padStart(5)}`);
});

// 5. SHOPIFY ORDERS & ABANDONED CHECKOUTS POST 15:30 IST (OCT 29)
console.log("\n5. 🛒 SHOPIFY ORDERS (SINCE OCT 29, 15:30 IST):");
const orders = data.shopify_orders || [];
console.log(`Total Orders in Window: ${orders.length}`);
orders.forEach(o => {
  const n = o.node;
  console.log(`- Order ${n.name}: Created ${n.createdAt} | Amount: ₹${n.totalPriceSet?.presentmentMoney?.amount} | Financial: ${n.displayFinancialStatus} | Items: ${n.lineItems?.edges?.map(e => `${e.node.title} (${e.node.quantity}x)`).join(', ')}`);
});

console.log("\n6. 🛒 SHOPIFY ABANDONED / OPEN CHECKOUTS:");
const abandoned = (data.shopify_abandoned || []).filter(c => {
  const created = new Date(c.created_at).getTime();
  const cutoff = new Date('2026-10-29T10:00:00Z').getTime();
  return created >= cutoff;
});
console.log(`Abandoned checkouts in this period: ${abandoned.length}`);
abandoned.forEach(c => {
  console.log(`- Checkout ID: ${c.id} | Created: ${c.created_at} | Phone: ${c.phone || c.customer?.phone || 'N/A'} | Price: ₹${c.total_price} | URL: ${c.abandoned_checkout_url}`);
});
