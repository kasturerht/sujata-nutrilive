// scripts/amazon-sales-traffic-engine.mjs
// =========================================================================================
// 🚀 SUJATA NUTRILIVE — ENTERPRISE AMAZON SALES & TRAFFIC INTELLIGENCE ENGINE (OCTOBER 2026)
// =========================================================================================
// Silicon Valley Tier-1 Telemetry Engine for Amazon India (SP-API)
// Ingests, decompresses (GZIP), audits, and diagnoses ASIN-level traffic, conversion funnels,
// mobile vs. desktop behavior, Buy Box health, and revenue attribution with ZERO guesswork.
// =========================================================================================

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Load Environment
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[trimmed.substring(0, idx).trim()] = val;
      }
    }
  }
}
loadEnv();

// 2. Comprehensive ASIN & SKU Knowledge Matrix
const ASIN_CATALOG_MAP = {
  // Supplements
  'B0DP2FWN4J': { sku: 'L5-UK79-BHXE', name: 'Spirulina Powder 100g', category: 'Powder', mrp: 499, price: 350 },
  'B0DNSXGGTN': { sku: '8X-HQKV-14T7', name: 'Spirulina Tablets 60s', category: 'Tablets', mrp: 450, price: 350 },
  'B0HMJD7SJ9': { sku: 'SJT-SP-TAB-120', name: 'Spirulina Tablets 120s', category: 'Tablets', mrp: 750, price: 550 },
  'B0HMP23P3T': { sku: 'SJT-SP-TAB-PARENT', name: 'Spirulina Tablets Parent', category: 'Parent', mrp: 0, price: 0 },
  'B0GMQYS6M4': { sku: 'AB01', name: 'Spirulina Capsules 60s', category: 'Capsules', mrp: 699, price: 499 },
  'B0HMJFFVCW': { sku: 'SJT-SP-CAP-120', name: 'Spirulina Capsules 120s', category: 'Capsules', mrp: 1100, price: 799 },
  'B0HMJRHQZL': { sku: 'SJT-SP-CAP-180', name: 'Spirulina Capsules 180s', category: 'Capsules', mrp: 1550, price: 1099 },
  'B0HMJHWLV3': { sku: 'SJT-SB-CAP-60', name: 'Himalayan Sea Buckthorn 60s', category: 'Capsules', mrp: 899, price: 649 },
  'B0HMJHG237': { sku: 'SJT-SHIL-CAP-60', name: 'Pure Himalayan Shilajit 60s', category: 'Ayurveda', mrp: 999, price: 649 },
  'B0HMJDWMSB': { sku: 'SJT-B12-CAP-90', name: 'Plant-Based Vitamin B12 90s', category: 'Capsules', mrp: 899, price: 649 },
  'B0HMJMYRS5': { sku: 'SJT-MOR-PWD-100G', name: 'Natural Moringa Leaf Powder 100g', category: 'Powder', mrp: 349, price: 249 },
  // Cosmetics & Personal Care
  'B0HMJNSZY2': { sku: 'SJT-SP-FW-100ML', name: 'Spirulina Anti-Acne Face Wash 100ml', category: 'Skincare', mrp: 299, price: 199 },
  'B0GNMB2P9X': { sku: 'AB29', name: 'Spirulina Herbal Face Pack 50g', category: 'Skincare', mrp: 299, price: 199 },
  'B0HMJF366D': { sku: 'SJT-SP-SOAP-100G', name: 'SpiruGlow Handmade Bath Soap 100g', category: 'Soap', mrp: 99, price: 60 },
  'B0HMKR4W22': { sku: 'SJT-SP-SOAP-5PK', name: 'SpiruGlow Soap Pack of 5 (500g)', category: 'Soap', mrp: 450, price: 280 },
  'B0HMKD5F7N': { sku: 'SJT-SP-SOAP-10PK', name: 'SpiruGlow Soap Pack of 10 (1kg)', category: 'Soap', mrp: 900, price: 550 },
  'B0HMJNTHKF': { sku: 'SJT-SP-KC-50G', name: 'Spirulina Korean Glass Skin Cream 25g', category: 'Skincare', mrp: 1499, price: 999 },
  'B0HMJHFCL4': { sku: 'SJT-BR-CRM-50G', name: 'Bridal Luxury Radiance Cream 50g', category: 'Skincare', mrp: 1899, price: 1199 },
  'B0HMJM64G3': { sku: 'SJT-SP-OIL-50ML', name: 'Spirulina & Coconut Hair Oil 50ml', category: 'Haircare', mrp: 349, price: 249 },
  'B0HMJL173K': { sku: 'SJT-SP-SHP-100ML', name: 'SpiruShine 2-in-1 Shampoo 100ml', category: 'Haircare', mrp: 349, price: 250 },
  // Combos
  'B0HMJNJ2LP': { sku: 'SJT-COMBO-SP90-SB60', name: 'Super Immunity Combo (90T+60C)', category: 'Combo', mrp: 1299, price: 950 },
  'B0HMKBCF92': { sku: 'SJT-COMBO-SP120-SB60', name: 'Mega Synergy Combo (120T+60C)', category: 'Combo', mrp: 1549, price: 1099 },
  'B0HMJNHVNH': { sku: 'SJT-CMBO-HL-1M', name: 'Healthy Life Combo 1-Month (60C+60C)', category: 'Combo', mrp: 1485, price: 1100 },
  'B0HMJRLX2C': { sku: 'SJT-CMBO-HL-2M', name: 'Healthy Life Combo 2-Month (120C+120C)', category: 'Combo', mrp: 2565, price: 1900 },
  'B0HMJD6LYN': { sku: 'SJT-CMBO-HL-3M', name: 'Healthy Life Combo 3-Month (180C+180C)', category: 'Combo', mrp: 3645, price: 2700 }
};

// 3. Amazon SP-API Access Token Generator
async function getAccessToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.AMAZON_REFRESH_TOKEN,
      client_id: process.env.AMAZON_LWA_CLIENT_ID,
      client_secret: process.env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Failed to obtain SP-API access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

// 4. Request and Download Sales & Traffic Report
async function requestSalesAndTrafficReport(token, startDate, endDate) {
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  console.log(`📡 [SP-API] Requesting GET_SALES_AND_TRAFFIC_REPORT (${startDate} to ${endDate})...`);
  const createRes = await fetch(`${endpoint}/reports/2021-06-30/reports`, {
    method: 'POST',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reportType: 'GET_SALES_AND_TRAFFIC_REPORT',
      dataStartTime: `${startDate}T00:00:00.000Z`,
      dataEndTime: `${endDate}T23:59:59.000Z`,
      marketplaceIds: [marketId],
      reportOptions: {
        dateGranularity: 'DAY',
        asinGranularity: 'CHILD'
      }
    })
  });

  const createData = await createRes.json();
  if (!createData.reportId) {
    throw new Error(`Report request failed: ${JSON.stringify(createData)}`);
  }

  const reportId = createData.reportId;
  console.log(`⏳ Report queued (ID: ${reportId}). Polling Amazon server processing...`);

  let reportDocId = null;
  for (let attempt = 1; attempt <= 15; attempt++) {
    await new Promise(r => setTimeout(r, 3500));
    const statusRes = await fetch(`${endpoint}/reports/2021-06-30/reports/${reportId}`, {
      headers: { 'x-amz-access-token': token }
    });
    const statusData = await statusRes.json();
    console.log(`   [Attempt ${attempt}/15] Amazon Processing Status: ${statusData.processingStatus}`);

    if (statusData.processingStatus === 'DONE') {
      reportDocId = statusData.reportDocumentId;
      break;
    }
    if (statusData.processingStatus === 'FATAL' || statusData.processingStatus === 'CANCELLED') {
      throw new Error(`Report failed with status: ${statusData.processingStatus}`);
    }
  }

  if (!reportDocId) {
    throw new Error('Report processing timed out after 15 attempts.');
  }

  console.log(`📥 [SP-API] Fetching report document: ${reportDocId}`);
  const docRes = await fetch(`${endpoint}/reports/2021-06-30/documents/${reportDocId}`, {
    headers: { 'x-amz-access-token': token }
  });
  const docData = await docRes.json();

  console.log(`📦 Downloading & decompressing payload (${docData.compressionAlgorithm || 'RAW'})...`);
  const fileRes = await fetch(docData.url);
  const arrayBuffer = await fileRes.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);

  if (docData.compressionAlgorithm === 'GZIP') {
    buffer = zlib.gunzipSync(buffer);
  }

  return JSON.parse(buffer.toString('utf8'));
}

// 5. Silicon Valley Analytics & Diagnostic Algorithmic Pipeline
function analyzeTelemetry(rawReport) {
  const dateData = rawReport.salesAndTrafficByDate || [];
  const asinData = rawReport.salesAndTrafficByAsin || [];

  // 1. ASIN-level enriched telemetry
  const asinAnalysis = asinData.map(item => {
    const asin = item.childAsin;
    const meta = ASIN_CATALOG_MAP[asin] || {
      sku: item.sku || 'UNKNOWN',
      name: `Catalog Item (${asin})`,
      category: 'Other',
      price: item.salesByAsin?.orderedProductSales?.amount || 0
    };

    const traffic = item.trafficByAsin || {};
    const sales = item.salesByAsin || {};

    const sessions = traffic.sessions || 0;
    const pageViews = traffic.pageViews || 0;
    const mobileSessions = traffic.mobileAppSessions || 0;
    const browserSessions = traffic.browserSessions || 0;
    const buyBoxPct = traffic.buyBoxPercentage || 0;
    const unitsOrdered = sales.unitsOrdered || 0;
    const revenue = sales.orderedProductSales?.amount || 0;
    const convRate = sessions > 0 ? (unitsOrdered / sessions) * 100 : 0;
    const mobileRatio = sessions > 0 ? (mobileSessions / sessions) * 100 : 0;

    return {
      asin,
      parentAsin: item.parentAsin,
      sku: meta.sku,
      name: meta.name,
      category: meta.category,
      listPrice: meta.price,
      sessions,
      sessionShare: traffic.sessionPercentage || 0,
      pageViews,
      pageViewShare: traffic.pageViewsPercentage || 0,
      mobileSessions,
      browserSessions,
      mobileRatio,
      buyBoxPct,
      unitsOrdered,
      convRate,
      revenue,
      refunds: sales.unitsRefunded || 0,
      // Silicon Valley Diagnostic Flagging
      healthVerdict: assessAsinHealth(sessions, buyBoxPct, convRate, unitsOrdered)
    };
  });

  // Sort by sessions descending
  asinAnalysis.sort((a, b) => b.sessions - a.sessions);

  // 2. Aggregate Totals
  const totalSessions = asinAnalysis.reduce((acc, a) => acc + a.sessions, 0);
  const totalPageViews = asinAnalysis.reduce((acc, a) => acc + a.pageViews, 0);
  const totalUnits = asinAnalysis.reduce((acc, a) => acc + a.unitsOrdered, 0);
  const totalRevenue = asinAnalysis.reduce((acc, a) => acc + a.revenue, 0);
  const totalMobileSessions = asinAnalysis.reduce((acc, a) => acc + a.mobileSessions, 0);
  const catalogBlendedConvRate = totalSessions > 0 ? (totalUnits / totalSessions) * 100 : 0;
  const overallMobileShare = totalSessions > 0 ? (totalMobileSessions / totalSessions) * 100 : 0;

  // 3. Date-level trend
  const dailyTrend = dateData.map(d => ({
    date: d.date,
    sessions: d.trafficByDate?.sessions || 0,
    pageViews: d.trafficByDate?.pageViews || 0,
    mobileSessions: d.trafficByDate?.mobileAppSessions || 0,
    browserSessions: d.trafficByDate?.browserSessions || 0,
    buyBoxPct: d.trafficByDate?.buyBoxPercentage || 0,
    orders: d.salesByDate?.totalOrderItems || 0,
    units: d.salesByDate?.unitsOrdered || 0,
    revenue: d.salesByDate?.orderedProductSales?.amount || 0,
    dailyConvRate: (d.trafficByDate?.unitSessionPercentage || 0)
  }));

  // 4. Strategic Prescriptions (Actionable Business Owner Intelligence)
  const prescriptions = generatePrescriptions(asinAnalysis);

  return {
    window: {
      startDate: rawReport.reportSpecification?.dataStartTime,
      endDate: rawReport.reportSpecification?.dataEndTime
    },
    aggregates: {
      totalSessions,
      totalPageViews,
      totalUnits,
      totalRevenue,
      catalogBlendedConvRate,
      overallMobileShare
    },
    asinAnalysis,
    dailyTrend,
    prescriptions
  };
}

// 6. Algorithmic Health Classifier
function assessAsinHealth(sessions, buyBoxPct, convRate, units) {
  if (buyBoxPct < 50 && sessions > 0) {
    return { status: 'CRITICAL_BUYBOX_LEAK', label: '🚨 Buy Box Compromised', color: 'red' };
  }
  if (sessions >= 5 && units === 0) {
    return { status: 'CONVERSION_BOTTLENECK', label: '⚠️ High Traffic / Zero Sales', color: 'yellow' };
  }
  if (units > 0 && convRate >= 10) {
    return { status: 'HERO_PERFORMER', label: '🌟 High-Conversion Hero', color: 'green' };
  }
  if (sessions > 0 && units > 0) {
    return { status: 'HEALTHY_CONVERTING', label: '✅ Active Converting', color: 'blue' };
  }
  if (sessions > 0) {
    return { status: 'DISCOVERABLE_WARMUP', label: '🌱 Discovery Stage', color: 'cyan' };
  }
  return { status: 'DORMANT', label: '💤 Dormant (0 Visitors)', color: 'gray' };
}

// 7. Executive Prescriptions Engine
function generatePrescriptions(asins) {
  const actions = [];

  // A. Buy Box Leaks
  const buyBoxVictims = asins.filter(a => a.buyBoxPct < 80 && a.sessions > 0);
  if (buyBoxVictims.length > 0) {
    actions.push({
      priority: 'P0 - URGENT',
      title: 'Fix Buy Box Suppression on At-Risk ASINs',
      detail: `${buyBoxVictims.map(a => `${a.name} (${a.asin}): ${a.buyBoxPct.toFixed(0)}% Buy Box`).join('; ')}. Check seller dispatch lead times, delivery pricing, or competitive pricing flags in Seller Central.`
    });
  }

  // B. Traffic Without Conversion (Bounce/Mismatch Risk)
  const conversionLaggards = asins.filter(a => a.sessions >= 5 && a.unitsOrdered === 0);
  if (conversionLaggards.length > 0) {
    actions.push({
      priority: 'P1 - HIGH IMPACT',
      title: 'Optimize PDP Conversion Funnels for Active Traffic Drawers',
      detail: `${conversionLaggards.map(a => `${a.name} (${a.sessions} sessions, 0 orders)`).join('; ')}. Customers are visiting but not checking out. Audit Main Image, Price anchoring, and A+ Comparison tables.`
    });
  }

  // C. Hero Growth Candidates for Amazon Ads / Attribution
  const heroCandidates = asins.filter(a => a.convRate >= 10);
  if (heroCandidates.length > 0) {
    actions.push({
      priority: 'P2 - SCALE REVENUE',
      title: 'Scale Traffic to High-Converting Hero SKUs',
      detail: `${heroCandidates.map(a => `${a.name} (Conv: ${a.convRate.toFixed(1)}%, Rev: ₹${a.revenue})`).join('; ')}. These ASINs have exceptional conversion efficiency. Prioritize them for Amazon Sponsored Products (PPC) and Meta Ads Click-to-Amazon campaigns.`
    });
  }

  return actions;
}

// 8. Generate Reports & CLI Output
async function runEngine() {
  console.log(`========================================================================`);
  console.log(`🚀 SUJATA NUTRILIVE: AMAZON SALES & TRAFFIC INTELLIGENCE ENGINE (v2026.10)`);
  console.log(`========================================================================\n`);

  const token = await getAccessToken();

  // Use the last 7 completed days (2026-10-12 to 2026-10-18)
  const startDate = '2026-10-12';
  const endDate = '2026-10-18';

  const rawReport = await requestSalesAndTrafficReport(token, startDate, endDate);
  const analysis = analyzeTelemetry(rawReport);

  // 1. Save Telemetry JSON
  const outputDir = path.join(rootDir, 'reports_and_blueprints');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const jsonPath = path.join(outputDir, 'amazon_sales_traffic_intelligence.json');
  fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
  console.log(`\n💾 Saved Forensic Telemetry JSON: ${jsonPath}`);

  // 2. Generate Markdown Executive Dossier
  const mdPath = path.join(outputDir, 'amazon_daily_traffic_intelligence_report.md');
  const mdContent = generateMarkdownReport(analysis);
  fs.writeFileSync(mdPath, mdContent);
  console.log(`📄 Saved Executive Dossier: ${mdPath}`);

  // 3. Print CLI Summary Table
  console.log('\n========================================================================');
  console.log(`📊 ASIN TELEMETRY SUMMARY (${startDate} to ${endDate})`);
  console.log('========================================================================');
  console.table(analysis.asinAnalysis.map(a => ({
    Product: a.name.substring(0, 32),
    ASIN: a.asin,
    Sessions: a.sessions,
    MobilePct: `${a.mobileRatio.toFixed(0)}%`,
    PageViews: a.pageViews,
    BuyBox: `${a.buyBoxPct.toFixed(0)}%`,
    Orders: a.unitsOrdered,
    ConvRate: `${a.convRate.toFixed(1)}%`,
    Revenue: `₹${a.revenue}`,
    Diagnosis: a.healthVerdict.label
  })));

  console.log('\n========================================================================');
  console.log('📈 DAILY OVERALL TRAFFIC TREND ON AMAZON');
  console.log('========================================================================');
  console.table(analysis.dailyTrend.map(d => ({
    Date: d.date,
    Sessions: d.sessions,
    MobileSessions: d.mobileSessions,
    PageViews: d.pageViews,
    BuyBox: `${d.buyBoxPct.toFixed(0)}%`,
    Units: d.units,
    Revenue: `₹${d.revenue}`,
    ConvRate: `${d.dailyConvRate.toFixed(1)}%`
  })));

  console.log('\n========================================================================');
  console.log('💡 SILICON VALLEY STRATEGIC PRESCRIPTIONS:');
  console.log('========================================================================');
  analysis.prescriptions.forEach((p, i) => {
    console.log(`[${p.priority}] ${p.title}`);
    console.log(`  👉 ${p.detail}\n`);
  });
}

function generateMarkdownReport(analysis) {
  const { aggregates, asinAnalysis, dailyTrend, prescriptions, window } = analysis;
  return `# 🚀 Sujata Nutrilive — Amazon Daily Sales & Traffic Intelligence Dossier
**Generated:** ${new Date().toISOString()} | **Telemetry Window:** ${window.startDate} to ${window.endDate}
**Engine:** Silicon Valley Tier-1 Amazon SP-API Telemetry Pipeline (October 2026)

---

## Executive Summary

* **Total Amazon Sessions (Unique Visitors):** **${aggregates.totalSessions}**
* **Total Page Views:** **${aggregates.totalPageViews}**
* **Mobile App Shopping Dominance:** **${aggregates.overallMobileShare.toFixed(1)}%** of all shoppers browsed via the Amazon Mobile App.
* **Total Units Ordered:** **${aggregates.totalUnits}** (Gross Revenue: **₹${aggregates.totalRevenue.toLocaleString('en-IN')}**)
* **Catalog Blended Conversion Rate:** **${aggregates.catalogBlendedConvRate.toFixed(1)}%**

---

## ASIN-Level Telemetry & Conversion Funnel Matrix

| Product Name | ASIN | Sessions | Mobile % | PageViews | Buy Box % | Units | Conv Rate % | Revenue | Health Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
${asinAnalysis.map(a => `| **${a.name}** | \`${a.asin}\` | ${a.sessions} | ${a.mobileRatio.toFixed(0)}% | ${a.pageViews} | ${a.buyBoxPct.toFixed(0)}% | **${a.unitsOrdered}** | **${a.convRate.toFixed(1)}%** | ₹${a.revenue} | ${a.healthVerdict.label} |`).join('\n')}

---

## Daily Traffic & Revenue Trajectory

| Date | Sessions | Mobile Sessions | Browser Sessions | PageViews | Buy Box % | Units | Revenue | Conversion % |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${dailyTrend.map(d => `| **${d.date}** | ${d.sessions} | ${d.mobileSessions} | ${d.browserSessions} | ${d.pageViews} | ${d.buyBoxPct.toFixed(0)}% | **${d.units}** | **₹${d.revenue}** | ${d.dailyConvRate.toFixed(1)}% |`).join('\n')}

---

## Strategic Action Items (Prescriptions)

${prescriptions.map(p => `### [${p.priority}] ${p.title}\n> ${p.detail}`).join('\n\n')}

---
*Autonomous Telemetry Report compiled via Selling Partner API (SP-API) v2021-06-30.*
`;
}

runEngine().catch(console.error);
