import fs from 'fs';

const data = JSON.parse(fs.readFileSync('reports/today_forensic_funnel_oct29.json', 'utf8'));

console.log("=================================================");
console.log("📊 REAL-TIME FORENSIC DATA: TODAY (29 OCT 2026)");
console.log("=================================================");

console.log("\n1. 📈 HOURLY TRAFFIC (TODAY SINCE MORNING):");
if (data.ga4.hourly?.rows) {
  let totalUsers = 0;
  let totalSessions = 0;
  let totalPV = 0;
  console.log("Hour (UTC) | Users | Sessions | Pageviews");
  console.log("-----------------------------------------");
  data.ga4.hourly.rows.forEach(r => {
    const hr = r.dimensionValues[0].value;
    const u = parseInt(r.metricValues[0].value);
    const s = parseInt(r.metricValues[1].value);
    const pv = parseInt(r.metricValues[2].value);
    totalUsers += u;
    totalSessions += s;
    totalPV += pv;
    // Convert UTC hour to IST hour (+5:30)
    const istHr = (parseInt(hr, 10) + 5) % 24;
    console.log(`${hr}:00 UTC (~${istHr}:30 IST) | ${u} | ${s} | ${pv}`);
  });
  console.log("-----------------------------------------");
  console.log(`TOTAL TODAY: ${totalUsers} Users, ${totalSessions} Sessions, ${totalPV} Pageviews`);
} else {
  console.log("No hourly rows found:", data.ga4.hourly);
}

console.log("\n2. 🌐 TRAFFIC SOURCES TODAY:");
if (data.ga4.sources?.rows) {
  console.log("Source / Medium | Campaign | Users | Sessions | PV | Bounce Rate | Avg Duration");
  console.log("-------------------------------------------------------------------------------");
  data.ga4.sources.rows.forEach(r => {
    const sm = r.dimensionValues[0].value;
    const c = r.dimensionValues[1].value;
    const u = r.metricValues[0].value;
    const s = r.metricValues[1].value;
    const pv = r.metricValues[2].value;
    const br = (parseFloat(r.metricValues[3].value) * 100).toFixed(1) + "%";
    const dur = parseFloat(r.metricValues[4].value).toFixed(1) + "s";
    console.log(`${sm} | ${c} | ${u} | ${s} | ${pv} | ${br} | ${dur}`);
  });
}

console.log("\n3. 🎯 GA4 FUNNEL EVENTS (USER JOURNEY TODAY):");
if (data.ga4.events?.rows) {
  console.log("Event Name | Count | Total Users");
  console.log("--------------------------------");
  data.ga4.events.rows.forEach(r => {
    const ev = r.dimensionValues[0].value;
    const cnt = r.metricValues[0].value;
    const u = r.metricValues[1].value;
    console.log(`${ev.padEnd(20)} | ${cnt.padStart(6)} | ${u.padStart(6)}`);
  });
}

console.log("\n4. 📄 PAGES VISITED TODAY:");
if (data.ga4.pages?.rows) {
  console.log("Page Path | Pageviews | Users | Bounce Rate");
  console.log("--------------------------------------------");
  data.ga4.pages.rows.forEach(r => {
    const p = r.dimensionValues[0].value;
    const pv = r.metricValues[0].value;
    const u = r.metricValues[1].value;
    const br = (parseFloat(r.metricValues[2].value) * 100).toFixed(1) + "%";
    console.log(`${p.padEnd(35)} | ${pv.padStart(5)} | ${u.padStart(5)} | ${br}`);
  });
}

console.log("\n5. 📱 META ADS INSIGHTS TODAY:");
if (data.meta?.data) {
  data.meta.data.forEach(ad => {
    console.log(`Ad: Spend ₹${ad.spend}, Reach: ${ad.reach}, Impr: ${ad.impressions}, Clicks: ${ad.clicks}, CTR: ${ad.ctr}%, CPC: ₹${ad.cpc}`);
    console.log("Actions:", JSON.stringify(ad.actions, null, 2));
  });
}

console.log("\n6. 🛒 SHOPIFY CHECKOUTS & ORDERS TODAY:");
console.log("Open / Abandoned Checkouts Count:", data.shopify.open_checkouts?.checkouts?.length ?? "REST not allowed / None");
if (data.shopify.open_checkouts?.checkouts?.length > 0) {
  console.log("Checkouts details:", JSON.stringify(data.shopify.open_checkouts.checkouts, null, 2));
}
console.log("Orders Today:", JSON.stringify(data.shopify.orders_today?.data?.orders?.edges || [], null, 2));
