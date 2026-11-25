// scripts/seo/baseline.mjs
// Weekly SEO snapshot: GSC by date / page / query (last 28 days, ending 2 days ago because of GSC lag)
// and URL Inspection for every sitemap URL. Writes reports/seo/baseline-YYYY-MM-DD.json.
// Usage: node scripts/seo/baseline.mjs
import fs from 'node:fs';
import { googleToken, gscClient, daysAgo, isoDay } from './lib/google.mjs';

const token = await googleToken(['https://www.googleapis.com/auth/webmasters.readonly']);
const gsc = gscClient(token);
const range = { startDate: daysAgo(30), endDate: daysAgo(2) };

const [byDate, byPage, byQuery, sitemaps] = await Promise.all([
  gsc.query({ ...range, dimensions: ['date'], rowLimit: 100 }),
  gsc.query({ ...range, dimensions: ['page'], rowLimit: 1000 }),
  gsc.query({ ...range, dimensions: ['query'], rowLimit: 1000 }),
  gsc.sitemaps(),
]);

const index = await (await fetch('https://www.sujatanutrilive.com/sitemap-index.xml')).text();
const urls = [];
for (const m of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const xml = await (await fetch(m[1])).text();
  urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
}
const inspection = [];
for (const url of urls) {
  const r = await gsc.inspect(url);
  const s = r.inspectionResult?.indexStatusResult || {};
  inspection.push({ url, verdict: s.verdict || null, coverage: s.coverageState || r.error?.message || null, lastCrawl: s.lastCrawlTime || null, googleCanonical: s.googleCanonical || null });
}

const totals = (byDate.rows || []).reduce((a, r) => ({ clicks: a.clicks + r.clicks, impressions: a.impressions + r.impressions }), { clicks: 0, impressions: 0 });
const indexed = inspection.filter((i) => i.verdict === 'PASS').length;
const out = {
  generatedAt: new Date().toISOString(), range,
  totals: { ...totals, ctr: totals.impressions ? totals.clicks / totals.impressions : 0 },
  index: { sitemapUrls: urls.length, indexed, share: urls.length ? indexed / urls.length : 0 },
  byDate: byDate.rows || [], byPage: byPage.rows || [], byQuery: byQuery.rows || [], sitemaps: sitemaps.sitemap || [], inspection,
};
fs.mkdirSync('reports/seo', { recursive: true });
const file = `reports/seo/baseline-${isoDay(new Date())}.json`;
fs.writeFileSync(file, JSON.stringify(out, null, 2));
console.log(`${file}: ${range.startDate}..${range.endDate} clicks=${totals.clicks} impressions=${totals.impressions} | indexed ${indexed}/${urls.length}`);
const byCoverage = inspection.reduce((a, i) => ((a[i.coverage] = (a[i.coverage] || 0) + 1), a), {});
for (const [k, v] of Object.entries(byCoverage)) console.log(`  ${v}  ${k}`);
