// scripts/seo/crawl-check.mjs
// Phase 1 exit-gate verifier. Crawls every sitemap URL and every legacy URL and fails on:
//   - any 5xx
//   - a sitemap URL that is not 200, not self-canonical, or carries noindex
//   - a legacy URL that is not exactly one permanent redirect (301/308) to a 200 page
// Also checks <html lang> on the Hindi/Marathi pages, the preview host's X-Robots-Tag, and that an
// unknown product handle returns 404.
// Usage: node scripts/seo/crawl-check.mjs [--base https://www.sujatanutrilive.com] [--json out.json]
import fs from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'https://www.sujatanutrilive.com').replace(/\/$/, '');
const OUT = arg('--json', null);
const UA = 'Mozilla/5.0 (compatible; SujataCrawlCheck/1.0)';
const LANG = {
  '/learn/spirulina-in-marathi': 'mr', '/learn/spirulina-side-effects-in-marathi': 'mr',
  '/learn/spirulina-in-hindi': 'hi', '/learn/sea-buckthorn-in-hindi': 'hi', '/learn/sea-buckthorn-benefits-for-skin-in-hindi': 'hi',
};
const PERMANENT = new Set([301, 308]);

const get = (url, redirect = 'manual') => fetch(url, { redirect, headers: { 'User-Agent': UA } });
const failures = [];
const fail = (kind, url, detail) => failures.push({ kind, url, detail });

// 1. Sitemap URLs
const index = await (await get(`${BASE}/sitemap-index.xml`, 'follow')).text();
const maps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace('https://www.sujatanutrilive.com', BASE));
const sitemapUrls = [];
for (const m of maps) sitemapUrls.push(...[...(await (await get(m, 'follow')).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
let sitemapOk = 0;
for (const loc of sitemapUrls) {
  const url = loc.replace('https://www.sujatanutrilive.com', BASE);
  const path = new URL(loc).pathname.replace(/\/$/, '') || '/';
  const r = await get(url);
  if (r.status !== 200) { fail('sitemap-status', loc, r.status + (r.headers.get('location') ? ` -> ${r.headers.get('location')}` : '')); continue; }
  const html = await r.text();
  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
  if (canon.replace(/\/$/, '') !== loc.replace(/\/$/, '')) fail('sitemap-canonical', loc, `canonical=${canon || 'none'}`);
  if (/<meta name="robots" content="[^"]*noindex/i.test(html) || /noindex/i.test(r.headers.get('x-robots-tag') || '')) fail('sitemap-noindex', loc, 'noindex');
  if (LANG[path]) { const lang = (html.match(/<html[^>]*\blang="([^"]+)"/) || [])[1]; if (lang !== LANG[path]) fail('lang', loc, `lang=${lang} expected ${LANG[path]}`); }
  if (/\/learn\/(sea-buckthorn-for-fatty-liver-and-diabetes|spirulina-for-weight-loss|sea-buckthorn-for-dry-eyes)$/.test(path)) fail('sitemap-retired', loc, 'retired URL still listed');
  sitemapOk++;
}

// 2. Legacy URLs: exactly one permanent hop to a 200 page
const legacy = JSON.parse(fs.readFileSync('src/config/legacy-redirects.json', 'utf8')).redirects
  .map((r) => r.source.replace(/\/:\w+\*$/, '/x1'));
let legacyOk = 0;
for (const p of legacy) {
  const r1 = await get(BASE + p);
  if (r1.status >= 500) { fail('legacy-5xx', p, r1.status); continue; }
  if (!PERMANENT.has(r1.status)) { fail('legacy-not-redirected', p, r1.status); continue; }
  const hop = new URL(r1.headers.get('location'), BASE).toString();
  const r2 = await get(hop);
  if (r2.status !== 200) { fail('legacy-chain', p, `${r1.status} -> ${hop} -> ${r2.status}`); continue; }
  legacyOk++;
}

// 3. Error handling and preview host
const unknown = await get(`${BASE}/product/this-handle-does-not-exist-xyz`);
if (unknown.status !== 404) fail('unknown-product', '/product/this-handle-does-not-exist-xyz', unknown.status);
const unknownPage = await get(`${BASE}/no-such-page-xyz`);
if (unknownPage.status !== 404) fail('unknown-page', '/no-such-page-xyz', unknownPage.status);
let previewTag = 'skipped';
if (BASE.includes('sujatanutrilive.com')) {
  const pv = await get('https://sujata-nutrilive.vercel.app/');
  previewTag = pv.headers.get('x-robots-tag') || 'none';
  if (!/noindex/i.test(previewTag)) fail('preview-host-indexable', 'https://sujata-nutrilive.vercel.app/', previewTag);
}

const summary = { base: BASE, at: new Date().toISOString(), sitemapUrls: sitemapUrls.length, sitemapOk, legacyUrls: legacy.length, legacyOk, unknownProduct: unknown.status, unknownPage: unknownPage.status, previewTag, failures };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
console.log(`Sitemap: ${sitemapOk}/${sitemapUrls.length} clean | Legacy: ${legacyOk}/${legacy.length} single-hop to 200 | unknown product ${unknown.status} | unknown page ${unknownPage.status} | preview X-Robots-Tag: ${previewTag}`);
for (const f of failures) console.log(`FAIL ${f.kind}  ${f.url}  ${f.detail}`);
console.log(failures.length ? `${failures.length} failure(s)` : 'PASS: zero failures');
process.exit(failures.length ? 1 : 0);
