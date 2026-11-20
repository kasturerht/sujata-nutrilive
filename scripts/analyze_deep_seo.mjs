// scripts/analyze_deep_seo.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'deep_seo_audit.json'), 'utf8'));

console.log("=================================================================");
console.log("             DEEP SEO & ORGANIC REALITY AUDIT                    ");
console.log("=================================================================\n");

// 1. GSC Totals over 28 days
let totalClicks = 0;
let totalImpressions = 0;
let weightedPosSum = 0;

raw.gsc.daily.forEach(d => {
  totalClicks += d.clicks;
  totalImpressions += d.impressions;
  weightedPosSum += (d.position * d.impressions);
});

const avgPos = totalImpressions > 0 ? (weightedPosSum / totalImpressions).toFixed(1) : 0;
const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

console.log("--- 1. GOOGLE SEARCH CONSOLE TOTALS (LAST 26-28 DAYS) ---");
console.log(`Total Organic Clicks: ${totalClicks} clicks`);
console.log(`Total Organic Impressions: ${totalImpressions} impressions`);
console.log(`Average Organic CTR: ${overallCtr}%`);
console.log(`Average Google Ranking Position: ${avgPos}`);
console.log(`Daily Average Organic Clicks: ${(totalClicks / raw.gsc.daily.length).toFixed(1)} clicks/day`);
console.log(`Daily Average Impressions: ${(totalImpressions / raw.gsc.daily.length).toFixed(0)} impressions/day`);

// 2. Daily Trend
console.log("\n--- 2. RECENT DAILY ORGANIC CLICKS & IMPRESSIONS ---");
console.log("Date       | Clicks | Impressions | CTR(%) | Position");
console.log("-----------|--------|-------------|--------|---------");
raw.gsc.daily.slice(-14).forEach(d => {
  console.log(
    `${d.keys[0]} | ` +
    `${String(d.clicks).padStart(6)} | ` +
    `${String(d.impressions).padStart(11)} | ` +
    `${(d.ctr * 100).toFixed(2).padStart(6)} | ` +
    `${d.position.toFixed(1).padStart(8)}`
  );
});

// 3. Top Queries Breakdown (Branded vs Commercial/Generic)
console.log("\n--- 3. TOP SEARCH QUERIES RANKING ON GOOGLE ---");
console.log("Query                                              | Clicks | Impressions | CTR(%) | Position");
console.log("---------------------------------------------------|--------|-------------|--------|---------");
raw.gsc.queries.slice(0, 25).forEach(q => {
  console.log(
    `${q.keys[0].padEnd(50)} | ` +
    `${String(q.clicks).padStart(6)} | ` +
    `${String(q.impressions).padStart(11)} | ` +
    `${(q.ctr * 100).toFixed(1).padStart(6)} | ` +
    `${q.position.toFixed(1).padStart(8)}`
  );
});

// 4. Top Organic Landing Pages
console.log("\n--- 4. TOP ORGANIC LANDING PAGES ---");
console.log("Page URL                                                     | Clicks | Impressions | CTR(%) | Position");
console.log("-------------------------------------------------------------|--------|-------------|--------|---------");
raw.gsc.pages.slice(0, 15).forEach(p => {
  const url = p.keys[0].replace('https://www.sujatanutrilive.com', '');
  console.log(
    `${(url || '/').padEnd(60)} | ` +
    `${String(p.clicks).padStart(6)} | ` +
    `${String(p.impressions).padStart(11)} | ` +
    `${(p.ctr * 100).toFixed(1).padStart(6)} | ` +
    `${p.position.toFixed(1).padStart(8)}`
  );
});

// 5. GA4 Organic Traffic Reality
console.log("\n--- 5. GA4 ORGANIC TRAFFIC & ENGAGEMENT (LAST 28 DAYS) ---");
let ga4TotalSessions = 0;
let ga4TotalUsers = 0;
let ga4TotalEngaged = 0;

raw.ga4.landingPages.forEach(lp => {
  ga4TotalSessions += parseInt(lp.metricValues[0].value, 10);
  ga4TotalUsers += parseInt(lp.metricValues[1].value, 10);
  ga4TotalEngaged += parseInt(lp.metricValues[3].value, 10);
});

console.log(`Total GA4 Organic Sessions: ${ga4TotalSessions}`);
console.log(`Total GA4 Organic Users: ${ga4TotalUsers}`);
console.log(`Total Engaged Sessions: ${ga4TotalEngaged} (${((ga4TotalEngaged / (ga4TotalSessions || 1)) * 100).toFixed(1)}%)`);

console.log("\nGA4 Landing Page Breakdown:");
raw.ga4.landingPages.slice(0, 10).forEach(lp => {
  const page = lp.dimensionValues[0].value;
  const sessions = lp.metricValues[0].value;
  const users = lp.metricValues[1].value;
  const bounce = (parseFloat(lp.metricValues[4].value) * 100).toFixed(1);
  const avgDur = parseFloat(lp.metricValues[5].value).toFixed(0);
  console.log(`  ${(page || '/').padEnd(50)}: ${sessions.padStart(3)} sessions | ${users.padStart(3)} users | Bounce: ${bounce.padStart(5)}% | Avg: ${avgDur}s`);
});

// 6. Sitemaps Status
console.log("\n--- 6. GSC SITEMAP STATUS ---");
console.log(JSON.stringify(raw.gsc.sitemaps, null, 2));
